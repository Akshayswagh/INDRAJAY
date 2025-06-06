// routes/publicEnquiryRoutes.js
const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');

// GET route to display the public enquiry form
// Assuming '/contact-us' is the page where the form resides
router.get('/contact-us', enquiryController.showPublicEnquiryForm);

// POST route to handle the form submission
router.post('/submit-enquiry', enquiryController.submitPublicEnquiry);



// GET route for the thank you page
router.get('/contact-thank-you', (req, res) => {
    res.render('client/thank_you', { // You need to create views/public/thank_you.ejs
        title: 'Enquiry Submitted',
        activePage: 'contact', // Or null if no active state needed
        // Success message will be picked up by res.locals from flash if global middleware is set up
        // Or you can explicitly pass it like this:
        success_msg: req.flash('success_msg')
    });
});

module.exports = router;