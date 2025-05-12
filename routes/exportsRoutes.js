const express = require("express");
const router = express.Router();
const Export = require("../models/Exports");
const getMulterUploader = require("../config/multerConfig");
const uploadPath = "/uploads/exports";
const multer = require("multer");
const handleError = require("../utils/handleError");
const uploader = getMulterUploader("exports");

// ADD - add exports
router.post("/addExport", uploader.single("image"), async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }
    if (!name || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Name, Category and description are required",
      });
    }

    const imagePath = `/uploads/exports/${req.file.filename}`;

    const newExport = new Export({
      name,
      category,
      image: imagePath,
      description,
    });

    await newExport.save();
    res.status(201).json({
      success: true,
      message: "Export added successfully!",
      data: newExport,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// READ - Get all export items
router.get("/allExports", async (req, res, next) => {
  console.log("req received");
  try {
    const exports = await Export.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: exports.length,
      data: exports,
    });
  } catch (error) {
    next(error);
  }
});

// READ - Get single export item
router.get("/:id", async (req, res) => {
  try {
    const exportItem = await Export.findById(req.params.id);

    if (!exportItem) {
      return handleError(res, new Error("Export item not found"), 404);
    }

    res.status(200).json({
      success: true,
      data: exportItem,
    });
  } catch (error) {
    handleError(res, error); // automatically handles known types
  }
});

// UPDATE - Update export item
router.put("/:id", uploader.single("image"), async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!category || !description) {
      return handleError(
        res,
        new Error("Category and description are required"),
        400
      );
    }
    const updateData = {
      name,
      category,
      description,
      updatedAt: new Date(),
    };

    if (req.file) {
      updateData.image = `/uploads/careManagement/${req.file.filename}`; // Adjust path if needed
    }

    const updatedExport = await Export.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedExport) {
      return handleError(res, new Error("Export item not found"), 404);
    }

    res.status(200).json({
      success: true,
      data: updatedExport,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE - Delete export item
router.delete("/:id", async (req, res) => {
  try {
    const exportItem = await Export.findByIdAndDelete(req.params.id);

    if (!exportItem) {
      return handleError(res, new Error("Export item not found"), 404);
    }

    // Optionally delete the associated image file (implement this based on your file storage)

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Handle Multer errors specifically
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "File upload error: " + err.message,
    });
  }

  // Handle other errors
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = router;
