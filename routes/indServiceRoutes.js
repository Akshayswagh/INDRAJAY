const express = require("express");
const router = express.Router();
const {
  showAllServices,
  showSingleService,
  showAddForm,
  createService,
  showEditForm,
  updateService,
  deleteService,
} = require("../controllers/indServiceController");

// Home - All Services
router.get("/", showAllServices);

// Single Service
router.get("/service/:id", showSingleService);

// Create
router.get("/add-service", showAddForm);
router.post("/add-service", createService);

// Update
router.get("/edit/:id", showEditForm);
router.post("/edit/:id", updateService);

// Delete
router.post("/delete/:id", deleteService);

module.exports = router;
