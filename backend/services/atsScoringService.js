const https = require("https");
const http = require("http");
const pdfParseModule = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Application = require("../models/Application");

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

// Helper: fetch PDF from Cloudinary / direct URL and extract text
const extractTextFromResumeUrl = (resumeUrl) => {
  return new Promise((resolve, reject) => {
    const targetUrl = resumeUrl.includes("cloudinary.com")
      ? `http://localhost:${process.env.PORT || 8000}/api/auth/proxy-resume?url=${encodeURIComponent(resumeUrl)}`
      : resumeUrl;

    const client = targetUrl.startsWith("https") ? https : http;

    client.get(targetUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(extractTextFromResumeUrl(res.headers.location));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch resume: HTTP ${res.statusCode}`));
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const extractedText = await parsePdfBuffer(buffer);
          resolve(extractedText.trim());
        } catch (err) {
          reject(new Error("Failed to parse PDF: " + err.message));
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
};

/**
 * Score an application using Gemini ATS evaluation and persist to MongoDB
 * @param {string} applicationId - Application MongoDB _id
 * @returns {Promise<Object>} scoreData
 */
const scoreApplicationATS = async (applicationId) => {
  const application = await Application.findById(applicationId)
    .populate("applicant", "name resume")
    .populate("job", "title description requirements");

  if (!application) {
    throw new Error("Application not found.");
  }

  // If already scored, return existing permanent score
  if (
    application.atsResult &&
    typeof application.atsResult === "object" &&
    typeof application.atsResult.score === "number" &&
    application.atsResult.summary
  ) {
    return application.atsResult;
  }

  // Find best available resume URL
  const resumeUrl = [application.applicant?.resume, application.resume]
    .find((u) => u && typeof u === "string" && !u.startsWith("blob:"));

  if (!resumeUrl) {
    throw new Error("No valid resume found for this applicant.");
  }

  const job = application.job;
  if (!job) {
    throw new Error("Job details not found for this application.");
  }

  // Extract text from PDF
  const resumeText = await extractTextFromResumeUrl(resumeUrl);
  if (!resumeText || resumeText.length < 30) {
    throw new Error("Resume appears to be empty or unreadable.");
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const preferredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const modelCandidates = [
    preferredModel,
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];
  const uniqueModels = [...new Set(modelCandidates)];

  const prompt = `You are an expert ATS (Applicant Tracking System) resume evaluator.

Analyze the following resume against the job description and requirements, then provide an ATS compatibility score.

---
JOB TITLE: ${job.title}

JOB DESCRIPTION:
${job.description || "N/A"}

JOB REQUIREMENTS:
${job.requirements || "N/A"}

---
RESUME TEXT:
${resumeText.slice(0, 4000)}

---
Respond ONLY with a valid JSON object in this exact format (no markdown, no code fences, no extra text):
{
  "score": <number from 0 to 100>,
  "label": "<Poor|Fair|Good|Excellent>",
  "summary": "<1-2 sentence summary of the match>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"]
}`;

  let rawText = "";
  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      rawText = result.response.text().trim();
      if (rawText) break;
    } catch (err) {
      console.warn(`[Auto-ATS] Model "${modelName}" failed:`, err.message);
      lastError = err;
    }
  }

  if (!rawText) {
    throw new Error(`All Gemini models failed: ${lastError?.message || "No response"}`);
  }

  // Parse JSON
  const jsonText = rawText.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
  const scoreData = JSON.parse(jsonText);

  if (!scoreData || typeof scoreData.score !== "number" || !scoreData.summary) {
    throw new Error("Invalid response format from AI evaluator.");
  }

  scoreData.score = Math.max(0, Math.min(100, Math.round(scoreData.score)));

  // Save to MongoDB
  application.atsScore = scoreData.score;
  application.atsResult = scoreData;
  await application.save();

  console.log(`⚡ [Auto-ATS] Successfully scored application ${applicationId}: ${scoreData.score}% (${scoreData.label})`);
  return scoreData;
};

module.exports = {
  scoreApplicationATS,
  extractTextFromResumeUrl,
};
