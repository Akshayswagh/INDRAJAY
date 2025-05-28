// routes/adminTrustedBuyerApiRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminTrustedBuyerController');
const bankPdfUploader = ctrl.bankPdfUploader;

const {
  ensureAuthenticated,
  ensureAdminRole,
} = require("../middlewares/adminAuthMiddleware");
router.use(ensureAuthenticated, ensureAdminRole);

router.post('/', bankPdfUploader.single('bankDetailsPdf'), ctrl.createAdminTrustedBuyer);
router.put('/:id', bankPdfUploader.single('bankDetailsPdf'), ctrl.updateAdminTrustedBuyer);
router.delete('/:id', ctrl.deleteAdminTrustedBuyer);

module.exports = router;