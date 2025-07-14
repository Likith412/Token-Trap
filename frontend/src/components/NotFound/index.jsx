import { useNavigate } from "react-router";
import "./index.css";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")} className="home-button">
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
