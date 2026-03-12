const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");

/**
 * Creates a new bank account and redirects back to the accounts page
 */
async function createAccountController(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { accountType, balance } = req.body;
        const initialDeposit = Number(balance);

        if (!accountType || initialDeposit < 500) {
            throw new Error("Minimum initial deposit of ₹500 is required.");
        }

        // 1. Create the account
        const [newAccount] = await accountModel.create([{
            user: req.user._id,
            accountType,
            balance: 0 // Ledger will maintain the actual balance
        }], { session });

        const idempotencyKey = uuidv4();

        // 2. Create Initial Deposit Transaction record
        const [transaction] = await transactionModel.create([{
            user: req.user._id,
            amount: initialDeposit,
            type: "DEPOSIT",
            status: "COMPLETED",
            idempotencyKey,
            toAccount: newAccount._id,
            description: "Initial Account Opening Deposit"
        }], { session });

        // 3. Credit Ledger Entry to reflect balance
        await ledgerModel.create([{
            account: newAccount._id,
            transaction: transaction._id,
            amount: initialDeposit,
            type: "CREDIT",
            description: "Initial Deposit"
        }], { session });

        await session.commitTransaction();
        
        
        return res.redirect("/accounts");

    } catch (error) {
        await session.abortTransaction();
        console.error("Account Creation Error:", error.message);
        
        return res.redirect("/accounts?error=" + encodeURIComponent(error.message));
    } finally {
        session.endSession();
    }
}

/**
 * Fetches all accounts owned by the user 
 */
async function getUserAccountsController(req, res) {
    try {
        const accountsData = await accountModel.find({ user: req.user._id });

        // Calculate real-time balance for each account before rendering
        const accounts = await Promise.all(accountsData.map(async (acc) => {
            const currentBalance = await acc.getBalance();
            return {
                ...acc.toObject(),
                balance: currentBalance
            };
        }));

        res.status(200).json({ accounts });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Fetches real-time balance using ledger aggregation
 */
async function getAccountBalanceController(req, res) {
    try {
        const { accountId } = req.params;
        const account = await accountModel.findOne({ _id: accountId, user: req.user._id });
        
        if (!account) return res.status(404).json({ message: "Account not found" });

        const balance = await account.getBalance();
        res.status(200).json({ accountId, balance });
    } catch (error) {
        res.status(500).json({ message: "Error fetching balance" });
    }
}

/**
 * Money transfer logic (Keeping it for Dashboard use)
 */
async function transferMoneyController(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fromAccountId, toAccountId, amount } = req.body;
        const transferAmount = Number(amount);

        if (!fromAccountId || !toAccountId || transferAmount <= 0) {
            throw new Error("Invalid transfer details.");
        }

        const senderAccount = await accountModel.findOne({ _id: fromAccountId, user: req.user._id });
        if (!senderAccount) throw new Error("Unauthorized source account.");

        const currentBalance = await senderAccount.getBalance();
        if (currentBalance < transferAmount) throw new Error("Insufficient funds.");

        const recipientAccount = await accountModel.findById(toAccountId);
        if (!recipientAccount) throw new Error("Recipient does not exist.");

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

        await ledgerModel.create([{
            account: fromAccountId,
            transaction: transaction._id,
            amount: transferAmount,
            type: "DEBIT",
            description: `Sent to ${toAccountId}`
        }], { session });

        await ledgerModel.create([{
            account: toAccountId,
            transaction: transaction._id,
            amount: transferAmount,
            type: "CREDIT",
            description: `Received from ${fromAccountId}`
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ status: "success", message: "Transfer successful" });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ status: "error", message: error.message });
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