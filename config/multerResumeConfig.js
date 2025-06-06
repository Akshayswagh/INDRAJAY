// config/multerResumeConfig.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

if (!cloudinary.config().cloud_name) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

const resumeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const originalName = path.parse(file.originalname).name; // Filename without extension
        const sanitizedOriginalName = originalName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, ''); // Further sanitize
        const extension = path.extname(file.originalname).toLowerCase(); // e.g., .pdf

        // Construct just the filename part (Cloudinary will prepend the folder)
        const uniqueFileName = `${sanitizedOriginalName}-${Date.now()}${extension}`;


        return {
            folder: 'resumes', // Specify the FULL target folder path here
            public_id: uniqueFileName,              // Provide ONLY the desired filename (Cloudinary adds extension if not present here)
                                                    // but since we add it, it's fine.
            resource_type: 'raw',
            allowed_formats: ['pdf', 'doc', 'docx', 'txt'], // This can also just be the extension without the dot
            // format: extension.substring(1) // Optional: explicitly set format without dot
        };
    },
});

// ... (resumeFileFilter and resumeUploader remain the same) ...
const resumeFileFilter = (req, file, cb) => {
    // Define allowed mime types and extensions for resumes
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'text/plain' // .txt
    ];
    const allowedExtensions = /\.(pdf|doc|docx|txt)$/i;
    const errorMessage = 'Only PDF, DOC, DOCX, and TXT files are allowed for resumes!';

    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        const err = new Error(errorMessage);
        err.code = 'INVALID_FILE_TYPE';
        cb(err, false);
    }
};

const resumeUploader = multer({
    storage: resumeStorage,
    fileFilter: resumeFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = resumeUploader;