import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import Cookies from "js-cookie";

import UserContext from "../../context/UserContext";

import "./index.css";

function Navbar() {
  // State variables
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hooks
  const navigate = useNavigate();

  // Context
  const { user, setUser } = useContext(UserContext);

  // Handle logout
  const handleLogout = () => {
    Cookies.remove("jwtToken");
    setUser(null);
    navigate("/");
  };

  // Render navbar
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          TokenTrap
        </Link>

        <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className={`menu-bar ${isMenuOpen ? "open" : ""}`}></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/scans" className="nav-link">
              Scans
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/start-scan" className="nav-link">
              Start Scan
            </Link>
          </li>
          {/* User menu for mobile (inside nav-menu) */}
          <li className="user-menu mobile-only">
            {user ? (
              <>
                <span className="username">{user.username}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="logout-button"
              >
                Login
              </button>
            )}
          </li>
        </ul>
        {/* User menu for desktop (outside nav-menu) */}
        <div className="user-menu desktop-only">
          {user ? (
            <>
              <span className="username">{user.username}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="logout-button"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
