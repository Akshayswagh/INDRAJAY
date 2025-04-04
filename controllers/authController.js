const { response } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

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
    const validRoles = ["admin", "vender", "user"];
    if (!validRoles.includes(role)) {

      console.log(" form submitted but invalid role")
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
        return res
          .status(400)
          .json({ message: "All Fields are required" });
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
    console.log("done success register");
    console.log(req.body);

    res
      .status(201)
      .json({ message: `User registered successfully`, user: { email, role } });
  } catch (err) {
    console.error("Registration error:", err.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: `user with email ${email} not found` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: `Invalid Credintials` });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

module.exports = {
  register,
  login,
};
