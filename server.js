import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================
// Middleware
// =====================

// CORS (supports mobile APK + web)
app.use(
  cors({
    origin: "*",
    credentials: true
  })
);

// Body parsers (safe limits for Render)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =====================
// Static files (OPTIONAL)
// ⚠️ Render does NOT persist local files
// Use Cloudinary for production
// =====================
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================
// Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/reports", reportRoutes);

// =====================
// Health check (IMPORTANT for Render)
// =====================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Root route
app.get("/", (req, res) => {
  res.send("Complaint Management API is running 🚀");
});

// =====================
// Server start
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
