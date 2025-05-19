const careManagement = require("../models/careManagement");
const mongoose = require("mongoose");

// Helper: Validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create new care and management entry
const createEntry = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required." });
    }

    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const imagePath = req.file.path; // Cloudinary URL
    const newEntry = new careManagement({ title, description, image: imagePath });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all entries
const getAllEntries = async (req, res) => {
  try {
    const entries = await careManagement.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get single entry
const getEntryById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ msg: "Invalid entry ID" });
  }

  try {
    const entry = await careManagement.findById(id);
    if (!entry) return res.status(404).json({ msg: "Entry not found" });

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Update entry
const updateEntry = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ msg: "Invalid entry ID" });
  }

  try {
    const { title, description } = req.body;
    const updateData = { title, description, updatedAt: new Date() };

    if (req.file) {
      updateData.image = req.file.path; // Cloudinary path
    }

    const updatedEntry = await careManagement.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedEntry) return res.status(404).json({ msg: "Entry not found" });

    res.json(updatedEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Delete entry
const deleteEntry = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ msg: "Invalid entry ID" });
  }

  try {
    const deletedEntry = await careManagement.findByIdAndDelete(id);
    if (!deletedEntry) return res.status(404).json({ msg: "Entry not found" });

    res.json({ msg: "Entry removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createEntry,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
};
