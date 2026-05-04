const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Task = require("./models/Task");
const auth = require("./middleware/auth");

const app = express();
app.use(express.json());

/* ===================== ROUTES ===================== */

// Test route
app.get("/", (req, res) => {
  res.send("API running");
});

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Task (Protected)
app.post("/task", auth, async (req, res) => {
  try {
    const { title } = req.body;

    const task = new Task({
      title,
      assignedTo: req.user.id
    });

    await task.save();

    res.json({ message: "Task created", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Tasks (Protected)
app.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Task (Protected)
app.put("/task/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = ["Pending", "In Progress", "Completed"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedTo: req.user.id
      },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated", task });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard (Protected)
app.get("/dashboard", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id
    });

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const pending = tasks.filter(t => t.status === "Pending").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;

    res.json({
      total,
      completed,
      pending,
      inProgress
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== SERVER START ===================== */

//  IMPORTANT: DB connect hone ke baad hi server start hoga
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");

  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
})
.catch(err => console.log(err));