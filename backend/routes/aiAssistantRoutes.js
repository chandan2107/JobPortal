const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional auth: populate req.user if token cookie or Bearer token is present, but don't reject guests
const optionalProtect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const secret = process.env.JT_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (err) {
    // Proceed as guest
  }
  next();
};

// ─── Gemini Caller with Multi-Model Fallback ────────────────────────────────
const getGeminiResult = async (prompt) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY in backend/.env.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const preferredModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const modelCandidates = [
    preferredModel,
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
  ];

  const uniqueModels = [...new Set(modelCandidates)];

  let lastError = null;
  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn(`[AI-Assistant] Model "${modelName}" failed (${err.message}), trying next candidate...`);
      lastError = err;
    }
  }

  throw new Error(`All Gemini models failed: ${lastError?.message || "Unknown error"}`);
};

/**
 * 1. POST /api/ai/polish-experience
 * Transforms a raw job description into strictly 1 single bullet point consisting of 25 to 30 words.
 */
router.post("/polish-experience", optionalProtect, async (req, res) => {
  try {
    const { text, jobTitle, company } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ message: "Please provide the experience text to polish." });
    }

    const prompt = `You are an elite, concise executive resume editor.
Rewrite the following job experience notes for the role "${jobTitle || "Professional"}" at "${company || "Company"}".

STRICT MANDATORY RULES:
- Output STRICTLY ONE single bullet point (exactly 1 sentence).
- The bullet point MUST consist of between 25 and 30 words (strictly count words to stay within 25 to 30 words).
- Must start with '• ' followed by a strong past-tense action verb (e.g., Engineered, Architected, Spearheaded, Optimized, Accelerated).
- Highlight the core responsibilities, key technologies, and measurable business impact in a single cohesive sentence.
- Absolutely NO multiple bullets. Absolutely NO multi-line paragraphs.
- Output ONLY the single bullet point. Do not add intro or markdown code fences.

Raw Notes:
${text.trim()}`;

    const raw = await getGeminiResult(prompt);

    // Clean up any extra wrapper
    const polished = raw
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    return res.json({ polished });
  } catch (error) {
    console.error("[AI-Assistant] Polish experience error:", error);
    return res.status(500).json({
      message: error.message || "Failed to polish experience. Please try again.",
    });
  }
});

/**
 * 1b. POST /api/ai/polish-project
 * Transforms project notes into strictly 1 single bullet point consisting of 25 to 30 words.
 */
router.post("/polish-project", optionalProtect, async (req, res) => {
  try {
    const { text, projectName, technologies } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ message: "Please provide some project notes first." });
    }

    const techStr = Array.isArray(technologies) && technologies.length > 0
      ? technologies.join(", ")
      : "";

    const prompt = `You are an elite, concise technical resume editor.
Rewrite the following project notes for the project "${projectName || "Web Application"}" ${techStr ? `built with [${techStr}]` : ""}.

STRICT MANDATORY RULES:
- Output STRICTLY ONE single bullet point (exactly 1 sentence).
- The bullet point MUST consist of between 25 and 30 words (strictly count words to stay within 25 to 30 words).
- Must start with '• ' followed by a strong action verb (e.g., Engineered, Architected, Developed, Deployed).
- Highlight the core feature, stack, and direct user benefit or performance outcome in a single cohesive sentence.
- Absolutely NO multiple bullets. Absolutely NO multi-line paragraphs.
- Output ONLY the single bullet point. Do not add intro or markdown code fences.

Raw Project Notes:
${text.trim()}`;

    const raw = await getGeminiResult(prompt);

    const polished = raw
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    return res.json({ polished });
  } catch (error) {
    console.error("[AI-Assistant] Polish project error:", error);
    return res.status(500).json({
      message: error.message || "Failed to polish project description.",
    });
  }
});

/**
 * 2. POST /api/ai/generate-summaries
 * Generates 3 SHORT tailored professional summaries (strictly 1-2 sentences, under 30 words).
 */
