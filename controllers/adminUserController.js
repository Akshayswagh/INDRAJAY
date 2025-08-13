// controllers/adminUserController.js
const User = require('../models/User'); // Adjust path to your User model
const Vendor = require('../models/VendorModel'); // ✅ ADD THIS: Adjust path if needed

// Helper function to get sort criteria (to avoid repetition)
const getSortCriteria = (sortQuery) => {
    let criteria = { createdAt: -1 }; // Default: newest first (desc)
    let value = "desc";
    if (sortQuery === "asc") {
        criteria = { createdAt: 1 }; // Oldest first (asc)
        value = "asc";
    }
    return { sortCriteria: criteria, currentSortValue: value };
};

const deleteVendorFromAdmin = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            if(req.flash) req.flash('error_msg', 'Vendor not found.');
            return res.redirect('/admin/vendors'); // Or wherever your vendors list is
        }

        // Delete PDF from Cloudinary (ensure 'bankDetailsPdf' casing and structure match your model)
        if (vendor.bankDetailsPdf) {
            let publicIdToDelete = null;
            if (typeof vendor.bankDetailsPdf === 'object' && vendor.bankDetailsPdf.public_id) {
                publicIdToDelete = vendor.bankDetailsPdf.public_id;
            } else if (typeof vendor.bankDetailsPdf === 'string' && vendor.bankDetailsPdf.includes('cloudinary.com')) {
                // Attempt to parse public_id from URL
                try {
                    const urlParts = vendor.bankDetailsPdf.split('/');
                    const filenameWithPotentialFolder = urlParts.slice(urlParts.indexOf('upload') + 2).join('/');
                    publicIdToDelete = path.join(path.dirname(filenameWithPotentialFolder), path.parse(filenameWithPotentialFolder).name).replace(/\\/g, '/');

                    // Ensure the resource_type specific folder like 'vendor-bank-details' is part of publicIdToDelete if it's not in the filenameWithPotentialFolder
                    if (!publicIdToDelete.startsWith('vendor-bank-details/') && vendor.bankDetailsPdf.includes('/vendor-bank-details/')) {
                         publicIdToDelete = `vendor-bank-details/${publicIdToDelete.split('/').pop()}`;
                    }

                } catch (parseError) {
                    console.error("Could not parse public_id from URL for Cloudinary deletion:", parseError);
                }
            }

            if (publicIdToDelete) {
                try {
                    // console.log(`Admin attempting to delete Cloudinary raw resource: ${publicIdToDelete}`);
                    await cloudinary.uploader.destroy(publicIdToDelete, { resource_type: "raw" });
                } catch (cloudinaryError) {
                    console.error("Cloudinary deletion failed from admin:", cloudinaryError);
                    // Decide if you want to proceed with DB deletion if Cloudinary fails
                    if(req.flash) req.flash('error_msg', 'Failed to delete associated PDF from cloud. Vendor still in DB.');
                    // return res.redirect('/admin/vendors'); // Optionally stop here
                }
            }
        }

        await Vendor.findByIdAndDelete(vendorId);

        if(req.flash) req.flash('success_msg', 'Vendor deleted successfully.');
        res.redirect('/admin/vendors'); // Redirect back to the list

    } catch (err) {
        console.error("Error deleting vendor from admin:", err);
        if(req.flash) req.flash('error_msg', 'Error deleting vendor.');
        res.redirect('/admin/vendors');
    }
};

// Mark a vendor as trusted
const trustVendor = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const vendor = await Vendor.findByIdAndUpdate(vendorId, { isTrusted: true }, { new: true });

        if (!vendor) {
            req.flash('error_msg', 'Vendor not found.');
            return res.redirect(req.headers.referer || '/admin/vendors');
        }
        req.flash('success_msg', `${vendor.firmName || 'Vendor'} has been marked as trusted.`);
        res.redirect(req.headers.referer || '/admin/vendors');
    } catch (error) {
        console.error("Error marking vendor as trusted:", error);
        req.flash('error_msg', 'Failed to mark vendor as trusted. Please try again.');
        res.redirect(req.headers.referer || '/admin/vendors');
    }
};

