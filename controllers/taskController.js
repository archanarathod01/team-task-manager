const Task = require("../models/Task");

/* ===================== CREATE TASK ===================== */
exports.createTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    const task = await Task.create({
      title,
      assignedTo: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });

  } catch (err) {
    next(err);
  }
};


/* ===================== GET TASKS (FINAL VERSION) ===================== */
exports.getTasks = async (req, res, next) => {
  try {
    // 🔥 Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // 🔥 Filter object
    const filter = { assignedTo: req.user.id };

    // 🔥 Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // 🔥 Search (title)
    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i"
      };
    }

    // 🔥 Sorting
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    // 🔥 DB query
    const tasks = await Task.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sortField]: sortOrder })
      .populate("assignedTo", "name"); // cleaner

    // 🔥 Total count
    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    next(err);
  }
};