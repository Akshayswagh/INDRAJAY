// routes/publicEventApiRoutes.js (Your existing event router, if it's for public API)
const express = require("express");
const router = express.Router();
// No uploader needed here if these are just GET requests
const {
  getAllEvents, // This is your original controller function that returns JSON
  getEventById,   // This is your original controller function that returns JSON
} = require("../controllers/adminEventController"); // Assuming these JSON-returning functions are still there

router.get("/", getAllEvents);     // GET /api/events (example mount)
router.get("/:id", getEventById);  // GET /api/events/123

module.exports = router;