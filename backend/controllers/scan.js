const mongoose = require("mongoose");
const path = require("path");

const { spawn } = require("child_process");
const kill = require("tree-kill");

const Scan = require("../models/scan");
const { collectResults, deleteScanFiles } = require("../utils/scanHelper");
const { sendEmail } = require("../utils/emailSender");
const {
  generateSuccessMailBody,
  generateFailureMailBody,
  generateCancelledMailBody,
} = require("../utils/mailBodyGenerator");

const scanProcesses = new Map();

// Start Scan
async function handleStartScan(req, res) {
  try {
    const { org } = req.body;
    const { _id: currentUserId, email: currentUserEmail } = req.user;

    if (!org) return res.status(400).json({ message: "org is required" });
    if (org.trim().split(" ").length > 1) {
      return res.status(400).json({ error: "Only one org is allowed" });
    }

    // Check if valid org name (github username)
    const githubResponse = await fetch(`https://api.github.com/users/${org}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });

    if (!githubResponse.ok) {
      return res
        .status(404)
        .json({ message: "Invalid GitHub organization or user" });
    }

    // Create scan document
    const scanDoc = await Scan.create({
      org,
      status: "running",
      createdBy: currentUserId,
    });

    // Start the scan process
    const runScriptPath = path.join(__dirname, "../scripts/run-scan.sh");
    const scanProcess = spawn("bash", [runScriptPath, org, scanDoc._id], {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    scanProcesses.set(scanDoc._id.toString(), { process: scanProcess });

    // Scan process is exited
    scanProcess.on("exit", async (code) => {
      const scanId = scanDoc._id.toString();
      const existing = await Scan.findById(scanId);
      // If scan process is already cancelled
      if (existing.status === "cancelled") {
        scanProcesses.delete(scanId);
        await deleteScanFiles(scanId);

        // Send email to user
        const mailBody = generateCancelledMailBody(org);
        await sendEmail(
          currentUserEmail,
          `Scan cancelled for ${org}`,
          mailBody
        );

        return;
      }

      // If scan process is successfully executed
      if (code === 0) {
        const results = await collectResults(scanId);
        await Scan.updateOne(
          { _id: scanId },
          {
            status: "completed",
            results,
            completedAt: new Date(),
          }
        );

        // Send email to user
        const mailBody = generateSuccessMailBody(org, results, scanId);
        await sendEmail(
          currentUserEmail,
          `Scan completed for ${org}`,
          mailBody
        );
      } else {
        await Scan.updateOne(
          { _id: scanId },
          {
            status: "failed",
          }
        );

        // Send email to user
        const mailBody = generateFailureMailBody(org);
        await sendEmail(currentUserEmail, `Scan failed for ${org}`, mailBody);
      }

      scanProcesses.delete(scanId);
      await deleteScanFiles(scanId);
    });

    res.json({ message: "Scan started", scanId: scanDoc._id });
  } catch (_) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Cancel Scan
async function handleCancelScan(req, res) {
  try {
    const { id: scanId } = req.params;
    if (!scanId) return res.status(400).json({ message: "scanId is required" });

    const scanProc = scanProcesses.get(scanId);
    if (!scanProc) {
      return res
        .status(404)
        .json({ message: "No active scan found for this ID" });
    }

    const scanDoc = await Scan.findById(scanId);
    if (!scanDoc) {
      return res.status(404).json({ message: "Scan not found" });
    }

    const { _id: currentUserId } = req.user;
    const isCreator = scanDoc.createdBy.toString() === currentUserId.toString();

    if (!isCreator) {
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this scan" });
    }

    kill(scanProc.process.pid, "SIGTERM", () => {});
    scanProcesses.delete(scanId);

    await Scan.updateOne(
      { _id: scanId },
      { status: "cancelled", cancelledAt: new Date() }
    );

    await deleteScanFiles(scanId);

    res.json({ message: "Scan cancelled" });
  } catch (_) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Fetch all scans with optional filtering and pagination
async function handleFetchScans(req, res) {
  try {
    const { status, org, page = 1, limit = 10 } = req.query;

    const { _id: currentUserId } = req.user;

    const allowedStatuses = ["running", "completed", "failed", "cancelled"];
    const filter = { createdBy: currentUserId };

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      filter.status = status;
    }

    if (org) {
      filter.org = { $regex: new RegExp(org, "i") }; // case-insensitive partial match
    }

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);
    const skip = (pageNum - 1) * limitNum;

    const scans = await Scan.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    const total = await Scan.countDocuments(filter);

    res.status(200).json({
      message: "Scans fetched successfully",
      count: scans.length,
      total,
      page: pageNum,
      limit: limitNum,
      scans,
    });
  } catch (_) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Fetch specific scan by ID
async function handleFetchSpecificScan(req, res) {
  try {
    const { id: scanId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(scanId)) {
      return res.status(404).json({ message: "Scan not found" });
    }

    const scan = await Scan.findById(scanId);
    if (!scan) {
      return res.status(404).json({ message: "Scan not found" });
    }

    const { _id: currentUserId } = req.user;

    const isCreator = scan.createdBy.toString() === currentUserId.toString();

    if (!isCreator) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this scan" });
    }
    return res.status(200).json({ message: "Scan fetched successfully", scan });
  } catch (_) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Fetch scan status by ID
async function handleFetchScanStatus(req, res) {
  try {
    const { id: scanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(scanId)) {
      return res.status(404).json({ message: "Scan not found" });
    }

    const scan = await Scan.findById(scanId, {
      status: 1,
      results: 1,
      createdBy: 1,
    });
    if (!scan) {
      return res.status(404).json({ message: "Scan not found" });
    }

    const { _id: currentUserId } = req.user;

    const isCreator = scan.createdBy.toString() === currentUserId.toString();
    if (!isCreator) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this scan status" });
    }

    // If the scan is currently complete, return its status and summary
    const responseToSend = {
      message: "Scan status fetched successfully",
      status: scan.status,
    };

    if (scan.status === "completed") {
      responseToSend.summary = {
        orgResults: scan.results.orgResults.length,
        userResults: scan.results.userResults.length,
      };
    }

    return res.status(200).json(responseToSend);
  } catch (_) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}
// Delete specific scan by ID
async function handleDeleteSpecificScan(req, res) {
  try {
    const { id: scanId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(scanId)) {
      return res.status(404).json({ message: "Scan not found" });
    }

    const scan = await Scan.findById(scanId);
    if (!scan) {
      return res.status(404).json({ message: "Scan not found" });
    }

    const { _id: currentUserId } = req.user;

    const isCreator = scan.createdBy.toString() === currentUserId.toString();
    if (!isCreator) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this scan" });
    }

    // If the scan is currently running, prevent deletion
    if (scan.status === "running") {
      return res.status(400).json({ message: "Cannot delete a running scan" });
    }

    await Scan.deleteOne({ _id: scanId });

    res.status(200).json({ message: "Scan deleted successfully" });
  } catch (_) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  handleStartScan,
  handleCancelScan,
  handleFetchScans,
  handleFetchSpecificScan,
  handleFetchScanStatus,
  handleDeleteSpecificScan,
};
