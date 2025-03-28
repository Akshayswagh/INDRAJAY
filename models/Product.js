const mongoose = require("mongoose");

const categories = [
  "Fruits",
  "Vegetables",
  "Nuts",
  "Grains",
  "Pulses",
  "Coconuts",
  "Dehydrated Powder of Banana",
];

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, enum: categories },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, required: true }, // Percentage (e.g., 10 for 10%)
    finalPrice: { type: Number, required: true }, // Auto-calculated
    imageUrl: { type: String, required: true }, // Cloudinary Image URL
  },
  { timestamps: true }
);

// Middleware to calculate final price before saving
ProductSchema.pre("save", function (next) {
  this.finalPrice =
    this.originalPrice - (this.originalPrice * this.discount) / 100;
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
