const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController");
const router = express.Router();



// Route definitions
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", resetPassword);

router.post("/reset-password/:token", updatePassword);

module.exports = router;
