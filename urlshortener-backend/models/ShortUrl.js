const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const shortUrlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastVisited: {
      type: Date,
    },
    password: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash link password before saving
shortUrlSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password) {
    this.password = null;
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare link password
shortUrlSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return true;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("ShortUrl", shortUrlSchema);