const router = require("express").Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");

// Get all tasks for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC",
      [req.user.id]
    );
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Create a new task
router.post("/", verifyToken, async (req, res) => {
  const { title, description, deadline } = req.body;
  try {
    const newTask = await pool.query(
      "INSERT INTO tasks (user_id, title, description, deadline) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, title, description, deadline]
    );
    res.json(newTask.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Update a task
router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, status, deadline } = req.body;
  try {
    const update = await pool.query(
      "UPDATE tasks SET title = $1, description = $2, status = $3, deadline = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
      [title, description, status, deadline, req.params.id, req.user.id]
    );
    res.json(update.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Delete a task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
