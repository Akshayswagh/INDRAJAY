// controllers/careManagementController.js
const CareManagement = require("../models/careManagement"); // Corrected import for convention
const mongoose = require("mongoose");
const getMulterUploader = require("../config/multerConfig");
const uploader = getMulterUploader("careManagement");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// === ADMIN PANEL PAGE RENDERING FUNCTIONS ===

const getAdminCareManagementListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortCriteria = { createdAt: -1 };

    const entries = await CareManagement.find({})
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalEntries = await CareManagement.countDocuments({});
    const totalPages = Math.ceil(totalEntries / limit);

    res.render('admin/view_care_management', {
      title: 'Manage Care & Management',
      activePage: 'view_care_management',
      entries: entries,
      currentUser: req.user || { name: 'Admin' },
      messages: {
        success_msg: req.flash ? req.flash('success_msg') : [],
        error_msg: req.flash ? req.flash('error_msg') : [],
      },
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
    });
  } catch (err) {
    console.error("Error fetching care & management entries for admin:", err.message);
    if(req.flash) req.flash('error_msg', 'Could not load Care & Management entries.');
    res.redirect(req.headers.referer || '/admin/dashboard');
  }
};

const showAdminAddCareEntryForm = (req, res) => {
  try {
    res.render('admin/add_care_management_form', {
      title: 'Add New Care & Management Entry',
      activePage: 'add_care_management',
      currentUser: req.user || { name: 'Admin' },
      messages: { /* For flash messages if any prior to form load */ },
      entryData: {},
      errors: [],
    });
  } catch (err) {
    console.error("Error rendering admin add care entry form:", err.message);
    if(req.flash) req.flash('error_msg', 'Could not load the add entry page.');
    res.redirect('/admin/care-management');
  }
};

// This function is mostly for if you had a dedicated edit page.
// For modal editing, the data is passed via data-* attributes to the list page.
const showAdminEditCareEntryForm = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        if(req.flash) req.flash('error_msg', 'Invalid Entry ID.');
        return res.redirect('/admin/care-management');
    }
    try {
        const entry = await CareManagement.findById(id).lean();
        if (!entry) {
            if(req.flash) req.flash('error_msg', 'Entry not found.');
            return res.redirect('/admin/care-management');
        }
        res.render('admin/edit_care_management_form', { // Assumes you have this EJS file
            title: 'Edit Care & Management Entry',
            activePage: 'edit_care_management',
            currentUser: req.user || { name: 'Admin' },
            entryItem: entry,
            entryData: entry, // for pre-filling
            errors: [],
            messages: { /* flash */ }
        });
    } catch (err) {
        console.error(`Error rendering edit care entry form for item ${id}:`, err.message);
        if(req.flash) req.flash('error_msg', 'Could not load the edit entry page.');
        res.redirect('/admin/care-management');
    }
};


// === ADMIN PANEL ACTION HANDLERS (Forms submission, redirects, flash) ===

const createAdminCareEntry = async (req, res) => {
  try {
    const { title, description } = req.body;
    let errors = [];

    if (!title || title.trim() === '') errors.push({ msg: "Title is required." });
    if (!description || description.trim() === '') errors.push({ msg: "Description is required." });
    if (!req.file) errors.push({ msg: "Image is required." });

    if (errors.length > 0) {
      if(req.flash) req.flash('error_msg', errors.map(e => e.msg).join('<br>'));
      return res.status(400).render('admin/add_care_management_form', {
        title: 'Add New Care & Management Entry', activePage: 'add_care_management',
        entryData: { title, description }, errors,
        currentUser: req.user || { name: 'Admin' }, messages: {}
      });
    }

    const imagePath = req.file.path;
    await CareManagement.create({ title, description, image: imagePath });

    if(req.flash) req.flash('success_msg', 'Care & Management entry added successfully!');
    res.redirect('/admin/care-management');
  } catch (err) {
    console.error("Error creating care entry (admin):", err.message);
    let errorMessages = ['Server Error. Please try again.'];
    if (err.name === "ValidationError") {
      errorMessages = Object.values(err.errors).map((val) => val.message);
    }
    if(req.flash) req.flash('error_msg', errorMessages.join('<br>'));
    res.status(500).render('admin/add_care_management_form', {
      title: 'Add New Care & Management Entry', activePage: 'add_care_management',
      entryData: req.body, errors: errorMessages.map(msg => ({msg})),
      currentUser: req.user || { name: 'Admin' }, messages: {}
    });
  }
};

