const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// --- View Engine & Directory Setup ---
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

// --- Layout Configuration ---
app.use(expressLayouts);

app.set('layout', 'layouts/main'); 

// --- Static Files (CSS, JS, Images) ---

const publicPath = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicPath));

// --- Middleware ---
app.use(express.json());
// Important for handling form submissions directly
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * - Routes required
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");
const viewRouter = require("./routes/view.routes"); 

/**
 * - Use Routes
 */

app.use("/", viewRouter);
// API routes for backend logic
app.use("/api/auth", authRouter); 
app.use("/api/accounts", accountRouter); 
app.use("/api/transactions", transactionRoutes);

module.exports = app;