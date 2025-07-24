const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// --- BOOKING CRUD ---

// READ all bookings (Admin List View)
router.get("/bookings", async (req, res) => {
  const bookings = await Booking.find().sort({ bookingDate: -1 });
  res.render("admin/bookings", { bookings }); // Assumes admin/bookings.ejs
});

// -------->>>>>> NYA ROUTE 1: EK BOOKING KI DETAILS FETCH KARNE KE LIYE (FOR MODAL) <<<<<<--------
router.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking); // Booking ki details JSON me bhejo
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// -------->>>>>> NYA ROUTE 2: BOOKING KA STATUS UPDATE KARNE KE LIYE (FROM MODAL) <<<<<<--------
router.post("/bookings/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body; // Form se naya status lo
    // Check karo ki bheja gaya status valid hai ya nahi
    if (
      !["Pending", "Verified", "Ticket Sent", "Cancelled", "Refunded"].includes(
        status
      )
    ) {
      return res.status(400).send("Invalid status value.");
    }
    await Booking.findByIdAndUpdate(req.params.id, { status: status });
    res.redirect("/admin/bookings"); // Update karne ke baad list page par wapas bhej do
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).send("Server Error");
  }
});

// routes/admin.js
router.delete('/bookings/:id', async (req, res) => {
    await Booking.findByIdAndDelete(req.params.id);
    res.redirect('/admin/bookings');
});
module.exports = router;
