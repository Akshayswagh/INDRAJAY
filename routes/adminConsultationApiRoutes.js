// routes/adminConsultationApiRoutes.js
const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// Example: Protect all admin API routes
// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

// POST / - Create a new consultation (e.g., /admin/api/consultations)
router.post('/', consultationController.createAdminConsultation);

// PUT /:id - Update a consultation (e.g., /admin/api/consultations/123)
router.put('/:id', consultationController.updateAdminConsultation);

// DELETE /:id - Delete a consultation (e.g., /admin/api/consultations/123)
router.delete('/:id', consultationController.deleteAdminConsultation);

module.exports = router;