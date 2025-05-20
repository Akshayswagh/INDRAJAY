// controllers/indServiceController.js
const IndService = require("../models/IndService");

// =============================================
// CLIENT-FACING / GENERAL SITE FUNCTIONS
// (These typically render views for the public website)
// =============================================

// Show all services (e.g., on a public "Our Services" page or homepage)
const showAllServices = async (req, res) => {
  try {
    const services = await IndService.find({}).sort({ createdAt: -1 }); // Example sort
    res.render("home", {
      // Renders 'views/home.ejs'
      title: "Our Industrial Services",
      services: services,
      // messages and currentUser would be available via res.locals if set up globally
    });
  } catch (err) {
    console.error("Error in showAllServices:", err);
    res.status(500).send("Server Error: Could not load services.");
  }
};

// Show single service (e.g., on a public service detail page)
const showSingleService = async (req, res) => {
  try {
    const service = await IndService.findById(req.params.id);
    if (!service) {
      // You might want to render a 404 page for the client site
      return res
        .status(404)
        .render("client/404", { title: "Service Not Found" });
    }
    res.render("client/indService-details", {
      // Renders 'views/client/indService-details.ejs'
      title: service.title || "Service Details",
      service: service,
      // messages and currentUser
    });
  } catch (err) {
    console.error(`Error in showSingleService for ID ${req.params.id}:`, err);
    res.status(500).send("Server Error: Could not load service details.");
  }
};




// =============================================
// ADMIN PANEL FUNCTIONS


// NEW FUNCTION: To display the list of services in the admin panel
const getAdminServicesListPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Or your preferred default
    const skip = (page - 1) * limit;

    const services = await IndService.find({})
      .sort({ createdAt: -1 }) // Optional: sort by newest
      .skip(skip)
      .limit(limit)
      .lean(); // Use .lean() for better performance if not modifying docs

    const totalServices = await IndService.countDocuments({});
    const totalPages = Math.ceil(totalServices / limit);

    res.render('admin/industrial_services', { // Or your specific admin list EJS file
                                              // e.g., 'admin/services_list.ejs'
      title: 'Manage Industrial Services',
      activePage: 'view_services', // For nav highlighting
      services: services,
      currentUser: req.user || { name: 'Admin' }, // Pass current user if available
      messages: { // Pass flash messages if set up
        success_msg: req.flash ? req.flash('success_msg') : [],
        error_msg: req.flash ? req.flash('error_msg') : [],
      },
      currentPage: page,
      totalPages: totalPages,
      limit: limit
    });
  } catch (err) {
    console.error("Error fetching services for admin list page:", err);
    if (req.flash) req.flash('error_msg', 'Could not load the services list. Please try again.');
    // Redirect to a dashboard or render an error page
    res.redirect(req.headers.referer || '/admin/dashboard'); // Or some other safe admin page
  }
};
// (These are for managing services within the admin area)
// =============================================

// Show create form (Admin Panel)
// This would render a dedicated page for adding a service if not using modals exclusively.

// Show create form (Admin Panel)
const showAddForm = (req, res) => {
  try {
    res.render("admin/add_ind_service_form", { // We'll create this EJS file
      title: "Add New Industrial Service",
      activePage: 'add_service', // For nav highlighting if you have it
      // 'messages' and 'currentUser' should be available via res.locals if global middleware is set up
      serviceData: {}, // Pass an empty object for initial form values
      errors: []       // Pass an empty array for errors initially
    });
  } catch (err) {
    console.error("Error rendering admin add service form:", err);
    if(req.flash) req.flash('error_msg', 'Could not load the add service page.');
    res.redirect('/admin/IndustrialServices'); // Redirect to a safe admin page
  }
};

// Create new service (Admin Panel)
const createService = async (req, res) => {
  const { title, description } = req.body;
  let errors = [];

  // Basic Validation
  if (!title || title.trim() === "") {
    errors.push({ msg: 'Service title is required.' });
  }
  if (!description || description.trim() === "") {
    errors.push({ msg: 'Service description is required.' });
  }

  if (errors.length > 0) {
    // If there are validation errors, re-render the form with errors and previous input
    return res.render("admin/add_service_form", {
      title: "Add New Industrial Service",
      activePage: 'add_service',
      errors: errors,
      serviceData: { title, description }, // Send back the data the user entered
      // messages (populated by req.flash) and currentUser
    });
  }

  try {
    await IndService.create({ title, description });
    if (req.flash) req.flash('success_msg', 'New industrial service added successfully!');
    res.redirect('/admin/IndustrialServices'); // Redirect to the admin services list

  } catch (err) {
    console.error("Error creating service (admin):", err);
    if (req.flash) req.flash('error_msg', 'Error adding service. Please try again.');
    // On database or other unexpected error, re-render form with general error
    // and entered data so user doesn't lose it.
    res.render("admin/add_service_form", {
      title: "Add New Industrial Service",
      activePage: 'add_service',
      errors: [{ msg: 'An unexpected error occurred. Please try again.' }],
      serviceData: { title, description },
      // messages and currentUser
    });
  }
};


