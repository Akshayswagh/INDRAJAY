// routes/adminJobApplicationPageRoutes.js
const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');

router.get('/', jobApplicationController.getAdminJobApplicationsListPage);
// router.get('/view/:id', jobApplicationController.viewAdminJobApplicationDetails); // If you add a detail view
module.exports = router;