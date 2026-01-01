import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🧾 Helper: Generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🧍 Signup (Register)
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Allow only specific roles
    const allowedRoles = ["complainer", "technician", "admin", "floorManager"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// 🔐 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

export const savePushToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await User.findById(req.user._id);
    user.expoPushToken = token;
    await user.save();

    res.status(200).json({ message: "Push token saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save token", error });
  }
};