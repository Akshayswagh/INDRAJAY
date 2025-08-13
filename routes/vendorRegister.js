// routes/vendorRegister.js
const express = require("express");
const Vendor = require("../models/VendorModel");
const bankPdfUploader = require("../config/multerVendorDocsConfig"); // Import the new Multer middleware

const router = express.Router();

router.post(
    "/register",
    bankPdfUploader.single("bankDetailsPdf"), // Use the Multer instance
    async (req, res, next) => { // Added 'next' for better error propagation from Multer
        try {
            // Check if a file was actually uploaded by Multer
            // (Multer-storage-cloudinary populates req.file on successful upload)
            if (!req.file) {
                // This condition might be hit if fileFilter rejected the file
                // and the error wasn't caught by a global error handler or if cb(null,false) was used without error.
                // However, our fileFilter now passes an error so it should go to the catch or error middleware.
                return res.status(400).json({ message: "Bank details PDF file is required and must be a valid PDF." });
            }

            // req.file.path will contain the secure URL from Cloudinary
            // req.file.filename will contain the public_id
            const newVendor = new Vendor({
                ...req.body,
                // Assuming your VendorModel's 'bankDetailsPdf' field is a String to store the URL
                bankDetailsPdf: req.file.path,
                // If you wanted to store both public_id and url:
                // bankDetailsPdf: {
                //   public_id: req.file.filename,
                //   url: req.file.path
                // }
                // Make sure your VendorModel schema matches this structure if you use the object form.
            });

            await newVendor.save();

            res.status(201).json({ message: "Vendor registered successfully", vendor: newVendor });

        } catch (err) {
            console.error("Error in /register route:", err);

            // Handle Mongoose validation errors
            if (err.name === 'ValidationError') {
                return res.status(400).json({ message: "Validation Error", errors: err.errors });
            }

            // Handle errors from Multer (e.g., file type, size limit)
            // Multer errors passed via cb(err) in fileFilter will have err.status
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            
            // Handle errors that might come from Cloudinary via multer-storage-cloudinary
            // These might not have a standard 'status' but could be identified by message or other properties
            if (err.message && (err.message.toLowerCase().includes('cloudinary') || err.http_code)) {
                return res.status(500).json({ message: "File upload service error", error: err.message });
            }

            // Generic fallback server error
            // Consider using next(err) to pass to a global error handler
            // next(err); 
            res.status(500).json({ message: "Error registering vendor", error: err.message });
        }
    }
);


module.exports = router;