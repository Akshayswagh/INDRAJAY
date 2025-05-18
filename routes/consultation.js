const express = require("express");
const router = express.Router();
const controller = require("../controllers/consultationController");

router.get("/", controller.getAllConsultations);
router.get("/new", controller.showCreateForm);
router.post("/", controller.createConsultation);

// router.get("/view/:id", controller.getConsultationById);

router.get("/:id/edit", controller.showEditForm);
router.post("/:id", controller.updateConsultation);
router.post("/:id/delete", controller.deleteConsultation);

module.exports = router;
