const express = require("express");
const router = express.Router();
const getMulterUploader = require("../config/multerConfig");
const uploader = getMulterUploader("careManagement");

const {
  createEntry,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} = require("../controllers/careManagementController");

// Routes
router.post("/", uploader.single("image"), createEntry);
router.get("/", getAllEntries);
router.get("/:id", getEntryById);
router.put("/:id", uploader.single("image"), updateEntry);
router.delete("/:id", deleteEntry);

module.exports = router;
