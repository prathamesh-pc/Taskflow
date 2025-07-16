const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json("User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashed]
    );

    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET);
    const { password: _, ...userWithoutPassword } = newUser.rows[0];
    res.json({ token, user: userWithoutPassword });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json("Invalid email or password");
    }

    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) {
      return res.status(400).json("Invalid email or password");
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
    const { password: _, ...userWithoutPassword } = user.rows[0];
    res.json({ token, user: userWithoutPassword });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
