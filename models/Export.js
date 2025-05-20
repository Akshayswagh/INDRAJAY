const mongoose = require("mongoose");

const exportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },

  // Category field with validation
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: {
      values: [
        "Grains & Cereals",
        "Oil Seeds",
        "Pulses",
        "Spises",
        "Fruits and Vegetables",
        "Sugar",
        "Jaggery",
        "Coffee and Cocoa",
        "Coconut",
        "Nuts & Dry Fruits",
        "Chemicals",
        "Wooden Pallets",
        "Packing Materials",
        "Appearals & Garments",
      ],
      message: "{VALUE} is not a valid category",
    },
    index: true, // Add index for better query performance
  },

  // Image field - stores URL or file path
  image: {
    type: String,
    required: [true, "Image URL/path is required"],
    validate: {
      validator: function (v) {
        // Simple URL validation regex
        return /^(https?:\/\/|\.?\/).+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: (props) => `${props.value} is not a valid image URL/path!`,
    },
  },

  // Description field
  description: {
    type: String,
    required: [true, "Description is required"],
    // minlength: [20, 'Description must be at least 20 characters long'],
    // maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
exportSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the model
const Export = mongoose.model("Export", exportSchema);

module.exports = Export;
