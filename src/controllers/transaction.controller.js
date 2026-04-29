const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * 10-STEP TRANSACTION FLOW (Supports SELF Deposit & OTHERS Transfer)
 * This controller handles atomic transfers between accounts.
 */
async function createTransaction(req, res) {
    // Extract account IDs and transfer details from the request body
    const fromAccount = req.body.fromAccount || req.body.fromAccountId;
    let toAccount = req.body.toAccount || req.body.toAccountId;
    const { amount, transferType } = req.body;
    
    // Use the client-provided idempotencyKey to prevent duplicate processing
    const idempotencyKey = req.body.idempotencyKey || `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transferAmount = Number(amount);

    // If it's a self-deposit, the destination is the same as the source
    if (transferType === 'SELF') {
        toAccount = fromAccount;
    }

    // Basic validation for required fields
    if (!fromAccount || !toAccount || !transferAmount) {
        return res.status(400).json({
            success: false,
            message: "fromAccount, toAccount, and amount are required",
            received: { fromAccount, toAccount, transferAmount }
        });
    }

    try {
        // Fetch account details and populate owner information for emails
        const fromUserAccount = await accountModel.findOne({ _id: fromAccount }).populate('user');
        const toUserAccount = await accountModel.findOne({ _id: toAccount }).populate('user');

        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({ success: false, message: "Invalid account details provided" });
        }

        // Check if this specific transaction has already been processed (Idempotency)
        const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey });
        if (isTransactionAlreadyExists) {
            return res.status(200).json({
                success: true,
                message: `Transaction already ${isTransactionAlreadyExists.status.toLowerCase()}`,
                transaction: isTransactionAlreadyExists
            });
        }

        // Ensure accounts are not frozen or closed
        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(400).json({ success: false, message: "Accounts must be ACTIVE" });
        }

        // Verify sufficient funds for transfers (skipped for self-deposits)
        if (transferType !== 'SELF') {
            const balance = await fromUserAccount.getBalance();
            if (balance < transferAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient balance. Available: ₹${balance}`
                });
            }
        }

        // Start a Managed Transaction Session for Atomicity
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Create the Transaction Log
            const [transaction] = await transactionModel.create([{
                fromAccount: transferType === 'SELF' ? null : fromAccount, // Logic: Self deposit doesn't have a "source account" in the ledger
                toAccount,
                amount: transferAmount,
                idempotencyKey,
                status: "PENDING",
                user: req.user._id
            }], { session });

            // 2. Debit the sender (ONLY if it is NOT a self-deposit)
            if (transferType !== 'SELF') {
                await ledgerModel.create([{
                    account: fromAccount,
                    amount: transferAmount,
                    transaction: transaction._id,
                    type: "DEBIT",
                    description: `Transfer to ${toAccount}`
                }], { session });
            }

            // Artificial delay to test race condition handling
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Credit the receiver (Always happens)
            await ledgerModel.create([{
                account: toAccount,
                amount: transferAmount,
                transaction: transaction._id,
                type: "CREDIT",
                description: transferType === 'SELF' ? "Self Vault Deposit" : `Received from ${fromAccount}`
            }], { session });

            // 4. Finalize transaction status
            await transactionModel.findOneAndUpdate(
                { _id: transaction._id },
                { status: "COMPLETED" },
                { session }
            );

            // Commit all changes to the database
            await session.commitTransaction();
            session.endSession();

            // Asynchronous Email Notifications
            try {
                // In SELF mode, the user gets a CREDIT notification
                const senderMailType = transferType === 'SELF' ? "CREDIT" : "DEBIT";
                await emailService.sendTransactionEmail(
                    req.user.email, 
                    req.user.name, 
                    transferAmount, 
                    toAccount, 
                    senderMailType
                );

                if (transferType !== 'SELF' && toUserAccount.user && toUserAccount.user.email) {
                    await emailService.sendTransactionEmail(
                        toUserAccount.user.email, 
                        toUserAccount.user.name, 
                        transferAmount, 
                        fromAccount, 
                        "CREDIT"
                    );
                }
            } catch (mailErr) {
                console.error("Email delivery failed, but transaction is permanent:", mailErr);
            }

            return res.status(201).json({
                success: true,
                message: "Transaction completed successfully",
                transaction: transaction
            });

        } catch (innerError) {
            // Abort transaction in case of any failure during the steps
            await session.abortTransaction();
            session.endSession();
            throw innerError;
        }
    } catch (error) {
        console.error("Transaction Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * System-initiated Initial Funds Transfer
 * Used to credit funds from a system account to a new user account.
 */
async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount } = req.body;
    const idempotencyKey = req.body.idempotencyKey || `init-${Date.now()}`;

    if (!toAccount || !amount) {
        return res.status(400).json({ success: false, message: "toAccount and amount are required" });
    }

    try {
        const toUserAccount = await accountModel.findOne({ _id: toAccount }).populate('user');
        const fromUserAccount = await accountModel.findOne({ user: req.user._id });

        if (!toUserAccount || !fromUserAccount) {
            return res.status(400).json({ success: false, message: "Invalid account details" });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const [transaction] = await transactionModel.create([{
                fromAccount: fromUserAccount._id,
                toAccount,
                amount: Number(amount),
                idempotencyKey,
                status: "PENDING"
            }], { session });

            await ledgerModel.create([{
                account: fromUserAccount._id,
                amount: Number(amount),
                transaction: transaction._id,
                type: "DEBIT"
            }], { session });

            await ledgerModel.create([{
                account: toAccount,
                amount: Number(amount),
                transaction: transaction._id,
                type: "CREDIT"
            }], { session });

            await transactionModel.findByIdAndUpdate(transaction._id, { status: "COMPLETED" }, { session });

            await session.commitTransaction();
            session.endSession();

            if (toUserAccount.user && toUserAccount.user.email) {
                await emailService.sendTransactionEmail(
                    toUserAccount.user.email, 
                    toUserAccount.user.name, 
                    Number(amount), 
                    fromUserAccount._id, 
                    "CREDIT"
                );
            }

            return res.status(201).json({ success: true, message: "Initial funds credited", transaction });
        } catch (innerError) {
            await session.abortTransaction();
            session.endSession();
            throw innerError;
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createTransaction, createInitialFundsTransaction };