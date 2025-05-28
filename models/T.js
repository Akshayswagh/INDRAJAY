// models/TrustedBuyer.js
const mongoose = require('mongoose');

const trustedBuyerSchema = new mongoose.Schema({
    customerName: { type: String, required: [true, "Customer name is required."], trim: true },
    companyName: { type: String, required: [true, "Company name is required."], trim: true },
    email: {
        type: String, required: [true, "Email is required."], trim: true, lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address.']
    },
    contactNumber: { type: String, required: [true, "Contact number is required."], trim: true },
    address: {
        fullAddress: { type: String, required: [true, "Address is required."], trim: true }
    },
    gstnNumber: {
        type: String, trim: true, uppercase: true,
        match: [/^[0-9A-Z]{15}$/, 'Please enter a valid 15-character GSTN number.']
    },
    panNumber: {
        type: String, trim: true, uppercase: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid 10-character PAN number.']
    },
    bankDetailsPdf: {
        url: String,
        public_id: String,
        filename: String
    },
    adminNotes: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('TrustedBuyer', trustedBuyerSchema);