const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const cors = require("cors");
const { initializeIo } = require("./io"); // Import the io.js file

// Load .env variables
dotenv.config();

const app = express();
const server = http.createServer(app);

initializeIo(server); // Initialize Socket.IO with the server instance

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
const complainRoutes = require("./routes/complain");
const userRoutes = require("./routes/user");
const exhibitRoutes = require("./routes/exhibits");
const pushTokenRoutes = require("./routes/pushToken");

app.use("/api/v1", complainRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", exhibitRoutes);
app.use("/api/v1", pushTokenRoutes);

// Configurations
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI;

// Connect to MongoDB and start server
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  });
