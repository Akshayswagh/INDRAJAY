// controllers/adminTrustedBuyerController.js
const TrustedBuyer = require('../models/T');
const mongoose = require('mongoose');
const getMulterUploader = require('../config/multerConfig');
const cloudinary = require('../config/cloudinaryConfig');

const bankPdfUploader = getMulterUploader('trustedBuyersBankPdfs', ['application/pdf']);
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to parse flashed form data and errors
const getFlashedData = (req) => {
    let buyerData = {};
    let errors = [];
    const formDataFlash = req.flash('form_data');
    const validationErrorsFlash = req.flash('validation_errors');

    if (formDataFlash.length > 0) {
        try { buyerData = JSON.parse(formDataFlash[0]); }
        catch (e) { console.error("Error parsing flashed form_data:", e); }
    }
    if (validationErrorsFlash.length > 0) {
        try { errors = JSON.parse(validationErrorsFlash[0]); }
        catch (e) { console.error("Error parsing flashed validation_errors:", e); }
    }
    return { buyerData, errors };
};

// === ADMIN PAGE RENDERING ===
const getAdminTrustedBuyersListPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const buyers = await TrustedBuyer.find({})
            .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
        const totalBuyers = await TrustedBuyer.countDocuments({});
        const totalPages = Math.ceil(totalBuyers / limit);

        res.render('admin/view_trusted_buyers', {
            title: 'Manage Trusted Buyers', activePage: 'view_trusted_buyers',
            buyers, currentUser: req.user || { name: 'Admin' },
            currentPage: page, totalPages, limit
            // messages will be handled by global res.locals middleware
        });
    } catch (err) {
        console.error("Error fetching trusted buyers:", err);
        req.flash('error_msg', 'Could not load trusted buyers. ' + err.message);
        res.redirect(req.headers.referer || '/admin/dashboard');
    }
};

const showAdminAddTrustedBuyerForm = (req, res) => {
    const { buyerData, errors } = getFlashedData(req);
    try {
        // Explicitly decide if the PDF is required for a *new* entry form.
        // This might be a business rule rather than strictly from schema.
        const isBankPdfRequiredOnForm = true; // Set to true if PDF MUST be uploaded for new buyers

        res.render('admin/add_trusted_buyer_form', {
            title: 'Add New Trusted Buyer', activePage: 'add_trusted_buyer',
            currentUser: req.user || { name: 'Admin' },
            formData: Object.keys(buyerData).length ? buyerData : { address: {} },
            errors: errors,
            isBankPdfRequiredOnForm: isBankPdfRequiredOnForm // Pass this to EJS
        });
    } catch (err) {
        console.error("Error rendering add trusted buyer form:", err);
        req.flash('error_msg', 'Could not load form. ' + err.message);
        res.redirect('/admin/trusted-buyers');
     }
};

const showAdminEditTrustedBuyerForm = async (req, res) => {
    const { id } = req.params;
    const { buyerData: flashedBuyerData, errors } = getFlashedData(req);

    if (!isValidId(id)) {
        req.flash('error_msg', 'Invalid Buyer ID specified.');
        return res.redirect('/admin/trusted-buyers');
    }
    try {
        const buyerItem = await TrustedBuyer.findById(id).lean();
        if (!buyerItem) {
            req.flash('error_msg', 'Trusted Buyer not found.');
            return res.redirect('/admin/trusted-buyers');
        }
        const currentData = Object.keys(flashedBuyerData).length ? flashedBuyerData : buyerItem;
        if (!currentData.address) currentData.address = {};

        // For edit, PDF is usually optional (only if they want to replace it)
        const isBankPdfRequiredOnForm = false;

        res.render('admin/edit_trusted_buyer_form', {
            title: 'Edit Trusted Buyer', activePage: 'edit_trusted_buyer',
            currentUser: req.user || { name: 'Admin' },
            buyerItem,
            formData: currentData, // Use formData for consistency with add form
            errors,
            isBankPdfRequiredOnForm: isBankPdfRequiredOnForm // Pass this to EJS
        });
    } catch (err) {
        console.error(`Error rendering edit trusted buyer form for ID ${id}:`, err);
        req.flash('error_msg', 'Could not load edit form. ' + err.message);
        res.redirect('/admin/trusted-buyers');
    }
};

