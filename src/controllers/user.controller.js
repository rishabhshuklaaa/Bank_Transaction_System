const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");

/**
 * Fetches all necessary data for the React Dashboard.
 * GET /api/user/dashboard-data
 */
async function getDashboardData(req, res) {
    try {
        // 1. Fetch user accounts
        const accountsData = await accountModel.find({ user: req.user._id });

        // 2. Map accounts with real-time balance aggregation
        const accounts = await Promise.all(accountsData.map(async (acc) => {
            const currentBalance = await acc.getBalance();
            return { ...acc.toObject(), balance: currentBalance };
        }));

        const accountIds = accounts.map(a => a._id);

        // 3. Fetch recent ledger entries for the activity feed
        const recentLedgerEntries = await ledgerModel.find({
            account: { $in: accountIds }
        })
        .populate('transaction')
        .sort({ createdAt: -1 })
        .limit(8);

        // 4. Format for React UI
        const recentTransactions = recentLedgerEntries.map(entry => ({
            _id: entry.transaction ? entry.transaction._id : entry._id,
            type: entry.type,
            amount: entry.amount,
            description: entry.type === 'DEBIT' ? 'Payment Sent' : 'Money Received',
            createdAt: entry.createdAt
        }));

        res.status(200).json({
            success: true,
            user: {
                name: req.user.name,
                email: req.user.email
            },
            accounts,
            recentTransactions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load dashboard data." });
    }
}

/**
 * Fetches full transaction history across all accounts for the History page.
 * GET /api/user/history
 */
async function getFullHistory(req, res) {
    try {
        const userAccounts = await accountModel.find({ user: req.user._id });
        const accountIds = userAccounts.map(a => a._id);

        const ledgerEntries = await ledgerModel.find({ 
            account: { $in: accountIds } 
        })
        .populate('transaction') 
        .sort({ createdAt: -1 });

        const transactions = ledgerEntries.map(entry => ({
            _id: entry.transaction ? entry.transaction._id : entry._id,
            type: entry.type,
            amount: entry.amount,
            accountNo: entry.account.toString().slice(-4),
            createdAt: entry.createdAt,
            status: entry.transaction ? entry.transaction.status : 'COMPLETED'
        }));

        res.status(200).json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load history." });
    }
}

module.exports = {
    getDashboardData,
    getFullHistory
};