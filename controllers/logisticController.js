const Logistic = require("../models/logistic");

// @desc    Get the page to view all logistic orders
// @route   GET /admin/logistics
exports.getLogisticsPage = async (req, res) => {
  try {
    const logistics = await Logistic.find({}).sort({ createdAt: -1 });
    res.render("admin/view-logistics", {
      title: "Manage Logistics",
      activePage: "logistics",
      logistics: logistics,
      currentUser: req.user, // Assuming you have user auth middleware
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Could not retrieve logistics data.");
    res.redirect("/");
  }
};

// @desc    Get the page to add a new logistic order
// @route   GET /admin/logistics/add
exports.getAddLogisticPage = (req, res) => {
  res.render("admin/add-logistic", {
    title: "Add New Logistic Order",
    activePage: "logistics",
  });
};

// @desc    Create a new logistic order
// @route   POST /admin/api/logistics
// --- CORRECTED CONTROLLER ---
exports.createLogistic = async (req, res) => {
  try {
    // 1. Log the incoming data to be sure it's arriving
    console.log("Backend received booking data:", req.body);

    const newLogistic = new Logistic(req.body);
    await newLogistic.save();

    // 2. The response for an API call MUST be JSON.
    // It should not be a redirect or render a page.
    res.status(201).json({
      success: true,
      message: "New logistic order created successfully.",
      data: newLogistic, // Optionally send back the created data
    });
  } catch (err) {
    console.error("Error creating logistic entry:", err);

    // 3. The error response MUST ALSO be JSON.
    res.status(500).json({
      success: false,
      message: "Failed to create logistic order due to a server error.",
      error: err.message,
    });
  }
};
// @desc    Update a logistic order
// @route   PUT /admin/api/logistics/:id
exports.updateLogistic = async (req, res) => {
  try {
    await Logistic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    req.flash("success_msg", "Logistic order updated successfully.");
    res.redirect("/admin/logistics");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to update logistic order.");
    res.redirect("/admin/logistics");
  }
};

// @desc    Delete a logistic order
// @route   DELETE /admin/api/logistics/:id
exports.deleteLogistic = async (req, res) => {
  try {
    await Logistic.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Logistic order deleted successfully.");
    res.redirect("/admin/logistics");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to delete logistic order.");
    res.redirect("/admin/logistics");
  }
};
