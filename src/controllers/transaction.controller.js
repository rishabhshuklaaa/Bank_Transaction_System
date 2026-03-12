const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * 10-STEP TRANSACTION FLOW (Supports SELF Deposit & OTHERS Transfer)
 */
async function createTransaction(req, res) {
    console.log("BODY RECEIVED:", req.body);

    const fromAccount = req.body.fromAccount || req.body.fromAccountId;
    let toAccount = req.body.toAccount || req.body.toAccountId;
    const { amount, transferType } = req.body;
    const idempotencyKey = req.body.idempotencyKey || `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transferAmount = Number(amount);

    if (transferType === 'SELF') {
        toAccount = fromAccount;
    }

    if (!fromAccount || !toAccount || !transferAmount) {
        return res.status(400).json({
            message: "fromAccount, toAccount, and amount are required",
            received: { fromAccount, toAccount, transferAmount }
        });
    }

    try {
        
        const fromUserAccount = await accountModel.findOne({ _id: fromAccount }).populate('user');
        const toUserAccount = await accountModel.findOne({ _id: toAccount }).populate('user');

        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({ message: "Invalid account details provided" });
        }

        const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey });
        if (isTransactionAlreadyExists) {
            return res.status(200).json({
                message: `Transaction already ${isTransactionAlreadyExists.status.toLowerCase()}`,
                transaction: isTransactionAlreadyExists
            });
        }

        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(400).json({ message: "Accounts must be ACTIVE" });
        }

        if (transferType !== 'SELF') {
            const balance = await fromUserAccount.getBalance();
            if (balance < transferAmount) {
                return res.status(400).json({
                    message: `Insufficient balance. Available: ₹${balance}`
                });
            }
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const [transaction] = await transactionModel.create([{
                fromAccount: transferType === 'SELF' ? null : fromAccount,
                toAccount,
                amount: transferAmount,
                idempotencyKey,
                status: "PENDING",
                user: req.user._id
            }], { session });

            if (transferType !== 'SELF') {
                await ledgerModel.create([{
                    account: fromAccount,
                    amount: transferAmount,
                    transaction: transaction._id,
                    type: "DEBIT"
                }], { session });
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            await ledgerModel.create([{
                account: toAccount,
                amount: transferAmount,
                transaction: transaction._id,
                type: "CREDIT"
            }], { session });

            await transactionModel.findOneAndUpdate(
                { _id: transaction._id },
                { status: "COMPLETED" },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            /**
             * EMAIL LOGIC: Notify both parties
             */
            try {
                // 1. Sender (A) notification (Debit/Deposit Confirmation)
                const senderMailType = transferType === 'SELF' ? "CREDIT" : "DEBIT";
                await emailService.sendTransactionEmail(
                    req.user.email, 
                    req.user.name, 
                    transferAmount, 
                    toAccount, 
                    senderMailType
                );

                // 2. Receiver (B) notification (Credit Alert)
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
                message: "Transaction completed successfully",
                transaction: transaction
            });

        } catch (innerError) {
            await session.abortTransaction();
            session.endSession();
            throw innerError;
        }
    } catch (error) {
        console.error("Transaction Error:", error);
        return res.status(500).json({ message: error.message });
    }
}

/**
 * System-initiated Initial Funds Transfer
 */
async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount } = req.body;
    const idempotencyKey = req.body.idempotencyKey || `init-${Date.now()}`;

    if (!toAccount || !amount) {
        return res.status(400).json({ message: "toAccount and amount are required" });
    }

    try {
        const toUserAccount = await accountModel.findOne({ _id: toAccount }).populate('user');
        const fromUserAccount = await accountModel.findOne({ user: req.user._id });

        if (!toUserAccount || !fromUserAccount) {
            return res.status(400).json({ message: "Invalid toAccount or System user not found" });
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

            // Initial Credit Notification
            if (toUserAccount.user && toUserAccount.user.email) {
                await emailService.sendTransactionEmail(
                    toUserAccount.user.email, 
                    toUserAccount.user.name, 
                    Number(amount), 
                    fromUserAccount._id, 
                    "CREDIT"
                );
            }

            return res.status(201).json({ message: "Initial funds credited successfully", transaction });
        } catch (innerError) {
            await session.abortTransaction();
            session.endSession();
            throw innerError;
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { createTransaction, createInitialFundsTransaction };