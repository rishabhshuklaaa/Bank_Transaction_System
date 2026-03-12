const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model"); 

// --- Landing page
router.get("/", (req, res) => {
    res.render("landing"); 
});

router.get("/auth/login", (req, res) => {
    res.render("auth/login");
});

router.get("/auth/register", (req, res) => {
    res.render("auth/register");
});

/**
 * @route   GET /dashboard
 * @desc    Main Action Center: Balance, Quick Transfer Form, and Recent Activity
 */
router.get("/dashboard", authMiddleware.authMiddleware, async (req, res) => {
    try {
        const accountsData = await accountModel.find({ user: req.user._id });

        // Real-time balance fetch
        const accounts = await Promise.all(accountsData.map(async (acc) => {
            const currentBalance = await acc.getBalance();
            return { ...acc.toObject(), balance: currentBalance };
        }));

        const accountIds = accounts.map(a => a._id);

        
        const recentLedgerEntries = await ledgerModel.find({
            account: { $in: accountIds }
        })
        .populate('transaction')
        .sort({ createdAt: -1 })
        .limit(8);

        // Data format for Dashboard
        const recentTransactions = recentLedgerEntries.map(entry => ({
            _id: entry.transaction ? entry.transaction._id : entry._id,
            type: entry.type, // DEBIT or CREDIT directly from Ledger
            amount: entry.amount,
            description: entry.type === 'DEBIT' ? 'Payment Sent' : 'Money Received',
            createdAt: entry.createdAt
        }));

        res.render("dashboard/dashboard", {
            user: req.user,
            accounts,
            recentTransactions
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).send("Failed to load dashboard.");
    }
});

/**
 * @route   GET /accounts
 * @desc    Account Management Page: View Cards and Open New Account
 */
router.get("/accounts", authMiddleware.authMiddleware, async (req, res) => {
    try {
        const accountsData = await accountModel.find({ user: req.user._id });

        const accounts = await Promise.all(accountsData.map(async (acc) => {
            const currentBalance = await acc.getBalance();
            return {
                ...acc.toObject(),
                balance: currentBalance 
            };
        }));

        res.render("accounts/index", { user: req.user, accounts });
    } catch (error) {
        res.status(500).send("Failed to load accounts.");
    }
});

/**
 * @route   GET /accounts/:accountId
 * @desc    Detailed Account View: User Info, Account ID, and Full Ledger History
 */
router.get("/accounts/:accountId", authMiddleware.authMiddleware, async (req, res) => {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({ 
            _id: accountId, 
            user: req.user._id 
        });

        if (!account) {
            return res.redirect("/accounts");
        }

        const balance = await account.getBalance();

        // Fetch ALL ledger entries for this specific account
        const ledgerEntries = await ledgerModel.find({ account: accountId })
            .populate('transaction')
            .sort({ createdAt: -1 });

        res.render("accounts/details", { 
            user: req.user, 
            account: { ...account.toObject(), balance },
            ledgerEntries 
        });
    } catch (error) {
        console.error("Details Page Error:", error);
        res.redirect("/accounts");
    }
});

/**
 * @route   GET /history
 * @desc    Full Transaction History across all accounts
 */
router.get("/history", authMiddleware.authMiddleware, async (req, res) => {
    try {
        
        const userAccounts = await accountModel.find({ user: req.user._id });
        const accountIds = userAccounts.map(a => a._id);

        
        const ledgerEntries = await ledgerModel.find({ 
            account: { $in: accountIds } 
        })
        .populate('transaction') 
        .sort({ createdAt: -1 });

        
        const transactions = ledgerEntries.map(entry => {
            return {
                _id: entry.transaction ? entry.transaction._id : entry._id,
                decimalId: parseInt(entry._id.toString().slice(-8), 16), // Hex to Decimal
                type: entry.type,
                amount: entry.amount,
                accountNo: entry.account.toString().slice(-4), // Last 4 digits of account
                createdAt: entry.createdAt,
                status: entry.transaction ? entry.transaction.status : 'COMPLETED'
            };
        });

        res.render("transactions/history", { user: req.user, transactions }); 
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).send("Failed to load history.");
    }
});

module.exports = router;