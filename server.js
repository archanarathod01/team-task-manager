const express = require("express");
const mongoose = require("mongoose");

// 🔥 dotenv only for local
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

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

// ✅ ROOT (IMPORTANT)
app.get("/", (req, res) => {
  console.log("ROOT HIT");
  res.send("WORKING ROOT");
});

// API routes
//app.use("/api/auth", authRoutes);
//app.use("/api", taskRoutes);

/* ===================== ERROR HANDLER ===================== */

// ✅ MUST SEND RESPONSE
app.use(errorHandler);

/* ===================== SERVER START ===================== */

// Debug
console.log("ENV CHECK:", process.env.MONGO_URI ? "FOUND" : "MISSING");

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.error("DB ERROR:", err));