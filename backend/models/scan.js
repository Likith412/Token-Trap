const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    org: { type: String, required: true },
    status: {
      type: String,
      enum: ["running", "completed", "failed", "cancelled"],
      default: "running",
    },
    results: {
      type: Object,
      default: {
        userResults: [],
        orgResults: [],
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", scanSchema);
