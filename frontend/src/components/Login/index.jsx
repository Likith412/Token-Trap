import { useState, useContext } from "react";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router";

import UserContext from "../../context/UserContext";

import "./index.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  // States
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Making a request to the backend
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const { message, jwtToken, user } = await response.json();
      if (!response.ok) {
        setError(message);
        setIsLoading(false);
        return;
      }

      // Store token in cookie
      Cookies.set("jwtToken", jwtToken, {
        expires: 7,
      });

      // Set user in context
      setUser(user);

      // Navigate to the home page
      navigate("/", { replace: true });
    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <div className="form-group">
          <label htmlFor="username">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? (
            <>
              Signing in...
              <ClipLoader color="#000000" size={16} speedMultiplier={0.8} />
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
