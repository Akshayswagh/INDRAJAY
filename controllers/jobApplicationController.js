// controllers/jobApplicationController.js
const JobApplication = require('../models/JobApplication');
const Career = require('../models/careerModel'); // To link application to a job
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinaryConfig');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


const submitPublicJobApplication = async (req, res) => {
    // console.log("[JobAppCtrl DEBUG] submitPublicJobApplication called.");
    // console.log("[JobAppCtrl DEBUG] req.headers.accept:", req.headers.accept); // Log Accept header

    // Determine if it's a fetch/AJAX request expecting JSON
    const isFetchRequest = req.xhr || (req.headers.accept && req.headers.accept.toLowerCase().includes('application/json'));
    // console.log("[JobAppCtrl DEBUG] Is Fetch Request evaluated as:", isFetchRequest);

    const { jobId } = req.params;
    const {
        applicantName, applicantEmail, applicantPhone, gender,
        appliedForPosition, startDate, address, coverLetter
    } = req.body;

    // 1. Validate Job ID
    if (!isValidId(jobId)) {
        const message = 'Invalid job reference for application.';
        // console.log("[JobAppCtrl DEBUG] Invalid Job ID.");
        if (isFetchRequest) {
            // console.log("[JobAppCtrl DEBUG] Sending JSON error for invalid Job ID.");
            return res.status(400).json({ success: false, message, errors: [{ msg: message }] });
        }
        if (req.flash) req.flash('error_msg', message);
        // console.log("[JobAppCtrl DEBUG] Redirecting for invalid Job ID.");
        return res.status(400).redirect(req.headers.referer || '/careers');
    }

    // 2. Validate Form Fields
    let errors = [];
    if (!applicantName) errors.push({ field: "applicantName", msg: "Full name is required." });
    if (!applicantEmail) errors.push({ field: "applicantEmail", msg: "Email is required." });
    // Add more server-side validation for other fields from your form
    if (!req.file) errors.push({ field: "resumeFile", msg: "Resume file is required." });
    if (!appliedForPosition) errors.push({ field: "appliedForPosition", msg: "Position applied for is required." });

    if (errors.length > 0) {
        // console.log("[JobAppCtrl DEBUG] Validation errors on submit:", errors);
        // If a file was uploaded despite other errors, and you want to clean it up immediately
        if (req.file && req.file.filename) {
            // console.log("[JobAppCtrl DEBUG] Cleaning up uploaded file due to validation errors.");
            try { await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' }); } // specify resource_type for raw files
            catch (cdnErr) { console.error("[JobAppCtrl DEBUG] Error cleaning up Cloudinary on validation fail:", cdnErr); }
        }

        if (isFetchRequest) {
            // console.log("[JobAppCtrl DEBUG] Sending JSON error for validation failures.");
            return res.status(400).json({ success: false, message: "Validation failed. Please check the form.", errors });
        }
        if (req.flash) {
            req.flash('error_validation_application', JSON.stringify(errors)); // For client to parse and display
            req.flash('error_form_data_application', JSON.stringify(req.body)); // To repopulate form
        }
        // console.log("[JobAppCtrl DEBUG] Redirecting due to validation failures.");
        return res.status(400).redirect(req.headers.referer || `/careers`); // Or specific job page if possible
    }

    // 3. Process Application
    try {
        const job = await Career.findById(jobId);
        if (!job) {
            const message = 'The job you are applying for no longer exists.';
            // console.log(`[JobAppCtrl DEBUG] Job with ID ${jobId} not found for application.`);
            // Clean up uploaded file if job not found
            if (req.file && req.file.filename) {
                try { await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' }); }
                catch (cdnErr) { console.error("[JobAppCtrl DEBUG] Error cleaning up Cloudinary (job not found):", cdnErr); }
            }
            if (isFetchRequest) {
                // console.log("[JobAppCtrl DEBUG] Sending JSON error for job not found.");
                return res.status(404).json({ success: false, message, errors: [{ msg: message }] });
            }
            if (req.flash) req.flash('error_msg', message);
            // console.log("[JobAppCtrl DEBUG] Redirecting for job not found.");
            return res.status(404).redirect('/careers');
        }

        const newApplication = new JobApplication({
            jobId: jobId,
            jobRoleAppliedFor: appliedForPosition, // or job.role from the fetched job object
            applicantName, applicantEmail, applicantPhone, gender, startDate, address, coverLetter,
            resumePath: req.file.path,       // from CloudinaryStorage (Multer)
            resumePublicId: req.file.filename // from CloudinaryStorage (Multer)
            // Ensure 'filename' from multer-storage-cloudinary is indeed the public_id
        });

        await newApplication.save();
        // console.log("[JobAppCtrl DEBUG] Job application saved:", newApplication._id);

        if (isFetchRequest) {
            // console.log("[JobAppCtrl DEBUG] Sending JSON success response.");
            return res.status(201).json({ // 201 Created is good for successful POST
                success: true,
                message: 'Your application has been submitted successfully!',
                redirectUrl: '/careers/application-success' // Client will use this to navigate
            });
        }
        // For traditional form submissions
        if (req.flash) req.flash('success_msg', 'Your application has been submitted successfully!');
        // console.log("[JobAppCtrl DEBUG] Redirecting to success page for traditional form.");
        return res.redirect('/careers/application-success'); // Ensure this route exists for GET

    } catch (err) {
        console.error("[JobAppCtrl DEBUG] Error during application processing (try-catch):", err.message, err.stack);

        // Cleanup Cloudinary if DB save fails or other error occurs after file upload
        if (req.file && req.file.filename) {
            // console.log("[JobAppCtrl DEBUG] Cleaning up Cloudinary due to error in try-catch.");
            try { await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' }); }
            catch (cdnErr) { console.error("[JobAppCtrl DEBUG] Error cleaning up Cloudinary in catch block:", cdnErr); }
        }

        let errorMessagesForClient = [{ msg: 'An error occurred while submitting your application.' }];
        if (err.name === "ValidationError") { // Mongoose validation error
            errorMessagesForClient = Object.values(err.errors).map((val) => ({ field: val.path, msg: val.message }));
        } else if (err.message) { // Other specific errors
             errorMessagesForClient = [{ msg: err.message }];
        }


        if (isFetchRequest) {
            // console.log("[JobAppCtrl DEBUG] Sending JSON error response from catch block.");
            return res.status(500).json({
                success: false,
                message: errorMessagesForClient.length > 1 ? 'Please correct the errors.' : errorMessagesForClient[0].msg,
                errors: errorMessagesForClient
            });
        }
        // For traditional form submissions
        if (req.flash) {
            // For general errors, flash a simple message or the first one
            req.flash('error_msg', errorMessagesForClient[0].msg);
          
        }
        // console.log("[JobAppCtrl DEBUG] Redirecting from catch block for traditional form.");
        return res.status(500).redirect(req.headers.referer || '/careers');
    }
};


// === ADMIN: MANAGE JOB APPLICATIONS ===
const getAdminJobApplicationsListPage = async (req, res) => {
    // console.log("[JobAppCtrl DEBUG] getAdminJobApplicationsListPage called");
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const applications = await JobApplication.find({})
            .populate({ path: 'jobId', model: 'Career', select: 'role domain' }) // Populate job info
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalApplications = await JobApplication.countDocuments({});
        const totalPages = Math.ceil(totalApplications / limit);

        res.render('admin/view_job_applications', { // Create this EJS file
            title: 'Manage Job Applications',
            activePage: 'view_job_applications',
            applications: applications,
            currentUser: req.user || { name: 'Admin' },
            messages: { success_msg: req.flash('success_msg'), error_msg: req.flash('error_msg')},
            currentPage: page, totalPages: totalPages, limit: limit,
        });
    } catch (err) {
        console.error("[JobAppCtrl DEBUG] Error fetching job applications for admin:", err.message);
        if(req.flash) req.flash('error_msg', 'Could not load job applications.');
        res.redirect(req.headers.referer || '/admin/dashboard');
    }
};

const deleteAdminJobApplication = async (req, res) => {
    const { id } = req.params; // This is JobApplication ID
    // console.log(`[JobAppCtrl DEBUG] deleteAdminJobApplication for ID: ${id}`);
    if (!isValidId(id)) { /* ... error handling ... */ return res.redirect('/admin/job-applications'); }
    try {
        const application = await JobApplication.findById(id);
        if (!application) { /* ... error handling ... */ return res.redirect('/admin/job-applications'); }

        if (application.resumePublicId) {
            try {
                // console.log(`[JobAppCtrl DEBUG] Deleting resume from Cloudinary: ${application.resumePublicId}`);
                await cloudinary.uploader.destroy(application.resumePublicId, { resource_type: "raw" }); // Use "raw" if it might not be an image/video
            } catch (cloudinaryError) {
                console.error("[JobAppCtrl DEBUG] Cloudinary deletion error (non-fatal):", cloudinaryError.message);
                // Log this, but proceed to delete DB record
                if(req.flash) req.flash('error_msg', 'Could not delete resume from cloud, but application record will be deleted.');
            }
        }
        await JobApplication.findByIdAndDelete(id);
        if(req.flash) req.flash('success_msg', 'Job application and associated resume deleted successfully.');
        res.redirect('/admin/job-applications');
    } catch (err) { /* ... error handling ... */ }
};

// Optional: viewAdminJobApplicationDetails, updateAdminJobApplicationStatus

module.exports = {
    submitPublicJobApplication,
    getAdminJobApplicationsListPage,
    deleteAdminJobApplication,
};