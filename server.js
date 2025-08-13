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

// const errorHandler = require("./middlewares/errorHandler");

const connectDB = require("./config/db");

// Models
const Export = require("./models/Export");
const careManagement = require("./models/careManagement");
const IndService = require("./models/IndService");
const Career = require("./models/careerModel");
const event = require("./models/Event");
const User = require("./models/User");
const ConsultService = require("./models/ConsultService");
const Booking = require("./models/Booking");
const Popup = require("./models/Popup"); 
const Vendor = require("./models/VendorModel"); 


// --- Routers ---
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const {
  ensureAuthenticated,
  ensureAdminRole,
} = require("./middlewares/adminAuthMiddleware");

const adminLogisticPageRoutes = require("./routes/adminlogitsicPageRoutes");
const adminLogisticApiRoutes = require("./routes/adminLogisticApiRoutes");
const clientLogisticApiRoutes = require("./routes/clientLogisticApiRoutes");

const publicEnquiryRoutes = require("./routes/publicEnquiryRoutes");
const adminTrustedBuyerPageRoutes = require("./routes/adminTrustedBuyerPageRoutes");
const adminTrustedBuyerApiRoutes = require("./routes/adminTrustedBuyerApiRoutes");

const adminEnquiryPageRoutes = require("./routes/adminEnquiryPageRoutes");
const adminEnquiryApiRoutes = require("./routes/adminEnquiryApiRoutes");
const adminCareManagementPageRoutes = require("./routes/adminCareManagementPageRoutes");
const adminCareManagementApiRoutes = require("./routes/adminCareManagementApiRoutes");
const publicCareApiRoutes = require("./routes/publicCareManagementRoutes"); // If you have a public JSON API

const adminCareerPageRoutes = require("./routes/adminCareerPageRoutes");
const adminCareerApiRoutes = require("./routes/adminCareerApiRoutes");
const publicCareerApiRoutes = require("./routes/publicCareerApiRoutes"); // If you're using it

const adminConsultationPageRoutes = require("./routes/adminConsultationPageRoutes");
const adminConsultationApiRoutes = require("./routes/adminConsultationApiRoutes");
const clientServiceRoutes = require("./routes/clientIndServiceRoutes");
const adminServicePageRoutes = require("./routes/adminIndServicePageRoutes");
const adminServiceApiRoutes = require("./routes/adminIndServiceApiRoutes");
const adminExportPageRoutes = require("./routes/adminExportPageRoutes");
const adminExportApiRoutes = require("./routes/adminExportApiRoutes");
const clientExportRoutes = require("./routes/clientExportRoutes");
const adminUserPageRoutes = require("./routes/adminUserPageRoutes");
const adminEventPageRoutes = require("./routes/adminEventPageRoutes");
const adminEventApiRoutes = require("./routes/adminEventApiRoutes");
const publicEventApiRoutes = require("./routes/publicEventApiRoutes"); // Your existing API router for events

const publicJobApplicationRoutes = require("./routes/publicJobApplicationRoutes");
const adminJobApplicationPageRoutes = require("./routes/adminJobApplicationPageRoutes");
const adminJobApplicationApiRoutes = require("./routes/adminJobApplicationApiRoutes");

const vendorRoutes = require("./routes/vendorRegister");

const adminBookingRoutes = require("./routes/adminBooking");
const popupRoutes = require('./routes/popupRoutes');
// const accessVendor = require("./routes/accessVendors");

connectDB();

const app = express();
// if the image upload folder does not exists then it will create that
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Middleware
app.use(methodOverride("_method")); // For PUT and DELETE from forms
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Set up EJS and layouts
app.use("/admin", expressLayouts);
// app.use(expressLayouts);
app.set("layout", "./layouts/main"); // Default layout
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static("public"));

// Session Configuration (MUST be before flash)
// Express Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "a_very_strong_and_long_secret_key", // CHANGE THIS and use .env
    resave: false,
    saveUninitialized: false, // true if you want to store session for all visitors
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in production (requires HTTPS)
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24, // e.g., 1 day
    },
  })
);

// Flash Middleware (MUST be after session)
app.use(flash());

// Global variables for templates (IMPORTANT for EJS pages)
app.use((req, res, next) => {
  // Create a single 'messages' object for flash messages
  res.locals.messages = {
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
    error: req.flash("error"),
    info_msg: req.flash("info_msg"),
  };
  // Other global variables remain the same
  res.locals.currentUser = req.session.user || null;
  res.locals.isAdmin = !!(
    req.session.user && req.session.user.role === "admin"
  );
  next();
});

// Routes mapping
app.use("/industrialservices", clientServiceRoutes); // e.g., yoursite.com/services and yoursite.com/services/123

