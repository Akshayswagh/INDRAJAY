const express = require("express");
const dotenv = require("dotenv");
// const expressLayouts = require('express-ejs-layouts');
const connectDB = require("./config/db");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const Product = require("./models/Product");
const path = require("path");
const { title } = require("process");

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Optional for styling
app.use(express.urlencoded({ extended: true }));
app.use("/api", productRoutes);

// Set up EJS and layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app.use(expressLayouts);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.message); // Logs only the error message
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Routes

// add products
app.get("/add-product", (req, res) => {
  res.render("admin/addProduct");
});

// all products
app.get("/all-products", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch products from MongoDB
    res.render("admin/allProducts", { products }); // pass products to EJS
  } catch (error) {
    res.status(500).send("Failed to fetch products");
  }
});

// Route to render the edit form
app.get("/edit-product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("admin/editProduct", { product }); // Render editProduct.ejs with product data
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server Error");
  }
});

// Update product route
app.post("/update-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, originalPrice, discount, finalPrice } = req.body;

    await Product.findByIdAndUpdate(id, {
      name,
      category,
      originalPrice,
      discount,
      finalPrice,
    });

    res.redirect("/all-products"); // Redirect after update
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Home Page Rendering
app.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch products from MongoDB
    res.render("client/home", { title: "Indrajay Enterprises", products });
  } catch (error) {
    res.status(500).send("Failed to fetch products");
  }
});

// Complete Meal
app.get("/completeMeal", async (req, res) => {
  res.render("client/completeMeal"); // pass products to EJS
});

// all products
app.get("/product", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch products from MongoDB
    res.render("client/products", { products }); // pass products to EJS
  } catch (error) {
    res.status(500).send("Failed to fetch products");
  }
});

// About page
app.get("/about", (req, res) => {
  res.render("client/about.ejs", { title: "About | Indrajay Enterprises" });
});

// contact page
app.get("/contact", (req, res) => {
  res.render("client/contact.ejs", { title: "Contact | Indrajay Enterprises" });
});

// 404 page
app.get("*", (req, res) => {
  res.render("client/404.ejs");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
