// routes/adminTrustedBuyerPageRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminTrustedBuyerController");
const {
  ensureAuthenticated,
  ensureAdminRole,
} = require("../middlewares/adminAuthMiddleware");
router.use(ensureAuthenticated, ensureAdminRole);
router.get("/", ctrl.getAdminTrustedBuyersListPage);
router.get("/add", ctrl.showAdminAddTrustedBuyerForm);
router.get("/edit/:id", ctrl.showAdminEditTrustedBuyerForm);

module.exports = router;
