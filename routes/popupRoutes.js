// routes/popup.js

const express = require("express");
const router = express.Router();
const Popup = require("../models/Popup"); // Adjust path if needed
const getMulterUploader = require("../config/multerConfig"); // Adjust path
const upload = getMulterUploader("popup_banners"); // Cloudinary folder name

// --- HELPER FUNCTION to extract public_id from Cloudinary URL ---
const getPublicId = (url) => {
  try {
    const parts = url.split("/");
    const lastPart = parts.pop();
    const publicIdWithExt = lastPart;
    const publicId = publicIdWithExt.split(".")[0];
    const folder = parts.slice(parts.indexOf("popup_banners")).join("/");
    return `${folder}/${publicId}`;
  } catch (e) {
    console.error("Could not extract public_id from URL:", url);
    return null;
  }
};

// GET /popups - List all popups with pagination and sorting
router.get("/", async (req, res) => {
  try {
    // --- Ye aapka pagination aur sorting ka logic hai ---
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortOrder = req.query.sort === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const popups = await Popup.find()
      .sort({ created_at: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalPopups = await Popup.countDocuments();
    const totalPages = Math.ceil(totalPopups / limit);

    // --- Yahan hum saare variables ko render mein pass kar rahe hain ---
    res.render("admin/manage-popups", {
      title: "Manage Popups",
      popups: popups, // Database se aaye popups
      currentPage: page, // Current page number
      totalPages: totalPages, // Total pages
      limit: limit, // Items per page
      currentSort: req.query.sort || "desc", // Current sort order
      activePage: "view_popups", // <<--- YEH LINE ADD KI GAYI HAI
    });
  } catch (error) {
    console.error("Error fetching popups:", error);
    res.status(500).send("Server Error");
  }
});

// GET /popups/add - Show form to add a new popup
router.get("/add", (req, res) => {
  res.render("admin/add-popup", {
    title: "Add New Popup",
    activePage: "add_popup", // <--- Add this line
  });
});

// POST /popups - Create a new popup
router.post("/", upload.single("bannerImage"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const isActive = req.body.is_active === "on";

    // If this new popup is set to active, deactivate all others
    if (isActive) {
      await Popup.updateMany({}, { is_active: false });
    }

    if (!req.file) {
      // Handle case where no image is uploaded
      req.flash("error", "Banner image is required.");
      return res.redirect("/admin/popups/add");
    }

    const newPopup = new Popup({
      title,
      description,
      image_url: req.file.path, // Cloudinary URL
      image_public_id: getPublicId(req.file.path), // Store public_id for deletion
      is_active: isActive,
    });

    await newPopup.save();
    req.flash("success", "Popup created successfully!"); // Optional: for success messages
    res.redirect("/admin/popups");
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to create popup.");
    res.redirect("/admin/popups/add");
  }
});

// PUT /api/popups/:id - Update an existing popup
router.put("/api/:id", upload.single("bannerImage"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const isActive = req.body.is_active === "on";

    let updateData = {
      title,
      description,
      is_active: isActive,
    };

    // If this popup is being activated, deactivate all others first.
    if (isActive) {
      await Popup.updateMany(
        { _id: { $ne: req.params.id } },
        { is_active: false }
      );
    }

    // If a new image is uploaded, update the image URL and public_id
    if (req.file) {
      updateData.image_url = req.file.path;
      updateData.image_public_id = getPublicId(req.file.path);

      // Optional but recommended: Delete old image from Cloudinary
      const oldPopup = await Popup.findById(req.params.id);
      if (oldPopup && oldPopup.image_public_id) {
        const cloudinary = require("cloudinary").v2;
        await cloudinary.uploader.destroy(oldPopup.image_public_id);
      }
    }

    await Popup.findByIdAndUpdate(req.params.id, updateData);

    req.flash("success", "Popup updated successfully!");
    res.redirect("/admin/popups");
  } catch (error) {
    console.error("Update Error:", error);
    req.flash("error", "Failed to update popup.");
    res.redirect("/admin/popups");
  }
});

// DELETE /api/popups/:id - Delete a popup
router.delete("/api/:id", async (req, res) => {
  try {
    const popup = await Popup.findById(req.params.id);
    if (!popup) {
      req.flash("error", "Popup not found.");
      return res.redirect("/admin/popups");
    }

    // Delete image from Cloudinary
    if (popup.image_public_id) {
      const cloudinary = require("cloudinary").v2;
      await cloudinary.uploader.destroy(popup.image_public_id);
    }

    // Delete popup from database
    await Popup.findByIdAndDelete(req.params.id);

    req.flash("success", "Popup deleted successfully.");
    res.redirect("/admin/popups");
  } catch (error) {
    console.error("Delete Error:", error);
    req.flash("error", "Failed to delete popup.");
    res.redirect("/admin/popups");
  }
});

module.exports = router;
