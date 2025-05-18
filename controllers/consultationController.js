const Consultation = require("../models/ConsultService");

// Show all consultations
exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.render("consultations/index", { consultations });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// Show single consultation detail
// exports.getConsultationById = async (req, res) => {
//   try {
//     const consultation = await Consultation.findById(req.params.id);
//     res.render("../views/client/consult-details", { consultation });
//   } catch (error) {
//     res.status(404).send("Consultation not found");
//   } 
// };

// Show form to add new consultation
exports.showCreateForm = (req, res) => {
  res.render("consultations/new");
};

// Add new consultation
exports.createConsultation = async (req, res) => {
  try {
    const { title, description } = req.body;
    await Consultation.create({ title, description });
    res.redirect("/consultations");
  } catch (error) {
    res.status(400).send("Error creating consultation");
  }
};

// Show form to edit
exports.showEditForm = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    res.render("consultations/edit", { consultation });
  } catch (error) {
    res.status(404).send("Consultation not found");
  }
};

// Update consultation
exports.updateConsultation = async (req, res) => {
  try {
    const { title, description } = req.body;
    await Consultation.findByIdAndUpdate(req.params.id, { title, description });
    res.redirect("/consultations");
  } catch (error) {
    res.status(400).send("Update failed");
  }
};

// Delete
exports.deleteConsultation = async (req, res) => {
  try {
    await Consultation.findByIdAndDelete(req.params.id);
    res.redirect("/consultations");
  } catch (error) {
    res.status(400).send("Delete failed");
  }
};
