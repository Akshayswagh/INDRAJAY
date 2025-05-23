// controllers/consultationController.js
const Consultation = require("../models/ConsultService"); // Adjust path if needed
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// === ADMIN PAGE RENDERING CONTROLLERS ===

// Display list of all consultations in Admin Panel
const getAdminConsultationsListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortCriteria = { createdAt: -1 }; // Default: newest first

    const consultations = await Consultation.find({})
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalConsultations = await Consultation.countDocuments({});
    const totalPages = Math.ceil(totalConsultations / limit);

    res.render('admin/view_consultations', {
      title: 'Manage Consultations',
      activePage: 'view_consultations',
      consultations: consultations,
      currentUser: req.user || { name: 'Admin' },
      messages: {
        success_msg: req.flash ? req.flash('success_msg') : [],
        error_msg: req.flash ? req.flash('error_msg') : [],
      },
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      // currentSort: 'desc' // Add if you implement sorting UI
    });
  } catch (err) {
    console.error("Error fetching consultations for admin list:", err);
    if(req.flash) req.flash('error_msg', 'Could not load consultations.');
    res.redirect(req.headers.referer || '/admin/dashboard');
  }
};

// Display form to add a new consultation (Admin Panel)
const showAdminAddConsultationForm = (req, res) => {
  try {
    res.render('admin/add_consultation_form', {
      title: 'Add New Consultation',
      activePage: 'add_consultation',
      currentUser: req.user || { name: 'Admin' },
      messages: { /* For flash messages if any before form load */ },
      consultationData: {}, // For pre-filling on error
      errors: [],           // For displaying validation errors
    });
  } catch (err) {
    console.error("Error rendering admin add consultation form:", err);
    if(req.flash) req.flash('error_msg', 'Could not load the add consultation page.');
    res.redirect('/admin/consultations');
  }
};

// Display form to edit an existing consultation (Admin Panel)
const showAdminEditConsultationForm = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Consultation ID.');
    return res.redirect('/admin/consultations');
  }
  try {
    const consultation = await Consultation.findById(id).lean();
    if (!consultation) {
      if(req.flash) req.flash('error_msg', 'Consultation not found.');
      return res.redirect('/admin/consultations');
    }
    res.render('admin/edit_consultation_form', {
      title: 'Edit Consultation',
      activePage: 'edit_consultation',
      currentUser: req.user || { name: 'Admin' },
      messages: { /* For flash messages */ },
      consultationItem: consultation, // Original item for reference
      consultationData: consultation, // For pre-filling form
      errors: [],
    });
  } catch (err) {
    console.error(`Error rendering admin edit consultation form for item ${id}:`, err);
    if(req.flash) req.flash('error_msg', 'Could not load the edit consultation page.');
    res.redirect('/admin/consultations');
  }
};

// === ADMIN API/ACTION CONTROLLERS ===

// Create a new consultation (Admin Panel Action)
const createAdminConsultation = async (req, res) => {
  try {
    const { title, description /* other fields you might add */ } = req.body;
    let errors = [];

    if (!title || title.trim() === '') errors.push({ msg: "Title is required." });
    if (!description || description.trim() === '') errors.push({ msg: "Description is required." });
    // Add other validations for new fields

    if (errors.length > 0) {
      // If flash messages are set up globally, they will be picked by res.locals
      // For explicit flash messages here before re-rendering:
      if(req.flash) req.flash('error_msg', errors.map(e => e.msg).join('<br>'));
      return res.status(400).render('admin/add_consultation_form', {
        title: 'Add New Consultation', activePage: 'add_consultation',
        consultationData: req.body, // Send back submitted data
        errors, // Send back errors array
        currentUser: req.user || { name: 'Admin' },
        messages: { /* Flash messages will be available via res.locals */ }
      });
    }

    await Consultation.create({ title, description /* other fields */ });
    if(req.flash) req.flash('success_msg', 'Consultation created successfully!');
    res.redirect('/admin/consultations');
  } catch (err) {
    console.error("Error creating consultation (admin):", err);
    let errorMessages = ['An unexpected server error occurred. Please try again.'];
    if (err.name === "ValidationError") {
      errorMessages = Object.values(err.errors).map((val) => val.message);
    }
    if(req.flash) req.flash('error_msg', errorMessages.join('<br>'));
    res.status(500).render('admin/add_consultation_form', {
      title: 'Add New Consultation', activePage: 'add_consultation',
      consultationData: req.body, errors: errorMessages.map(msg => ({msg})),
      currentUser: req.user || { name: 'Admin' },
      messages: { /* Flash messages will be available via res.locals */ }
    });
  }
};

