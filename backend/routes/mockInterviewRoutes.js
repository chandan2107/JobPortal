const express = require("express");
const router = express.Router();
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require("../middleware/authMiddleware");
const { extractTextFromPdfBuffer } = require("./atsHelpers");
const MockInterview = require("../models/MockInterview");
const Resume = require("../models/Resume");
const Job = require("../models/Job");
const { generatePdfFromHtml } = require("../services/pdfService");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."), false);
    }
  },
});

// ─── Helper: Gemini Caller with Multi-Model Fallback ─────────────────────────
const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not configured in backend/.env.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const modelCandidates = [
    preferredModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-latest",
  ];
  const uniqueModels = [...new Set(modelCandidates)];

  let lastError = null;
  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      console.warn(`[MockInterview-Gemini] Model "${modelName}" failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`All Gemini models failed: ${lastError?.message || "No response"}`);
};

// ─── Format Resume into Text ────────────────────────────────────────────────
const formatResumeContext = (resume) => {
  if (!resume) return "";
  const parts = [];
  if (resume.personalInfo?.fullName) parts.push(`Candidate: ${resume.personalInfo.fullName}`);
  if (resume.personalInfo?.jobTitle) parts.push(`Current Title: ${resume.personalInfo.jobTitle}`);
  if (resume.summary) parts.push(`Professional Summary:\n${resume.summary}`);
  if (resume.skills && resume.skills.length > 0) parts.push(`Skills:\n${resume.skills.join(", ")}`);

  if (resume.experience && resume.experience.length > 0) {
    const expText = resume.experience
      .map(
        (e) =>
          `- ${e.title} at ${e.company} (${e.startDate || ""} - ${e.current ? "Present" : e.endDate || ""}): ${e.description || ""}`
      )
      .join("\n");
    parts.push(`Work Experience:\n${expText}`);
  }

  if (resume.projects && resume.projects.length > 0) {
    const projText = resume.projects
      .map(
        (p) =>
          `- ${p.name || p.title}: ${p.description || ""} (Tech: ${p.technologies || p.techStack || ""})`
      )
      .join("\n");
    parts.push(`Projects:\n${projText}`);
  }

  if (resume.education && resume.education.length > 0) {
    const eduText = resume.education
      .map((ed) => `- ${ed.degree} from ${ed.school} (${ed.startDate || ""} - ${ed.endDate || ""})`)
      .join("\n");
    parts.push(`Education:\n${eduText}`);
  }

  return parts.join("\n\n");
};

// ─── System Prompt Builder for Real Voice Interviewer ───────────────────────
const buildInterviewSystemPrompt = ({
  interviewerName = "Alex",
  role = "Full Stack Developer",
  difficulty = "fresher",
  interviewType = "mixed",
  questionCount = 5,
  mode = "quick",
  resumeContext = "",
  jobContext = "",
}) => {
  const difficultyGuidance = {
    fresher:
      "Assess fundamental principles, algorithmic thinking, basic system building blocks, and learning enthusiasm. Keep feedback constructive and supportive.",
    mid:
      "Assess hands-on software development, database query optimization, REST/GraphQL design, state management, debugging, and practical engineering trade-offs.",
    senior:
      "Assess distributed architecture, high-scale scalability, resiliency, concurrency, cloud infrastructure, team leadership, and complex technical trade-offs.",
  }[difficulty] || "Assess core technical competence, problem-solving, and practical development skills.";

  const typeGuidance = {
    technical:
      `Focus heavily on deep technical engineering, architecture, coding patterns, stack-specific mechanics, performance, and debugging for ${role}.`,
    behavioral:
      "Focus on leadership, handling tough deadlines, navigating ambiguity, conflict resolution, and teamwork using the STAR method.",
    mixed:
      `Maintain a balanced blend: approximately 70% deep technical competencies for ${role} and 30% communication and problem-solving agility.`,
  }[interviewType] || "Evaluate both technical mastery and engineering communication.";

  let contextBlock = "";
  if (mode === "job" && jobContext) {
    contextBlock = `TARGET JOB POSTING SPECIFICATION:\n${jobContext}\nTailor your questions directly to the technologies, requirements, and responsibilities described in this job description.`;
  } else if (mode === "resume" && resumeContext) {
    contextBlock = `CANDIDATE'S VERIFIED RESUME BACKGROUND:\n${resumeContext}

RESUME + ROLE ALIGNMENT INSTRUCTIONS:
- Conduct this like a real hiring interview for "${role}" using the candidate's resume above.
- If their resume aligns with "${role}", ask specific questions connecting their real projects, listed tools, technologies, and achievements to "${role}" responsibilities.
- If "${role}" is significantly different from their resume background (different tech stack or domain), act like a real interviewer: politely point out that their resume focuses on a different area, ask why they are transitioning to "${role}" and what transferable skills or preparation they have, and then evaluate them realistically with role-appropriate questions for "${role}".`;
  }

  return `You are ${interviewerName}, an expert, seasoned engineering hiring manager conducting an official, real-time voice mock interview for the position of "${role}".

INTERVIEW PROFILE:
- Target Role: ${role}
- Difficulty Level: ${difficulty.toUpperCase()} (${difficultyGuidance})
- Round Focus: ${typeGuidance}
- Total Questions Target: Exactly ${questionCount} questions across this session.

${contextBlock ? `${contextBlock}\n` : ""}

CRITICAL CONVERSATIONAL & ACTIVE LISTENING RULES:

1. ACTIVE LISTENING & RESPONSE DECISION RULES (NO EXPLAINING ANSWERS):
- NEVER explain, teach, correct, or give away the answer to any interview question—even if the candidate gives an incorrect answer, an incomplete answer, or says "I don't know". You are an interviewer evaluating them, not a tutor.
- NEVER parrot, repeat, or regurgitate the candidate's exact words back to them. (For example, NEVER say: "Understood, you are a fullstack developer with React and Node.js. Next question...").
- After each candidate response, decide your next step based on their answer:
  * If the answer is incomplete, ask a targeted follow-up question to probe for the missing details.
  * If the answer is strong, ask a deeper question on edge cases, trade-offs, or internals.
  * If the answer is correct, give a small, natural acknowledgment (e.g., "That makes sense." or "Good point.") without lecturing.
  * If the answer is sufficient, move directly to the next topic.

2. CONTEXTUAL & ROLE-SPECIFIC QUESTIONS:
- Formulate each question naturally based on what the candidate just explained and the target role (${role}).
  * For fullstack roles, probe both ends of the stack: frontend UI/state/performance (e.g., React, DOM rendering, async fetching) and backend architecture (e.g., Node.js APIs, database indexing, caching, authentication, error boundaries).
- Ask only ONE clear, focused question per turn. Never combine multiple complex questions together.

3. VOCAL CADENCE & DELIBERATE PACING:
- Speak in a calm, relaxed, measured, and unhurried manner. Imagine you are having a thoughtful 1-on-1 engineering dialogue in a quiet conference room.
- Use natural punctuation (commas and periods) to create clear, comfortable pauses. This ensures the voice synthesizer sounds relaxed and easy to understand.
- Keep each spoken turn to 2 to 3 natural conversational sentences (under 40 words total).
- NEVER output markdown formatting, bullet points, asterisks (*), hashtags (#), or emojis—this is pure spoken audio over a live telephone-style call.

4. INTERVIEW PROGRESSION & CLOSING:
- You are asking Question 1 in your opening message.
- Keep track of the number of questions asked.
- After the candidate completes answering Question #${questionCount}, conclude warmly by saying:
  "Thank you very much for your time and thoughtful responses today. That concludes our interview session! You can now click End Interview to view your full performance report and detailed scorecard. Best of luck!"
- After that final closing statement, do not ask any further questions and do not continue speaking.

5. PATIENT TURN-TAKING & PAUSE TOLERANCE:
- Technical candidates often pause for several seconds (5 to 6 seconds) to mentally structure their thoughts, consider algorithmic complexity, or remember architecture specifics.
- Be exceptionally patient. Do NOT interpret a brief pause or breath as the end of their answer. Allow them the full silence to finish their thought before replying.`;
};

// Common technical vocabulary strictly matching Vapi's keyword format ('word' or 'word:number')
const TECH_VOCABULARY_KEYWORDS = [
  "fullstack:4",
  "frontend:3",
  "backend:3",
  "developer:2",
  "engineer:2",
  "JavaScript:3",
  "TypeScript:3",
  "React:3",
  "Nodejs:3",
  "Node:3",
  "Express:2",
  "MongoDB:3",
  "PostgreSQL:3",
  "Postgres:3",
  "SQL:2",
  "NoSQL:2",
  "Nextjs:3",
  "Redux:2",
  "Tailwind:2",
  "HTML:2",
  "CSS:2",
  "API:3",
  "APIs:3",
  "REST:3",
  "RESTful:3",
  "GraphQL:3",
  "Docker:2",
  "Kubernetes:2",
  "AWS:2",
  "Cloud:2",
  "CICD:2",
  "Git:2",
  "GitHub:2",
  "microservices:2",
  "DevOps:2",
  "architecture:2",
  "caching:2",
  "Redis:2",
  "database:2",
  "debugging:2",
  "refactoring:2",
  "async:2",
  "await:2",
  "middleware:2",
  "authentication:2",
  "JWT:2",
];

// Multi-word keyterm phrases supported on Deepgram Nova-3
const TECH_VOCABULARY_KEYTERMS = [
  "full stack",
  "full-stack",
  "full stack developer",
  "fullstack developer",
  "frontend developer",
  "backend developer",
  "Node.js",
  "Next.js",
  "CI/CD",
  "REST API",
  "RESTful API",
  "system design",
  "unit testing",
];

// ─── 1. GET /api/mock-interview/config ───────────────────────────────────────
router.get("/config", protect, (req, res) => {
  try {
    const vapiPublicKey =
      process.env.VAPI_PUBLIC_KEY || process.env.VITE_VAPI_PUBLIC_KEY || "";
    res.json({
      success: true,
      vapiPublicKey,
      hasKey: Boolean(vapiPublicKey),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── 1b. POST /api/mock-interview/upload-resume ───────────────────────────────
router.post("/upload-resume", protect, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF resume." });
    }
    const resumeText = await extractTextFromPdfBuffer(req.file.buffer);
    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(400).json({ message: "Could not read text from the uploaded PDF." });
    }
    res.json({
      success: true,
      fileName: req.file.originalname || "Uploaded_Resume.pdf",
      resumeText: resumeText.slice(0, 6000),
    });
  } catch (error) {
    console.error("[MockInterview] upload-resume error:", error);
    res.status(500).json({ message: error.message || "Failed to process uploaded resume." });
  }
});

// ─── 2. POST /api/mock-interview/start ──────────────────────────────────────
router.post("/start", protect, async (req, res) => {
  try {
    const {
      mode = "quick",
      role = "Software Developer",
      difficulty = "fresher",
      interviewType = "mixed",
      questionCount = 5,
      voiceId = "orpheus",
      voiceSpeed = 0.88,
      pauseBuffer = 5.5,
      resumeId,
      useProfileResume = false,
      uploadedResumeText = "",
      jobId,
    } = req.body;

    const parsedQuestionCount = Math.min(10, Math.max(3, parseInt(questionCount, 10) || 5));
    const parsedSpeed = Math.max(0.7, Math.min(1.2, parseFloat(voiceSpeed) || 0.88));
    // Generous pause buffer: allows candidate 5-6 seconds of silence to think without getting cut off
    const parsedPauseBuffer = Math.max(2.0, Math.min(10.0, parseFloat(pauseBuffer) || 5.5));

    // Determine Interviewer Name based on voice choice
    let interviewerName = "Alex";
    if (voiceId === "luna") interviewerName = "Sarah";
    if (voiceId === "asteria") interviewerName = "Asteria";

    let resumeContext = "";
    let jobContext = "";
    let companyName = "";
    let jobTitle = role;

    // Load Resume Context if mode === "resume" or resumeId/useProfileResume/uploadedResumeText provided
    const isProfileResume = Boolean(useProfileResume || resumeId === "profile");
    if (uploadedResumeText && typeof uploadedResumeText === "string" && uploadedResumeText.trim()) {
      resumeContext = `Uploaded Resume Content:\n${uploadedResumeText.trim().slice(0, 4000)}`;
    } else if (isProfileResume && req.user) {
      const parts = [];
      if (req.user.name) parts.push(`Candidate: ${req.user.name}`);
      if (req.user.jobTitle || req.user.resumeHeadline) {
        parts.push(`Headline: ${req.user.jobTitle || req.user.resumeHeadline}`);
      }
      if (req.user.bio) parts.push(`Summary: ${req.user.bio}`);
      const combinedSkills = [
        ...(Array.isArray(req.user.skills) ? req.user.skills : []),
        ...(Array.isArray(req.user.resumeSkills) ? req.user.resumeSkills : []),
      ];
      if (combinedSkills.length > 0) {
        parts.push(`Skills: ${[...new Set(combinedSkills)].join(", ")}`);
      }
      if (req.user.resumeExtractedText) {
        parts.push(`Uploaded Resume Content:\n${req.user.resumeExtractedText.slice(0, 3500)}`);
      }
      resumeContext = parts.join("\n\n");
    } else if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (resume) {
        resumeContext = formatResumeContext(resume);
      }
    }

    // Load Job Context if mode === "job" or jobId provided
    if (jobId) {
      const job = await Job.findById(jobId).populate("company", "name companyName");
      if (job) {
        jobTitle = job.title;
        companyName = job.company?.companyName || job.company?.name || "Company";
        jobContext = `Role: ${job.title}\nCompany: ${companyName}\nLocation: ${job.location || "Remote"}\nType: ${job.type}\n\nDescription:\n${job.description}\n\nRequirements:\n${job.requirements}`;
      }
    }

    // Generate Contextual, Active-Listening System Prompt
    const systemPrompt = buildInterviewSystemPrompt({
      interviewerName,
      role: jobTitle || role,
      difficulty,
      interviewType,
      questionCount: parsedQuestionCount,
      mode,
      resumeContext,
      jobContext,
    });

    const firstMessage = `Hi there! I'm ${interviewerName}, your technical interviewer for the ${jobTitle || role} position today. It is great to speak with you! Whenever you are ready, let's begin with our first question: Could you please introduce yourself, and walk me through your background and what excites you about this role?`;

    // Create the session in MongoDB
    const session = await MockInterview.create({
      user: req.user._id,
      mode,
      role: jobTitle || role,
      difficulty,
      interviewType,
      questionCount: parsedQuestionCount,
      voiceId,
      voiceSpeed: parsedSpeed,
      pauseBuffer: parsedPauseBuffer,
      interviewerName,
      resumeId: resumeId && resumeId !== "profile" ? resumeId : null,
      jobId: jobId || null,
      resumeContext,
      jobContext,
      status: "in-progress",
    });

    // Provide the optimized assistant configuration for Vapi Web SDK
    const vapiAssistant = {
      name: `Mock Interviewer - ${jobTitle || role}`,
      firstMessage,
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
        temperature: 0.6,
      },
      voice: {
        provider: "deepgram",
        voiceId: voiceId || "orpheus",
        model: "aura-2",
        speed: parsedSpeed, // Calm, deliberate pace (resolves fast talking)
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-3",
        language: "en-US",
        endpointing: 500, // Maximum streaming silence tolerance (500ms) for speech chunks
        smartFormat: true,
        keywords: TECH_VOCABULARY_KEYWORDS,
        keyterm: TECH_VOCABULARY_KEYTERMS,
      },
      // Pacing & Turn-taking: Allow candidate a 5-6s gap so natural pauses are never mistaken for end of answer
      startSpeakingPlan: {
        waitSeconds: Math.min(5.0, parsedPauseBuffer),
        customEndpointingRules: [
          {
            type: "assistant",
            regex: ".*",
            timeoutSeconds: parsedPauseBuffer,
          },
          {
            type: "customer",
            regex: ".*",
            timeoutSeconds: parsedPauseBuffer,
          },
        ],
        transcriptionEndpointingPlan: {
          onPunctuationSeconds: Math.min(3.0, parsedPauseBuffer),
          onNoPunctuationSeconds: Math.min(3.0, parsedPauseBuffer),
          onNumberSeconds: Math.min(3.0, parsedPauseBuffer),
        },
      },
      stopSpeakingPlan: {
        numWords: 1,
        voiceSeconds: 0.2,
        backoffSeconds: 1.0,
      },
      backgroundSpeechDenoisingPlan: {
        smartDenoisingPlan: {
          enabled: true,
        },
      },
      endCallMessage: "Thank you for the interview. Goodbye!",
      recordingEnabled: false,
    };

    res.status(201).json({
      success: true,
      interviewId: session._id,
      session,
      vapiAssistant,
      vapiPublicKey: process.env.VAPI_PUBLIC_KEY || process.env.VITE_VAPI_PUBLIC_KEY || "",
    });
  } catch (error) {
    console.error("[MockInterview] Error in /start:", error);
    res.status(500).json({ message: error.message || "Failed to start mock interview." });
  }
});

// ─── 3. POST /api/mock-interview/:id/save-transcript ─────────────────────────
router.post("/:id/save-transcript", protect, async (req, res) => {
  try {
    const { transcript = [], duration = 0, vapiCallId } = req.body;

    const session = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    if (Array.isArray(transcript) && transcript.length > 0) {
      session.transcript = transcript.map((item) => ({
        role: item.role === "assistant" || item.role === "ai" ? "ai" : "user",
        text: item.text || item.message || "",
        timestamp: item.timestamp || 0,
      }));
    }

    const computedDuration =
      Number(duration) ||
      (Array.isArray(transcript) && transcript.length > 0
        ? Math.max(...transcript.map((t) => Number(t.timestamp) || 0))
        : 0);
    if (computedDuration) session.duration = computedDuration;
    if (vapiCallId) session.vapiCallId = vapiCallId;

    await session.save();

    res.json({ success: true, message: "Transcript saved successfully.", session });
  } catch (error) {
    console.error("[MockInterview] Error saving transcript:", error);
    res.status(500).json({ message: error.message });
  }
});

// ─── 4. POST /api/mock-interview/:id/generate-report ─────────────────────────
router.post("/:id/generate-report", protect, async (req, res) => {
  try {
    const session = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    // Check if report already exists and transcript hasn't changed
    if (session.report && session.report.overallScore > 0 && session.status === "completed") {
      return res.json({ success: true, session });
    }

    const transcript = session.transcript || [];
    if (transcript.length === 0) {
      return res.status(400).json({
        message: "No transcript available to generate a report for this interview.",
      });
    }

    // Format transcript into a readable conversation
    const formattedDialogue = transcript
      .map((entry) => `${entry.role.toUpperCase()}: ${entry.text}`)
      .join("\n\n");

    const prompt = `You are a world-class senior technical interviewer, career coach, and executive hiring manager.
Analyze the following mock interview transcript and evaluate the candidate's performance thoroughly and constructively.

ROLE BEING INTERVIEWED FOR: ${session.role}
TARGET DIFFICULTY LEVEL: ${session.difficulty}
INTERVIEW TYPE: ${session.interviewType}
${session.jobContext ? `JOB SPECIFICATION:\n${session.jobContext.slice(0, 1000)}\n` : ""}

FULL INTERVIEW TRANSCRIPT:
${formattedDialogue.slice(0, 7000)}

---
Carefully analyze:
1. Technical accuracy and domain mastery.
2. Communication clarity, conciseness, and articulation (structure of answers, e.g., STAR technique).
3. Confidence, tone, and poise.
4. Problem-solving approach and critical thinking.
5. Specific questions asked by the AI and how well the candidate responded to each.

Return ONLY a valid JSON object matching this exact schema (no markdown formatting, no code fences, no extra text):
{
  "overallScore": <integer 0-100>,
  "readinessLevel": "<'Interview Ready' | 'Nearly Ready' | 'Needs Practice' | 'Foundational Gaps'>",
  "summary": "<2-3 sentences summarizing performance, professionalism, and potential>",
  "strengths": [
    "<specific highlight with example from conversation>",
    "<specific highlight>",
    "<specific highlight>"
  ],
  "weaknesses": [
    "<specific area where candidate struggled or was incomplete>",
    "<specific area>",
    "<specific area>"
  ],
  "improvements": [
    "<actionable tip on how to answer better next time>",
    "<actionable tip on technology or concept to review>",
    "<actionable tip on delivery/communication>"
  ],
  "skillBreakdown": {
    "technicalAccuracy": <integer 0-100>,
    "communication": <integer 0-100>,
    "confidence": <integer 0-100>,
    "problemSolving": <integer 0-100>
  },
  "questionAnalysis": [
    {
      "question": "<the question asked by AI>",
      "answer": "<summary or quote of candidate's answer>",
      "score": <integer 0-10>,
      "feedback": "<detailed feedback on what was good and what was missing>",
      "idealAnswer": "<a concise, high-impact model answer candidate could have given>"
    }
  ]
}`;

    const rawResponse = await callGemini(prompt);
    const cleanedJson = rawResponse.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();

    let reportData;
    try {
      reportData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("[MockInterview] Failed to parse Gemini JSON:", rawResponse);
      throw new Error("Failed to parse evaluation report from AI evaluator.");
    }

    // Clamp and validate scores
    reportData.overallScore = Math.max(0, Math.min(100, Math.round(Number(reportData.overallScore) || 50)));
    if (reportData.skillBreakdown) {
      for (const key of Object.keys(reportData.skillBreakdown)) {
        reportData.skillBreakdown[key] = Math.max(0, Math.min(100, Math.round(Number(reportData.skillBreakdown[key]) || 50)));
      }
    }

    session.report = reportData;
    session.status = "completed";
    await session.save();

    res.json({
      success: true,
      message: "Report generated successfully.",
      session,
    });
  } catch (error) {
    console.error("[MockInterview] Error in /generate-report:", error);
    res.status(500).json({ message: error.message || "Failed to generate interview report." });
  }
});

// ─── 5. GET /api/mock-interview/history ───────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    const rawInterviews = await MockInterview.find({ user: req.user._id })
      .select("role mode difficulty interviewType duration questionCount report.overallScore report.readinessLevel status createdAt transcript.timestamp")
      .sort({ createdAt: -1 })
      .lean();

    const interviews = rawInterviews.map(({ transcript, ...rest }) => {
      const effectiveDuration =
        rest.duration ||
        (Array.isArray(transcript) && transcript.length > 0
          ? Math.max(...transcript.map((t) => Number(t.timestamp) || 0))
          : 0);
      return {
        ...rest,
        duration: effectiveDuration,
      };
    });

    res.json({
      success: true,
      interviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── 6. GET /api/mock-interview/:id ──────────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const session = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("resumeId", "title template")
      .populate("jobId", "title type location company");

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── 7. DELETE /api/mock-interview/:id ───────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const session = await MockInterview.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    res.json({
      success: true,
      message: "Interview session deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── 8. POST /api/mock-interview/:id/export-pdf ──────────────────────────────
router.post("/:id/export-pdf", protect, async (req, res) => {
  try {
    const { html, title = "Interview_Report" } = req.body;
    if (!html || typeof html !== "string") {
      return res.status(400).json({ message: "HTML content is required to generate PDF." });
    }

    const pdfBuffer = await generatePdfFromHtml(html, {
      fontScale: 100,
      styles: `
        @page { size: A4 portrait; margin: 12mm; }
        body { background: #ffffff !important; color: #18181b !important; font-family: 'Plus Jakarta Sans', sans-serif; }
        .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; overflow: visible !important; }
        .pdf-no-border { border: none !important; box-shadow: none !important; background: transparent !important; padding-left: 0 !important; padding-right: 0 !important; }
      `,
    });

    const cleanFilename = (title || "Interview_Report").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${cleanFilename}_Interview_Report.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    return res.end(pdfBuffer);
  } catch (error) {
    console.error("[MockInterview] Error exporting PDF:", error);
    return res.status(500).json({ message: "Failed to generate PDF report.", error: error.message });
  }
});

module.exports = router;
