// routes/adminEventApiRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/adminEventController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// Middleware for image uploads from the controller
const uploader = eventController.uploader;

// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

// POST / (e.g., /admin/api/events) - Create a new event
router.post('/', uploader.single('image'), eventController.createAdminEvent);

// PUT /:id (e.g., /admin/api/events/:id) - Update an event
router.put('/:id', uploader.single('image'), eventController.updateAdminEvent);

// DELETE /:id (e.g., /admin/api/events/:id) - Delete an event
router.delete('/:id', eventController.deleteAdminEvent);

module.exports = router;