// === ADMIN API/ACTIONS ===
const createAdminTrustedBuyer = async (req, res) => {
    try {
        const { customerName, companyName, email, contactNumber, fullAddress, gstnNumber, panNumber, adminNotes } = req.body;
        let validationErrors = [];

        if (!customerName || customerName.trim() === '') validationErrors.push({ param: 'customerName', msg: "Customer Name is required." });
        if (!companyName || companyName.trim() === '') validationErrors.push({ param: 'companyName', msg: "Company Name is required." });
        if (!email || email.trim() === '') validationErrors.push({ param: 'email', msg: "Email is required."});
        else if (!/\S+@\S+\.\S+/.test(email)) validationErrors.push({param: 'email', msg: "Valid email is required."});
        if (!contactNumber || contactNumber.trim() === '') validationErrors.push({ param: 'contactNumber', msg: "Contact number is required."});
        if (!fullAddress || fullAddress.trim() === '') validationErrors.push({ param: 'fullAddress', msg: "Full address is required."});
        if (gstnNumber && !/^[0-9A-Z]{15}$/.test(gstnNumber.toUpperCase())) validationErrors.push({param: 'gstnNumber', msg: "Invalid GSTN format."});
        if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) validationErrors.push({param: 'panNumber', msg: "Invalid PAN format."});
        
        // If you decide the PDF is strictly required for new entries based on business logic:
        const isBankPdfRequiredOnForm = true; // Match this with showAdminAddTrustedBuyerForm
        if (isBankPdfRequiredOnForm && !req.file) {
            validationErrors.push({ param: 'bankDetailsPdf', msg: "Bank Details PDF is required." });
        }


        if (validationErrors.length > 0) {
            req.flash('validation_errors', JSON.stringify(validationErrors));
            req.flash('form_data', JSON.stringify(req.body));
            return res.redirect('/admin/trusted-buyers/add');
        }

        const newBuyerData = {
            customerName, companyName, email, contactNumber,
            address: { fullAddress },
            gstnNumber: gstnNumber ? gstnNumber.toUpperCase() : undefined,
            panNumber: panNumber ? panNumber.toUpperCase() : undefined,
            adminNotes
        };

        if (req.file) {
            newBuyerData.bankDetailsPdf = {
                url: req.file.path,
                public_id: req.file.filename,
                filename: req.file.originalname
            };
        }

        await TrustedBuyer.create(newBuyerData);
        req.flash('success_msg', 'Trusted Buyer added successfully!');
        res.redirect('/admin/trusted-buyers');

    } catch (err) {
        console.error("Error creating trusted buyer:", err);
        let errorMessages = [{msg: 'Server error while creating buyer. Please try again.'}];
        if (err.name === "ValidationError") { // Mongoose schema validation errors
            errorMessages = Object.values(err.errors).map(val => ({ param: val.path, msg: val.message }));
        } else if (err instanceof multer.MulterError) {
            errorMessages = [{param: err.field || 'bankDetailsPdf', msg: err.message }];
        }
        req.flash('validation_errors', JSON.stringify(errorMessages));
        req.flash('form_data', JSON.stringify(req.body));
        res.redirect('/admin/trusted-buyers/add');
    }
};

