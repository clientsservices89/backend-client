import Complaint from "../models/Complaint.js";
import { v2 as cloudinary } from "cloudinary";
import { sendPushNotification } from "../utils/pushNotification.js";
import User from "../models/User.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📝 Create Complaint
export const createComplaint = async (req, res) => {
  try {
    const photoUrl = req.body.photo || null;

    const complaint = await Complaint.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      floor: req.body.floor,
      theme: req.body.theme,
      location: req.body.location,
      photo: photoUrl,
      createdBy: req.user._id,
      history: [{ status: "pending" }],
    });
    // 🔔 Send push notifications to all users with tokens
    const users = await User.find({
      expoPushToken: { $exists: true, $ne: "" },
    });
    const messageTitle = "New Complaint Added";
    const messageBody = `${req.user.name} added a new complaint: ${complaint.title}`;

    for (const user of users) {
      await sendPushNotification(user.expoPushToken, messageTitle, messageBody);
    }

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Complaint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get My Complaints
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints", error });
  }
};

// Get All Complaints (Admin & Technician)
export const getAllComplaints = async (req, res) => {
  try {
    const { status, floor, priority } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (floor) filter.floor = floor;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all complaints", error });
  }
};

// Update Status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, resolvedPhoto } = req.body;

    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    // 🆕 Require proof image when resolving
    if (status === "resolved" && !resolvedPhoto) {
      return res.status(400).json({ message: "Resolution photo is required" });
    }

    complaint.status = status;

    if (status === "resolved") {
      complaint.resolvedBy = req.user._id;
      complaint.resolvedPhoto = resolvedPhoto; // save Cloudinary URL
    }

    complaint.history.push({
      status,
      message: message || `Status changed to ${status}`,
      updatedBy: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });

    await complaint.save();

    const updated = await Complaint.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("resolvedBy", "name email");

    // notify the user who created complaint
    // 🔔 Send push notifications to all users
    const users = await User.find({
      expoPushToken: { $exists: true, $ne: "" },
    });
    const messageTitle = "Complaint Status Updated";
    const messageBody = `${complaint.title} is now ${status}`;

    for (const user of users) {
      await sendPushNotification(user.expoPushToken, messageTitle, messageBody);
    }

    res.status(200).json({
      message: "Complaint status updated",
      complaint: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update complaint", error });
  }
};

// DELETE Complaint
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Delete main complaint image from Cloudinary
    if (complaint.photo) {
      const parts = complaint.photo.split("/");
      const file = parts.pop();
      const folder = parts.slice(parts.indexOf("upload") + 2).join("/");
      const publicId = file.split(".")[0];
      const fullPath = `${folder}/${publicId}`;
      await cloudinary.uploader.destroy(fullPath);
    }

    // Delete resolved photo proof if exists
    if (complaint.resolvedPhoto) {
      const parts = complaint.resolvedPhoto.split("/");
      const file = parts.pop();
      const folder = parts.slice(parts.indexOf("upload") + 2).join("/");
      const publicId = file.split(".")[0];
      const fullPath = `${folder}/${publicId}`;
      await cloudinary.uploader.destroy(fullPath);
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete complaint", error });
  }
};
