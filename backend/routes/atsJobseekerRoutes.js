const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require("../middleware/authMiddleware");
const { extractTextFromPdfBuffer } = require("./atsHelpers");
const ragService = require("../services/ragService");

const router = express.Router();

// ─── Multer Setup for PDF uploads ───────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `ats_${Date.now()}_${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."), false);
    }
  },
});

// ─── In-Memory Session Resume Cache (Fallback) ────────────────────────────────
const sessionResumeCache = new Map();
const cleanupOldSessions = () => {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  for (const [key, value] of sessionResumeCache.entries()) {
    if (value.timestamp < twoHoursAgo) {
      sessionResumeCache.delete(key);
    }
  }
};

// ─── Helper: get Gemini model with robust fallback ──────────────────────────
const getGeminiResult = async (prompt) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY in backend/.env.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const modelCandidates = [
    preferredModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-1.5-flash",
  ];

  // Deduplicate candidate models
  const uniqueModels = [...new Set(modelCandidates)];

  let lastError = null;
  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn(`[ATS-Seeker] Model "${modelName}" failed (${err.message}), trying next candidate...`);
      lastError = err;
    }
  }

  throw new Error(`All Gemini models failed: ${lastError?.message || "Unknown error"}`);
};

// ─── POST /api/ats/jobseeker/scan ───────────────────────────────────────────
// Job-seeker uploads a resume PDF + pastes a Job Description to get ATS score.
// Returns: score, label, summary, strengths, weaknesses, missingSkills, improvements
router.post("/jobseeker/scan", protect, upload.single("resume"), async (req, res) => {
  let filePath = null;
  try {
    if (req.user.role !== "jobSeeker") {
      return res.status(403).json({ message: "Only job seekers can use the ATS scanner." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a resume PDF." });
    }

    filePath = req.file.path;
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ message: "Please provide a job description (at least 20 characters)." });
    }

    // Extract text from uploaded PDF (with universal pdf-parse + Gemini OCR fallback)
    const pdfBuffer = fs.readFileSync(filePath);
    let resumeText = await extractTextFromPdfBuffer(pdfBuffer);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: "Resume appears empty or unreadable. Ensure it contains readable text." });
    }

    console.log(`[ATS-Seeker] Scanning resume (${resumeText.length} chars) against JD (${jobDescription.length} chars) for user ${req.user._id}`);

    // ── Build the comprehensive Gemini prompt ──
    const prompt = `You are an expert ATS (Applicant Tracking System) resume evaluator and career coach.

Analyze the following resume against the given job description. Provide a thorough, actionable ATS compatibility analysis.

---
JOB DESCRIPTION:
${jobDescription.slice(0, 5000)}

---
RESUME TEXT:
${resumeText.slice(0, 6000)}

---
Respond ONLY with a valid JSON object in this EXACT format (no markdown, no explanation, no code fences):
{
  "score": <number from 0 to 100>,
  "label": "<Poor|Fair|Good|Excellent>",
  "summary": "<2-3 sentence summary of overall match quality>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>", "<specific weakness 3>"],
  "missingSkills": ["<skill 1 from JD not in resume>", "<skill 2>", "<skill 3>"],
  "improvements": [
    "<actionable improvement suggestion 1>",
    "<actionable improvement suggestion 2>",
    "<actionable improvement suggestion 3>",
    "<actionable improvement suggestion 4>",
    "<actionable improvement suggestion 5>"
  ],
  "keywordMatch": {
    "matched": ["<keyword found in both JD and resume>", "..."],
    "missing": ["<important keyword from JD NOT in resume>", "..."]
  },
  "formatScore": <number from 0 to 100 rating resume formatting/structure>,
  "formatFeedback": "<1-2 sentences about resume formatting quality>"
}`;

    const rawText = await getGeminiResult(prompt);

    // Parse JSON from Gemini response
    let scoreData;
    try {
      const jsonText = rawText.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
      scoreData = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error("[ATS-Seeker] JSON parse error:", rawText.slice(0, 500));
      return res.status(500).json({ message: "Failed to parse AI response. Please try again.", raw: rawText.slice(0, 500) });
    }

    if (!scoreData || typeof scoreData.score !== "number" || !scoreData.summary) {
      return res.status(500).json({ message: "AI returned an invalid response structure. Please try again." });
    }

    // Clamp score
    scoreData.score = Math.max(0, Math.min(100, Math.round(scoreData.score)));
    if (scoreData.formatScore != null) {
      scoreData.formatScore = Math.max(0, Math.min(100, Math.round(scoreData.formatScore)));
    }

    // ── Index resume into Qdrant Vector DB for RAG chatbot (Awaited for immediate retrieval) ──
    const sessionId = `ats_session_${req.user._id}_${Date.now()}`;
    let chunksIndexed = 0;
    try {
      chunksIndexed = await ragService.indexResume({
        resumeText,
        applicationId: sessionId,
        jobId: "ats_scan",
        userId: req.user._id.toString(),
        applicantName: req.user.name || "Job Seeker",
      });
      console.log(`[ATS-Seeker] Successfully indexed ${chunksIndexed} resume chunks in Qdrant for session ${sessionId}`);
    } catch (idxErr) {
      console.warn("[ATS-Seeker] Qdrant resume indexing warning (using session cache fallback):", idxErr.message);
    }

    // Save into memory cache as reliable backup for the session
    sessionResumeCache.set(sessionId, {
      userId: req.user._id.toString(),
      resumeText,
      jobDescription,
      timestamp: Date.now(),
    });
    cleanupOldSessions();

    // Return the result with the session ID for chatbot use
    res.json({
      ...scoreData,
      sessionId,
      resumeTextLength: resumeText.length,
      ragIndexed: chunksIndexed > 0,
    });
  } catch (err) {
    console.error("[ATS-Seeker] Scan error:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    // Clean up the uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// ─── POST /api/ats/jobseeker/chat ───────────────────────────────────────────
// RAG-powered chatbot: retrieves resume context from Qdrant vector database,
// then generates answers using Gemini based on the uploaded resume and job description.
// Body: { message: string, sessionId: string, jobDescription?: string, history?: array }
router.post("/jobseeker/chat", protect, async (req, res) => {
  try {
    if (req.user.role !== "jobSeeker") {
      return res.status(403).json({ message: "Only job seekers can use the resume chatbot." });
    }

    const { message, sessionId, jobDescription, history } = req.body;

    if (!message || typeof message !== "string" || message.trim().length < 2) {
      return res.status(400).json({ message: "Please provide a message." });
    }

    // ── Step 1: RAG Retrieval from Qdrant Vector Database ──
    let ragChunks = [];
    try {
      // 1. Semantic vector search for the specific query
      ragChunks = await ragService.searchResumes({
        query: message.trim(),
        filter: {
          ...(sessionId ? { applicationId: sessionId } : { userId: req.user._id.toString() }),
        },
        limit: 5,
      });

      // 2. If vector search returned 0 chunks (e.g. conversational greetings or broad prompts),
      // scroll the candidate's indexed resume chunks from Qdrant
      if (!ragChunks || ragChunks.length === 0) {
        console.log(`[ATS-Chat] Semantic search returned 0 chunks for "${message.slice(0, 30)}", scrolling Qdrant chunks for ${sessionId || req.user._id}...`);
        const allChunks = await ragService.getResumeChunks({
          applicationId: sessionId,
          userId: req.user._id.toString(),
          limit: 10,
        });
        if (allChunks.length > 0) {
          ragChunks = allChunks.map((c) => ({
            score: 1.0,
            chunkText: c.chunkText,
            payload: c.payload,
          }));
        }
      }

      console.log(`[ATS-Chat] Retrieved ${ragChunks.length} chunks from Qdrant vector database`);
    } catch (ragErr) {
      console.warn("[ATS-Chat] Qdrant search encountered error, attempting scroll fallback:", ragErr.message);
      try {
        const allChunks = await ragService.getResumeChunks({
          applicationId: sessionId,
          userId: req.user._id.toString(),
          limit: 10,
        });
        if (allChunks.length > 0) {
          ragChunks = allChunks.map((c) => ({ score: 1.0, chunkText: c.chunkText, payload: c.payload }));
        }
      } catch (_) {}
    }

    // Format RAG context from Qdrant chunks
    let ragContext = "";
    if (ragChunks.length > 0) {
      ragContext = ragChunks
        .map((r, i) => `[Resume Excerpt ${i + 1}]\n${r.chunkText}`)
        .join("\n\n");
    } else if (sessionId && sessionResumeCache.has(sessionId)) {
      // Secondary fallback to session cache if Qdrant was empty
      const cached = sessionResumeCache.get(sessionId);
      ragContext = `[Uploaded Resume Text]\n${cached.resumeText.slice(0, 4500)}`;
      console.log(`[ATS-Chat] Using session cached resume text for ${sessionId}`);
    }

    const effectiveJobDescription =
      jobDescription ||
      (sessionId && sessionResumeCache.get(sessionId)?.jobDescription) ||
      "";

    // ── Step 2: Build conversation context ──
    const conversationHistory = (history || [])
      .slice(-8)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    // ── Step 3: Generate response with Gemini ──
    const prompt = `You are an expert AI Resume Assistant and ATS Career Coach. The job seeker has ALREADY uploaded their resume and submitted the target job description for ATS analysis.

CRITICAL INSTRUCTIONS:
1. The user's resume has ALREADY been uploaded and indexed in the RAG vector database (Qdrant). Excerpts are provided below.
2. NEVER ask the user to upload a resume, never ask them to paste their resume, and never say you don't have their resume. You ALREADY have their resume data right in front of you.
3. Base all your responses, answers, feedback, and advice directly on the retrieved resume data and the target job description provided below.
4. When asked about skills, strengths, experience, or qualifications, extract and cite specific details from the candidate's resume excerpts.
5. If the user sends a greeting or general question (e.g. "hi", "how can I improve?", "what should I change?"), proactively provide a concise, structured assessment of their uploaded resume against the job description with clear bullet points.
6. Format your answer with clean markdown (bold, bullet points, numbered lists).

--- TARGET JOB DESCRIPTION ---
${effectiveJobDescription ? effectiveJobDescription.slice(0, 3000) : "Target job description provided during ATS scan."}

--- RETRIEVED RESUME DATA (From Qdrant Vector Database) ---
${ragContext || "Candidate's resume has been uploaded for this session. Use the job description requirements to guide ATS optimization."}

${conversationHistory ? `--- CONVERSATION HISTORY ---\n${conversationHistory}\n---` : ""}

USER'S CURRENT QUESTION: ${message}

Your response:`;

    const responseText = await getGeminiResult(prompt);

    res.json({
      reply: responseText,
      ragChunksUsed: ragChunks.length,
      ragExcerpts: ragChunks.map((c, i) => ({
        index: i + 1,
        relevance: c.score ? Math.round(c.score * 100) : null,
        text: c.chunkText,
      })),
    });
  } catch (err) {
    console.error("[ATS-Chat] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
