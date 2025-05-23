// routes/adminEnquiryApiRoutes.js
const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// router.use(ensureAuthenticated, ensureAdmin);

router.put('/:id', enquiryController.updateAdminEnquiry);
router.delete('/:id', enquiryController.deleteAdminEnquiry);

module.exports = router;