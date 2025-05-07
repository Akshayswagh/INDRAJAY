// middleware/errorHandler.js (optional if you want to separate)
function errorHandler(err, req, res, next) {
    console.error("Global Error Handler:", err);
  
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "production" ? null : err.stack, // optional: hide stack in prod
    });
  }
  
  module.exports = errorHandler;
  