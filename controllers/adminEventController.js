// controllers/eventController.js
const Event = require("../models/Event");
const mongoose = require("mongoose");
const getMulterUploader = require("../config/multerConfig"); // Assuming this path is correct
const uploader = getMulterUploader("events"); // Configure for 'events' subfolder

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// === ADMIN PAGE RENDERING CONTROLLERS ===

// Display list of all events in Admin Panel
const getAdminEventsListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Sort by event date, newest events first, then by creation date for same-day events
    const sortCriteria = { date: -1, createdAt: -1 };

    const events = await Event.find({})
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalEvents = await Event.countDocuments({});
    const totalPages = Math.ceil(totalEvents / limit);

    res.render("admin/view_events", {
      // EJS template for listing events
      title: "Manage Events",
      activePage: "view_events",
      events: events,
      currentSort: req.query.sort || "default", // or whatever logic you use
      // currentUser: req.user || { name: 'Admin' },
      messages: {
        success_msg: req.flash ? req.flash("success_msg") : [],
        error_msg: req.flash ? req.flash("error_msg") : [],
      },
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
    });
  } catch (err) {
    console.error("Error fetching events for admin list:", err);
    if (req.flash) req.flash("error_msg", "Could not load events.");
    res.redirect(req.headers.referer || "/admin/dashboard");
  }
};

// Display form to add a new event (Admin Panel)
const showAdminAddEventForm = (req, res) => {
  try {
    res.render("admin/add_event_form", {
      // EJS template for the add form
      title: "Add New Event",
      activePage: "add_event",
      currentUser: req.user || { name: "Admin" },
      messages: {
        success_msg: req.flash ? req.flash("success_msg") : [],
        error_msg: req.flash ? req.flash("error_msg") : [],
      },
      eventData: {},
      errors: [],
    });
  } catch (err) {
    console.error("Error rendering admin add event form:", err);
    if (req.flash) req.flash("error_msg", "Could not load the add event page.");
    res.redirect("/admin/events");
  }
};

// Display form to edit an existing event (Admin Panel)
const showAdminEditEventForm = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if (req.flash) req.flash("error_msg", "Invalid Event ID.");
    return res.redirect("/admin/events");
  }
  try {
    const event = await Event.findById(id).lean();
    if (!event) {
      if (req.flash) req.flash("error_msg", "Event not found.");
      return res.redirect("/admin/events");
    }
    // Format date for input type="date" (YYYY-MM-DD)
    const formattedDate = event.date
      ? new Date(event.date).toISOString().split("T")[0]
      : "";

    res.render("admin/edit_event_form", {
      // EJS template for the edit form
      title: "Edit Event",
      activePage: "edit_event",
      currentUser: req.user || { name: "Admin" },
      messages: {
        success_msg: req.flash ? req.flash("success_msg") : [],
        error_msg: req.flash ? req.flash("error_msg") : [],
      },
      eventItem: { ...event, date: formattedDate }, // Pass existing item data, with formatted date
      eventData: { ...event, date: formattedDate },
      errors: [],
    });
  } catch (err) {
    console.error(`Error rendering admin edit event form for item ${id}:`, err);
    if (req.flash)
      req.flash("error_msg", "Could not load the edit event page.");
    res.redirect("/admin/events");
  }
};

// === ADMIN API/ACTION CONTROLLERS (adapted for HTML form submissions & redirects) ===

// Create an event (Admin Panel Action)
const createAdminEvent = async (req, res) => {
  // uploader.single('image') will be middleware in the route
  try {
    const { name, category, description, venue, price, date, time } = req.body;
    let errors = [];

    // Basic server-side validation (schema validation will also run)
    if (!name || name.trim() === "")
      errors.push({ msg: "Event name is required." });
    if (!category) errors.push({ msg: "Category is required." });
    if (!description || description.trim() === "")
      errors.push({ msg: "Description is required." });
    if (!venue || venue.trim() === "")
      errors.push({ msg: "Venue is required." });
    if (!date) errors.push({ msg: "Date is required." });
    if (!time) errors.push({ msg: "Time is required." });
    if (!price) errors.push({ msg: "price is required." });
    if (!req.file) errors.push({ msg: "Event image is required." });

    if (errors.length > 0) {
      if (req.flash)
        req.flash("error_msg", errors.map((e) => e.msg).join("<br>"));
      // Re-render add form with errors and previous data
      return res.status(400).render("admin/add_event_form", {
        title: "Add New Event",
        activePage: "add_event",
        eventData: { name, category, description, venue, date, time },
        errors,
        currentUser: req.user || { name: "Admin" },
        messages: {
          /* Flash messages will be picked up by global middleware */
        },
      });
    }

    const imagePath = req.file.path; // Path from Multer/Cloudinary

    await Event.create({
      name,
      category,
      description,
      venue,
      date,
      price,
      time,
      image: imagePath,
    });

    if (req.flash) req.flash("success_msg", "Event created successfully!");
    res.redirect("/admin/events");
  } catch (err) {
    console.error("Error creating event (admin):", err);
    let errorMessages = ["Server Error. Please try again."];
    if (err.name === "ValidationError") {
      errorMessages = Object.values(err.errors).map((val) => val.message);
    }
    if (req.flash) req.flash("error_msg", errorMessages.join("<br>"));
    // Re-render add form with errors and previous data
    res.status(500).render("admin/add_event_form", {
      title: "Add New Event",
      activePage: "add_event",
      eventData: req.body,
      errors: errorMessages.map((msg) => ({ msg })),
      currentUser: req.user || { name: "Admin" },
      messages: {
        /* Flash messages will be picked up by global middleware */
      },
    });
  }
};

