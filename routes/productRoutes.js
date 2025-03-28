const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const Product = require("../models/Product");

const router = express.Router();
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });

// all request goes through ======localhots:8080/api/
router.post("/add-product", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Convert buffer to a readable stream for Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      async (error, uploadResult) => {
        if (error) {
          return res.status(500).json({ error: "Upload failed" });
        }

        // Save product details with image URL
        const newProduct = new Product({
          name: req.body.name,
          category: req.body.category,
          originalPrice: req.body.originalPrice,
          discount: req.body.discount,
          finalPrice:
            req.body.originalPrice -
            (req.body.originalPrice * req.body.discount) / 100,
          imageUrl: uploadResult.secure_url, // Store Cloudinary image URL
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added", product: newProduct });
      }
    );

    stream.end(req.file.buffer); // Pass the image buffer to Cloudinary
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Route to render the edit form
router.get("/edit-product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("editProduct", { product }); // Render EJS form with product data
  } catch (error) {
    res.status(500).send("Server Error");
  }
});



// Update Product Route
router.post("/update-product/:id", async (req, res) => {
  try {
    const { name, category, originalPrice, discount } = req.body;
    const finalPrice = Math.round(originalPrice - (originalPrice * discount) / 100);

    await Product.findByIdAndUpdate(req.params.id, {
      name,
      category,
      originalPrice,
      discount,
      finalPrice,
    });

    res.redirect("/products"); // Redirect back to product list
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Server Error");
  }
});


// DELETE Product by ID
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
