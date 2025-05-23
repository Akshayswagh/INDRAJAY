// middleware/adminAuthMiddleware.js

const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) { // Check if user is in session
        return next();
    }
    req.session.returnTo = req.originalUrl; // Store original URL to redirect back after login
    req.flash('error_msg', 'You must be logged in to view this admin page.');
    res.redirect('/admin/auth/login');
};

const ensureAdminRole = (req, res, next) => {
    // This middleware should run AFTER ensureAuthenticated
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'You do not have permission to access this page.');
    // If already logged in but not admin, redirect to a different page or show error
    // If somehow this is hit without a session, ensureAuthenticated should have caught it
    res.redirect(req.session.user ? '/' : '/admin/auth/login'); // Redirect non-admin to home or login
};

module.exports = {
    ensureAuthenticated,
    ensureAdminRole
};