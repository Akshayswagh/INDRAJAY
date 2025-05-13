const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig"); // your Cloudinary instance
const { v4: uuidv4 } = require("uuid");

const getMulterUploader = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      format: async (req, file) => {
        // Ensure the format is consistent
        return file.mimetype.split("/")[1];
      },
      public_id: (req, file) => {
        // Create a custom name like: events-uuid.ext
        const ext = file.originalname.split(".").pop().toLowerCase();
        return `${folderName}-${uuidv4()}.${ext}`;
      },
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error("Only images (jpeg, jpg, png, gif, webp) are allowed!"));
      }
    },
  });
};

module.exports = getMulterUploader;
