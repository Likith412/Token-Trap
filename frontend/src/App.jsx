import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";

import HashLoader from "react-spinners/HashLoader";

import Cookies from "js-cookie";

import Login from "./components/Login";
import Home from "./components/Home";
import Scans from "./components/Scans";
import NotFound from "./components/NotFound";
import ProtectedRoutes from "./components/ProtectedRoutes";
import UserContext from "./context/UserContext";
import StartScan from "./components/StartScan";
import ScanDetails from "./components/ScanDetails";

import "./App.css";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

function App() {
  // State variables
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  const [user, setUser] = useState(null);

  // Get jwtToken from cookies
  const jwtToken = Cookies.get("jwtToken");

  // Verify user and set user state
  const verifyUser = async () => {
    setApiStatus(apiStatusConstants.inProgress);
    try {
      const response = await fetch("/api/protected", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
      });

      const { user } = await response.json();

      if (response.ok) {
        setUser(user);
      } else {
        setUser(null);
      }
      setApiStatus(apiStatusConstants.success);
    } catch (e) {
      console.log(e);
      setApiStatus(apiStatusConstants.failure);
      setUser(null);
    }
  };

  // Verify user on mount
  useEffect(() => {
    verifyUser();
  }, []);

  // Render loading view
  const renderLoadingView = () => {
    return (
      <div className="app-loader-container">
        <HashLoader color="#2fff7a" size={50} />
      </div>
    );
  };

  // Render failure view
  const renderFailureView = () => {
    return (
      <div className="app-failure-container">
        <div className="app-failure-content">
          <div className="app-failure-icon">⚠️</div>
          <h1 className="app-failure-heading">Something Went Wrong</h1>
          <p className="app-failure-message">
            We are having some trouble fetching the data. Please try again.
          </p>
          <button onClick={verifyUser} className="app-failure-retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  };

  // Render success view
  const renderSuccessView = () => {
    return (
      <>
        <UserContext.Provider value={{ user, setUser }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/scans" element={<Scans />} />
              <Route path="/start-scan" element={<StartScan />} />
              <Route path="/scans/:id" element={<ScanDetails />} />
            </Route>
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
          </Routes>
        </UserContext.Provider>
      </>
    );
  };

  const renderView = () => {
    switch (apiStatus) {
      case apiStatusConstants.success:
        return renderSuccessView();
      case apiStatusConstants.failure:
        return renderFailureView();
      case apiStatusConstants.inProgress:
        return renderLoadingView();
      default:
        return null;
    }
  };

  return <div className="app-container">{renderView()}</div>;
}

export default App;
