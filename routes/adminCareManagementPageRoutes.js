// routes/adminCareManagementPageRoutes.js
const express = require('express');
const router = express.Router();
const careManagementController = require('../controllers/careManagementController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

router.get('/', careManagementController.getAdminCareManagementListPage);
router.get('/add', careManagementController.showAdminAddCareEntryForm);
// The GET /edit/:id route can remain if you might want a dedicated edit page later,
// but for modal editing, it's not strictly necessary for the modal to open.
router.get('/edit/:id', careManagementController.showAdminEditCareEntryForm);

module.exports = router;