const mongoose = require("mongoose");

const complainSchema = new mongoose.Schema({
  floor: {
    type: String,
    required: true,
  },
  exhibit: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    public_id: String,
    url: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  complainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Complain", complainSchema);
