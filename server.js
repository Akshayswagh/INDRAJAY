const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const exportsRoutes = require("./routes/exportsRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const PasswordResetToken = require("./models/PasswordResetToken");
const uploadPath = path.join(__dirname, "public", "uploads", "exports");
const errorHandler = require("./middlewares/errorHandler");

connectDB();

const app = express();
// if the image upload folder does not exists then it will create that
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/exports", exportsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Set up EJS and layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static("public"));

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

// Route to render the edit form

// Update product route

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
    res.render("client/home", { title: "Indrajay Enterprises" });
  } catch (error) {
    res.status(500).send("Failed to fetch products");
  }
});

// Complete Meal
app.get("/completeMeal", async (req, res) => {
  res.render("client/completeMeal"); // pass products to EJS
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

// Add this after all your routes
// Global error handler - always at the end
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