// Update event (Admin Panel Action)
const updateAdminEvent = async (req, res) => {
  // uploader.single('image') will be middleware in the route
  const { id } = req.params;
  if (!isValidId(id)) {
    if (req.flash) req.flash("error_msg", "Invalid Event ID.");
    return res.redirect("/admin/events");
  }

  try {
    const { name, category, description, price, venue, date, time } = req.body;
    let errors = [];

    // Basic server-side validation
    if (!name || name.trim() === "")
      errors.push({ msg: "Event name is required." });
    // ... add other validations as needed ...

    if (errors.length > 0) {
      if (req.flash)
        req.flash("error_msg", errors.map((e) => e.msg).join("<br>"));
      // Re-render edit form with errors and previous data
      // Need to fetch original event again for full form re-render or pass carefully
      const eventItem = await Event.findById(id).lean();
      const formattedDate = eventItem.date
        ? new Date(eventItem.date).toISOString().split("T")[0]
        : "";
      return res.status(400).render("admin/edit_event_form", {
        title: "Edit Event",
        activePage: "edit_event",
        eventItem: { ...eventItem, date: formattedDate, ...req.body }, // Merge with submitted data for repopulation
        eventData: { ...eventItem, date: formattedDate, ...req.body },
        errors,
        currentUser: req.user || { name: "Admin" },
        messages: {
          /* Flash messages will be picked up by global middleware */
        },
      });
    }

    const updateData = { name, category, description,price, venue, date, time };
    if (req.file) {
      updateData.image = req.file.path;
    }

    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      if (req.flash)
        req.flash("error_msg", "Event not found or could not be updated.");
      return res.redirect("/admin/events");
    }

    if (req.flash) req.flash("success_msg", "Event updated successfully!");
    res.redirect("/admin/events");
  } catch (err) {
    console.error(`Error updating event ${id} (admin):`, err);
    let errorMessages = ["Server Error. Please try again."];
    if (err.name === "ValidationError") {
      errorMessages = Object.values(err.errors).map((val) => val.message);
    }
    if (req.flash) req.flash("error_msg", errorMessages.join("<br>"));
    // Re-render edit form on error
    const eventItem = await Event.findById(id).lean(); // Re-fetch for safety
    const formattedDate = eventItem.date
      ? new Date(eventItem.date).toISOString().split("T")[0]
      : "";
    res.status(500).render("admin/edit_event_form", {
      title: "Edit Event",
      activePage: "edit_event",
      eventItem: { ...eventItem, date: formattedDate, ...req.body },
      eventData: { ...eventItem, date: formattedDate, ...req.body },
      errors: errorMessages.map((msg) => ({ msg })),
      currentUser: req.user || { name: "Admin" },
      messages: {
        /* Flash messages will be picked up by global middleware */
      },
    });
  }
};

// Delete event (Admin Panel Action)
const deleteAdminEvent = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if (req.flash) req.flash("error_msg", "Invalid Event ID.");
    return res.redirect("/admin/events");
  }

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      if (req.flash)
        req.flash("error_msg", "Event not found or could not be deleted.");
      return res.redirect("/admin/events");
    }
    // TODO: Optionally delete image from storage (Cloudinary/local)
    if (req.flash) req.flash("success_msg", "Event deleted successfully!");
    res.redirect("/admin/events");
  } catch (err) {
    console.error(`Error deleting event ${id} (admin):`, err);
    if (req.flash)
      req.flash("error_msg", "Error deleting event. Please try again.");
    res.redirect("/admin/events");
  }
};

// === CLIENT-FACING API/PAGE CONTROLLERS (Your existing ones, slightly adapted if needed) ===
// These can remain largely the same if they are for a public API or client-side rendering
// that expects JSON. If they also render EJS for clients, adapt similarly.

// @desc    Get all events (Client/API)
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean(); // Using lean for client read-only
    // If this is for a client EJS page:
    // res.render('client/events_list', { title: 'Upcoming Events', events });
    // If this is purely an API:
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error("Error in getAllEvents (client/API):", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get a single event (Client/API)
const getEventById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }
  try {
    const event = await Event.findById(id).lean();
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    // If this is for a client EJS page:
    // res.render('client/event_details', { title: event.name, event });
    // If this is purely an API:
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    console.error(`Error in getEventById for ID ${id} (client/API):`, err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

module.exports = {
  // Admin Page Rendering
  getAdminEventsListPage,
  showAdminAddEventForm,
  showAdminEditEventForm,
  // Admin Actions
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  // Client/API (if you keep them in the same controller)
  getAllEvents,
  getEventById,
  // Export uploader instance for routes
  uploader,
};
