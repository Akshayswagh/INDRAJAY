const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // For generating truly unique names
const fs = require("fs");

const getMulterUploader = (folderName) => {
  const uploadPath = path.join("public", "uploads", folderName);

  // Create folder if it doesn't exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Configure Multer for image uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${folderName}-${uuidv4()}${ext}`;
      cb(null, uniqueName); // <-- This is required
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit (optional)
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedTypes.test(file.mimetype);

      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error("Only images (jpeg, jpg, png, gif, webp) are allowed!"));
      }
    },
  });

  return multer({ storage });
};

module.exports = getMulterUploader;
