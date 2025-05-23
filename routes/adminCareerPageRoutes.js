// routes/adminCareerPageRoutes.js
const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

router.get('/', careerController.getAdminCareersListPage);
router.get('/add', careerController.showAdminAddJobForm);
router.get('/edit/:id', careerController.showAdminEditJobForm);

module.exports = router;