// Show edit form (Admin Panel)
// This renders a dedicated page for editing a service.
// If you only edit via modal, this might not be directly hit by the list page's edit button,
// but could be linked from the "View Modal's Edit" button if it doesn't open another modal.
const showEditForm = async (req, res) => {
  try {
    const service = await IndService.findById(req.params.id);
    if (!service) {
      if (req.flash) req.flash("error_msg", "Service not found.");
      return res.redirect("/admin/IndustrialServices");
    }
    res.render("admin/add_edit_service", {
      // Renders 'views/admin/add_edit_service.ejs'
      title: "Edit Industrial Service",
      activePage: "edit_service", // For nav highlighting
      service: service, // Pass existing service data
      formAction: `/admin/api/indservices/${service._id}?_method=PUT`, // PUT to this URL to update
      // messages and currentUser
    });
  } catch (err) {
    console.error(
      `Error rendering admin edit form for service ${req.params.id}:`,
      err
    );
    if (req.flash)
      req.flash("error_msg", "Could not load the edit service page.");
    res.redirect("/admin/IndustrialServices");
  }
};

// Update service (Admin Panel - for API calls from modal OR full edit page form)
const updateService = async (req, res) => {
  const { title, description } = req.body;
  const serviceId = req.params.id;

  try {
    if (!title || !description) {
      if (req.flash)
        req.flash(
          "error_msg",
          "Title and description are required for update."
        );
      // If coming from a dedicated form page, re-render with errors and old input.
      // For now, redirecting back to admin list.
      return res.redirect("/admin/IndustrialServices");
    }

    const updatedService = await IndService.findByIdAndUpdate(
      serviceId,
      { title, description },
      { new: true, runValidators: true } // new: true returns updated doc, runValidators for schema validation
    );

    if (!updatedService) {
      if (req.flash)
        req.flash("error_msg", "Service not found or could not be updated.");
      return res.redirect("/admin/IndustrialServices");
    }

    if (req.flash)
      req.flash("success_msg", "Industrial service updated successfully!");
    res.redirect("/admin/IndustrialServices"); // Redirect to admin services list
  } catch (err) {
    console.error(`Error updating service ${serviceId} (admin):`, err);
    if (req.flash)
      req.flash("error_msg", "Error updating service. Please try again.");
    res.redirect("/admin/IndustrialServices"); // Redirect to admin services list
  }
};

// Delete service (Admin Panel - already modified from your previous input)
const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const deletedService = await IndService.findByIdAndDelete(serviceId);

    if (!deletedService) {
      if (req.flash) {
        req.flash("error_msg", "Service not found or could not be deleted.");
      } else {
        console.warn(
          'Flash messages not configured. Could not send "not found" message.'
        );
      }
      return res.redirect("/admin/IndustrialServices");
    }

    if (req.flash) {
      req.flash("success_msg", "Industrial service deleted successfully!");
    } else {
      console.warn(
        "Flash messages not configured. Could not send success message."
      );
    }
    res.redirect("/admin/IndustrialServices");
  } catch (err) {
    console.error(`Error deleting service with ID ${req.params.id}:`, err);
    if (req.flash) {
      req.flash(
        "error_msg",
        "An error occurred while deleting the service. Please try again."
      );
    } else {
      console.warn(
        "Flash messages not configured. Could not send error message."
      );
    }
    res.redirect("/admin/IndustrialServices");
  }
};

module.exports = {
  // Client-facing functions
  showAllServices,
  showSingleService,

  // Admin panel functions
  // (Note: The function for rendering the admin list page itself, e.g., getIndustrialServicesAdminPage,
  // would typically be separate or you'd have a generic admin list renderer.)
  showAddForm, // Renders a dedicated "add service" page for admin
  createService, // Handles submission from "add service" page or API
  showEditForm, // Renders a dedicated "edit service" page for admin
  updateService, // Handles submission from "edit service" page or API (modal)
  deleteService, // Handles delete API calls

  getAdminServicesListPage, //display all services in admin panel
};
