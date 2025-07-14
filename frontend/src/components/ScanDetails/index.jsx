import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import HashLoader from "react-spinners/HashLoader";
import Navbar from "../Navbar";
import Footer from "../Footer";
import ResultCard from "../ResultCard";
import Cookies from "js-cookie";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiAlertCircle } from "react-icons/fi";

const statusLabels = {
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const statusClass = {
  running: "status-badge running",
  completed: "status-badge completed",
  failed: "status-badge failed",
  cancelled: "status-badge cancelled",
};

const apiStatusConstants = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

function getVulnCount(results) {
  if (!results) return 0;
  const user = results.userResults?.length || 0;
  const org = results.orgResults?.length || 0;
  return user + org;
}

function ScanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  const [error, setError] = useState(null);
  const [showFullCard, setShowFullCard] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchScan() {
      setApiStatus(apiStatusConstants.inProgress);
      setError(null);
      try {
        const res = await fetch(`/api/scans/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("jwtToken")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch scan details");
        const data = await res.json();
        setScan(data.scan);
        setApiStatus(apiStatusConstants.success);
      } catch (err) {
        setError(err.message);
        setApiStatus(apiStatusConstants.failure);
      }
    }
    fetchScan();
  }, [id]);

  // Add delete and cancel handlers
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/scans/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwtToken")}`,
        },
      });
      if (response.ok) {
        navigate("/scans");
      } else {
        toast.error("Failed to delete scan");
      }
    } catch {
      toast.error("Error deleting scan");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelScan = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/scans/${id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwtToken")}`,
        },
      });
      if (response.ok) {
        setScan((prev) => ({ ...prev, status: "cancelled" }));
      } else {
        toast.error("Failed to delete scan");
      }
    } catch {
      toast.error("Error deleting scan");
    } finally {
      setActionLoading(false);
    }
  };

  // Render loading view
  const renderLoadingView = () => (
    <div className="scan-details-loader">
      <HashLoader color="#2fff7a" size={60} />
    </div>
  );

  // Render failure view
  const renderFailureView = () => {
    const notFound = error?.toLowerCase().includes("not found") || !scan;
    return (
      <div className="scan-details-notfound-wrapper">
        <div className="scan-details-notfound-card">
          <FiAlertCircle size={48} className="scan-details-notfound-icon" />
          {notFound ? (
            <>
              <h2 className="scan-details-notfound-title">Scan not found</h2>
              <p className="scan-details-notfound-desc">
                The scan you are looking for does not exist or was deleted.
              </p>
              <button
                className="scan-details-notfound-btn"
                onClick={() => navigate("/scans")}
              >
                Go to Scans
              </button>
            </>
          ) : (
            <>
              <h2
                className="scan-details-notfound-title"
                style={{ color: "var(--color-error)", fontSize: 24 }}
              >
                Failed to load scan details
              </h2>
              <p className="scan-details-notfound-desc">{error}</p>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render success view
  const renderSuccessView = () => {
    const { org, status, createdAt, completedAt, results } = scan;
    const userResults = results?.userResults || [];
    const orgResults = results?.orgResults || [];
    const totalVulns = getVulnCount(results);

    // Analytics: count by detector type
    const detectorCounts = {};
    [...userResults, ...orgResults].forEach((r) => {
      detectorCounts[r.detector] = (detectorCounts[r.detector] || 0) + 1;
    });

    return (
      <>
        <div className="scan-summary-card card-bg">
          <div className="scan-summary-header">
            <h1 className="scan-summary-title">Scan Summary</h1>
            <span className={statusClass[status] || "status-badge"}>
              {statusLabels[status] || status}
            </span>
          </div>
          <div className="scan-summary-grid">
            <div>
              <span className="summary-label">Organization</span>
              <span className="summary-value">{org}</span>
            </div>
            <div>
              <span className="summary-label">Started</span>
              <span className="summary-value">
                {new Date(createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="summary-label">Completed</span>
              <span className="summary-value">
                {completedAt ? new Date(completedAt).toLocaleString() : "-"}
              </span>
            </div>
            <div>
              <span className="summary-label">Total Vulnerabilities</span>
              <span className="summary-value text-accent">{totalVulns}</span>
            </div>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            {scan.status === "running" && (
              <button
                className="cancel-btn"
                onClick={cancelScan}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Cancel"}
              </button>
            )}
            {scan.status !== "running" && (
              <button
                className="delete-btn"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        <div className="scan-results-section">
          <h2 className="results-section-title">
            Organization Results
            <span className="results-count-badge">{orgResults.length}</span>
          </h2>
          <div className="results-grid">
            {orgResults.length === 0 ? (
              <div className="results-empty">
                No organization vulnerabilities found.
              </div>
            ) : (
              orgResults.map((result, index) => (
                <ResultCard
                  key={index}
                  result={result}
                  showFullCard={showFullCard}
                  setShowFullCard={setShowFullCard}
                />
              ))
            )}
          </div>

          <h2 className="results-section-title">
            User Results
            <span className="results-count-badge">{userResults.length}</span>
          </h2>
          <div className="results-grid">
            {userResults.length === 0 ? (
              <div className="results-empty">
                No user vulnerabilities found.
              </div>
            ) : (
              userResults.map((result, index) => (
                <ResultCard
                  key={index}
                  result={result}
                  showFullCard={showFullCard}
                  setShowFullCard={setShowFullCard}
                />
              ))
            )}
          </div>
        </div>
      </>
    );
  };

  // Main render switch
  const renderView = () => {
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return renderLoadingView();
      case apiStatusConstants.failure:
        return renderFailureView();
      case apiStatusConstants.success:
        return renderSuccessView();
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="scan-details-container">
        <ToastContainer
          position="bottom-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {renderView()}
      </div>
      <Footer />
    </>
  );
}

export default ScanDetails;
