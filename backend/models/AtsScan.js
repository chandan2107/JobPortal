const mongoose = require("mongoose");

const atsScanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: { type: String, default: "Resume.pdf" },
    jobSnippet: { type: String, default: "" },
    score: { type: Number, required: true },
    label: { type: String, default: "Fair" },
    formatScore: { type: Number },
    formatFeedback: { type: String, default: "" },
    summary: { type: String, default: "" },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    missingSkills: [{ type: String }],
    improvements: [{ type: String }],
    keywordMatch: {
      matched: [{ type: String }],
      missing: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AtsScan", atsScanSchema);
