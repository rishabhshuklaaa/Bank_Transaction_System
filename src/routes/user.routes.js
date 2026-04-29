const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

/**
 * Routes for fetching user-specific data needed by the React frontend.
 */

// Fetches summary for the Dashboard view
router.get("/dashboard-data", authMiddleware.authMiddleware, userController.getDashboardData);

// Fetches full list for the Transaction History view
router.get("/history", authMiddleware.authMiddleware, userController.getFullHistory);

module.exports = router;