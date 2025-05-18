// models/ConsultService.js
const mongoose = require("mongoose");

const ConsultationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultation", ConsultationSchema);
