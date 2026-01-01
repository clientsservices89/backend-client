import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
} from "../controllers/complaintController.js";
import { protect, isComplainer } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------- CLOUDINARY STORAGE ---------------- */

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "complaints",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

/* ---------------- ROLE CHECK HELPER ---------------- */

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: "Access denied" });
  };
};

/* ---------------- ROUTES ---------------- */

// Create complaint (ONLY complainer)
router.post("/", protect, isComplainer, createComplaint);

// My complaints (ONLY complainer)
router.get("/my", protect, isComplainer, getMyComplaints);

// Delete complaint (admin / technician / floorManager)
router.delete(
  "/:id",
  protect,
  allowRoles("admin", "technician", "floorManager"),
  deleteComplaint
);

// Get all complaints (admin / technician / floorManager)
router.get(
  "/all",
  protect,
  allowRoles("admin", "technician", "floorManager"),
  getAllComplaints
);

// Update complaint status (admin / technician / floorManager)
router.put(
  "/:id/status",
  protect,
  allowRoles("admin", "technician", "floorManager"),
  updateComplaintStatus
);

export default router;
