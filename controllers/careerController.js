// controllers/careerController.js
const Career = require("../models/careerModel"); // Adjust path if needed
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// === ADMIN PAGE RENDERING CONTROLLERS ===

const getAdminCareersListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortCriteria = { created_at: -1 }; // Sort by your custom 'created_at' field

    const jobs = await Career.find({})
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalJobs = await Career.countDocuments({});
    const totalPages = Math.ceil(totalJobs / limit);

    res.render('admin/view_careers', {
      title: 'Manage Job Postings',
      activePage: 'view_careers',
      jobs: jobs,
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
    console.error("Error fetching jobs for admin list:", err);
    if(req.flash) req.flash('error_msg', 'Could not load job postings.');
    res.redirect(req.headers.referer || '/admin/dashboard');
  }
};

const showAdminAddJobForm = (req, res) => {
  try {
    res.render('admin/add_career_form', {
      title: 'Add New Job Posting',
      activePage: 'add_career',
      currentUser: req.user || { name: 'Admin' },
      messages: { /* For flash messages if any prior to form load */ },
      jobData: { experience_required: "Anyone can apply" }, // Pre-fill default for new form
      errors: [],
    });
  } catch (err) {
    console.error("Error rendering admin add job form:", err);
    if(req.flash) req.flash('error_msg', 'Could not load the add job page.');
    res.redirect('/admin/careers');
  }
};

const showAdminEditJobForm = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Job ID.');
    return res.redirect('/admin/careers');
  }
  try {
    const job = await Career.findById(id).lean();
    if (!job) {
      if(req.flash) req.flash('error_msg', 'Job posting not found.');
      return res.redirect('/admin/careers');
    }
    res.render('admin/edit_career_form', {
      title: 'Edit Job Posting',
      activePage: 'edit_career',
      currentUser: req.user || { name: 'Admin' },
      messages: { /* For flash messages */ },
      jobItem: job, // Original item
      jobData: job, // For pre-filling form (can be merged with req.body on error)
      errors: [],
    });
  } catch (err) {
    console.error(`Error rendering admin edit job form for item ${id}:`, err);
    if(req.flash) req.flash('error_msg', 'Could not load the edit job page.');
    res.redirect('/admin/careers');
  }
};

// === ADMIN API/ACTION CONTROLLERS ===

const createAdminJob = async (req, res) => {
  try {
    const { role, domain, description, experience_required } = req.body;
    let errors = [];

    if (!role || role.trim() === '') errors.push({ msg: "Role is required." });
    if (!domain || domain.trim() === '') errors.push({ msg: "Domain is required." });
    if (!description || description.trim() === '') errors.push({ msg: "Description is required." });
    // experience_required has a default, so specific validation might only be if you want to enforce a format if provided

    if (errors.length > 0) {
      if(req.flash) req.flash('error_msg', errors.map(e => e.msg).join('<br>'));
      return res.status(400).render('admin/add_career_form', {
        title: 'Add New Job Posting', activePage: 'add_career',
        jobData: req.body, errors,
        currentUser: req.user || { name: 'Admin' }, messages: {}
      });
    }

    const jobToCreate = { role, domain, description };
    // Only include experience_required if it's provided and not empty, otherwise default will apply
    if (experience_required && experience_required.trim() !== "") {
        jobToCreate.experience_required = experience_required.trim();
    }
    // created_at will be set by default from the schema

    await Career.create(jobToCreate);
    if(req.flash) req.flash('success_msg', 'Job posting created successfully!');
    res.redirect('/admin/careers');
  } catch (err) {
    console.error("Error creating job posting (admin):", err);
    let errorMessages = ['An unexpected server error occurred while creating the job.'];
    if (err.name === "ValidationError") {
      errorMessages = Object.values(err.errors).map((val) => val.message);
    }
    if(req.flash) req.flash('error_msg', errorMessages.join('<br>'));
    res.status(500).render('admin/add_career_form', {
      title: 'Add New Job Posting', activePage: 'add_career',
      jobData: req.body, errors: errorMessages.map(msg => ({msg})),
      currentUser: req.user || { name: 'Admin' }, messages: {}
    });
  }
};

