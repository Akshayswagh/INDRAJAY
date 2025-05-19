const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv").config();
const methodOverride = require("method-override"); // Add this
const cors = require("cors");
const session = require("express-session"); // Add this
const flash = require("connect-flash"); // Add this
const axios = require("axios");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const uploadPath = path.join(__dirname, "public", "uploads", "exports");


// middlewares
const verifyToken = require("./middlewares/authMiddleware");
const authorizeRoles = require("./middlewares/roleMiddleware");
// const errorHandler = require("./middlewares/errorHandler");


const connectDB = require("./config/db");


// Models 
const PasswordResetToken = require("./models/PasswordResetToken");
const Export = require("./models/Exports");
const careManagement = require("./models/careManagement");
const IndService = require("./models/IndService");
const Career = require("./models/careerModel");
const event = require("./models/Event");
const User = require("./models/userModel");
const ConsultService = require("./models/ConsultService");



// Routes
const exportsRoutes = require("./routes/exportsRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const careerRoutes = require("./routes/careerRoutes");
const eventRoutes = require("./routes/eventRoutes");
const careManagementRoutes = require("./routes/careManagementRoutes");
const serviceRoutes = require("./routes/indServiceRoutes");
const consultationRoutes = require("./routes/consultation");




connectDB();

const app = express();
// if the image upload folder does not exists then it will create that
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Middleware
app.use(methodOverride('_method')); // For PUT and DELETE from forms
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Session Configuration (MUST be before flash)
app.use(
  session({
    secret: "my-secret key", // Replace with a strong, random secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS in production
  })
);

// Flash Middleware (MUST be after session)
app.use(flash());

// Optional: Make flash messages available in all templates via res.locals
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg"); // Example for success messages
  res.locals.error_msg = req.flash("error_msg"); // Example for error messages
  res.locals.error = req.flash("error"); // General error (often used by Passport)
  res.locals.messages = req.flash(); // This passes all flash messages as an object
  next();
});

// Routes
app.use("/api/consultations", consultationRoutes);
app.use("/api/exports", exportsRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/care-management", careManagementRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/indservices", serviceRoutes);




