import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("You must be logged in to access this page.");
    return <Navigate to="/" replace />;  // Redirect to login
  }

  return children;  // Render the protected component
};

export default ProtectedRoute;
