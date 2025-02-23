const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

// Replace with your actual Amadeus credentials
const CLIENT_ID = process.env.AMADEUS_API_KEY;
const CLIENT_SECRET = process.env.AMADEUS_API_SECRET;

// Manually set the access token
const MANUAL_ACCESS_TOKEN = process.env.AMADEUS_ACCESS_TOKEN;

// Function to get access token from Amadeus
const getAccessToken = async () => {
  // Return the manually set token
  return MANUAL_ACCESS_TOKEN;

  // Uncomment the following code if you want to fetch the token from Amadeus API
  /*
  try {
    const response = await axios.post('https://api.amadeus.com/v1/security/oauth2/token', null, {
      params: {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching Amadeus token:', error.response?.data || error.message);
    throw new Error('Failed to get access token.');
  }
  */
};

// GET /api/locations?keyword=cityname
router.get('/locations', async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required.' });
  }

  try {
    const token = await getAccessToken();

    const response = await axios.get('https://api.amadeus.com/v1/reference-data/locations', {
      params: {
        keyword,
        subType: 'AIRPORT,CITY',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching locations:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch locations.' });
  }
});

module.exports = router;
