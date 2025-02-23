import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart } from "react-icons/fa";

const FlightSearchPage = () => {
  const [flights, setFlights] = useState([]);
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("2025-04-11");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      alert("You must be logged in to access this page.");
      navigate("/");
    }
  }, [navigate, user]);

  const fetchFlights = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/flights/search", {
        params: {
          origin: departure,
          destination: arrival,
          date,
        },
      });
      setFlights(res.data.data);  // Set flight offers to state
    } catch (err) {
      console.error("Error fetching flights:", err.response?.data || err.message);
    }
  };
  
  

  const toggleFavorite = async (flight) => {
    try {
      const route = `${flight.itineraries[0].segments[0].departure.city} → ${flight.itineraries[0].segments.slice(-1)[0].arrival.city}`;
      await axios.post("http://localhost:5000/api/favorites/add", {
        user_id: user.id,
        flight_id: flight.id,
        route,
        price: flight.price.total,
      });
      alert("Flight added to favorites!");
    } catch (err) {
      console.error("Error favoriting flight:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "8px 16px",
          borderRadius: "5px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <h1>Flight Search</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          placeholder="Departure City (e.g., New York)"
          style={{ width: "300px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          value={arrival}
          onChange={(e) => setArrival(e.target.value)}
          placeholder="Arrival City (e.g., Los Angeles)"
          style={{ width: "300px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "300px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={fetchFlights}
          style={{
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
          }}
        >
          Search Flights
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {flights.length > 0 ? (
          flights.map((flight, index) => (
            <li
              key={index}
              style={{
                marginBottom: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                width: "80%",
                margin: "20px auto",
              }}
            >
              <strong>Price:</strong> ${flight.price.total} <br />
              <strong>Route:</strong> {flight.itineraries[0].segments[0].departure.city} →{" "}
              {flight.itineraries[0].segments.slice(-1)[0].arrival.city}
              <br />
              <button
                onClick={() => toggleFavorite(flight)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  backgroundColor: "#FF6B6B",
                  color: "white",
                  border: "none",
                }}
              >
                <FaHeart color="white" /> Favorite
              </button>
            </li>
          ))
        ) : (
          <p>No flights found.</p>
        )}
      </ul>
    </div>
  );
};

export default FlightSearchPage;