// Unmark a vendor as trusted
const untrustVendor = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const vendor = await Vendor.findByIdAndUpdate(vendorId, { isTrusted: false }, { new: true });

        if (!vendor) {
            req.flash('error_msg', 'Vendor not found.');
            return res.redirect(req.headers.referer || '/admin/vendors');
        }
        req.flash('success_msg', `${vendor.firmName || 'Vendor'} has been removed from trusted list.`);
        res.redirect(req.headers.referer || '/admin/vendors');
    } catch (error) {
        console.error("Error unmarking vendor as trusted:", error);
        req.flash('error_msg', 'Failed to unmark vendor as trusted. Please try again.');
        res.redirect(req.headers.referer || '/admin/vendors');
    }
};


// Display list of TRUSTED vendors in Admin Panel
const getTrustedVendorsListPage = async (req, res) => {
    try {
        const { sortCriteria, currentSortValue } = getSortCriteria(req.query.sort);
        const trustedVendors = await Vendor.find({ isTrusted: true }).sort(sortCriteria).lean();

        res.render('admin/trusted_vendors', {
            title: 'Trusted Vendors',
            activePage :'trusted_vendors',
            vendors: trustedVendors, // Re-use 'vendors' variable name in template
            currentSort: currentSortValue,
            currentUser: req.user,
            messages: {
                success_msg: req.flash('success_msg'),
                error_msg: req.flash('error_msg'),
            }
        });
    } catch (error) {
        console.error("Error fetching trusted vendors for admin:", error);
        req.flash('error_msg', 'Could not load trusted vendors. Please try again.');
        res.redirect(req.headers.referer || '/admin/dashboard');
    }
};

// Display list of all 'vendor' records in Admin Panel
const getAdminVendorsListPage = async (req, res) => {
    try {
        const { sortCriteria, currentSortValue } = getSortCriteria(req.query.sort);

        // ✅ CHANGE HERE: Fetch from Vendor model
        const vendorsData = await Vendor.find({}) // Find all vendors
            .sort(sortCriteria)
            .lean(); // .lean() is good for performance if you don't need Mongoose instance methods in EJS

        res.render('admin/view_vendors', { // Your EJS template for listing vendors
            title: 'Manage Vendors',
            activePage: 'view_vendors', // For highlighting active link in nav
            vendors: vendorsData,       // Pass vendors data to the template
            currentSort: currentSortValue,
            currentUser: req.user || { name: 'Admin' }, // Assuming you have auth middleware setting req.user
            messages: { // Assuming you use connect-flash for messages
                success_msg: req.flash ? req.flash('success_msg') : [],
                error_msg: req.flash ? req.flash('error_msg') : [],
            }
        });
    } catch (error) {
        console.error("Error fetching vendors for admin list:", error);
        if(req.flash) req.flash('error_msg', 'Could not load vendors.');
        // Redirect to a safe page, like the admin dashboard or the previous page
        res.redirect(req.headers.referer || '/admin/dashboard');
    }
};

// Display list of all 'admin' role users in Admin Panel
const getAdminAdminsListPage = async (req, res) => {
    try {
        const { sortCriteria, currentSortValue } = getSortCriteria(req.query.sort);

        const adminsData = await User.find({ role: "admin" })
            .sort(sortCriteria)
            .lean();

        res.render('admin/view_admins', { // Your EJS template for listing 'admin' role
            title: 'Manage Administrators',
            activePage: 'view_admins',
            admins: adminsData,
            currentSort: currentSortValue,
            currentUser: req.user || { name: 'Admin' },
            messages: {
                success_msg: req.flash ? req.flash('success_msg') : [],
                error_msg: req.flash ? req.flash('error_msg') : [],
            }
        });
    } catch (error) {
        console.error("Error fetching 'admin' role users for admin list:", error);
        if(req.flash) req.flash('error_msg', 'Could not load administrators.');
        res.redirect(req.headers.referer || '/admin/dashboard');
    }
};


module.exports = {
    // getAdminUsersListPage,
    getAdminVendorsListPage,
    getAdminAdminsListPage,
    deleteVendorFromAdmin,
    trustVendor,
    untrustVendor,
    getTrustedVendorsListPage,

};