// Update consultation (Admin Panel Action)
const updateAdminConsultation = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Consultation ID.');
    return res.redirect('/admin/consultations');
  }
  try {
    const { title, description /* other fields */ } = req.body;
    let errors = [];

    if (!title || title.trim() === '') errors.push({ msg: "Title is required." });
    if (!description || description.trim() === '') errors.push({ msg: "Description is required." });
    // Add other validations

    if (errors.length > 0) {
        const consultationItem = await Consultation.findById(id).lean(); // Re-fetch for form context
        if(req.flash) req.flash('error_msg', errors.map(e => e.msg).join('<br>'));
        return res.status(400).render('admin/edit_consultation_form', {
            title: 'Edit Consultation', activePage: 'edit_consultation',
            consultationItem: { ...consultationItem, ...req.body }, // Merge original with submitted for repopulation
            consultationData: { ...consultationItem, ...req.body },
            errors,
            currentUser: req.user || { name: 'Admin' },
            messages: { /* Flash messages */ }
        });
    }

    const updatedConsultation = await Consultation.findByIdAndUpdate(id,
      { title, description /* other fields */ },
      { new: true, runValidators: true }
    );

    if (!updatedConsultation) {
      if(req.flash) req.flash('error_msg', 'Consultation not found or could not be updated.');
      return res.redirect('/admin/consultations');
    }

    if(req.flash) req.flash('success_msg', 'Consultation updated successfully!');
    res.redirect('/admin/consultations');
  } catch (err) {
    console.error(`Error updating consultation ${id} (admin):`, err);
    let errorMessages = ['An unexpected server error occurred. Please try again.'];
    if (err.name === "ValidationError") {
      errorMessages = Object.values(err.errors).map((val) => val.message);
    }
    if(req.flash) req.flash('error_msg', errorMessages.join('<br>'));
    const consultationItem = await Consultation.findById(id).lean(); // Re-fetch for form context
    res.status(500).render('admin/edit_consultation_form', {
        title: 'Edit Consultation', activePage: 'edit_consultation',
        consultationItem: { ...consultationItem, ...req.body },
        consultationData: { ...consultationItem, ...req.body },
        errors: errorMessages.map(msg => ({msg})),
        currentUser: req.user || { name: 'Admin' },
        messages: { /* Flash messages */ }
    });
  }
};

// Delete consultation (Admin Panel Action)
const deleteAdminConsultation = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Consultation ID.');
    return res.redirect('/admin/consultations');
  }
  try {
    const consultation = await Consultation.findByIdAndDelete(id);
    if (!consultation) {
      if(req.flash) req.flash('error_msg', 'Consultation not found or could not be deleted.');
      return res.redirect('/admin/consultations');
    }
    if(req.flash) req.flash('success_msg', 'Consultation deleted successfully!');
    res.redirect('/admin/consultations');
  } catch (err) {
    console.error(`Error deleting consultation ${id} (admin):`, err);
    if(req.flash) req.flash('error_msg', 'Error deleting consultation.');
    res.redirect('/admin/consultations');
  }
};

module.exports = {
  // Admin Page Rendering
  getAdminConsultationsListPage,
  showAdminAddConsultationForm,
  showAdminEditConsultationForm,
  // Admin Actions
  createAdminConsultation,
  updateAdminConsultation,
  deleteAdminConsultation,
};