router.post("/generate-summaries", optionalProtect, async (req, res) => {
  try {
    const { jobTitle, skills, experienceSummary } = req.body;

    const skillsStr = Array.isArray(skills) && skills.length > 0
      ? skills.slice(0, 5).join(", ")
      : "Modern industry best practices and core domain skills";

    const prompt = `You are an elite, concise resume writer.
Generate 3 SHORT, PUNCHY professional summaries for a candidate with:
- Target Role: ${jobTitle || "Professional"}
- Key Skills: ${skillsStr}
- Background: ${experienceSummary || "Experienced industry professional"}

CRITICAL LENGTH CONSTRAINTS:
- Keep each summary STRICTLY 1 to 2 short sentences (maximum 20 to 30 words TOTAL).
- Absolutely NO long paragraphs or verbose fluff. Keep it tight, crisp, and high-impact.

Styles:
1. "Executive & Impact-Driven": High-level strategic results and business value.
2. "Technical & Hands-on": Core engineering prowess and modern system architecture.
3. "Growth & Product-Minded": Product agility, fast iteration, and user impact.

Return ONLY a valid JSON array of objects in this exact format with NO markdown code fences:
[
  {
    "id": "executive",
    "style": "Executive & Impact-Driven",
    "text": "..."
  },
  {
    "id": "technical",
    "style": "Technical & Hands-on",
    "text": "..."
  },
  {
    "id": "creative",
    "style": "Growth & Product-Minded",
    "text": "..."
  }
]`;

    const raw = await getGeminiResult(prompt);

    let summaries = [];
    try {
      const cleanJson = raw
        .replace(/^```json?\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
      summaries = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("[AI-Assistant] Summary JSON parse error:", raw);
      // Fallback concise summaries if JSON parsing had quirks
      summaries = [
        {
          id: "executive",
          style: "Executive & Impact-Driven",
          text: `Results-oriented ${jobTitle || "Professional"} with expertise in ${skillsStr}. Proven track record delivering scalable solutions and driving business impact.`,
        },
        {
          id: "technical",
          style: "Technical & Hands-on",
          text: `Hands-on ${jobTitle || "Engineer"} skilled in ${skillsStr}. Focused on building high-performance architectures and clean, reliable code.`,
        },
        {
          id: "creative",
          style: "Growth & Product-Minded",
          text: `Agile ${jobTitle || "Creator"} combining expertise in ${skillsStr} to ship user-focused products and accelerate team velocity.`,
        },
      ];
    }

    return res.json({ summaries });
  } catch (error) {
    console.error("[AI-Assistant] Generate summaries error:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate summaries. Please try again.",
    });
  }
});

/**
 * 3. POST /api/ai/suggest-skills
 * Recommends 12-16 trending skills based on target Job Title.
 */
router.post("/suggest-skills", optionalProtect, async (req, res) => {
  try {
    const { jobTitle, currentSkills } = req.body;

    const existingList = Array.isArray(currentSkills) ? currentSkills : [];

    const prompt = `You are a technical recruiter and industry skills researcher.
Based on the job title "${jobTitle || "Full Stack Developer"}", recommend 12 to 16 trending, highly in-demand technical, tooling, and domain skills that hiring managers seek right now.
${existingList.length > 0 ? `The candidate ALREADY has these skills: [${existingList.join(", ")}]. Do NOT include any of these existing skills.` : ""}

Return ONLY a valid JSON array of strings containing the skill names (e.g. ["Next.js", "Docker", "GraphQL", ...]).
No explanations, no markdown fences, only the JSON array.`;

    const raw = await getGeminiResult(prompt);

    let skills = [];
    try {
      const cleanJson = raw
        .replace(/^```json?\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
      skills = JSON.parse(cleanJson);
      if (!Array.isArray(skills)) skills = [];
    } catch (parseErr) {
      console.error("[AI-Assistant] Skills JSON parse error:", raw);
      // Fallback
      skills = ["React", "TypeScript", "Node.js", "Tailwind CSS", "Docker", "REST APIs", "Git", "PostgreSQL", "Next.js", "CI/CD"];
    }

    // Filter out duplicates against existing list
    const filtered = skills.filter(
      (s) => typeof s === "string" && !existingList.some((e) => e.toLowerCase() === s.toLowerCase())
    );

    return res.json({ skills: filtered });
  } catch (error) {
    console.error("[AI-Assistant] Suggest skills error:", error);
    return res.status(500).json({
      message: error.message || "Failed to suggest skills. Please try again.",
    });
  }
});

module.exports = router;
