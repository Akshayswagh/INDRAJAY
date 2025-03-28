const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const Product = require("./models/Product");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Optional for styling
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use("/api", productRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// Routes

// add products
app.get("/add-product", (req, res) => {
  res.render("addProduct");
});

// all products
app.get("/all-products", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch products from MongoDB
    res.render("allProducts", { products }); // pass products to EJS
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
    res.render("editProduct", { product }); // Render editProduct.ejs with product data
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server Error");
  }
});

//
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
