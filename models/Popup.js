const mongoose = require("mongoose");

const popupSchema = new mongoose.Schema({
  title: { type: String },
  image_url: { type: String, required: true }, // Cloudinary or local
  is_active: { type: Boolean, default: true }, // Only 1 active popup at a time
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Popup", popupSchema);
