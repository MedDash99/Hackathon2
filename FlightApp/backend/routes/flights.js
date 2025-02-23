require("dotenv").config();  // ✅ Load environment variables from .env
const express = require("express");
const axios = require("axios");
const router = express.Router();

const AMADEUS_CLIENT_ID = process.env.AMADEUS_API_KEY;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_API_SECRET;
const MANUAL_ACCESS_TOKEN = process.env.AMADEUS_ACCESS_TOKEN; // New: manual token from .env
console.log('Client ID:', process.env.AMADEUS_API_KEY);
console.log('Client Secret:', process.env.AMADEUS_API_SECRET);

let accessToken = null;
let tokenExpiry = null;

// ✅ Function to fetch Amadeus access token
const getAccessToken = async () => {
  if (MANUAL_ACCESS_TOKEN) {
    return MANUAL_ACCESS_TOKEN;
  }
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  try {
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        client_id: AMADEUS_CLIENT_ID,
        client_secret: AMADEUS_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;  // Set token expiry
    return accessToken;
  } catch (err) {
    console.error("❌ Failed to fetch Amadeus access token:", err.response?.data || err.message);
    throw new Error("Unable to fetch access token.");
  }
};

// ✅ Step 1: Get matching locations (cities/airports)
const getLocationCode = async (keyword) => {
  const token = await getAccessToken();

  try {
    const response = await axios.get("https://test.api.amadeus.com/v1/reference-data/locations", {
      params: { keyword, subType: "CITY,AIRPORT" },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.data.length > 0) {
      return response.data.data[0].iataCode;  // Return the IATA code of the top result
    } else {
      throw new Error(`No locations found for keyword: ${keyword}`);
    }
  } catch (err) {
    console.error("❌ Error fetching location code:", err.response?.data || err.message);
    throw new Error("Failed to fetch location code.");
  }
};

// ✅ Step 2: Search for flight offers between two cities
router.get("/search", async (req, res) => {
  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: "Missing required parameters (origin, destination, date)" });
  }

  try {
    const originCode = await getLocationCode(origin);
    const destinationCode = await getLocationCode(destination);

    const token = await getAccessToken();

    const response = await axios.get("https://test.api.amadeus.com/v2/shopping/flight-offers", {
      params: {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate: date,
        adults: 1,
        currencyCode: "USD",
        travelClass: "ECONOMY",
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching flight offers:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch flight offers", details: error.message });
  }
});

module.exports = router;
