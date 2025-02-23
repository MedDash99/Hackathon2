// File: backend/index.js (or whichever file starts your backend)
require('dotenv').config(); 
const express = require('express');
const app = express();
const Amadeus = require('amadeus');
const cors = require('cors');
const { Pool } = require('pg');

// Optional: Debug log to verify that environment variables are loaded
console.log('AMADEUS_CLIENT_ID:', process.env.AMADEUS_CLIENT_ID);
console.log('AMADEUS_CLIENT_SECRET:', process.env.AMADEUS_CLIENT_SECRET);

// Initialize the Amadeus API client with client credentials
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});


// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Connection (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL (Neon)"))
  .catch((err) => console.error("Connection error", err));

// ✅ Import and use user routes
const usersRoute = require("./routes/users");
app.use("/api/users", usersRoute);

// Existing flight routes
const flightsRoute = require("./routes/flights");
app.use("/api/flights", flightsRoute);

const favoritesRoute = require("./routes/favorites");
app.use("/api/favorites", favoritesRoute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
