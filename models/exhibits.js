const mongoose = require("mongoose");

const exhibitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  floor: {
    type: String,
    required: [true, "Please enter Floor"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Exhibit", exhibitSchema);
