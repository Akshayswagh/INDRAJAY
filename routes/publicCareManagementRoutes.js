// routes/publicCareManagementRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllEntries,  // This now maps to getAllEntriesAPI from the controller
  getEntryById,   // This now maps to getEntryByIdAPI from the controller
} = require("../controllers/careManagementController"); // Adjust path if needed

// GET all care & management entries (for public consumption, returns JSON)
// Example: your-site.com/api/care-entries/
router.get("/", getAllEntries);

// GET a single care & management entry by ID (for public consumption, returns JSON)
// Example: your-site.com/api/care-entries/123xyz
router.get("/:id", getEntryById);

module.exports = router;