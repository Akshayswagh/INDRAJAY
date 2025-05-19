const IndService = require("../models/IndService");

// Show all services
const showAllServices = async (req, res) => {
  try {
    const services = await IndService.find({});
    res.render("home", { services });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Show single service
const showSingleService = async (req, res) => {
  try {
    const service = await IndService.findById(req.params.id);
    if (!service) return res.status(404).send("Service not found");
    res.render("client/indService-details", { title: service.title, service });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Show create form
const showAddForm = (req, res) => {
  res.render("add-service");
};

// Create new service
const createService = async (req, res) => {
  const { title, description } = req.body;
  try {
    await IndService.create({ title, description });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error adding service");
  }
};

// Show edit form
const showEditForm = async (req, res) => {
  try {
    const service = await IndService.findById(req.params.id);
    if (!service) return res.status(404).send("Service not found");
    res.render("edit-service", { service });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Update service
const updateService = async (req, res) => {
  const { title, description } = req.body;
  try {
    await IndService.findByIdAndUpdate(req.params.id, { title, description });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error updating service");
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    await IndService.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error deleting service");
  }
};

module.exports = {
  showAllServices,
  showSingleService,
  showAddForm,
  createService,
  showEditForm,
  updateService,
  deleteService,
};