// Set up EJS and layouts
app.use(expressLayouts);
app.set("layout", "./layouts/main"); // Default layout
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
// Enquiry page
app.get("/enquiry", (req, res) => {
  res.render("client/enquiry", { title: "Enquiry | Indrajay Enterprises" });
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
    const events = await event.find().sort({ created_at: -1 }).lean(); // Add .lean() for better performance

    // Verify events data before rendering
    console.log("Fetched events:", events);

    res.render("client/e", {
      // Try without .ejs extension
      title: "Events | Indrajay Enterprises",
      events: events || [], // Ensure events is always defined
      user: req.user || null, // Add if using authentication
    });
  } catch (err) {
    console.error("Events fetch error:", err);

    // More robust error response
    res.status(500).render("client/error", {
      title: "Error | Indrajay Enterprises",
      message: "Failed to load events. Please try again later.",
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

app.get("/consultation", async (req, res) => {
  try {
    const consultations = await ConsultService.find({});

    res.render("client/consultation", {
      title: "Consultation | Indrajay Enterprises",
      consultations,
    });
  } catch (err) {
    res.status(500).send("server error");
  }
});

app.get("/api/consultations/view/:id", async (req, res) => {
  try {
    const consultation = await ConsultService.findById(req.params.id);
    if (!consultation) {
      console.log("❌ Consultation not found for ID:", req.params.id);
      return res.status(404).send("Consultation not found");
    }
    res.render("client/consult-details", {
      title: "Consultation | Indrajay Enterprises",
      consultation,
    });
  } catch (error) {
    res.status(404).send("server error");
  }
});

app.get("/is", async (req, res) => {
  try {
    const services = await IndService.find();
    res.render("client/is", {
      title: "Industrial Services | Indrajay Enterprises",
      services,
    });
  } catch (err) {
    res.status(500).send("server error");
  }
});

app.get("/transportlogistic", (req, res) => {
  res.render("client/transportlogistics", {
    title: "Transport Logistics  | Indrajay Enterprises",
  });
});

// admin dashboard route
app.get(
  "/admin",
  // verifyToken,              // Your existing token verification middleware
  // authorizeRoles("admin"),  // Your existing role authorization middleware
  async (req, res) => {
    // Make it async if you need to fetch data for the dashboard
    try {
      // OPTIONAL: Fetch any data you want to display on the dashboard
      // For example, counts of users, vendors, etc.
      // const totalUsers = await User.countDocuments({ role: 'user' });
      // const totalVendors = await User.countDocuments({ role: 'vendor' });
      // const recentActivity = await ActivityLog.find().sort({ createdAt: -1 }).limit(5);

      res.render("admin/dashboard", {
        // Render the EJS view
        title: "Admin Dashboard", // Passed to your main.ejs layout and navbar.ejs
        activePage: "dashboard", // Used by sidebar.ejs to highlight the active link
        // Pass any fetched data to the template:
        // totalUsers: totalUsers,
        // totalVendors: totalVendors,
        // recentActivity: recentActivity,
        // user: req.user // If verifyToken adds user object to req, you can pass it
      });
    } catch (error) {
      console.error("Error rendering admin dashboard:", error);
      // Render an error page or send an error response
      res.status(500).send("Error loading dashboard. Please try again later.");
      // Or, you could render an error view:
      // res.render('errorPage', { title: 'Error', message: 'Could not load dashboard.'});
    }
  }
);
// In your server.js or adminController.js

// ... (other requires, like your User model) ...

// Route that renders view_users.ejs
// (This is an example, find your actual route handler around server.js line 619)
app.get("/admin/users", async (req, res) => {
  // Make it async if fetching from DB
  try {
    // Determine the sort order from the query parameter
    // Default to 'desc' (newest first) if no sort parameter is provided or if it's invalid
    const sortQuery = req.query.sort;
    let sortCriteria = { createdAt: -1 }; // Mongoose sort object: -1 for descending
    let currentSortValue = "desc"; // Value to pass to the EJS template

    if (sortQuery === "asc") {
      sortCriteria = { createdAt: 1 }; // 1 for ascending
      currentSortValue = "asc";
    }
    // If sortQuery is 'desc' or anything else (or undefined), it defaults to 'desc' due to initial values.

    const usersData = await User.find({ role: "user" })
      .sort(sortCriteria)
      .lean(); // Fetch users with sorting

    res.render("admin/view_users", {
      title: "View Users",
      activePage: "view_users", // For sidebar active state
      users: usersData,
      currentSort: currentSortValue, // <--- THIS IS THE IMPORTANT PART
      // layout: 'layouts/main' // This might be set globally
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error loading users page.");
    // Or render an error page:
    // res.render('errorPage', { title: 'Error', message: 'Could not load users.'});
  }
});

app.get("/admin/vendors", async (req, res) => {
  try {
    const sortQuery = req.query.sort;
    let sortCriteria = { createdAt: -1 };
    let currentSortValue = "desc";

    if (sortQuery === "asc") {
      sortCriteria = { createdAt: 1 };
      currentSortValue = "asc";
    }

    const vendorsData = await User.find({ role: "vendor" })
      .sort(sortCriteria)
      .lean();

    res.render("admin/view_vendors", {
      title: "Manage Vendors",
      activePage: "view_vendors",
      vendors: vendorsData,
      currentSort: currentSortValue,
    });
  } catch (error) {
    console.error("Error fetching vendors for admin panel:", error);
    res
      .status(500)
      .send("An error occurred while trying to load the vendors page.");
  }
});

// GET /admin/admins - Display list of administrators
app.get("/admin/admins", async (req, res) => {
  try {
    // 1. Determine sort order from query parameters
    const sortQuery = req.query.sort;
    let sortCriteria = { createdAt: -1 }; // Default: newest first
    let currentSortValue = "desc";

    if (sortQuery === "asc") {
      sortCriteria = { createdAt: 1 }; // oldest first
      currentSortValue = "asc";
    }

    // 2. Fetch users with the role 'admin' from the database
    const adminsData = await User.find({ role: "admin" })
      .sort(sortCriteria)
      .lean();
      console.log(adminsData);

    // 3. Render the EJS template with the necessary data
    res.render("admin/view_admins", {
      title: "Manage Administrators",
      activePage: "view_admins", // For sidebar active state
      admins: adminsData,
      currentSort: currentSortValue,

      // currentUser: req.user, // Pass the logged-in admin's details for conditional rendering in EJS
      // Assuming verifyToken or authorizeRoles adds 'user' to 'req'

    });
  } catch (error) {
    console.error("Error fetching administrators for admin panel:", error);
    res.status(500).render("admin/error_page", {
      title: "Error",
      message:
        "Could not load the administrators page. Please try again later.",
      activePage: "error",
    });
  }
});

// GET /admin/exports/add - Display form to add a new export item
app.get("/admin/exports/add", (req, res) => {
  try {
    // CAREFULLY RE-TYPE THIS LINE. Ensure no leading/trailing spaces or weird characters.
    // Assuming your file is named 'add_export_form.ejs' in 'views/admin/'
    res.render("admin/add_exports", {
      title: "Add New Export Item",
      activePage: "add_export",
    });
  } catch (error) {
    console.error("ERROR RENDERING ADD EXPORT FORM:", error); // Log the full error object
    res
      .status(500)
      .send(
        `<h1>Error Loading Page</h1><p>Server error while trying to display the 'Add Export Item' page. Check server logs for details.</p><pre>${error.stack}</pre>`
      );
  }
});

// === ADMIN PAGE RENDERING ROUTES (mounted under /admin or similar) ===

// GET /admin/exports/allExports - Render the list page
// (Assuming this route is mounted as /admin/exports/allExports in server.js)
app.get('/admin/exports', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Items per page
        const skip = (page - 1) * limit;

        const exportItems = await Export.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalItems = await Export.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        res.render('admin/view_exports', {
            title: 'Manage Export Items',
            activePage: 'view_exports',
            exports: exportItems,
            // currentUser: req.user,
            currentPage: page,
            totalPages: totalPages,
            messages: req.flash() // Pass flash messages
        });
    } catch (error) {
        console.error("Error fetching export items list:", error);
        req.flash('error_msg', 'Could not load export items.');
        res.redirect('/admin/dashboard'); // Or an error page
    }
});


// Add this after all your routes
// Global error handler - always at the end
// app.use(errorHandler);

// 404 page
app.get("*", (req, res) => {
  res.render("client/404.ejs", {
    title: "404 - Page Not Found | Indrajay Enterprises",
    message: req.query.msg,
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
