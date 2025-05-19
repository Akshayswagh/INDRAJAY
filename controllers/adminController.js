// In your adminController.js for the /admin/users route
const User = require('../models/User'); // Your user model

exports.getUsersPage = async (req, res) => {
    try {
        const sortOrder = req.query.sort === 'asc' ? 1 : -1;
        const usersData = await User.find({ role: 'user' }).sort({ createdAt: sortOrder }).lean();
        res.render('admin/view_users', {
            title: 'Manage Users',
            activePage: 'view_users', // For sidebar active state
            users: usersData,
            currentSort: req.query.sort || 'desc'
            // layout: 'layouts/main' // Not needed if default is set, but can be explicit
        });
    } catch (err) {
        // Handle error
        res.status(500).send("Error fetching users.");
    }
};