const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require('dotenv').config();  // Load environment variables from .env file

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  status: {
    type: String,
    required: [true, "Please enter your designation as technician or complainer"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Password must be at least 6 characters"],  // Keep this validation if you want to ensure password length
    select: false, // Password should still be excluded from queries by default
  },
  complains: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complain",
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  pushToken: { type: String, default: null }, // Add the pushToken field
});

// Method to check if passwords match
userSchema.methods.matchPassword = async function (password) {
  return password === this.password;
};

// Method to generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

// Method to get reset password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
