const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');
const cors = require('cors');

const app = express();

/**
 * --- CORS Configuration ---
 * Configured to allow the React frontend to communicate with this backend.
 * 'credentials: true' allows the browser to send/receive JWT cookies.
 */
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));

/**
 * --- Standard Middlewares ---
 */
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

/**
 * --- Static Files ---
 */
const publicPath = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicPath));

/**
 * --- API Routes ---
 * All logic is served under /api. Client-side routing is handled by React.
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");
const userRouter = require("./routes/user.routes"); // New Import

app.use("/api/auth", authRouter); 
app.use("/api/accounts", accountRouter); 
app.use("/api/transactions", transactionRoutes);
app.use("/api/user", userRouter); // Use User routes for Dashboard/History data

/**
 * --- Global Error Handling Middleware ---
 * Catches errors like database failures or atomicity issues.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;