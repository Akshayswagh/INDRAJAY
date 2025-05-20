// routes/adminExportPageRoutes.js
const express = require('express');
const router = express.Router();
const adminExportController = require('../controllers/adminExportController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth'); // Your auth middleware

// Protect all routes in this file (example)
// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

// GET / (e.g., /admin/exports -> mounted path) - Display list of export items
router.get('/', adminExportController.getAdminExportsListPage);

// GET /add - Display form to add a new export item
router.get('/add', adminExportController.showAddExportForm);

// GET /edit/:id - Display form to edit an export item
router.get('/edit/:id', adminExportController.showEditExportForm);

module.exports = router;