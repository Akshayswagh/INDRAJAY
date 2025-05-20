// controllers/adminExportController.js
const Export = require("../models/Export"); // Adjust path if needed
const getMulterUploader = require("../config/multerConfig"); // Assuming this is your multer setup for uploads
const uploader = getMulterUploader("exports"); // Configure for 'exports' subfolder or Cloudinary folder

// === ADMIN PAGE RENDERING CONTROLLERS ===

// Display list of all export items in Admin Panel
const getAdminExportsListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const exportItems = await Export.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await Export.countDocuments({});
    const totalPages = Math.ceil(totalItems / limit);

    res.render("admin/view_exports", {
      // Your EJS template for listing exports
      title: "Manage Export Items",
      activePage: "view_exports",
      exports: exportItems,
      currentUser: req.user || { name: "Admin" }, // From auth middleware
      messages: {
        // From connect-flash middleware
        success_msg: req.flash ? req.flash("success_msg") : [],
        error_msg: req.flash ? req.flash("error_msg") : [],
      },
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
    });
  } catch (error) {
    console.error("Error fetching export items for admin list:", error);
    if (req.flash) req.flash("error_msg", "Could not load export items.");
    res.redirect(req.headers.referer || "/admin/dashboard"); // Or an error page
  }
};

// Display form to add a new export item (Admin Panel)
const showAddExportForm = (req, res) => {
  try {
    res.render("admin/add_export_form", {
      // Your EJS template for the add form
      title: "Add New Export Item",
      activePage: "add_export",
      currentUser: req.user || { name: "Admin" },
      messages: {
        success_msg: req.flash ? req.flash("success_msg") : [],
        error_msg: req.flash ? req.flash("error_msg") : [],
      },
      exportData: {}, // For pre-filling form if re-rendering on error
      errors: [], // For displaying validation errors
    });
  } catch (error) {
    console.error("Error rendering admin add export form:", error);
    if (req.flash)
      req.flash("error_msg", "Could not load the add export item page.");
    res.redirect("/admin/exports"); // Redirect to admin exports list
  }
};

// Display form to edit an existing export item (Admin Panel)
const showEditExportForm = async (req, res) => {
  try {
    const exportItem = await Export.findById(req.params.id).lean();
    if (!exportItem) {
      if (req.flash) req.flash("error_msg", "Export item not found.");
      return res.redirect("/admin/exports");
    }
    res.render("admin/edit_export_form", {
      // Your EJS template for the edit form
      title: "Edit Export Item",
      activePage: "edit_export",
      currentUser: req.user || { name: "Admin" },
      messages: {
        success_msg: req.flash ? req.flash("success_msg") : [],
        error_msg: req.flash ? req.flash("error_msg") : [],
      },
      exportItem: exportItem, // Pass existing item data to the form
      exportData: exportItem, // For pre-filling form
      errors: [],
    });
  } catch (error) {
    console.error(
      `Error rendering admin edit export form for item ${req.params.id}:`,
      error
    );
    if (req.flash)
      req.flash("error_msg", "Could not load the edit export item page.");
    res.redirect("/admin/exports");
  }
};

// === ADMIN API/ACTION CONTROLLERS ===

// Create a new export item (Admin Panel API)
const createExportItem = async (req, res) => {
  // Using uploader.single('image') as middleware in the route definition
  try {
    const { name, category, description } = req.body;
    let errors = [];

    if (!name || name.trim() === "") errors.push({ msg: "Name is required." });
    if (!category || category.trim() === "")
      errors.push({ msg: "Category is required." });
    if (!description || description.trim() === "")
      errors.push({ msg: "Description is required." });
    if (!req.file) errors.push({ msg: "Image is required." });

    if (errors.length > 0) {
      // If rendering a full page form on error:
      // return res.status(400).render('admin/add_export_form', {
      //     title: 'Add New Export Item', activePage: 'add_export',
      //     exportData: { name, category, description }, errors,
      //     currentUser: req.user, messages: req.flash()
      // });
      // If API style response for modal or AJAX:
      if (req.flash)
        req.flash("error_msg", errors.map((e) => e.msg).join("<br>"));
      return res.redirect(req.headers.referer || "/admin/exports/add");
    }

    const imagePath = req.file.path; // This path comes from Multer (local) or Cloudinary (URL)

    const newExport = new Export({
      name,
      category,
      image: imagePath,
      description,
    });

    await newExport.save();
    if (req.flash) req.flash("success_msg", "Export item added successfully!");
    res.redirect("/admin/exports"); // Redirect to admin exports list
  } catch (error) {
    console.error("Error creating export item (admin API):", error);
    if (req.flash)
      req.flash("error_msg", "Error adding export item. Please try again.");
    res.redirect(req.headers.referer || "/admin/exports/add");
  }
};

