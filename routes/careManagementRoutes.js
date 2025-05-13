const express = require("express");
const router = express.Router();
const getMulterUploader = require("../config/multerConfig");

const uploader = getMulterUploader("careManagement");

const careManagement = require("../models/careManagement"); // Adjust path as needed

// @route   POST /api/care-management
// @desc    Create new care and management entry
// @access  Public (you might want to add auth middleware)
router.post("/", uploader.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: " image is required.",
      });
    }
    const { title, description } = req.body;

    // Simple validation
    if (!title || !description) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

const imagePath = req.file.path; // full Cloudinary URL

    const newEntry = new careManagement({
      title,
      description,
      image: imagePath,
    });

    const savedEntry = await newEntry.save();
    res.json(savedEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/care-management
// @desc    Get all care and management entries
// @access  Public
router.get("/", async (req, res) => {
  try {
    const entries = await careManagement.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/care-management/:id
// @desc    Get single care and management entry
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const entry = await careManagement.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ msg: "Entry not found" });
    }

    res.json(entry);
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Entry not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// @route   PUT /api/care-management/:id
// @desc    Update care and management entry
// @access  Public (add auth as needed)
router.put("/:id", uploader.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    const updateData = {
      title,
      description,
      updatedAt: new Date(),
    };

    if (req.file) {
      updateData.image = `/uploads/careManagent/${req.file.filename}`; // Adjust path if needed
    }
    const updatedEntry = await careManagement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedEntry) {
      return res.status(404).json({ msg: "Entry not found" });
    }

    res.json(updatedEntry);
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Entry not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// @route   DELETE /api/care-management/:id
// @desc    Delete care and management entry
// @access  Public (add auth as needed)
router.delete("/:id", async (req, res) => {
  try {
    const deletedEntry = await careManagement.findByIdAndDelete(req.params.id);

    if (!deletedEntry) {
      return res.status(404).json({ msg: "Entry not found" });
    }

    res.json({ msg: "Entry removed" });
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Entry not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
