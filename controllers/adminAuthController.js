// controllers/adminAuthController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Adjust path to your User model

// Render Admin Login Page
const showAdminLoginPage = (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        // console.log("[DEBUG] Admin already logged in, redirecting to /admin");
        return res.redirect('/admin'); // Or /admin/dashboard
    }
    // console.log("[DEBUG] Rendering admin login page");
    res.render("admin/auth/login", {
        title: "Admin Login",
        layout: false, // Or your specific auth layout
        // Messages will be available via res.locals from flash
    });
};

// Handle Admin Login Submission (Simplified)
const processAdminLogin = async (req, res) => {
    console.log("--- processAdminLogin function started ---");
    console.log("Request body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        console.log("Validation failed: Email or password missing.");
        req.flash('error_msg', 'Please enter both email and password.');
        return res.redirect('/admin/auth/login');
    }

    try {
        console.log(`Attempting to find admin user: ${email}`);
        const adminUser = await User.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');
        // console.log("Admin user from DB:", adminUser ? adminUser.email : "null");

        if (!adminUser) {
            console.log("Admin user not found in DB or not an admin.");
            req.flash('error_msg', 'Admin account not found or invalid credentials.');
            return res.redirect('/admin/auth/login');
        }

        // console.log("Comparing password for user:", adminUser.email);
        const isMatch = await bcrypt.compare(password, adminUser.password);
        // console.log("Password match status:", isMatch);

        if (!isMatch) {
            console.log("Password does not match.");
            req.flash('error_msg', 'Invalid credentials.');
            return res.redirect('/admin/auth/login');
        }

        console.log("Password matches. Creating session.");
        // Store essential, non-sensitive user info in the session
        req.session.user = {
            id: adminUser._id,
            name: adminUser.name, // Or username if you prefer
            email: adminUser.email,
            role: adminUser.role
        };
        console.log('Admin session created:', JSON.stringify(req.session.user));

        req.flash('success_msg', 'You are now logged in as Admin.');
        const redirectUrl = req.session.returnTo || '/admin'; // Or /admin/dashboard
        delete req.session.returnTo; // Clean up returnTo from session

        console.log("Redirecting to:", redirectUrl);
        res.redirect(redirectUrl);
        // console.log("--- Redirect sent from processAdminLogin (try block) ---");

    } catch (error) {
        console.error("!!! Admin Login Error in try-catch block !!!:", error);
        req.flash('error_msg', 'An error occurred during login. Please try again.');
        res.redirect('/admin/auth/login');
        // console.log("--- Redirect sent from CATCH block in processAdminLogin ---");
    }
};

// Handle Admin Logout
const adminLogout = (req, res, next) => {
    // console.log("[DEBUG] adminLogout called.");
    req.session.destroy((err) => {
        if (err) {
            console.error("[DEBUG] Session destruction error:", err);
            return next(err); // Good practice to pass to Express error handler
        }
        res.clearCookie('connect.sid'); // Default session cookie name
        // console.log("[DEBUG] Session destroyed. Redirecting to /admin/auth/login?loggedout=true");
        res.redirect('/admin/auth/login?loggedout=true'); // Add query param for frontend if needed
    });
};

module.exports = {
    showAdminLoginPage,
    processAdminLogin,
    adminLogout,
};