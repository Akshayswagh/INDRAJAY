// const express = require("express");
// const router = express.Router();
// // const Vendor = require("../models/vendorModel"); // ✅ Adjust path if needed
// const cloudinary = require("../config/cloudinaryConfig"); // ✅ Required for deleting PDF from Cloudinary

// // Get all vendors
// router.get("/all", async (req, res) => {
//   const vendors = await Vendor.find().sort({ createdAt: -1 });
//   res.status(200).json(vendors);
// });

// // Get single vendor by ID
// router.get("/:id", async (req, res) => {
//   const vendor = await Vendor.findById(req.params.id);
//   if (!vendor) return res.status(404).json({ message: "Vendor not found" });
//   res.status(200).json(vendor);
// });




// // Delete vendor by ID
// router.delete("/:id", async (req, res) => { // <--- THIS IS YOUR DELETE ROUTE
//   try {
//     const vendor = await Vendor.findById(req.params.id);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });

//     // Optional: Delete PDF from Cloudinary
//     // Ensure 'bankDetailsPdf' matches the casing in your VendorModel
//     if (vendor.bankDetailsPdf && vendor.bankDetailsPdf.public_id) {
//       await cloudinary.uploader.destroy(vendor.bankDetailsPdf.public_id, {
//         resource_type: "raw", // Important for non-image files
//       });
//     } else if (typeof vendor.bankDetailsPdf === 'string' && vendor.bankDetailsPdf.includes('cloudinary.com')) {
//       // If bankDetailsPdf is just a URL, you need to extract the public_id
//       // This is a bit more complex and depends on your URL structure.
//       // Example for typical Cloudinary URLs:
//       // https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/v12345/folder/public_id.pdf
//       // You'd need to parse this to get 'folder/public_id'
//       try {
//         const urlParts = vendor.bankDetailsPdf.split('/');
//         const publicIdWithFolderAndVersion = urlParts.slice(urlParts.indexOf('upload') + 2).join('/');
//         const public_id = path.parse(publicIdWithFolderAndVersion).name; // Gets 'public_id' without extension
//         const folder = urlParts.slice(urlParts.indexOf('upload') + 1, urlParts.length -1).join('/');
//         const actualPublicId = folder.includes('vendor-bank-details') ? `vendor-bank-details/${public_id}` : public_id;


//         if (actualPublicId) {
//             console.log(`Attempting to delete Cloudinary raw resource: ${actualPublicId}`);
//             await cloudinary.uploader.destroy(actualPublicId, {
//                 resource_type: "raw",
//             });
//         }
//       } catch (cloudinaryErr) {
//         console.error("Error extracting public_id or deleting from Cloudinary:", cloudinaryErr);
//         // Decide if you want to stop deletion if Cloudinary fails, or just log and continue
//       }
//     }


//     await Vendor.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Vendor deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting vendor:", err); // Log the full error
//     res
//       .status(500)
//       .json({ message: "Error deleting vendor", error: err.message });
//   }
// });