app.use("/admin/auth", adminAuthRoutes);
app.use(
  "/admin/industrialservices",
  ensureAuthenticated,
  ensureAdminRole,
  adminServicePageRoutes
);
app.use(
  "/admin/api/indservices",
  ensureAuthenticated,
  ensureAdminRole,
  adminServiceApiRoutes
);
app.use(
  "/admin/exports",
  ensureAuthenticated,
  ensureAdminRole,
  adminExportPageRoutes
); // Mount Admin Page Routes for Exports
app.use(
  "/admin/api/exports",
  ensureAuthenticated,
  ensureAdminRole,
  adminExportApiRoutes
); // Mount Admin API Routes for Exports
app.use("/exports", clientExportRoutes); // Mount Client-Facing Routes for Exports (example)
app.use("/admin", ensureAuthenticated, ensureAdminRole, adminUserPageRoutes);
app.use(
  "/admin/events",
  ensureAuthenticated,
  ensureAdminRole,
  adminEventPageRoutes
);
app.use(
  "/admin/api/events",
  ensureAuthenticated,
  ensureAdminRole,
  adminEventApiRoutes
);
// Mount Public API Routes for Events (if you have them)
// This assumes your original router was purely for JSON API
app.use("/api/events", publicEventApiRoutes); // Example mount point for public API

app.use(
  "/admin/consultations",
  ensureAuthenticated,
  ensureAdminRole,
  adminConsultationPageRoutes
);
app.use(
  "/admin/api/consultations",
  ensureAuthenticated,
  ensureAdminRole,
  adminConsultationApiRoutes
);
// Mount Admin Page Routes for Careers
app.use(
  "/admin/careers",
  ensureAuthenticated,
  ensureAdminRole,
  adminCareerPageRoutes
);
// Mount Admin API Routes for Careers
app.use(
  "/admin/api/careers",
  ensureAuthenticated,
  ensureAdminRole,
  adminCareerApiRoutes
);
// Mount Public API Routes for Careers (optional, if your main site uses this)
app.use("/api/careers", publicCareerApiRoutes);
// Mount Admin Page Routes for Care & Management
app.use(
  "/admin/care-management",
  ensureAuthenticated,
  ensureAdminRole,
  adminCareManagementPageRoutes
);

// Mount Admin API Routes for Care & Management
app.use(
  "/admin/api/care-management",
  ensureAuthenticated,
  ensureAdminRole,
  adminCareManagementApiRoutes
);
// Choose a suitable path for your public API, e.g., /api/public/care-entries
app.use("/api/public/care-entries", publicCareApiRoutes);

// Mount Admin Page Routes for Enquiries
app.use(
  "/admin/enquiries",
  ensureAuthenticated,
  ensureAdminRole,
  adminEnquiryPageRoutes
);

// Mount Admin API Routes for Enquiries
app.use(
  "/admin/api/enquiries",
  ensureAuthenticated,
  ensureAdminRole,
  adminEnquiryApiRoutes
);
app.use(
  "/public/enquiry",

  publicEnquiryRoutes
);
// Mount Admin Page Routes for Trusted Buyers
app.use("/admin/trusted-buyers", adminTrustedBuyerPageRoutes);
app.use("/admin/api/trusted-buyers", adminTrustedBuyerApiRoutes);

// Public route for submitting job applications
app.use("/careers", publicJobApplicationRoutes);

// Admin routes for managing job applications
app.use("/admin/job-applications", adminJobApplicationPageRoutes);
app.use("/admin/api/job-applications", adminJobApplicationApiRoutes);

// Use a prefix for all admin routes for better organization
app.use("/admin/logistics", adminLogisticPageRoutes);
app.use("/admin/api/logistics", adminLogisticApiRoutes);
app.use("/logistics", clientLogisticApiRoutes);

app.use("/admin/api", adminBookingRoutes);

app.use("/api/vendor", vendorRoutes);

app.use('/admin/popups', popupRoutes)

// Admin creation route

// use postman tool to use these

