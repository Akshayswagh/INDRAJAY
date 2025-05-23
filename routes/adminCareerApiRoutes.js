// routes/adminCareerApiRoutes.js
const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
// const { ensureAuthenticated, ensureAdmin } = require('../config/auth');

// router.use(ensureAuthenticated);
// router.use(ensureAdmin);

router.post('/', careerController.createAdminJob);
router.put('/:id', careerController.updateAdminJob);
router.delete('/:id', careerController.deleteAdminJob);

module.exports = router;