// Update an existing export item (Admin Panel API)
const updateExportItem = async (req, res) => {
  // Using uploader.single('image') as middleware in the route definition
  try {
    const { name, category, description } = req.body;
    const exportId = req.params.id;
    let errors = [];

    // Basic validation
    if (!name || name.trim() === "") errors.push({ msg: "Name is required." });
    if (!category || category.trim() === "")
      errors.push({ msg: "Category is required." });
    if (!description || description.trim() === "")
      errors.push({ msg: "Description is required." });

    if (errors.length > 0) {
      // For API style response for modal or AJAX:
      if (req.flash)
        req.flash("error_msg", errors.map((e) => e.msg).join("<br>"));
      return res.redirect(
        req.headers.referer || `/admin/exports/edit/${exportId}`
      );
    }

    const updateData = {
      name,
      category,
      description,
      updatedAt: new Date(),
    };

    if (req.file) {
      updateData.image = req.file.path; // Path from Multer/Cloudinary
    }

    const updatedExport = await Export.findByIdAndUpdate(exportId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validations are run
    });

    if (!updatedExport) {
      if (req.flash)
        req.flash(
          "error_msg",
          "Export item not found or could not be updated."
        );
      return res.redirect("/admin/exports");
    }
    if (req.flash)
      req.flash("success_msg", "Export item updated successfully!");
    res.redirect("/admin/exports");
  } catch (error) {
    console.error(
      `Error updating export item ${req.params.id} (admin API):`,
      error
    );
    if (req.flash)
      req.flash("error_msg", "Error updating export item. Please try again.");
    res.redirect(req.headers.referer || `/admin/exports/edit/${req.params.id}`);
  }
};

// Delete an export item (Admin Panel API)
const deleteExportItem = async (req, res) => {
  try {
    const exportId = req.params.id;
    const deletedExport = await Export.findByIdAndDelete(exportId);

    if (!deletedExport) {
      if (req.flash)
        req.flash(
          "error_msg",
          "Export item not found or could not be deleted."
        );
      return res.redirect("/admin/exports");
    }

    // TODO: Optionally delete the associated image from storage (Cloudinary or local file system)
    // if (deletedExport.image) { /* ... logic to delete image ... */ }

    if (req.flash)
      req.flash("success_msg", "Export item deleted successfully!");
    res.redirect("/admin/exports");
  } catch (error) {
    console.error(
      `Error deleting export item ${req.params.id} (admin API):`,
      error
    );
    if (req.flash)
      req.flash("error_msg", "Error deleting export item. Please try again.");
    res.redirect("/admin/exports");
  }
};

// === CLIENT-FACING PAGE CONTROLLERS (If needed separately) ===
// View Single Export (Client-Facing)
const viewClientExportDetails = async (req, res) => {
  try {
    const exportItem = await Export.findById(req.params.id).lean();
    if (!exportItem) {
      // Render a client-side 404 page
      return res
        .status(404)
        .render("client/404", { title: "Export Item Not Found" });
    }
    res.render("client/exportDetails", {
      // Your client-side EJS detail template
      title: `${exportItem.name} | Export Details`,
      exportItem,
      // currentUser, messages if applicable to client side
    });
  } catch (error) {
    console.error(
      `Error fetching client export details for ${req.params.id}:`,
      error
    );
    res.status(500).render("client/500", { title: "Server Error" }); // Client-side 500 page
  }
};

// === CLIENT-FACING PAGE CONTROLLER ===

/**
 * Fetches and displays a list of all export items for the client-facing website.
 * Supports pagination.
 */
const getClientExportsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 12; // Items per page, default to 12 (adjust as needed for client view)
    const skip = (page - 1) * limit;

    // Fetch export items from the database with pagination
    // You might want to add a filter here, e.g., only show items marked as 'active' or 'published'
    // For example: const filter = { isActive: true };
    const filter = {}; // No filter for now, shows all

    const exportItems = await Export.find(filter)
      .sort({ category: 1, name: 1 }) // Example sorting: by category, then by name
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() for better performance as we are only reading data

    // Get the total number of items matching the filter for pagination
    const totalItems = await Export.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Data to pass to the EJS template
    const templateData = {
      title: "Our Export Products", // Or any title you prefer
      activePage: "exports", // For highlighting active nav link in client layout
      exports: exportItems,
      currentUser: req.user || null, // Pass current user if your client layout uses it
      // Client-side generally doesn't need admin flash messages,
      // but if you have client-specific flash messages, handle them here.
      // messages: { ... }
      currentPage: page,
      totalPages: totalPages,
      limit: limit, // Pass limit for constructing pagination links in EJS
    };

    // Render the client-facing EJS template for the list of exports
    // Replace 'client/exports_list' with the actual path to your EJS file
    res.render("client/exports_list", templateData);
  } catch (error) {
    console.error("Error fetching export items for client list page:", error);
    // Render a generic error page for the client
    // Replace 'client/error_page' with your actual client error EJS file
    res.status(500).render("client/error_page", {
      title: "Error",
      message:
        "We encountered an issue trying to display our export products. Please try again later.",
    });
  }
};

module.exports = {
  getAdminExportsListPage,
  showAddExportForm,
  showEditExportForm,
  createExportItem,
  updateExportItem,
  deleteExportItem,

  // client side
  viewClientExportDetails,
  getClientExportsList,
  // If you want to keep client view separate
  uploader, // Exporting the uploader instance if routes need it directly
};
