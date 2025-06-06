// models/JobApplication.js
const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    jobId: { // ID of the Career/Job posting applied for
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Career', // Referencing your careerModel
        required: [true, "Job ID is required."]
    },
    jobRoleAppliedFor: { // Store the role name for easy display
        type: String,
        required: true
    },
    applicantName: { type: String, required: true, trim: true },
    applicantEmail: { type: String, required: true, trim: true, lowercase: true },
    applicantPhone: { type: String, required: true, trim: true },
    // Add other fields from your form like gender, startDate, address, coverLetter
    // Ensure these match the `name` attributes in your EJS form
    gender: { type: String },
    startDate: { type: String },
    address: { type: String },
    coverLetter: { type: String, trim: true },

    resumePath: { // Cloudinary URL (req.file.path from CloudinaryStorage)
        type: String,
        required: [true, "Resume file path is required."]
    },
    resumePublicId: { // Cloudinary public_id (req.file.filename from CloudinaryStorage)
        type: String,
        required: [true, "Resume public ID is required for management."]
    },
    status: {
        type: String,
        enum: ['Submitted', 'Viewed', 'In Review', 'Interviewing', 'Offered', 'Hired', 'Rejected', 'Withdrawn'],
        default: 'Submitted'
    }
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);