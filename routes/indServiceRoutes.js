const express = require("express");
const router = express.Router();
const IndService = require("../models/IndService");

// Route: Show all services (Home)
router.get("/", async (req, res) => {
  try {
    const services = await IndService.find({});
    res.render("home", { services });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Route: Show single service
router.get("/service/:id", async (req, res) => {
  try {
    const service = await IndService.findById(req.params.id);
    if (!service) return res.status(404).send("Service not found");
    res.render("client/indService-details", { title: service.title, service });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ---------- CREATE ----------

// Show create form
router.get("/add-service", (req, res) => {
  res.render("add-service"); // Make sure to create this EJS file
});

// Handle form POST to add new service
router.post("/add-service", async (req, res) => {
  const { title, description } = req.body;
  try {
    await IndService.create({ title, description });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error adding service");
  }
});

// ---------- UPDATE ----------

// Show edit form
router.get("/edit/:id", async (req, res) => {
  try {
    const service = await IndService.findById(req.params.id);
    if (!service) return res.status(404).send("Service not found");
    res.render("edit-service", { service }); // Make sure to create this EJS file
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Handle update form POST
router.post("/edit/:id", async (req, res) => {
  const { title, description } = req.body;
  try {
    await IndService.findByIdAndUpdate(req.params.id, { title, description });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error updating service");
  }
});

// ---------- DELETE ----------

// Handle delete
router.post("/delete/:id", async (req, res) => {
  try {
    await IndService.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error deleting service");
  }
});

module.exports = router;
