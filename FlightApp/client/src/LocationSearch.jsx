import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LocationSearch = () => {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Replace with your actual access token
  const accessToken = 'YOUR_ACCESS_TOKEN_HERE';

  useEffect(() => {
    // Only search if the query is not empty and is at least 2 characters long
    if (query.trim().length < 2) {
      setLocations([]);
      return;
    }

    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://api.amadeus.com/reference-data/locations', {
          params: {
            keyword: query,
            // You can filter for specific types like airports or cities
            subType: 'AIRPORT,CITY'
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        // Assuming the data is under response.data.data
        setLocations(response.data.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call by 300ms to prevent rapid calls
    const debounceTimeout = setTimeout(fetchLocations, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query, accessToken]);

  return (
    <div className="location-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter city name..."
        className="search-input"
      />
      {isLoading && <div>Loading...</div>}
      {locations.length > 0 && (
        <ul className="suggestions">
          {locations.map((location) => (
            <li key={location.iataCode || location.id}>
              {location.name} {location.iataCode && `(${location.iataCode})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
