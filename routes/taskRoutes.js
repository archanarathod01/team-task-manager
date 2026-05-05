const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createTask,
  getTasks
} = require("../controllers/taskController");

router.post("/task", auth, createTask);
router.get("/tasks", auth, getTasks);

module.exports = router;