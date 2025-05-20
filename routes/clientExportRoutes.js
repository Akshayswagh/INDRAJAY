// routes/clientExportRoutes.js
const express = require('express');
const router = express.Router();
const adminExportController = require('../controllers/adminExportController'); // Or a dedicated clientExportController

// GET /:id (e.g., /exports/view/some-id) - Display single export item to client
router.get('/view/:id', adminExportController.viewClientExportDetails);

module.exports = router;