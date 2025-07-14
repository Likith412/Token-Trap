const express = require("express");
const {
  handleStartScan,
  handleFetchScans,
  handleFetchSpecificScan,
  handleFetchScanStatus,
  handleDeleteSpecificScan,
  handleCancelScan,
} = require("../controllers/scan");

const router = express.Router();

router.route("/").get(handleFetchScans).post(handleStartScan);
router.route("/:id/status").get(handleFetchScanStatus);
router
  .route("/:id")
  .get(handleFetchSpecificScan)
  .delete(handleDeleteSpecificScan);

router.route("/:id/cancel").put(handleCancelScan);

module.exports = router;
