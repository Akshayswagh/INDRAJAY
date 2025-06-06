// middleware/bankPdfUploader.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../config/cloudinaryConfig"); // Use the central config

const bankPdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary, // Pass the configured Cloudinary instance
  params: async (req, file) => {
    const originalName = path.parse(file.originalname).name;
    const sanitizedOriginalName = originalName
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-]/g, ""); // Remove non-alphanumeric characters except hyphens
    const uniqueSuffix = uuidv4();
    const publicId = `${sanitizedOriginalName}-${uniqueSuffix}`;

    return {
      folder: "vendor-bank-details",
      public_id: publicId, // Cloudinary uses this and adds extension if necessary
      resource_type: "raw", // Important for non-image files like PDF
      // allowed_formats: ["pdf"], // CloudinaryStorage can infer or you can specify; fileFilter is more robust here

      format: "pdf",
    };
  },
});

// File filter to ensure only PDF files are uploaded
const bankPdfFileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isPdfMimeType = file.mimetype === "application/pdf";

  if (fileExtension === ".pdf" && isPdfMimeType) {
    cb(null, true); // Accept the file
  } else {
    const err = new Error(
      "Only PDF files (.pdf) are allowed for bank documents!"
    );
    err.status = 400; // Bad Request status
    cb(err, false); // Reject the file
  }
};

const bankPdfUploader = multer({
  storage: bankPdfStorage,
  fileFilter: bankPdfFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = bankPdfUploader;
