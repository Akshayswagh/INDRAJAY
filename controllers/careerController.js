const mongoose = require("mongoose");
const Career = require("../models/careerModel");

// Helper: Validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new job posting
const createJob = async (req, res) => {
  try {
    const { role, domain, description } = req.body;

    if (!role || !domain || !description) {
      return res.status(400).json({ error: "Role, domain, and description are required." });
    }

    const career = new Career(req.body);
    await career.save();
    res.status(201).json({ message: "Job created successfully", data: career });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// Get all job postings
const getAllJobs = async (req, res) => {
  try {
    const careers = await Career.find().sort({ created_at: -1 });
    res.json({ total: careers.length, data: careers });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// Get a specific job by ID
const getJobById = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid job ID" });
  }

  try {
    const career = await Career.findById(id);
    if (!career) return res.status(404).json({ error: "Job not found" });
    res.json({ data: career });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// Update a job posting
const updateJob = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid job ID" });
  }

  try {
    const updatedCareer = await Career.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCareer) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job updated successfully", data: updatedCareer });
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err.message });
  }
};

// Delete a job posting
const deleteJob = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid job ID" });
  }

  try {
    const result = await Career.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
