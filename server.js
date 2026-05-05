const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// 🔹 ROUTES
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

// 🔹 MIDDLEWARE
const errorHandler = require("./middleware/errorHandler");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();

/* ===================== MIDDLEWARE ===================== */

app.use(express.json());

app.use(cors());
app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

/* ===================== ROUTES ===================== */

// Test route
app.get("/", (req, res) => {
  res.send("API running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", taskRoutes);

/* ===================== ERROR HANDLER ===================== */

// ⚠️ always last
app.use(errorHandler);

/* ===================== SERVER START ===================== */

// 🔥 ADD THIS LINE (IMPORTANT DEBUG)
console.log("ENV CHECK:", process.env.MONGO_URI ? "FOUND" : "MISSING");

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.error(err));