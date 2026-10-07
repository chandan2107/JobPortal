const express = require("express");
const https = require("https");
const http = require("http");
const pdfParseModule = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require("../middleware/authMiddleware");
const Application = require("../models/Application");
const Job = require("../models/Job");

const router = express.Router();

const { extractTextFromResumeUrl } = require("./atsHelpers");

const { scoreApplicationATS } = require("../services/atsScoringService");

// POST /api/ats/score/:applicationId
// Employer only — scores a resume against the job description using Gemini
router.post("/score/:applicationId", protect, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can request ATS scores." });
    }

    const scoreData = await scoreApplicationATS(req.params.applicationId);
    res.json(scoreData);
  } catch (err) {
    console.error("ATS Score Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
