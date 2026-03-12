const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");
const transactionController = require("../controllers/transaction.controller"); // New Import

const router = express.Router();

/**
 * @route   POST /api/accounts/create
 * @desc    Open a new account (Redirects to /accounts on success)
 */
router.post("/create", authMiddleware.authMiddleware, accountController.createAccountController);

/**
 * @route   GET /api/accounts/
 * @desc    Fetch all accounts for the user (JSON API)
 */
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController);

/**
 * @route   GET /api/accounts/balance/:accountId
 * @desc    Get real-time balance for a specific account
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController);

/**
 * @route   POST /api/accounts/transfer
 * @desc    Handles Money Transfer & Self-Deposit 
 * @logic   Connects to Transaction Controller for Email and Status Tracking
 */
router.post("/transfer", authMiddleware.authMiddleware, transactionController.createTransaction);

module.exports = router;