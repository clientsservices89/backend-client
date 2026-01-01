import express from "express";
import { signup, login, getAllUsers, savePushToken } from "../controllers/authController.js";
import { isAdminOrFloorManager, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.get("/users", protect, isAdminOrFloorManager, getAllUsers);
router.get("/users",  getAllUsers);
router.post("/signup", signup);
router.post("/login", login);
router.post("/save-token", protect, savePushToken);

export default router;
