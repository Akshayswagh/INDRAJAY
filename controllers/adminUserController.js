// controllers/adminUserController.js
const User = require('../models/User'); // Adjust path to your User model

// Helper function to get sort criteria (to avoid repetition)
const getSortCriteria = (sortQuery) => {
    let criteria = { createdAt: -1 }; // Default: newest first (desc)
    let value = "desc";
    if (sortQuery === "asc") {
        criteria = { createdAt: 1 }; // Oldest first (asc)
        value = "asc";
    }
    return { sortCriteria: criteria, currentSortValue: value };
};

// Display list of all 'user' role users in Admin Panel
const getAdminUsersListPage = async (req, res) => {
    try {
        const { sortCriteria, currentSortValue } = getSortCriteria(req.query.sort);

        const usersData = await User.find({ role: "user" })
            .sort(sortCriteria)
            .lean();

        res.render('admin/view_users', { // Your EJS template for listing 'user' role
            title: 'Manage Users',
            activePage: 'view_users',
            users: usersData,
            currentSort: currentSortValue,
            currentUser: req.user || { name: 'Admin' }, // From auth middleware
            messages: { // From connect-flash middleware
                success_msg: req.flash ? req.flash('success_msg') : [],
                error_msg: req.flash ? req.flash('error_msg') : [],
            }
        });
    } catch (error) {
        console.error("Error fetching 'user' role users for admin list:", error);
        if(req.flash) req.flash('error_msg', 'Could not load users.');
        res.redirect(req.headers.referer || '/admin/dashboard');
    }
};

// Display list of all 'vendor' role users in Admin Panel
const getAdminVendorsListPage = async (req, res) => {
    try {
        const { sortCriteria, currentSortValue } = getSortCriteria(req.query.sort);

        const vendorsData = await User.find({ role: "vendor" })
            .sort(sortCriteria)
            .lean();

        res.render('admin/view_vendors', { // Your EJS template for listing 'vendor' role
            title: 'Manage Vendors',
            activePage: 'view_vendors',
            vendors: vendorsData,
            currentSort: currentSortValue,
            currentUser: req.user || { name: 'Admin' },
            messages: {
                success_msg: req.flash ? req.flash('success_msg') : [],
                error_msg: req.flash ? req.flash('error_msg') : [],
            }
        });
    } catch (error) {
        console.error("Error fetching 'vendor' role users for admin list:", error);
        if(req.flash) req.flash('error_msg', 'Could not load vendors.');
        res.redirect(req.headers.referer || '/admin/dashboard');
    }
};

// Display list of all 'admin' role users in Admin Panel
const getAdminAdminsListPage = async (req, res) => {
    try {
        const { sortCriteria, currentSortValue } = getSortCriteria(req.query.sort);

        const adminsData = await User.find({ role: "admin" })
            .sort(sortCriteria)
            .lean();

        res.render('admin/view_admins', { // Your EJS template for listing 'admin' role
            title: 'Manage Administrators',
            activePage: 'view_admins',
            admins: adminsData,
            currentSort: currentSortValue,
            currentUser: req.user || { name: 'Admin' },
            messages: {
                success_msg: req.flash ? req.flash('success_msg') : [],
                error_msg: req.flash ? req.flash('error_msg') : [],
            }
        });
    } catch (error) {
        console.error("Error fetching 'admin' role users for admin list:", error);
        if(req.flash) req.flash('error_msg', 'Could not load administrators.');
        res.redirect(req.headers.referer || '/admin/dashboard');
    }
};

// You might also add functions here for:
// - Viewing a single user's details (admin view)
// - Showing a form to edit a user's role or status
// - Handling the update of a user's role/status
// - Deleting/Banning a user

module.exports = {
    getAdminUsersListPage,
    getAdminVendorsListPage,
    getAdminAdminsListPage,
    // ... other user management functions for admin ...
};