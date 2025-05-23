// routes/adminEnquiryPageRoutes.js
const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// router.use(ensureAuthenticated, ensureAdmin);

router.get('/', enquiryController.getAdminEnquiriesListPage);
router.get('/view/:id', enquiryController.viewAdminEnquiryDetails);

module.exports = router;