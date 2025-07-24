const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  event: { type: String, required: true }, // We'll store the event name
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  tickets: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  utr: { type: String, required: true, unique: true }, // UTR should be unique
  bookingDate: { type: Date, default: Date.now },
 status: {
        type: String,
        required: true,
        enum: ['Pending', 'Verified', 'Ticket Sent', 'Cancelled', 'Refunded'], 
        default: 'Pending' 
    }});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
