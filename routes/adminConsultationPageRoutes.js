// routes/adminConsultationPageRoutes.js
const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth'); // Your auth middleware

// Example: Protect all admin page routes
// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

// GET / - Display list of consultations (e.g., /admin/consultations)
router.get('/', consultationController.getAdminConsultationsListPage);

// GET /add - Display form to add a new consultation (e.g., /admin/consultations/add)
router.get('/add', consultationController.showAdminAddConsultationForm);

// GET /edit/:id - Display form to edit a consultation (e.g., /admin/consultations/edit/123)
router.get('/edit/:id', consultationController.showAdminEditConsultationForm);

module.exports = router;