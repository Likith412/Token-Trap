import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import HashLoader from "react-spinners/HashLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "../Navbar";
import Footer from "../Footer";
import ScanRow from "../ScanRow";

import "./index.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API Status Constants
const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

// Scan Status Options
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

// Get Status Color
const getStatusColor = (status) => {
  const colors = {
    running: "running",
    completed: "completed",
    failed: "failed",
    cancelled: "cancelled",
  };
  return colors[status] || "cancelled";
};

// Get Vulnerability Count
const getVulnerabilityCount = (scan) => {
  if (!scan.results) return 0;
  const userResults = scan.results.userResults?.length || 0;
  const orgResults = scan.results.orgResults?.length || 0;
  return userResults + orgResults;
};

function Scans() {
  // State
  const [scans, setScans] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  const [filters, setFilters] = useState({
    status: "",
    org: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Input State
  const [orgInput, setOrgInput] = useState("");

  const navigate = useNavigate();

  // Fetch Scans Function
  const fetchScans = async () => {
    try {
      setApiStatus(apiStatusConstants.inProgress);

      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.org) params.append("org", filters.org);
      params.append("page", page);
      params.append("limit", limit);

      const response = await fetch(`/api/scans?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("jwtToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch scans");
      }

      const data = await response.json();

      setScans(data.scans);
      setTotalCount(data.total);
      setApiStatus(apiStatusConstants.success);
    } catch (err) {
      setApiStatus(apiStatusConstants.failure);
      console.error("Error fetching scans:", err);
    }
  };

  // Handle Delete Scan
  const handleDelete = async (scanId) => {
    try {
      const response = await fetch(`/api/scans/${scanId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwtToken")}`,
        },
      });

      if (response.ok) {
        // Remove the deleted scan from the state
        setScans((prevScans) =>
          prevScans.filter((scan) => scan._id !== scanId)
        );
        toast.success("Scan deleted successfully");
        fetchScans();
      } else {
        toast.error("Failed to delete scan");
      }
    } catch {
      toast.error("Error deleting scan");
    }
  };

  // Add this function inside Scans component
  const cancelScan = async (scanId) => {
    try {
      const response = await fetch(`/api/scans/${scanId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwtToken")}`,
        },
      });
      if (response.ok) {
        // Update the scan status in state
        setScans((prevScans) =>
          prevScans.map((scan) =>
            scan._id === scanId ? { ...scan, status: "cancelled" } : scan
          )
        );
        // No toast for successful cancellation
      } else {
        toast.error("Failed to cancel scan");
      }
    } catch {
      toast.error("Error cancelling scan");
    }
  };

  useEffect(() => {
    fetchScans();
  }, [filters, page]);

  // Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Pagination controls
  const totalPages = Math.ceil(totalCount / limit);
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.org]);

  const renderNoScans = () => {
    return (
      <div className="scans-empty-container">
        <h1 className="scans-empty-heading">No Scans Found</h1>
        <p className="scans-empty-text">
          {filters.status || filters.org
            ? "No scans match your current filters. Try adjusting your search criteria."
            : "Start by running a new scan to detect vulnerabilities."}
        </p>
      </div>
    );
  };

  const renderSuccessView = () => {
    if (scans.length === 0) {
      return renderNoScans();
    }

    return (
      <>
        <div className="scans-table">
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Status</th>
                <th>Threats</th>
                <th>End Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <ScanRow
                  key={scan._id}
                  scan={scan}
                  onDelete={handleDelete}
                  onCancel={cancelScan}
                  onNavigate={(id) => navigate(`/scans/${id}`)}
                  getStatusColor={getStatusColor}
                  getVulnerabilityCount={getVulnerabilityCount}
                />
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls aligned right, outside the table */}
        <div className="pagination-wrapper">
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={page === 1}>
              &laquo; Prev
            </button>
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx + 1}
                className={page === idx + 1 ? "active" : ""}
                onClick={() => handlePageClick(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={page === totalPages || totalPages === 0}
            >
              Next &raquo;
            </button>
          </div>
        </div>
      </>
    );
  };

  // Render loading view
  const renderLoadingView = () => {
    return (
      <div className="scans-loader-container">
        <HashLoader color="#2fff7a" size={50} />
      </div>
    );
  };

  // Render failure view
  const renderFailureView = () => {
    return (
      <div className="scans-failure-container">
        <h1 className="scans-failure-heading">Oops! Something went wrong</h1>
        <p className="scans-failure-text">
          We are having some trouble fetching the data. Please try again.
        </p>
        <button className="scans-failure-retry-button" onClick={fetchScans}>
          Retry
        </button>
      </div>
    );
  };

  // Render the appropriate view based on API status
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

  return (
    <>
      <Navbar />
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
        limit={1}
      />

      <div className="scans-container">
        <h1 className="scans-heading">Scans</h1>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="org">Organization:</label>
            <input
              type="text"
              id="org"
              name="org"
              value={orgInput}
              onChange={(e) => setOrgInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setFilters((prev) => ({
                    ...prev,
                    org: orgInput,
                  }));
                }
              }}
              placeholder="Search by organization..."
            />
            <div className="button-group">
              <button
                className="search-btn"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    org: orgInput,
                  }))
                }
              >
                Search
              </button>
              <button
                className="clear-btn"
                onClick={() => {
                  setOrgInput("");
                  setFilters((prev) => ({
                    ...prev,
                    org: "",
                  }));
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {renderView()}
      </div>
      <Footer />
    </>
  );
}

export default Scans;
