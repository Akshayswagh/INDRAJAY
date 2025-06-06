// const { response } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const PasswordResetToken = require("../models/PasswordResetToken");
const transporter = require("../config/email");
const User = require("../models/User");

// Handle register/signup Request
const register = async (req, res) => {
  try {
    const {
      email,
      name,
      contactNumber,
      firmName,
      address,
      username,
      password,
      role,
    } = req.body;

    // Validate role
    const validRoles = ["admin", "vendor", "user"];
    if (!validRoles.includes(role)) {
      // console.log(" form submitted but invalid role");
      return res.status(400).json({ message: "Invalid role provided" });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user object based on role
    let userData = {
      email,
      name,
      contactNumber,
      username,
      password: hashedPassword,
      role,
    };

    // Add additional fields based on role
    if (role === "vendor") {
      if (!firmName || !address) {
        return res.status(400).json({ message: "All Fields are required" });
      }
      userData.firmName = firmName;
      userData.address = address;
    } else if (role === "user") {
      if (!address) {
        return res
          .status(400)
          .json({ message: "All Fields are required for users" });
      }
      userData.address = address;
    }

    // Create and save the user
    const newUser = new User(userData);
    await newUser.save();
    // console.log(newUser);
    // console.log("done success register");
    // console.log(req.body);

    let successMessage;
    switch (newUser.role) {
      case "vendor":
        successMessage = "Vendor registered successfully";
        break;
      case "user":
        successMessage = "User registered successfully";
        break;
      case "admin":
        successMessage = "Admin account created successfully";
        break;
      default:
        successMessage = "Account created successfully";
    }

    res.status(201).json({
      message: successMessage,
      user: {
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};

// Handle login Request
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!role) {
      return res.status(400).json({
        message: "Role is required for authentication",
        errorType: "MISSING_ROLE",
      });
    }

    const user = await User.findOne({ email }).select("+password +role");
    if (!user) {
      return res
        .status(404)
        .json({ message: `Account not found`, errorType: "ACCOUNT_NOT_FOUND" });
    }

    // First verify role match
    if (user.role !== role.toLowerCase()) {
      return res.status(403).json({
        message: `Access forbidden for ${role} role`,
        errorType: "ROLE_MISMATCH",
      });
    }

    //  verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: `Invalid Credintials`,
        errorType: "INVALID_CREDENTIALS",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "Internal server error",
      errorType: "SERVER_ERROR",
    });
  }
};

// Handle Password Reset Request
const forgotPassword = async (req, res) => {
  try {
    // console.log("Request received. Email:", req.body.email); // Log incoming email
    const { email } = req.body;

    const user = await User.findOne({ email });
    // console.log("User found:", user ? user.email : "None"); // Log user lookup

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account with that email exists" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
    const expiresAt = new Date(Date.now() + FIVE_MINUTES_IN_MS); // 5 minutes expiration
    // console.log("Token generated:", token); // Log token

    const savedToken = await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt,
    });
    // console.log("Token saved to DB:", savedToken); // Log DB operation

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${token}`;
    // console.log("Reset URL:", resetUrl); // Log URL

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
          }
          h2 {
            color: #333333;
          }
          p {
            color: #555555;
            line-height: 1.5;
          }
          a.button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 20px;
            background-color: #f47321;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            font-size: 0.85rem;
            color: #999999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name || "User"},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>If you did not request this, you can safely ignore this email. This password reset link will expire in 1 hour.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Indrajay Enterprises. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
    });

    // console.log("Email sent successfully"); // Confirm email sent
    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Full error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error processing request" });
  }
};

// Reset Password Page
const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const tokenDoc = await PasswordResetToken.findOne({ token });

    const valid = tokenDoc && new Date(tokenDoc.expiresAt) > new Date();

    res.render("client/reset-password", {
      title: "Reset Password | Indrajay Enterprises",
      valid,
      token: valid ? token : null,
    });
  } catch (error) {
    console.error(error);
    res.render("client/reset-password", {
      title: "Reset Password | Indrajay Enterprises",
      valid: false,
    });
  }
};

// Handle Password Update
const updatePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetToken = await PasswordResetToken.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(resetToken.userId);

    // Simply assign the plain password - the pre-save hook will hash it
    user.password = password;

    // This will trigger the pre-save hook to hash the password
    await user.save();

    // Delete the reset token
    await PasswordResetToken.deleteMany({ userId: user._id });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
};
