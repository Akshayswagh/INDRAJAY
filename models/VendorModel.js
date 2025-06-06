const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    isTrusted: {
      type: Boolean,
      default: false, // New vendors are not trusted by default
    },
    firmName: {
      type: String,
      required: true,
      trim: true,
    },
    Address: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    contactPersonName: {
      type: String,
      required: true,
      trim: true,
    },
    productOrService: {
      type: String,
      required: true,
      trim: true,
    },
    gstNumber: {
      type: String,
      required: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GST number format",
      ],
    },
    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format"],
    },
    bankDetailsPdf: {
      type: String, // Cloudinary PDF URL will be stored here
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite during hot reload
module.exports =
  mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
