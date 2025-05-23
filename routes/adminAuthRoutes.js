// routes/adminAuthRoutes.js
const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

// Middleware to prevent logged-in admins from accessing login/register again
const forwardAuthenticatedAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return res.redirect('/admin'); // Or /admin/dashboard
    }
    next();
};

// GET /admin/auth/login - Display Admin Login Page
router.get('/login', forwardAuthenticatedAdmin, adminAuthController.showAdminLoginPage);

// POST /admin/auth/login - Handle Admin Login
router.post('/login', adminAuthController.processAdminLogin);

// GET /admin/auth/logout - Handle Admin Logout
router.get('/logout', adminAuthController.adminLogout);

// Optional Admin Registration Routes
// router.get('/register', forwardAuthenticatedAdmin, adminAuthController.showAdminRegisterPage);
// router.post('/register', adminAuthController.processAdminRegister);

module.exports = router;