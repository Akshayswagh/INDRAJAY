// routes/adminJobApplicationApiRoutes.js
const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');

// Only delete for now, you might add update status later
router.delete('/:id', jobApplicationController.deleteAdminJobApplication);
module.exports = router;