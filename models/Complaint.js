import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"],
    required: true,
  },
  message: { type: String },

  updatedBy: {
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    email: { type: String },
  },

  createdAt: { type: Date, default: Date.now },
});

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, required: true },
    floor: { type: String, required: true },
    theme: { type: String, required: true },
    location: { type: String, required: true },
    photo: { type: String },

    // 🆕 Add resolved photo proof
    resolvedPhoto: { type: String },

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    history: [historySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
