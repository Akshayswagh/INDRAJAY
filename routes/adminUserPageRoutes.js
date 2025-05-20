// routes/adminUserPageRoutes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth'); // Your auth middleware

// Protect all routes in this file (example)
// router.use(ensureAuthenticated);
// router.use(ensureAdmin); // Or a more specific role check if needed

// GET /users - Display list of 'user' role users
router.get('/users', adminUserController.getAdminUsersListPage);

// GET /vendors - Display list of 'vendor' role users
router.get('/vendors', adminUserController.getAdminVendorsListPage);

// GET /admins - Display list of 'admin' role users
router.get('/admins', adminUserController.getAdminAdminsListPage);

// You might add routes here for:
// router.get('/view/:id', adminUserController.viewUserDetailsAdmin);
// router.get('/edit/:id', adminUserController.showEditUserFormAdmin);
// etc.

module.exports = router;