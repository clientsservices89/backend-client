const express = require("express");
const cookieParser = require("cookie-parser");
const complainRoutes = require("./routes/complain");
const userRoutes = require("./routes/user");
const pushTokenRoutes = require("./routes/pushToken"); // Add this line

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", complainRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", pushTokenRoutes); // Add this line

module.exports = app;
