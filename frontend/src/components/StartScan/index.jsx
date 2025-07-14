import React, { useState, useRef } from "react";
import HashLoader from "react-spinners/HashLoader";
import Cookies from "js-cookie";
import { FiShield, FiSearch, FiBriefcase, FiUsers } from "react-icons/fi";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "./index.css";
import { useNavigate } from "react-router";

const apiStatusConstants = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const scanStatusLabels = {
  running: "Scan is running...",
  completed: "Scan completed!",
  failed: "Scan failed.",
  cancelled: "Scan was cancelled.",
};

function StartScan() {
  const [scanState, setScanState] = useState({
    orgName: "",
    scanId: null,
    scanStatus: null,
    summary: null,
    error: "",
    isCancelling: false,
  });
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  // Start polling scan status
  const startPolling = (id) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchScanStatus(id);
    }, 10000);
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Fetch scan status
  const fetchScanStatus = async (id) => {
    try {
      const res = await fetch(`/api/scans/${id}/status`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("jwtToken")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch status");
      setScanState((prev) => ({
        ...prev,
        scanStatus: data.status,
        summary: data.status === "completed" ? data.summary : prev.summary,
      }));
      if (data.status === "completed") {
        stopPolling();
      } else if (data.status === "failed" || data.status === "cancelled") {
        stopPolling();
      }
    } catch (err) {
      setScanState((prev) => ({
        ...prev,
        error: err.message || "Failed to fetch scan status",
      }));
      stopPolling();
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setScanState((prev) => ({
      ...prev,
      error: "",
      scanId: null,
      scanStatus: null,
      summary: null,
      isCancelling: false,
    }));
    setApiStatus(apiStatusConstants.inProgress);
    stopPolling();
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("jwtToken")}`,
        },
        body: JSON.stringify({ org: scanState.orgName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start scan");
      setScanState((prev) => ({
        ...prev,
        scanId: data.scanId || data.id || data._id,
        scanStatus: "running",
      }));
      setApiStatus(apiStatusConstants.success);
      startPolling(data.scanId || data.id || data._id);
    } catch (err) {
      setScanState((prev) => ({
        ...prev,
        error: err.message || "Failed to start scan",
      }));
      setApiStatus(apiStatusConstants.failure);
    }
  };

  // Cancel scan handler
  const handleCancelScan = async () => {
    if (!scanState.scanId) return;
    setScanState((prev) => ({ ...prev, isCancelling: true, error: "" }));
    try {
      const res = await fetch(`/api/scans/${scanState.scanId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("jwtToken")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        // If scan is already completed/cancelled, update UI accordingly
        if (
          res.status === 404 &&
          data.message === "No active scan found for this ID"
        ) {
          // Fetch the latest status to update UI
          await fetchScanStatus(scanState.scanId);
          setScanState((prev) => ({ ...prev, isCancelling: false, error: "" }));
          return;
        }
        throw new Error(data.message || "Failed to cancel scan");
      }
      setScanState((prev) => ({ ...prev, scanStatus: "cancelled" }));
    } catch (err) {
      setScanState((prev) => ({
        ...prev,
        error: err.message || "Failed to cancel scan",
      }));
    } finally {
      setScanState((prev) => ({ ...prev, isCancelling: false }));
      stopPolling();
    }
  };

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => stopPolling();
  }, []);

  // UI rendering
  return (
    <>
      <Navbar />
      <div className="startscan-container">
        <h1 className="startscan-heading">
          <span className="icon">
            <FiShield />
          </span>
          Start a New Scan
        </h1>
        <form className="startscan-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="orgName">Organization Name</label>
            <input
              id="orgName"
              type="text"
              value={scanState.orgName}
              onChange={(e) =>
                setScanState((prev) => ({ ...prev, orgName: e.target.value }))
              }
              placeholder="Enter organization name"
              required
              disabled={
                apiStatus === apiStatusConstants.inProgress ||
                scanState.scanStatus === "running"
              }
            />
          </div>
          <button
            type="submit"
            className="startscan-button"
            disabled={
              apiStatus === apiStatusConstants.inProgress ||
              scanState.scanStatus === "running"
            }
          >
            <span className="icon">
              <FiSearch />
            </span>
            {apiStatus === apiStatusConstants.inProgress ? (
              <>
                Scanning... <HashLoader color="#2fff7a" size={18} />
              </>
            ) : (
              "Scan"
            )}
          </button>
        </form>
        <hr className="startscan-divider" />
        {scanState.error && (
          <div className="startscan-error">{scanState.error}</div>
        )}
        {scanState.scanId && (
          <div className="startscan-status-section">
            <div className="startscan-status-label">
              {scanState.scanStatus === "running" && (
                <>
                  <span>{scanStatusLabels[scanState.scanStatus]}</span>
                  <div className="startscan-loader">
                    <HashLoader color="#2fff7a" size={32} />
                  </div>
                  <button
                    className="startscan-cancel-btn"
                    onClick={handleCancelScan}
                    disabled={scanState.isCancelling}
                    style={{ marginTop: 18 }}
                  >
                    {scanState.isCancelling ? "Cancelling..." : "Cancel Scan"}
                  </button>
                </>
              )}
              {scanState.scanStatus === "completed" && (
                <>
                  <span>{scanStatusLabels[scanState.scanStatus]}</span>
                  <div className="startscan-summary-alt">
                    <h2>Scan Summary</h2>
                    {scanState.summary && (
                      <div className="summary-bar">
                        <div className="summary-pill org">
                          <FiBriefcase className="pill-icon" />
                          <span className="pill-value">
                            {scanState.summary.orgResults ?? 0}
                          </span>
                          <span className="pill-label">
                            Organization Results
                          </span>
                        </div>
                        <div className="summary-pill user">
                          <FiUsers className="pill-icon" />
                          <span className="pill-value">
                            {scanState.summary.userResults ?? 0}
                          </span>
                          <span className="pill-label">User Results</span>
                        </div>
                      </div>
                    )}
                    <button
                      className="startscan-report-link"
                      onClick={() => navigate(`/scans/${scanState.scanId}`)}
                    >
                      View Full Report
                    </button>
                  </div>
                </>
              )}
              {(scanState.scanStatus === "failed" ||
                scanState.scanStatus === "cancelled") && (
                <span className="startscan-error">
                  {scanStatusLabels[scanState.scanStatus]}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default StartScan;
