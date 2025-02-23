const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false },
});

// ✅ Add flight to favorites
router.post("/add", async (req, res) => {
  const { user_id, flight_id, route, price } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO favorites (user_id, flight_id, route, price) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, flight_id, route, price]
    );

    await pool.query(
      `INSERT INTO price_history (favorite_id, price) VALUES ($1, $2)`,
      [rows[0].id, price]
    );

    res.status(201).json({ message: "Flight favorited!", favorite: rows[0] });
  } catch (err) {
    console.error("Error favoriting flight:", err);
    res.status(500).json({ message: "Error favoriting flight." });
  }
});

// ✅ Get user's favorites with price history
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const { rows: favorites } = await pool.query(
      `SELECT * FROM favorites WHERE user_id = $1`,
      [user_id]
    );

    const priceHistories = await Promise.all(
      favorites.map(async (fav) => {
        const { rows: history } = await pool.query(
          `SELECT price, recorded_at FROM price_history WHERE favorite_id = $1 ORDER BY recorded_at ASC`,
          [fav.id]
        );
        return { ...fav, price_history: history };
      })
    );

    res.status(200).json(priceHistories);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ message: "Error fetching favorites." });
  }
});

module.exports = router;
