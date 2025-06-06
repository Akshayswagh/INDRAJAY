// controllers/enquiryController.js
const Enquiry = require('../models/Enquiry'); // Adjust path if needed
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// === PUBLIC FACING CONTROLLER ===

// Display the public enquiry form
const showPublicEnquiryForm = (req, res) => {
    let errors = [];
    let formData = {};
    const errorValidationFlash = req.flash('error_validation');
    const errorFormDataFlash = req.flash('error_form_data');

    if (errorValidationFlash && errorValidationFlash.length > 0) {
        try { errors = JSON.parse(errorValidationFlash[0]); }
        catch (e) { console.error("Error parsing validation flash for enquiry form:", e); }
    }
    if (errorFormDataFlash && errorFormDataFlash.length > 0) {
        try { formData = JSON.parse(errorFormDataFlash[0]); }
        catch (e) { console.error("Error parsing form data flash for enquiry form:", e); }
    }

    res.render('public/enquiry_form', { // Or your actual EJS path e.g. 'contact'
        title: 'Contact Us - Enquiry',
        activePage: 'contact', // For client-side nav highlighting
        errors: errors,
        formData: formData,
        currentUser: req.user || null, // If your client layout uses currentUser
        messages: req.flash() // Pass all flash messages for the messages partial
    });
};

const submitPublicEnquiry = async (req, res) => {
    try {
        const {
            yourName, country, companyName, companyWebsite,
            companyAddress, phoneCall, email, productNeeded, amountOfOrderKg,
            preferredDate, message
        } = req.body;

        let errors = [];
        if (!yourName || yourName.trim() === "") errors.push({ msg: "Your name is required." });
        if (!country || country.trim() === "") errors.push({ msg: "Country is required." });
        if (!companyName || companyName.trim() === "") errors.push({ msg: "Company name is required." });
        if (!companyAddress || companyAddress.trim() === "") errors.push({ msg: "Company address is required." });
        if (!phoneCall || phoneCall.trim() === "") errors.push({ msg: "Phone number is required." });
        if (!email || email.trim() === "") errors.push({ msg: "Email is required." });
        else if (!/\S+@\S+\.\S+/.test(email)) errors.push({ msg: "Valid email is required."});
        if (!productNeeded || productNeeded.trim() === "") errors.push({ msg: "Product needed is required." });
        if (!amountOfOrderKg || amountOfOrderKg.trim() === "") errors.push({ msg: "Amount of order is required." });
        if (!preferredDate) errors.push({ msg: "Preferred date is required." });
        if (companyWebsite && companyWebsite.trim() !== '' && !/^(https|http):\/\/[^\s$.?#].[^\s]*$/.test(companyWebsite)) {
            errors.push({ msg: "Please enter a valid company website URL." });
        }

        if (errors.length > 0) {
            if (req.flash) {
                req.flash('error_validation', JSON.stringify(errors));
                req.flash('error_form_data', JSON.stringify(req.body));
            }
            return res.redirect(req.headers.referer || '/contact-us'); // Redirect back to the form
        }

        await Enquiry.create({
            yourName, country, companyName, companyWebsite,
            companyAddress, phoneCall, email, productNeeded, amountOfOrderKg,
            preferredDate, message
        });

        if (req.flash) req.flash('success_msg', 'Your enquiry has been submitted successfully! We will contact you soon.');
        res.redirect('/public/enquiry/contact-thank-you');

    } catch (err) {
        console.error("Error submitting enquiry:", err);
        let errorMessages = ['An unexpected error occurred. Please try again later.'];
         if (err.name === "ValidationError") {
            errorMessages = Object.values(err.errors).map((val) => val.message);
        }
        if (req.flash) {
            req.flash('error_validation', JSON.stringify(errorMessages.map(msg => ({msg}))));
            req.flash('error_form_data', JSON.stringify(req.body));
        }
        res.redirect(req.headers.referer || '/enquiry');
    }
};

// === ADMIN PANEL CONTROLLERS ===

const getAdminEnquiriesListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortCriteria = { createdAt: -1 };

    const enquiries = await Enquiry.find({})
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalEnquiries = await Enquiry.countDocuments({});
    const totalPages = Math.ceil(totalEnquiries / limit);

    res.render('admin/view_enquiries', {
      title: 'Manage Enquiries',
      activePage: 'view_enquiries',
      enquiries: enquiries,
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
    console.error("Error fetching enquiries for admin:", err);
    if(req.flash) req.flash('error_msg', 'Could not load enquiries.');
    res.redirect(req.headers.referer || '/admin/dashboard');
  }
};

const viewAdminEnquiryDetails = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        if(req.flash) req.flash('error_msg', 'Invalid Enquiry ID.');
        return res.redirect('/admin/enquiries');
    }
    try {
        const enquiry = await Enquiry.findById(id).lean();
        if (!enquiry) {
            if(req.flash) req.flash('error_msg', 'Enquiry not found.');
            return res.redirect('/admin/enquiries');
        }
        res.render('admin/view_single_enquiry', {
            title: 'Enquiry Details',
            activePage: 'view_enquiries',
            enquiry: enquiry,
            currentUser: req.user || { name: 'Admin' },
            messages: req.flash()
        });
    } catch (err) {
        console.error(`Error fetching enquiry details ${id} for admin:`, err);
        if(req.flash) req.flash('error_msg', 'Could not load enquiry details.');
        res.redirect('/admin/enquiries');
    }
};

const updateAdminEnquiry = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        if(req.flash) req.flash('error_msg', 'Invalid Enquiry ID.');
        return res.redirect('back');
    }
    try {
        const { status, adminNotes } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (typeof adminNotes !== 'undefined') updateData.adminNotes = adminNotes;

        if (Object.keys(updateData).length === 0) {
            if(req.flash) req.flash('info_msg', 'No changes submitted.');
            return res.redirect(`/admin/enquiries/view/${id}`);
        }
        // Mongoose timestamps will handle updatedAt
        const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedEnquiry) {
            if(req.flash) req.flash('error_msg', 'Enquiry not found or could not be updated.');
            return res.redirect('/admin/enquiries');
        }
        if(req.flash) req.flash('success_msg', 'Enquiry updated successfully!');
        res.redirect(`/admin/enquiries/view/${id}`);
    } catch (err) {
        console.error(`Error updating enquiry ${id} (admin):`, err);
        if(req.flash) req.flash('error_msg', 'Error updating enquiry.');
        res.redirect(`/admin/enquiries/view/${id}`);
    }
};

const deleteAdminEnquiry = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    if(req.flash) req.flash('error_msg', 'Invalid Enquiry ID.');
    return res.redirect('/admin/enquiries');
  }
  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
    if (!deletedEnquiry) {
      if(req.flash) req.flash('error_msg', 'Enquiry not found or could not be deleted.');
      return res.redirect('/admin/enquiries');
    }
    if(req.flash) req.flash('success_msg', 'Enquiry deleted successfully!');
    res.redirect('/admin/enquiries');
  } catch (err) {
    console.error(`Error deleting enquiry ${id} (admin):`, err);
    if(req.flash) req.flash('error_msg', 'Error deleting enquiry.');
    res.redirect('/admin/enquiries');
  }
};

module.exports = {
  showPublicEnquiryForm, // For GET request to display the form
  submitPublicEnquiry,   // For POST request from the form
  getAdminEnquiriesListPage,
  viewAdminEnquiryDetails,
  updateAdminEnquiry,
  deleteAdminEnquiry,
};