// routes/publicCareerRoutes.js
const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');

// Import the pre-configured resumeUploader directly
const resumeUploader = require('../config/multerResumeConfig'); // Path to your new multerResumeConfig.js

// POST /careers/apply/:jobId (Example route for submitting an application)
// This route expects 'resumeFile' as the field name from your form's file input
// resumeUploader is now the multer instance itself, ready to use its .single() method.
router.post('/apply/:jobId', resumeUploader.single('resumeFile'), jobApplicationController.submitPublicJobApplication);

// You'd also have GET routes here to display job listings and the application form.
// Example:
// const careerController = require('../controllers/careerController'); // Assuming you have this
// router.get('/', careerController.getPublicJobsPage);
// router.get('/:jobId/apply', careerController.showApplicationFormPage);



// GET /careers/application-success
router.get('/application-success', (req, res) => {
    // Render the EJS template
    // 'application-success' is the name of the .ejs file (without the .ejs extension)
    // The second argument is an object for passing data to the template (if needed)
    res.render('client/application-success', {
        // You can pass any data needed by the EJS template here
        // For this simple thank you page, we might not need to pass much,
        // but the title is handled by the header partial now.
        // Example: user: req.user // if you have user sessions
    });
});

module.exports = router;