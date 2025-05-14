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
// const errorHandler = require("./middlewares/errorHandler");
const Product = require("./models/Exports");
const careerRoutes = require("./routes/careerRoutes");
const eventRoutes = require("./routes/eventRoutes");
const careManagementRoutes = require("./routes/careManagementRoutes");
careManagement = require("./models/careManagement");
const Career = require("./models/careerModel");
const event = require("./models/Event");
const verifyToken = require("./middlewares/authMiddleware");
const authorizeRoles = require("./middlewares/roleMiddleware");

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
app.use("/admin", express.static(path.join(__dirname, "admin-panel")));

// Routes
app.use("/api/exports", exportsRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/care-management", careManagementRoutes);
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

    // `Check `if token exists and is valid
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

// Fruits
app.get("/fruits", async (req, res) => {
  try {
    const fruits = await Product.find({ category: "Fruits and Vegetables" });
    res.render("client/fruits", {
      title: "Fruits & Vegetables | Indrajay Enterprises",
      fruits, // passing fruits to ejs template
    });
  } catch (err) {
    console.log("error fetching fruits:", err);
    res.status(500).send("Internal server Error");
  }
});

// Grains & cereals
app.get("/grainsandcereals", async (req, res) => {
  try {
    const grainsandcereals = await Product.find({
      category: "Grains & Cereals",
    });

    res.render("client/Grains&Sereals", {
      title: "Grains & Cereals | Indrajay Enterprises",
      grainsandcereals, // Passing products to the template
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Oil seeds
app.get("/oilseeds", async (req, res) => {
  try {
    const oilseeds = await Product.find({ category: "Oil Seeds" });
    res.render("client/oilseeds", {
      title: "Oil Seeds | Indrajay Enterprises",
      oilseeds,
    });
  } catch (err) {
    console.error("error fetching oilseeds:", err);
    res.status(500).send("Internal server Error");
  }
});

// Pulses
app.get("/pulses", async (req, res) => {
  try {
    const pulses = await Product.find({ category: "Pulses" });
    res.render("client/pulses", {
      title: "Pulses | Indrajay Enterprises",
      pulses,
    });
  } catch (err) {
    console.error("Error fetching pulses:", err);
    res.status(500).send("Internal server error");
  }
});

// Spises
app.get("/spises", async (req, res) => {
  try {
    const spises = await Product.find({ category: "Spises" });
    res.render("client/spises", {
      title: "Spises | Indrajay Enterprises",
      spises,
    });
  } catch (err) {
    console.error("Error fetching spices :", err);
    res.status(500).send("Ineternal Server Error");
  }
});

// Jaggery
app.get("/jaggery", async (req, res) => {
  try {
    const jaggery = await Product.find({ category: "Jaggery" });

    res.render("client/jaggery", {
      title: "Jaggery | Indrajay Enterprises",
      jaggery,
    });
  } catch (err) {
    console.error("Error fetching Jaggery :", err);
    res.status(500).send("Internal Server Error");
  }
});

// Coconut
app.get("/coconut", async (req, res) => {
  try {
    const coconut = await Product.find({ category: "Coconut" });
    res.render("client/coconut", {
      title: "Coconut | Indrajay Enterprises",
      coconut,
    });
  } catch (err) {
    console.error("Error fetching Coconut :", err);
    res.status(500).send("Internal Server Error");
  }
});

// Nuts & Dry Fruits
app.get("/nutsdryfruits", async (req, res) => {
  try {
    const nutsdryfruits = await Product.find({ category: "Nuts & Dry Fruits" });

    res.render("client/nutsdryfruits", {
      title: "Nuts & Dry Fruits | Indrajay Enterprises",
      nutsdryfruits,
    });
  } catch (err) {
    console.error("Error fetching Nuts & dryFruits :", err);
    res.status(500).send("Internal Server Error");
  }
});

// Chemicals
app.get("/chemicals", async (req, res) => {
  try {
    const chemicals = await Product.find({ category: "Chemicals" });

    res.render("client/chemicals", {
      title: "Chemicals | Indrajay Enterprises",
      chemicals,
    });
  } catch (err) {
    console.error("Error fetching Chemicals :", err);
    res.status(500).send("Internal Server Error");
  }
});

// Wooden Pallets
app.get("/woodenpalets", async (req, res) => {
  try {
    const woodenpalets = await Product.find({ category: "Wooden Pallets" });

    res.render("client/woodenpalets", {
      title: "Wooden Pallets | Indrajay Enterprises",
      woodenpalets,
    });
  } catch (err) {
    console.error("Error fetching woodenpalets :", err);
    res.status(500).send("Internal Server Error");
  }
});

//  Packing Materials
app.get("/packagingmaterials", async (req, res) => {
  try {
    const packagingmaterials = await Product.find({
      category: "Packing Materials",
    });
    res.render("client/packagingmaterials", {
      title: "Packing Materials | Indrajay Enterprises",
      packagingmaterials,
    });
  } catch (err) {
    console.error("Error fetching packaging matetials :", err);
    res.status(500).send("Internal Server Error");
  }
});

// Appearals & Garments
app.get("/appearalsgarments", async (req, res) => {
  try {
    const appearalsgarments = await Product.find({
      category: "Appearals & Garments",
    });

    res.render("client/appearalsgarments", {
      title: "Appearals & Garments | Indrajay Enterprises",
      appearalsgarments,
    });
  } catch (err) {
    console.error("Error fetching appearals garments :", err);
    res.status(500).send("Internal Server Error");
  }
});

// View Single Export
app.get("/exports/view/:id", async (req, res) => {
  try {
    const exportItem = await Product.findById(req.params.id);
    if (!exportItem) {
      return res.status(404).redirect(`client/404?msg=Export+item+not+found`);
    }
    res.render("client/exportDetails", {
      title: `${exportItem.category} | Indrajay Enterprises`,
      exportItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("404", { message: "Internal Server Error" });
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
app.get("/career", async (req, res) => {
  try {
    const careers = await Career.find().sort({ created_at: -1 });
    res.render("client/career.ejs", {
      title: "Career | Indrajay Enterprises",
      careers,
    });
  } catch (err) {
    console.error("Career fetch error:", err.message);
    res.render("client/career.ejs", {
      title: "Career | Indrajay Enterprises",
      careers: null, // Or [] if you prefer an empty array
    });
  }
});

// ................................................start..Career tab routes on admin side..................
// GET /careers – Render all job listings
app.get("/careers", async (req, res) => {
  try {
    const careers = await Career.find().sort({ created_at: -1 });
    res.render("careers/index", { careers });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// GET /careers/create – Render create form
app.get("/careers/create", (req, res) => {
  res.render("#");
});

// GET /careers/:id – Render single job detail
app.get("/careers/:id", async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).send("Job not found");
    res.render("#", { career });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await event.find().sort({ created_at: -1 });

    res.render("client/events", {
      title: "Events | Indrajay Enterprises",
      events,
    });
  } catch (err) {
    console.error("events fetch error:", err.message);
    res.render("client/events", {
      title: "events | Indrajay Enterprises",
      careers: null, // Or [] if you prefer an empty array
    });
  }
});

app.get("/careManagement", async (req, res) => {
  try {
    const care = await careManagement.find().sort({ created_at: -1 });
    res.render("client/careManagement", {
      title: "Care Management | Indrajay Enterprises",
      care,
    });
    // console.log(care)
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.get("/caremanegement/view/:id", async (req, res) => {
  try {
    const care = await careManagement.findById(req.params.id);
    if (!care) {
      return res
        .status(404)
        .redirect(`client/404?msg=careManagement+item+not+found`);
    }
    res.render("client/DetailscareManagement", {
      title: "Details Care Management | Indrajay Enterprises",
      care,
    });
    // console.log(care);
  } catch (err) {
    res.status(500).send("Server error");
    console.log(err);
  }
});

// ......................................End.....Career tab routes on admin side.................................

app.get("/canteen", (req, res) => {
  res.render("client/canteen", {
    title: "Canteen | Indrajay Enterprises",
  });
});
app.get("/consultation", (req, res) => {
  res.render("client/consultation", {
    title: "Consultation | Indrajay Enterprises",
  });
});

app.get("/is", (req, res) => {
  res.render("client/is", {
    title: "Industrial Services | Indrajay Enterprises",
  });
});

app.get("/transportlogistic", (req, res) => {
  res.render("client/transportlogistics", {
    title: "Transport Logistics  | Indrajay Enterprises",
  });
});

// 404 page
app.get("*", (req, res) => {
  res.render("client/404.ejs", {
    title: "404 - Page Not Found | Indrajay Enterprises",
    message: req.query.msg,
  });
});

// admin dashbord route
app.get(
  "/admin",
  verifyToken,
  authorizeRoles("admin"),

  (req, res) => {
    res.sendFile(path.join(__dirname, "admin-panel", "index.html"));
  }
);

// Add this after all your routes
// Global error handler - always at the end
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
