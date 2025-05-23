// routes/adminEventPageRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/adminEventController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

// GET / (e.g., /admin/events) - Display list of events
router.get('/', eventController.getAdminEventsListPage);

// GET /add - Display form to add a new event
router.get('/add', eventController.showAdminAddEventForm);

// GET /edit/:id - Display form to edit an event
router.get('/edit/:id', eventController.showAdminEditEventForm);

module.exports = router;