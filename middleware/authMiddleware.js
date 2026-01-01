import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Protect routes
export const protect = async (req, res, next) => {
  let token = null;

  // 1️⃣ Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // ❌ No token sent
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Find user & attach to req
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ⛳ Role-based middleware
export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Admin only access" });
};

export const isTechnician = (req, res, next) => {
  if (req.user?.role === "technician") return next();
  return res.status(403).json({ message: "Technician only access" });
};

export const isComplainer = (req, res, next) => {
  if (req.user?.role === "complainer") return next();
  return res.status(403).json({ message: "Complainer only access" });
};

export const isFloorManager = (req, res, next) => {
  if (req.user?.role === "floorManager") return next();
  return res.status(403).json({ message: "Floor Manager only access" });
};

export const isAdminOrFloorManager = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.role === "floorManager") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Admin or Floor Manager access only" });
};
