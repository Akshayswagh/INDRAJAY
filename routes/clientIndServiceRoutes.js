const express = require("express");
const router = express.Router();
const {
  showAllServices,
  showSingleService,
} = require("../controllers/adminIndServiceController");

router.get("/", showAllServices); // Renders a list of services for clients
router.get("/:id", showSingleService); // Renders a single service detail page for clients

module.exports = router;
