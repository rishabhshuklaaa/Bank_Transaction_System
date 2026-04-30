const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');
const cors = require('cors');

const app = express();

/**
 * --- CORS Configuration ---
 * We define an array of allowed origins.
 * 1. Localhost: For your development in VS Code.
 * 2. Render URL: For your live production site.
 */
const allowedOrigins = [
    'http://localhost:5173', 
    'https://bank-transaction-system-1.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            // Origin is allowed
            callback(null, true);
        } else {
            // Origin is not allowed
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Crucial for sending/receiving JWT cookies
}));

/**
 * --- Standard Middlewares ---
 */
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(cookieParser()); // Parses cookies from the request headers

/**
 * --- Root Route (Health Check) ---
 * Prevents "Cannot GET /" error when visiting the backend URL directly.
 */
app.get("/", (req, res) => {
    res.status(200).json({ status: "success", message: "API is live and running." });
});

/**
 * --- API Routes ---
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");
const userRouter = require("./routes/user.routes");

app.use("/api/auth", authRouter); 
app.use("/api/accounts", accountRouter); 
app.use("/api/transactions", transactionRoutes);
app.use("/api/user", userRouter);

/**
 * --- Global Error Handling ---
 * Middleware to catch all errors and return a structured JSON response.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;