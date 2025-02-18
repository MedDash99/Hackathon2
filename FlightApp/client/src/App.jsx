import { useEffect, useState } from "react";
import './App.css'
import axios from 'axios'

function App() {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    axios.get("/api/flights") // No need for full URL due to proxy
      .then((res) => setFlights(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Flight Data</h1>
      <ul>
        {flights.map((flight) => (
          <li key={flight.id}>
            {flight.airline} - {flight.departure} → {flight.arrival} (${flight.price})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;