const updateAdminTrustedBuyer = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        req.flash('error_msg', 'Invalid Buyer ID.');
        return res.redirect('/admin/trusted-buyers');
    }

    try {
        const { customerName, companyName, email, contactNumber, fullAddress, gstnNumber, panNumber, adminNotes } = req.body;
        let validationErrors = [];
        // Add server-side validation similar to createAdminTrustedBuyer
        if (!customerName || customerName.trim() === '') validationErrors.push({ param: 'customerName', msg: "Customer Name is required." });
        // ... other validations ...

        if (validationErrors.length > 0) {
            req.flash('validation_errors', JSON.stringify(validationErrors));
            req.flash('form_data', JSON.stringify(req.body));
            return res.redirect(`/admin/trusted-buyers/edit/${id}`);
        }

        const buyerToUpdate = await TrustedBuyer.findById(id);
        if (!buyerToUpdate) {
            req.flash('error_msg', 'Trusted Buyer not found.');
            return res.redirect('/admin/trusted-buyers');
        }

        buyerToUpdate.customerName = customerName;
        buyerToUpdate.companyName = companyName;
        buyerToUpdate.email = email;
        buyerToUpdate.contactNumber = contactNumber;
        if (!buyerToUpdate.address) buyerToUpdate.address = {}; // Ensure address object exists
        buyerToUpdate.address.fullAddress = fullAddress;
        buyerToUpdate.gstnNumber = gstnNumber ? gstnNumber.toUpperCase() : undefined;
        buyerToUpdate.panNumber = panNumber ? panNumber.toUpperCase() : undefined;
        buyerToUpdate.adminNotes = adminNotes;

        if (req.file) {
            if (buyerToUpdate.bankDetailsPdf && buyerToUpdate.bankDetailsPdf.public_id) {
                try {
                    await cloudinary.uploader.destroy(buyerToUpdate.bankDetailsPdf.public_id, { resource_type: 'raw' });
                } catch (cloudErr) {
                    console.error("Cloudinary old PDF delete error during update:", cloudErr);
                    req.flash('error_msg', 'Old bank PDF could not be deleted from cloud, but details will update.');
                }
            }
            buyerToUpdate.bankDetailsPdf = {
                url: req.file.path,
                public_id: req.file.filename,
                filename: req.file.originalname
            };
        }

        await buyerToUpdate.save();

        req.flash('success_msg', 'Trusted Buyer updated successfully!');
        res.redirect('/admin/trusted-buyers');

    } catch (err) {
        console.error(`Error updating trusted buyer ${id}:`, err);
        let errorMessages = [{msg: 'Server error while updating buyer. Please try again.'}];
        if (err.name === "ValidationError") {
            errorMessages = Object.values(err.errors).map(val => ({ param: val.path, msg: val.message }));
        } else if (err instanceof multer.MulterError) {
            errorMessages = [{param: err.field || 'bankDetailsPdf', msg: err.message }];
        }
        req.flash('validation_errors', JSON.stringify(errorMessages));
        req.flash('form_data', JSON.stringify(req.body));
        res.redirect(`/admin/trusted-buyers/edit/${id}`);
    }
};

const deleteAdminTrustedBuyer = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        req.flash('error_msg', 'Invalid Buyer ID.');
        return res.redirect('/admin/trusted-buyers');
    }
    try {
        const deletedBuyer = await TrustedBuyer.findByIdAndDelete(id);
        if (!deletedBuyer) {
            req.flash('error_msg', 'Trusted Buyer not found.');
            return res.redirect('/admin/trusted-buyers');
        }
        if (deletedBuyer.bankDetailsPdf && deletedBuyer.bankDetailsPdf.public_id) {
            try {
                await cloudinary.uploader.destroy(deletedBuyer.bankDetailsPdf.public_id, { resource_type: 'raw' });
            } catch (cloudErr) {
                console.error("Cloudinary PDF delete error during buyer delete:", cloudErr);
                req.flash('info_msg', 'Buyer deleted, but there was an issue removing the bank PDF from cloud storage.');
            }
        }
        req.flash('success_msg', 'Trusted Buyer deleted successfully!');
        res.redirect('/admin/trusted-buyers');
    } catch (err) {
        console.error(`Error deleting trusted buyer ${id}:`, err);
        req.flash('error_msg', 'Error deleting buyer. ' + err.message);
        res.redirect('/admin/trusted-buyers');
    }
};

module.exports = {
    getAdminTrustedBuyersListPage,
    showAdminAddTrustedBuyerForm,
    showAdminEditTrustedBuyerForm,
    createAdminTrustedBuyer,
    updateAdminTrustedBuyer,
    deleteAdminTrustedBuyer,
    bankPdfUploader
};