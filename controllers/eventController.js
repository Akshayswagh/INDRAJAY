const Event = require("../models/Event");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get a single event
const getEventById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Create an event
const createEvent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Event image is required.",
      });
    }

    const imagePath = req.file.path;
    const { name, category, description, venue, date, time } = req.body;

    const event = await Event.create({
      name,
      category,
      description,
      venue,
      date,
      time,
      image: imagePath,
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update event
const updateEvent = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }

    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Delete event
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
