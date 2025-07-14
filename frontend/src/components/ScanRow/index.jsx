import React, { useState } from "react";
import "./index.css";

const ScanRow = ({
  scan,
  onDelete,
  onCancel,
  onNavigate,
  getStatusColor,
  getVulnerabilityCount,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(scan._id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    setIsCancelling(true);
    try {
      await onCancel(scan._id);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <tr
      className="scan-row"
      onClick={(e) => {
        if (e.target.closest(".delete-btn")) return;
        onNavigate(scan._id);
      }}
      style={{ cursor: "pointer" }}
    >
      <td>{scan.org}</td>
      <td>
        <span className={`status-badge ${getStatusColor(scan.status)}`}>
          {scan.status}
        </span>
      </td>
      <td>{scan.status === "completed" ? getVulnerabilityCount(scan) : "-"}</td>
      <td>
        {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : "-"}
      </td>
      <td>
        {scan.status === "running" ? (
          <button
            className="cancel-btn"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </button>
        ) : (
          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </td>
    </tr>
  );
};

export default ScanRow;
