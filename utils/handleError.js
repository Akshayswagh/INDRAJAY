// utils/handleError.js
const handleError = (res, error, statusCode = 500) => {
  console.error("Handled Error:", error);

  let message = error.message || "Something went wrong";

  // Multer-specific error
  if (error.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`,
    });
  }
  // Handle specific known error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = error.message;
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate key error";
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = handleError;
