// const { response } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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




module.exports = {
  register,
  login,
  
};
