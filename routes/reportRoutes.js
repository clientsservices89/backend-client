import express from "express";
import { complaintExcelReport } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin / Technician only
router.get("/complaints/excel", protect, complaintExcelReport);

export default router;
