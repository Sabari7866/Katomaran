const express = require("express");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Backend validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required (username, email, password).",
      });
    }

    if (username.trim().length < 2 || username.trim().length > 50) {
      return res.status(400).json({
        message: "Username must be between 2 and 50 characters.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email.",
      });
    }

    const user = await User.create({
      username: username.trim(),
      email,
      password,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user info without the hashed password
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Backend validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (
      !user ||
      !(await user.comparePassword(password))
    ) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user info without the hashed password
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;