const updateAdminCareEntry = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Entry ID.');
    return res.redirect('/admin/care-management');
  }

  try {
    const { title, description } = req.body;
    let errors = [];

    if (!title || title.trim() === '') errors.push({ msg: "Title is required." });
    if (!description || description.trim() === '') errors.push({ msg: "Description is required." });

    if (errors.length > 0) {
        if(req.flash) req.flash('error_msg', errors.map(e => e.msg).join('<br>'));
        // If editing was via a dedicated page, you'd re-render it here with errors.
        // For modal, just redirecting back to list is simpler.
        return res.redirect('/admin/care-management');
    }

    const updateData = { title, description };
    // Mongoose timestamps will handle updatedAt automatically
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedEntry = await CareManagement.findByIdAndUpdate(id, updateData, {
      new: true, runValidators: true,
    });

    if (!updatedEntry) {
      if(req.flash) req.flash('error_msg', 'Entry not found or could not be updated.');
      return res.redirect('/admin/care-management');
    }
    if(req.flash) req.flash('success_msg', 'Care & Management entry updated successfully!');
    res.redirect('/admin/care-management');
  } catch (err) {
    console.error(`Error updating care entry ${id} (admin):`, err.message);
    let errorMessages = ['Server Error during update. Please try again.'];
    if (err.name === "ValidationError") {
      errorMessages = Object.values(err.errors).map((val) => val.message);
    }
    if(req.flash) req.flash('error_msg', errorMessages.join('<br>'));
    res.redirect('/admin/care-management'); // Redirect to list on error
  }
};

const deleteAdminCareEntry = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Entry ID.');
    return res.redirect('/admin/care-management');
  }
  try {
    const deletedEntry = await CareManagement.findByIdAndDelete(id);
    if (!deletedEntry) {
      if(req.flash) req.flash('error_msg', 'Entry not found or could not be deleted.');
      return res.redirect('/admin/care-management');
    }
    // TODO: Optionally delete image from Cloudinary/local storage
    if(req.flash) req.flash('success_msg', 'Care & Management entry deleted successfully!');
    res.redirect('/admin/care-management');
  } catch (err) {
    console.error(`Error deleting care entry ${id} (admin):`, err.message);
    if(req.flash) req.flash('error_msg', 'Error deleting entry.');
    res.redirect('/admin/care-management');
  }
};


// === ORIGINAL JSON API FUNCTIONS (if you want to keep them for other purposes) ===
// These are your original functions that return JSON.
// It's good practice to rename them if you also have admin functions
// that render EJS to avoid confusion.

const createEntryAPI = async (req, res) => { // Renamed from createEntry
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required." });
    }
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }
    const imagePath = req.file.path;
    const newEntry = new CareManagement({ title, description, image: imagePath });
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    console.error("API Create Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllEntriesAPI = async (req, res) => { // Renamed from getAllEntries
  try {
    const entries = await CareManagement.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error("API Get All Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getEntryByIdAPI = async (req, res) => { // Renamed from getEntryById
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ msg: "Invalid entry ID" });
  try {
    const entry = await CareManagement.findById(id);
    if (!entry) return res.status(404).json({ msg: "Entry not found" });
    res.json(entry);
  } catch (err) {
    console.error("API Get By ID Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const updateEntryAPI = async (req, res) => { // Renamed from updateEntry
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ msg: "Invalid entry ID" });
  try {
    const { title, description } = req.body;
    const updateData = { title, description }; // Timestamps will handle updatedAt
    if (req.file) {
      updateData.image = req.file.path;
    }
    const updatedEntry = await CareManagement.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedEntry) return res.status(404).json({ msg: "Entry not found" });
    res.json(updatedEntry);
  } catch (err) {
    console.error("API Update Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteEntryAPI = async (req, res) => { // Renamed from deleteEntry
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ msg: "Invalid entry ID" });
  try {
    const deletedEntry = await CareManagement.findByIdAndDelete(id);
    if (!deletedEntry) return res.status(404).json({ msg: "Entry not found" });
    res.json({ msg: "Entry removed" });
  } catch (err) {
    console.error("API Delete Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = {
  // Admin Page Rendering
  getAdminCareManagementListPage,
  showAdminAddCareEntryForm,
  showAdminEditCareEntryForm,
  // Admin Actions (for EJS forms)
  createAdminCareEntry,
  updateAdminCareEntry,
  deleteAdminCareEntry,
  // Multer uploader instance
  uploader,
  // Public JSON API functions (for client-facing read operations)
  getAllEntries: getAllEntriesAPI, // Renamed export, returns JSON
  getEntryById: getEntryByIdAPI,   // Renamed export, returns JSON
};