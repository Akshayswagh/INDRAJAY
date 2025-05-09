const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  experience_required: {
    type: String,
    default: "Anyone can apply",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Career = mongoose.model("Career", careerSchema);

module.exports = Career;