app.post("/create-admin", async (req, res) => {
  try {
    const { email, name, contactNumber, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create the user with admin role
    const adminUser = await User.create({
      email,
      name,
      contactNumber,
      password,
      role: "admin", // Force the role to admin
    });

    res
      .status(201)
      .json({ message: "Admin user created", userId: adminUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// register vendor
app.get("/register-vendor", async (req, res) => {
  res.render("client/register-vendor", {
    title: "Vendor Register | Indrajay Enterprises",
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

// Home Page Rendering
app.get("/", async (req, res) => {
  try {
    const Exports = await Export.find(); // fetch all Exports
    const popup = await Popup.findOne({ is_active: true })
      .sort({ created_at: -1 })
      .lean();
    res.render("client/home", {
      title: "Indrajay Enterprises",
      Exports,
      popup,
    });

    // console.log(Exports);
  } catch (error) {
    console.error("Error fetching Exports:", error.message);
    // Pass empty array if fetching fails
    res.render("client/home", {
      title: "Indrajay Enterprises",
      Exports: [],
      popup: null, // ✅ Add popup null to avoid undefined
    });
  }
});

app.get("/logistic", async (req, res) => {
  res.render("client/logistic", { title: "Indrajay Enterprises" });
});

// Fruits
app.get("/fruits", async (req, res) => {
  try {
    const fruits = await Export.find({ category: "Fruits and Vegetables" });
    res.render("client/fruits", {
      title: "Fruits & Vegetables | Indrajay Enterprises",
      fruits, // passing fruits to ejs template
    });
  } catch (err) {
    // console.log("error fetching fruits:", err);
    res.status(500).send("Internal server Error");
  }
});

// Grains & cereals
app.get("/grainsandcereals", async (req, res) => {
  try {
    const grainsandcereals = await Export.find({
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
    const oilseeds = await Export.find({ category: "Oil Seeds" });
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
    const pulses = await Export.find({ category: "Pulses" });
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
    const spises = await Export.find({ category: "Spises" });
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
    const jaggery = await Export.find({ category: "Jaggery" });

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
    const coconut = await Export.find({ category: "Coconut" });
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
    const nutsdryfruits = await Export.find({ category: "Nuts & Dry Fruits" });

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
    const chemicals = await Export.find({ category: "Chemicals" });

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
    const woodenpalets = await Export.find({ category: "Wooden Pallets" });

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
    const packagingmaterials = await Export.find({
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
    const appearalsgarments = await Export.find({
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
    // console.log("Fetched events:", events);

    res.render("client/e", {
      // Try without .ejs extension
      title: "Events | Indrajay Enterprises",
      events: events || [], // Ensure events is always defined
    });
  } catch (err) {
    console.error("Events fetch error:", err);

    // More robust error response
    res.status(500).render("client/404", {
      title: "Error | Indrajay Enterprises",
      message: "Failed to load events. Please try again later.",
    });
  }
});

// API Endpoint to create a new booking (CREATE)
app.post("/api/bookings", async (req, res) => {
  try {
    // The data comes from the `fetch` call in your frontend script
    const bookingData = req.body;

    console.log("Received booking data:", bookingData);

    // Create a new booking document using the Mongoose model
    const newBooking = new Booking({
      event: bookingData.event,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      address: bookingData.address,
      tickets: bookingData.tickets,
      totalAmount: bookingData.totalAmount,
      utr: bookingData.utr,
      // isVerified is false by default
    });

    // Save the new booking to the database
    await newBooking.save();

    // Send a success response back to the frontend
    res
      .status(201)
      .json({ message: "Booking received and is awaiting verification." });
  } catch (err) {
    console.error("Error saving booking:", err);
    // Handle potential duplicate UTR error
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "This Transaction ID (UTR) has already been used." });
    }
    res.status(500).json({ message: "An error occurred on the server." });
  }
});

// --- BOOKINGS MANAGEMENT ---

// READ all bookings with pagination
app.get("/admin/bookings", async (req, res) => {
  try {
    // Pagination ke liye settings
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Ek page par 10 bookings dikhayenge
    const skip = (page - 1) * limit;

    // 1. Database se saari bookings fetch karo (naye se purane order me)
    const bookings = await Booking.find()
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limit);

    // Pagination ke liye total bookings count karo
    const totalBookings = await Booking.countDocuments();
    const totalPages = Math.ceil(totalBookings / limit);

    // 2. 'admin/bookings_list.ejs' page ko render karo
    //    aur usme 'bookings' ka data aur pagination ki info bhej do.
    res.render("admin/eventBookings", {
      title: "Manage Bookings",
      bookings: bookings, // Yeh data page par jayega
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      activePage: "event_bookings",
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).send("Server Error: Could not fetch bookings.");
  }
});

//
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
      // console.log("❌ Consultation not found for ID:", req.params.id);
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

// admin dashboard route
app.get("/admin", ensureAuthenticated, ensureAdminRole, async (req, res) => {
  try {
    // --- CHANGE IS HERE ---
    // Fetch the total count of documents in the 'vendors' collection
    const vendorCount = await Vendor.countDocuments();
    // You could also fetch other data here, for example:
    // const trustedVendorCount = await Vendor.countDocuments({ isTrusted: true });

    res.render("admin/dashboard", {
      // Render the EJS view
      title: "Admin Dashboard",
      activePage: "dashboard",
      
      // --- PASS THE COUNT TO THE EJS FILE ---
      vendorCount: vendorCount, // Pass the fetched count
      // trustedVendorCount: trustedVendorCount, // You can pass other data too

      // user: req.user 
    });
  } catch (error) {
    console.error("Error rendering admin dashboard:", error);
    res.status(500).send("Error loading dashboard. Please try again later.");
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
