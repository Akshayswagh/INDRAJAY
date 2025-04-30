const express = require("express");
// const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");
const axios = require("axios");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const PasswordResetToken = require("./models/PasswordResetToken");
const Product = require("./models/Product");

const path = require("path");

connectDB();

const app = express();

// Middleware
app.use(express.json());

app.use(cors());
app.use(express.static("public")); // Optional for styling
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

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

app.post("/submit-form", async (req, res) => {
  const token = req.body["g-recaptcha-response"];

  if (!token) {
    return res.status(400).send("Please complete the reCAPTCHA");
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.SECRET_KEY,
          response: token,
        },
      }
    );

    const data = response.data;

    if (data.success) {
      return res.send("✅ CAPTCHA verified, form submitted successfully!");
    } else {
      return res.status(400).send("❌ CAPTCHA verification failed");
    }
  } catch (err) {
    console.error("Error verifying reCAPTCHA:", err);
    return res.status(500).send("Server error during CAPTCHA verification");
  }
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

// auth routes
// register user
app.get("/register-user", async (req, res) => {
  res.render("client/register-user", {
    title: "User Register | Indrajay Enterprises",
  });
});

// log in user
app.get("/login-user", async (req, res) => {
  res.render("client/login-user", {
    title: "User Login | Indrajay Enterprises",
  });
});

// register vendor
app.get("/register-vendor", async (req, res) => {
  res.render("client/register-vendor", {
    title: "Vendor Register | Indrajay Enterprises",
  });
});

// log in vendor
app.get("/login-vendor", async (req, res) => {
  res.render("client/login-vendor", {
    title: "Vendor Login | Indrajay Enterprises",
  });
});

// Admin auth Routes
// register admin
app.get("/register-admin", async (req, res) => {
  res.render("admin/register-admin", {
    title: "Admin Register | Indrajay Enterprises",
  });
});

// log in admin
app.get("/login-admin", async (req, res) => {
  res.render("admin/login-admin", {
    title: "Admin Login | Indrajay Enterprises",
  });
});

// password forgot
app.get("/forgot-password", async (req, res) => {
  res.render("client/forgot-password", {
    title: "Password forgot| Indrajay Enterprises",
  });
});

// Serve reset password page
app.get("/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Check if token exists and is valid
    const tokenDoc = await PasswordResetToken.findOne({ token }).populate(
      "userId"
    );

    if (!tokenDoc) {
      return res.render("client/reset-password", {
        title: "Reset Password | Indrajay Enterprises",
        valid: false,
      });
    }

    // Check if token has expired
    const valid = new Date(tokenDoc.expiresAt) > new Date();

    if (!valid) {
      // Optionally delete expired tokens
      await PasswordResetToken.deleteOne({ _id: tokenDoc._id });
    }

    res.render("client/reset-password", {
      title: "Reset Password | Indrajay Enterprises",
      valid,
      token: valid ? token : null,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.render("client/reset-password", {
      title: "Reset Password | Indrajay Enterprises",
      valid: false,
    });
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

// career page
app.get("/career", (req, res) => {
  res.render("client/career.ejs", { title: "Career | Indrajay Enterprises" });
});

// 404 page
app.get("*", (req, res) => {
  res.render("client/404.ejs", {
    title: "404 - Page Not Found | Indrajay Enterprises",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