const updateAdminJob = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Job ID.');
    return res.redirect('/admin/careers');
  }
  try {
    const { role, domain, description, experience_required } = req.body;
    let errors = [];

    if (!role || role.trim() === '') errors.push({ msg: "Role is required." });
    if (!domain || domain.trim() === '') errors.push({ msg: "Domain is required." });
    if (!description || description.trim() === '') errors.push({ msg: "Description is required." });

    if (errors.length > 0) {
        const jobItem = await Career.findById(id).lean(); // Re-fetch for form context
        if(req.flash) req.flash('error_msg', errors.map(e => e.msg).join('<br>'));
        return res.status(400).render('admin/edit_career_form', {
            title: 'Edit Job Posting', activePage: 'edit_career',
            jobItem: { ...jobItem, ...req.body }, jobData: { ...jobItem, ...req.body },
            errors,
            currentUser: req.user || { name: 'Admin' }, messages: {}
        });
    }

    const updateData = { role, domain, description };
    // Only update experience_required if it's provided. If empty, it could revert to default or keep existing.
    // If an empty string "" is submitted, and you want it to become "Anyone can apply"
    // or keep the existing value, you need specific logic.
    // For now, if provided, it updates. If not provided in req.body, it won't be in updateData.
    if (typeof experience_required !== 'undefined') { // Check if field was submitted
        updateData.experience_required = experience_required.trim() === "" ? "Anyone can apply" : experience_required.trim();
    }
    // updateData.updatedAt = Date.now(); // If you were managing updatedAt manually

    const updatedJob = await Career.findByIdAndUpdate(id, updateData, {
      new: true, runValidators: true,
    });

    if (!updatedJob) {
      if(req.flash) req.flash('error_msg', 'Job posting not found or could not be updated.');
      return res.redirect('/admin/careers');
    }
    if(req.flash) req.flash('success_msg', 'Job posting updated successfully!');
    res.redirect('/admin/careers');
  } catch (err) {
    console.error(`Error updating job ${id} (admin):`, err);
    let errorMessages = ['An unexpected server error occurred while updating.'];
     if (err.name === "ValidationError") {
      errorMessages = Object.values(err.errors).map((val) => val.message);
    }
    if(req.flash) req.flash('error_msg', errorMessages.join('<br>'));
    const jobItem = await Career.findById(id).lean(); // Re-fetch for form context
    res.status(500).render('admin/edit_career_form', {
        title: 'Edit Job Posting', activePage: 'edit_career',
        jobItem: { ...jobItem, ...req.body }, jobData: { ...jobItem, ...req.body },
        errors: errorMessages.map(msg => ({msg})),
        currentUser: req.user || { name: 'Admin' }, messages: {}
    });
  }
};

const deleteAdminJob = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Job ID.');
    return res.redirect('/admin/careers');
  }
  try {
    const job = await Career.findByIdAndDelete(id);
    if (!job) {
      if(req.flash) req.flash('error_msg', 'Job posting not found or could not be deleted.');
      return res.redirect('/admin/careers');
    }
    if(req.flash) req.flash('success_msg', 'Job posting deleted successfully!');
    res.redirect('/admin/careers');
  } catch (err) {
    console.error(`Error deleting job ${id} (admin):`, err);
    if(req.flash) req.flash('error_msg', 'Error deleting job posting.');
    res.redirect('/admin/careers');
  }
};

// --- Your original API functions (if you still need them for a public JSON API) ---
// Renaming them to avoid confusion with the admin panel functions.
const getAllJobsAPI = async (req, res) => {
  try {
    const careers = await Career.find().sort({ created_at: -1 }); // Using your schema's field
    res.json({ total: careers.length, data: careers });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

const getJobByIdAPI = async (req, res) => {
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

module.exports = {
  // Admin Page Rendering
  getAdminCareersListPage,
  showAdminAddJobForm,
  showAdminEditJobForm,
  // Admin Actions
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  // Original API functions (if needed)
  getAllJobs: getAllJobsAPI,
  getJobById: getJobByIdAPI,
};