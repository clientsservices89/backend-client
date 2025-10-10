const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require('http');
const cors = require('cors');
const { initializeIo } = require('./io'); // Import the io.js file
const complainRoutes = require("./routes/complain");
const userRoutes = require("./routes/user");
const exhibitRoutes = require("./routes/exhibits");
const pushTokenRoutes = require("./routes/pushToken");

dotenv.config({ path: "./config.env" });

const app = express();
const server = http.createServer(app);

initializeIo(server); // Initialize Socket.IO with the server instance

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", complainRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", exhibitRoutes);
app.use("/api/v1", pushTokenRoutes);

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;
const DB_URI = "mongodb://localhost:27017/complaints";

mongoose
  .connect(DB_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
