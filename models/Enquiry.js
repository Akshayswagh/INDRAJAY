// models/Enquiry.js
const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    yourName: { type: String, required: [true, "Your name is required."], trim: true }, // CHANGED from firstName/familyName
    country: { type: String, required: [true, "Country is required."], trim: true },
    companyName: { type: String, required: [true, "Company name is required."], trim: true },
    companyWebsite: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^(https|http):\/\/[^\s$.?#].[^\s]*$/, 'Please enter a valid website URL (e.g., https://example.com)']
    },
    companyAddress: { type: String, required: [true, "Company address is required."], trim: true },
    phoneCall: { type: String, required: [true, "Phone number is required."], trim: true },
    email: {
        type: String,
        required: [true, "Email is required."],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address.']
    },
    productNeeded: { type: String, required: [true, "Product needed is required."], trim: true },
    amountOfOrderKg: { type: String, required: [true, "Amount of order is required."] },
    preferredDate: { type: Date, required: [true, "Preferred date is required."] },
    message: { type: String, trim: true },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'In Progress', 'Resolved', 'Closed'],
        default: 'New'
    },
    adminNotes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);