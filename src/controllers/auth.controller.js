const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");

/**
 * Handles user registration.
 * POST /api/auth/register
 */
async function userRegisterController(req, res) {
    const { email, password, name } = req.body;

    // Check if a user with the given email already exists
    const isExists = await userModel.findOne({ email: email });

    if (isExists) {
        return res.status(422).json({
            message: "User already exists with this email.",
            status: "failed"
        });
    }

    // Create the new user record
    const user = await userModel.create({
        email, password, name
    });

    // Generate a JWT valid for 3 days
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

    // Set the token in a cookie for browser-based session management
    res.cookie("token", token);

    // Return the user data and token as JSON for React
    res.status(201).json({
        success: true,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });

    // Send the welcome email asynchronously
    await emailService.sendRegistrationEmail(user.email, user.name);
}

/**
 * Handles user login.
 * POST /api/auth/login
 */
async function userLoginController(req, res) {
    const { email, password } = req.body;

    // Find the user and explicitly include the password for comparison
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        });
    }

    // Use the model method to compare the hashed password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        });
    }

    // Generate JWT upon successful authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

    res.cookie("token", token);

    // Return status 200 with JSON payload
    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
}

/**
 * Handles user logout.
 * POST /api/auth/logout
 * Changed: Replaced redirects with JSON responses for React compatibility.
 */
async function userLogoutController(req, res) {
    // Extract token from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        // Instead of redirecting, return a 400 error or success if session is already gone
        return res.status(400).json({
            success: false,
            message: "No active session or token found."
        });
    }

    // Blacklist the token to prevent further use
    await tokenBlackListModel.create({
        token: token
    });

    // Clear the cookie on the client side
    res.clearCookie("token");

    // Return JSON success so React can navigate the user to the landing page
    res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
};