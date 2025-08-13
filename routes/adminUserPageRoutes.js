// routes/adminUserPageRoutes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth'); // Your auth middleware

// Protect all routes in this file (example)
// router.use(ensureAuthenticated);
// router.use(ensureAdmin); // Or a more specific role check if needed

;

// GET /vendors - Display list of 'vendor' role users
router.get('/vendors', adminUserController.getAdminVendorsListPage);

// Mark vendor as trusted (using PATCH, so method-override needed if from HTML form)
router.patch('/vendors/:vendorId/trust', adminUserController.trustVendor);

// Unmark vendor as trusted
router.patch('/vendors/:vendorId/untrust', adminUserController.untrustVendor);

// Display only trusted vendors
router.get('/trusted-vendors', adminUserController.getTrustedVendorsListPage);


router.post('/vendors/delete/:id', adminUserController.deleteVendorFromAdmin);

// GET /admins - Display list of 'admin' role users
router.get('/admins', adminUserController.getAdminAdminsListPage);



module.exports = router;