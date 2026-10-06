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

// POST /api/ats/score/:applicationId
// Employer only — scores a resume against the job description using Gemini
router.post("/score/:applicationId", protect, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can request ATS scores." });
    }

    const application = await Application.findById(req.params.applicationId)
      .populate("applicant", "name resume")
      .populate("job", "title description requirements");

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // If ATS score has already been generated and saved for this application,
    // return the permanent stored result directly without calling Gemini again.
    if (
      application.atsResult &&
      typeof application.atsResult === "object" &&
      typeof application.atsResult.score === "number" &&
      application.atsResult.summary
    ) {
      console.log(`[ATS] Returning existing saved score (${application.atsResult.score}%) for application ${req.params.applicationId}`);
      return res.json(application.atsResult);
    }

    // Get the best available resume URL (prefer current profile)
    const resumeUrl = [application.applicant?.resume, application.resume]
      .find((u) => u && typeof u === "string" && !u.startsWith("blob:"));

    if (!resumeUrl) {
      return res.status(400).json({ message: "No valid resume found for this applicant." });
    }

    console.log(`[ATS] Scoring application ${req.params.applicationId} with resumeUrl: ${resumeUrl}`);
    const job = application.job;

    // Extract text from PDF
    let resumeText;
    try {
      resumeText = await extractTextFromResumeUrl(resumeUrl);
    } catch (err) {
      console.error("[ATS] Extraction error:", err);
      return res.status(502).json({ message: "Could not read resume PDF. " + err.message });
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ message: "Resume appears to be empty or unreadable." });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return res.status(400).json({ message: "Gemini API key is not configured. Please add GEMINI_API_KEY in backend/.env." });
    }

    // Call Gemini API (with fallback if custom modelName fails)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";

    const prompt = `You are an expert ATS (Applicant Tracking System) resume evaluator.

Analyze the following resume against the job description and requirements, then provide an ATS compatibility score.

---
JOB TITLE: ${job.title}

JOB DESCRIPTION:
${job.description}

JOB REQUIREMENTS:
${job.requirements}

---
RESUME TEXT:
${resumeText.slice(0, 4000)}

---
Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation):
{
  "score": <number from 0 to 100>,
  "label": "<Poor|Fair|Good|Excellent>",
  "summary": "<1-2 sentence summary of the match>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"]
}`;

    let result;
    try {
      console.log(`[ATS] Requesting Gemini with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      result = await model.generateContent(prompt);
    } catch (modelErr) {
      console.warn(`[ATS] Model "${modelName}" failed (${modelErr.message}), falling back to "gemini-3-flash-preview"...`);
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      result = await fallbackModel.generateContent(prompt);
    }

    const rawText = result.response.text().trim();

    // Parse JSON from Gemini response
    let scoreData;
    try {
      const jsonText = rawText.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
      scoreData = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error("[ATS] JSON parse error on Gemini output:", rawText);
      return res.status(500).json({ message: "Failed to parse Gemini response.", raw: rawText });
    }

    if (!scoreData || typeof scoreData.score !== "number" || !scoreData.summary) {
      return res.status(500).json({ message: "Gemini returned invalid response structure.", raw: rawText });
    }

    // Ensure score is clamped between 0 and 100
    scoreData.score = Math.max(0, Math.min(100, Math.round(scoreData.score)));

    // Save ATS Score and result details to database
    application.atsScore = scoreData.score;
    application.atsResult = scoreData;
    await application.save();

    console.log(`[ATS] Successfully scored and saved ${scoreData.score}% for application ${req.params.applicationId}`);
    res.json(scoreData);
  } catch (err) {
    console.error("ATS Score Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
