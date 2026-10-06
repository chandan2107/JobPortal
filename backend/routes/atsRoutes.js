const express = require("express");
const https = require("https");
const http = require("http");
const pdfParseModule = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require("../middleware/authMiddleware");
const Application = require("../models/Application");
const Job = require("../models/Job");

const router = express.Router();

// Helper to parse PDF buffer supporting both pdf-parse v1 and v2
const parsePdfBuffer = async (buffer) => {
  if (typeof pdfParseModule === "function") {
    const data = await pdfParseModule(buffer);
    return typeof data === "string" ? data : data.text || "";
  } else if (pdfParseModule && typeof pdfParseModule.PDFParse === "function") {
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    const result = await parser.getText();
    return typeof result === "string" ? result : result.text || "";
  } else {
    throw new Error("PDF parser module not recognized.");
  }
};

// Helper: fetch PDF from Cloudinary / proxy URL and extract text
const extractTextFromResumeUrl = (resumeUrl) => {
  return new Promise((resolve, reject) => {
    // Try fetching via local proxy first to guarantee clean headers/PDF delivery
    const targetUrl = resumeUrl.includes("cloudinary.com")
      ? `http://localhost:${process.env.PORT || 8000}/api/auth/proxy-resume?url=${encodeURIComponent(resumeUrl)}`
      : resumeUrl;

    console.log("[ATS] Extracting text from:", targetUrl);
    const client = targetUrl.startsWith("https") ? https : http;

    client.get(targetUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(extractTextFromResumeUrl(res.headers.location));
      }

      if (res.statusCode !== 200) {
        console.error(`[ATS] Fetch failed with status ${res.statusCode} for ${targetUrl}`);
        reject(new Error(`Failed to fetch resume: HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          console.log(`[ATS] Downloaded PDF buffer size: ${buffer.length} bytes`);
          const extractedText = await parsePdfBuffer(buffer);
          console.log(`[ATS] Successfully extracted ${extractedText.length} characters of text`);
          resolve(extractedText.trim());
        } catch (err) {
          console.error("[ATS] pdfParse error:", err);
          reject(new Error("Failed to parse PDF: " + err.message));
        }
      });
    }).on("error", (err) => {
      console.error("[ATS] Network error fetching PDF:", err.message);
      reject(err);
    });
  });
};

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
