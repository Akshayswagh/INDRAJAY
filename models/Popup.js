const mongoose = require("mongoose");

const popupSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true, // Remove whitespace from start and end
  },
  image_url: {
    type: String,
    required: true,
  },
  
  // --- NEW & IMPROVED FIELDS ---
  link_url: {
    type: String,
    trim: true,
    default: null, // It's slightly better to have null than undefined
  },
  open_in_new_tab: {
    type: Boolean,
    default: true, // Default to opening in a new tab to not navigate users away
  },

  is_active: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Best Practice: Automatically update the 'updated_at' field on save
popupSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Popup", popupSchema);