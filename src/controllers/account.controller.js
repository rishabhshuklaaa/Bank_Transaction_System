const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");

/**
 * Creates a new bank account.
 * Updated: Replaced redirects with JSON responses for React frontend compatibility.
 */
async function createAccountController(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { accountType, balance } = req.body;
        const initialDeposit = Number(balance);

        // Validation: Minimum deposit check
        if (!accountType || initialDeposit < 500) {
            throw new Error("Minimum initial deposit of ₹500 is required.");
        }

        // 1. Create the account object within the session
        const [newAccount] = await accountModel.create([{
            user: req.user._id,
            accountType,
            balance: 0 // Balance is dynamically derived from the Ledger
        }], { session });

        // Generate a unique key to prevent duplicate initial deposits
        const idempotencyKey = uuidv4();

        // 2. Create the Initial Deposit Transaction record
        const [transaction] = await transactionModel.create([{
            user: req.user._id,
            amount: initialDeposit,
            type: "DEPOSIT",
            status: "COMPLETED",
            idempotencyKey,
            toAccount: newAccount._id,
            description: "Initial Account Opening Deposit"
        }], { session });

        // 3. Create a Ledger Entry (CREDIT) to reflect the starting balance
        await ledgerModel.create([{
            account: newAccount._id,
            transaction: transaction._id,
            amount: initialDeposit,
            type: "CREDIT",
            description: "Initial Deposit"
        }], { session });

        // Commit all changes atomically
        await session.commitTransaction();
        
        // Return success response to React
        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            account: newAccount
        });

    } catch (error) {
        // Rollback any changes if an error occurs during the session
        await session.abortTransaction();
        console.error("Account Creation Error:", error.message);
        
        // Return structured error message for frontend display
        return res.status(400).json({
            success: false,
            message: error.message
        });
    } finally {
        // Ensure the session is always closed
        session.endSession();
    }
}

/**
 * Fetches all accounts owned by the authenticated user.
 */
async function getUserAccountsController(req, res) {
    try {
        const accountsData = await accountModel.find({ user: req.user._id });

        // Use the aggregate getBalance method for each account to get real-time data
        const accounts = await Promise.all(accountsData.map(async (acc) => {
            const currentBalance = await acc.getBalance();
            return {
                ...acc.toObject(),
                balance: currentBalance
            };
        }));

        res.status(200).json({
            success: true,
            accounts
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error while fetching accounts" 
        });
    }
}

/**
 * Fetches the real-time balance of a specific account using ledger aggregation.
 */
async function getAccountBalanceController(req, res) {
    try {
        const { accountId } = req.params;
        const account = await accountModel.findOne({ _id: accountId, user: req.user._id });
        
        if (!account) {
            return res.status(404).json({ 
                success: false, 
                message: "Account not found" 
            });
        }

        const balance = await account.getBalance();
        res.status(200).json({ 
            success: true,
            accountId, 
            balance 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error fetching balance" 
        });
    }
}

/**
 * Handles money transfers between accounts.
 * This maintains atomicity and handles race conditions via Mongoose sessions.
 */
async function transferMoneyController(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fromAccountId, toAccountId, amount } = req.body;
        const transferAmount = Number(amount);

        // Basic validation
        if (!fromAccountId || !toAccountId || transferAmount <= 0) {
            throw new Error("Invalid transfer details.");
        }

        // Verify sender ownership and funds
        const senderAccount = await accountModel.findOne({ _id: fromAccountId, user: req.user._id });
        if (!senderAccount) throw new Error("Unauthorized source account.");

        const currentBalance = await senderAccount.getBalance();
        if (currentBalance < transferAmount) throw new Error("Insufficient funds.");

        // Verify recipient exists
        const recipientAccount = await accountModel.findById(toAccountId);
        if (!recipientAccount) throw new Error("Recipient does not exist.");

        // Create the transaction record with an idempotency key
        const [transaction] = await transactionModel.create([{
            user: req.user._id,
            amount: transferAmount,
            type: "TRANSFER",
            status: "COMPLETED",
            idempotencyKey: uuidv4(),
            fromAccount: fromAccountId,
            toAccount: toAccountId,
            description: `Transfer to ${toAccountId}`
        }], { session });

        // Double-entry bookkeeping: DEBIT the sender
        await ledgerModel.create([{
            account: fromAccountId,
            transaction: transaction._id,
            amount: transferAmount,
            type: "DEBIT",
            description: `Sent to ${toAccountId}`
        }], { session });

        // Double-entry bookkeeping: CREDIT the receiver
        await ledgerModel.create([{
            account: toAccountId,
            transaction: transaction._id,
            amount: transferAmount,
            type: "CREDIT",
            description: `Received from ${fromAccountId}`
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ 
            success: true, 
            message: "Transfer successful" 
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    } finally {
        session.endSession();
    }
}

module.exports = {
    transferMoneyController,
    getUserAccountsController,
    getAccountBalanceController,
    createAccountController 
};