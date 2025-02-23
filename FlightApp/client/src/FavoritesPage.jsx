import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      alert("You must be logged in to view favorites.");
      navigate("/");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/favorites/${user.id}`);
        setFavorites(response.data);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Your Favorite Flights</h1>
      {favorites.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        favorites.map((fav) => (
          <div key={fav.id} style={{ marginBottom: "40px" }}>
            <h3>{fav.route}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fav.price_history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="recorded_at" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))
      )}
    </div>
  );
};

export default FavoritesPage;
