const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

// Updated for Neon in the cloud
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Neon requires this setting
  }
});

// Log database connection status
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Database connected successfully');
  }
  release();
});

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Route to add or update a user
router.post("/add", async (req, res) => {
  const { uid, name, email, photoURL } = req.body;

  if (!uid || !name || !email) {
    return res.status(400).json({ message: "Missing user data." });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO users (uid, name, email, photo_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (uid) DO UPDATE
      SET name = EXCLUDED.name, email = EXCLUDED.email, photo_url = EXCLUDED.photo_url
      RETURNING *;
      `,
      [uid, name, email, photoURL]
    );

    res.status(200).json({ message: "User added/updated successfully.", user: rows[0] });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ message: "Server error while adding user.", error: err.stack });
  }
});

// Route to create a new user if it doesn't exist
router.post("/create", async (req, res) => {
  const { uid, name, email, password } = req.body;

  if (!uid || !name || !email || !password) {
    return res.status(400).json({ message: "Missing user data." });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO users (uid, name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [uid, name, email, password]
    );

    res.status(201).json({ message: "User created successfully.", user: rows[0] });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error while creating user.", error: err.stack });
  }
});

// Route to login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1 AND password = $2`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const user = rows[0];
    res.status(200).json({ message: "Login successful.", user });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Server error while logging in user.", error: err.stack });
  }
});

module.exports = router;
