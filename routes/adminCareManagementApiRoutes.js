// routes/adminCareManagementApiRoutes.js
const express = require('express');
const router = express.Router();
const careManagementController = require('../controllers/careManagementController');

const uploader = careManagementController.uploader; // Get uploader from controller

// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

router.post('/', uploader.single('image'), careManagementController.createAdminCareEntry);
router.put('/:id', uploader.single('image'), careManagementController.updateAdminCareEntry);
router.delete('/:id', careManagementController.deleteAdminCareEntry);

module.exports = router;