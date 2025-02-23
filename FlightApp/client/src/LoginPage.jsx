import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        username,
        password,
      });
  
      if (response.data) {
        alert(`Welcome, ${response.data.user.username}!`);
  
        // ✅ Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
  
        navigate("/flights");  // Redirect to flight search page
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password.");
    }
  };
  

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        username,
        password,
      });
      alert("Registration successful! You can now log in.");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Username might already be taken.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />
      <br />
      <button onClick={handleLogin} style={{ padding: "10px 20px", margin: "10px" }}>
        Login
      </button>
      <button onClick={handleRegister} style={{ padding: "10px 20px" }}>
        Register
      </button>
    </div>
  );
};

export default LoginPage;
