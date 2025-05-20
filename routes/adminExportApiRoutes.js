// routes/adminExportApiRoutes.js
const express = require('express');
const router = express.Router();
const adminExportController = require('../controllers/adminExportController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth'); // Your auth middleware

// Middleware for image uploads from the controller
const uploader = adminExportController.uploader; // Using the exported uploader

// Protect all routes in this file (example)
// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

// POST / (e.g., /admin/api/exports -> mounted path) - Create a new export item
router.post('/', uploader.single('image'), adminExportController.createExportItem);

// PUT /:id (e.g., /admin/api/exports/:id) - Update an export item
router.put('/:id', uploader.single('image'), adminExportController.updateExportItem);

// DELETE /:id (e.g., /admin/api/exports/:id) - Delete an export item
router.delete('/:id', adminExportController.deleteExportItem);

module.exports = router;