const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const validator = require("validator");

const ShortUrl = require("../models/ShortUrl");
const authMiddleware = require("../middleware/authMiddleware");

// Create Short URL
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { originalUrl, customAlias, expiryDate, password } = req.body;

    // Validate URL format
    if (!originalUrl || !validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({
        message: "Invalid original URL. Must include protocol (http:// or https://).",
      });
    }

    let shortCode;
    if (customAlias) {
      const aliasTrimmed = customAlias.trim();
      // Validate custom alias format
      if (!/^[a-zA-Z0-9-_]{3,30}$/.test(aliasTrimmed)) {
        return res.status(400).json({
          message: "Custom alias must be between 3 and 30 characters and contain only alphanumeric characters, dashes, or underscores.",
        });
      }

      // Check if custom alias is already in use
      const existingAlias = await ShortUrl.findOne({
        $or: [{ shortCode: aliasTrimmed }, { customAlias: aliasTrimmed }],
      });
      if (existingAlias) {
        return res.status(400).json({
          message: "This custom alias is already in use.",
        });
      }
      shortCode = aliasTrimmed;
    } else {
      // Generate unique short code
      let unique = false;
      while (!unique) {
        shortCode = nanoid(7);
        const existing = await ShortUrl.findOne({
          $or: [{ shortCode }, { customAlias: shortCode }],
        });
        if (!existing) unique = true;
      }
    }

    // Expiry Date Validation
    let parsedExpiry = null;
    if (expiryDate) {
      parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({
          message: "Invalid expiry date format.",
        });
      }
      if (parsedExpiry < new Date()) {
        return res.status(400).json({
          message: "Expiry date cannot be in the past.",
        });
      }
    }

    const url = await ShortUrl.create({
      originalUrl,
      shortCode,
      customAlias: customAlias ? customAlias.trim() : undefined,
      user: req.user.id,
      expiryDate: parsedExpiry,
      password: password || undefined,
    });

    res.status(201).json(url);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get User URLs with Pagination
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ShortUrl.countDocuments({ user: req.user.id });
    const urls = await ShortUrl.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      urls,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUrls: total,
    });
  } catch (error) {
    console.error("Error in GET /api/urls:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Destination URL
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { originalUrl } = req.body;

    // Validate new URL
    if (!originalUrl || !validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({
        message: "Invalid URL. Must include protocol (http:// or https://).",
      });
    }

    const url = await ShortUrl.findOne({ _id: req.params.id, user: req.user.id });

    if (!url) {
      return res.status(404).json({
        message: "URL not found or unauthorized.",
      });
    }

    url.originalUrl = originalUrl;
    await url.save();

    res.json(url);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete URL
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const url = await ShortUrl.findOne({ _id: req.params.id, user: req.user.id });

    if (!url) {
      return res.status(404).json({
        message: "URL not found or unauthorized.",
      });
    }

    await url.deleteOne();

    res.json({
      message: "URL Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
