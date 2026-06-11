const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  shortUrl: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShortUrl",
    required: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: String,
  userAgent: String,
  device: {
    type: String,
    default: "Desktop",
  },
  browser: {
    type: String,
    default: "Other",
  },
  referer: {
    type: String,
    default: "Direct",
  },
});

module.exports = mongoose.model("Visit", visitSchema);