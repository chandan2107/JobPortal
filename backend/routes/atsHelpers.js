const https = require("https");
const http = require("http");
const pdfParseModule = require("pdf-parse");

/**
 * Helper to parse PDF buffer supporting both pdf-parse v1 and v2.
 */
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

/**
 * Fallback: extracts text from any PDF using Gemini Multimodal Document Vision/OCR.
 * Handles browser-printed PDFs with custom CMap/glyph encoding, image-based, or scanned PDFs.
 */
const extractTextWithGemini = async (pdfBuffer) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is not configured.");
  }

  const { GoogleGenerativeAI } = require("@google/generative-ai");
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
  const uniqueModels = [...new Set(modelCandidates)];

  const pdfPart = {
    inlineData: {
      data: pdfBuffer.toString("base64"),
      mimeType: "application/pdf",
    },
  };

  const prompt = `Extract all text and content from this resume document verbatim.
Preserve all candidate details: Full Name, Contact Info (email, phone, location, links), Professional Summary, Work Experience (job titles, companies, dates, bullet points), Education (degrees, colleges, years), Skills, Projects, and Certifications.
Format the output as clean readable text. Do NOT add any preamble, conversational commentary, or meta-notes.`;

  let lastError = null;
  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([pdfPart, prompt]);
      const text = result.response.text().trim();
      if (text && text.length >= 50) {
        return text;
      }
    } catch (err) {
      console.warn(`[ATS Helper] Gemini PDF OCR model "${modelName}" error: ${err.message}, trying next...`);
      lastError = err;
    }
  }

  throw new Error(`Gemini PDF OCR extraction failed: ${lastError?.message || "No text extracted"}`);
};

/**
 * Universal PDF Text Extractor:
 * 1. Attempts fast standard PDF text stream parsing (pdf-parse).
 * 2. If pdf-parse returns < 50 characters (e.g. browser-printed vector with Identity-H CMap, scanned PDF, or canvas),
 *    automatically falls back to Gemini Multimodal Document OCR.
 */
const extractTextFromPdfBuffer = async (buffer) => {
  let extracted = "";
  try {
    extracted = await parsePdfBuffer(buffer);
  } catch (parseErr) {
    console.warn("[ATS Helper] pdf-parse error, attempting Gemini OCR fallback:", parseErr.message);
  }

  if (extracted && extracted.trim().length >= 50) {
    return extracted.trim();
  }

  console.log(`[ATS Helper] pdf-parse returned insufficient text (${extracted?.trim()?.length || 0} chars). Using Gemini Multimodal OCR fallback...`);
  try {
    const geminiText = await extractTextWithGemini(buffer);
    if (geminiText && geminiText.trim().length >= 50) {
      console.log(`[ATS Helper] Gemini OCR successfully extracted ${geminiText.length} characters.`);
      return geminiText.trim();
    }
  } catch (geminiErr) {
    console.error("[ATS Helper] Gemini OCR fallback failed:", geminiErr.message);
  }

  return (extracted || "").trim();
};

/**
 * Helper to download buffer from URL with redirect support.
 */
const downloadUrlBuffer = (url, redirectCount = 0) => {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error("Too many redirects fetching resume."));
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith("http")) {
          const parsed = new URL(url);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        return resolve(downloadUrlBuffer(redirectUrl, redirectCount + 1));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download resume: HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
};

/**
 * Fetches a PDF from a URL (Cloudinary or direct), follows redirects,
 * and extracts the text content using the universal text + Gemini OCR extractor.
 */
const extractTextFromResumeUrl = async (resumeUrl) => {
  if (!resumeUrl || typeof resumeUrl !== "string") {
    throw new Error("No resume URL provided.");
  }
  console.log("[ATS Helper] Downloading resume from:", resumeUrl);

  let buffer;
  try {
    buffer = await downloadUrlBuffer(resumeUrl);
  } catch (err) {
    console.warn(`[ATS Helper] Direct download failed (${err.message}). Trying proxy fallback...`);
    const proxyUrl = `http://localhost:${process.env.PORT || 8000}/api/auth/proxy-resume?url=${encodeURIComponent(resumeUrl)}`;
    buffer = await downloadUrlBuffer(proxyUrl);
  }

  console.log(`[ATS Helper] Downloaded PDF buffer size: ${buffer.length} bytes`);
  const extractedText = await extractTextFromPdfBuffer(buffer);
  console.log(`[ATS Helper] Successfully extracted ${extractedText.length} characters of text`);
  return extractedText.trim();
};

/**
 * Common tech skills dictionary for reliable fallback extraction
 */
const COMMON_SKILLS_DICTIONARY = [
  "JavaScript", "TypeScript", "React", "React Native", "Next.js", "Vue", "Angular", "Node.js",
  "Express", "NestJS", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot",
  "C++", "C#", ".NET", "Go", "Golang", "Rust", "PHP", "Laravel", "HTML", "HTML5", "CSS",
  "CSS3", "Tailwind CSS", "Bootstrap", "Sass", "SQL", "MySQL", "PostgreSQL", "MongoDB",
  "Redis", "GraphQL", "REST API", "Docker", "Kubernetes", "AWS", "Amazon Web Services",
  "Azure", "GCP", "Google Cloud", "CI/CD", "Git", "GitHub", "Linux", "Figma", "UI/UX",
  "Agile", "Scrum", "Jira", "Jest", "Cypress", "Machine Learning", "Deep Learning",
  "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-Learn", "Data Analysis", "NLP",
  "Computer Vision", "Tableau", "Power BI", "Kafka", "Microservices", "System Design",
  "Redux", "Webpack", "Vite", "Solidity", "Blockchain", "DevOps", "Cybersecurity"
];

/**
 * Common job titles for headline detection fallback
 */
const COMMON_JOB_TITLES = [
  "Full Stack Developer", "Full Stack Engineer", "Frontend Developer", "Frontend Engineer",
  "Backend Developer", "Backend Engineer", "Software Engineer", "Web Developer",
  "Mobile App Developer", "React Developer", "Node.js Developer", "Python Developer",
  "Java Developer", "DevOps Engineer", "Cloud Engineer", "Data Scientist", "Data Analyst",
  "Machine Learning Engineer", "AI Engineer", "UI/UX Designer", "Product Designer",
  "QA Engineer", "Software Test Engineer", "Systems Architect", "Database Administrator"
];

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Analyzes resume text to extract the candidate's professional headline, key skills, and experience level.
 * Uses Gemini if available, with a deterministic keyword dictionary fallback.
 */
const analyzeResumeSkillsAndHeadline = async (resumeText) => {
  if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 20) {
    return { headline: "Job Seeker", skills: [], yearsOfExperience: "" };
  }

  // 1. Try Gemini AI extraction if key is present
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const modelCandidates = [preferredModel, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      const uniqueModels = [...new Set(modelCandidates)];

      const prompt = `You are an expert HR recruiter and ATS parser.
Analyze this resume text and extract:
1. "headline": Professional role/title (e.g. "Full Stack Developer", "Frontend React Engineer", "Data Analyst"). Max 4 words.
2. "skills": An array of technical and professional skills clearly mentioned in the resume (max 20 skills, capitalized nicely like "React", "Node.js", "MongoDB").
3. "yearsOfExperience": Estimated years of experience or level (e.g. "0-2 years", "3-5 years", "5+ years", "Fresher").

RESUME TEXT:
${resumeText.slice(0, 5000)}

Respond ONLY with valid JSON in this exact structure:
{
  "headline": "<role title>",
  "skills": ["<skill1>", "<skill2>", "..."],
  "yearsOfExperience": "<level>"
}`;

      for (const modelName of uniqueModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const raw = result.response.text().trim();
          const cleanJson = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
            return {
              headline: parsed.headline || "Job Seeker",
              skills: parsed.skills,
              yearsOfExperience: parsed.yearsOfExperience || "",
            };
          }
        } catch (_) {}
      }
    } catch (geminiErr) {
      console.warn("[ATS Helper] Gemini skills analysis fallback to dictionary:", geminiErr.message);
    }
  }

  // 2. Deterministic rule-based fallback using COMMON_SKILLS_DICTIONARY
  const extractedSkills = [];
  COMMON_SKILLS_DICTIONARY.forEach((skill) => {
    const regex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, "i");
    if (regex.test(resumeText)) {
      extractedSkills.push(skill);
    }
  });

  // Detect headline
  let detectedHeadline = "Software Developer";
  for (const title of COMMON_JOB_TITLES) {
    const regex = new RegExp(`\\b${escapeRegExp(title)}\\b`, "i");
    if (regex.test(resumeText.slice(0, 1500))) {
      detectedHeadline = title;
      break;
    }
  }

  return {
    headline: detectedHeadline,
    skills: extractedSkills.slice(0, 20),
    yearsOfExperience: "",
  };
};

/**
 * Downloads resume from URL, extracts full text, and parses skills + headline.
 */
const analyzeResumeFromUrl = async (resumeUrl) => {
  const text = await extractTextFromResumeUrl(resumeUrl);
  const analysis = await analyzeResumeSkillsAndHeadline(text);
  return {
    text,
    headline: analysis.headline,
    skills: analysis.skills,
    yearsOfExperience: analysis.yearsOfExperience,
  };
};

/**
 * Evaluates how well a job matches a candidate's profile/resume.
 * Computes matchScore (0-100), matchedSkills, missingSkills, matchBadge, and matchReason.
 */
const calculateJobMatch = (job, candidateSkills = [], candidateHeadline = "", resumeText = "") => {
  const jobFullText = [
    job.title || "",
    job.description || "",
    job.requirements || "",
    job.category || "",
  ].join(" ").toLowerCase();

  const cSkills = Array.isArray(candidateSkills) ? candidateSkills : [];
  const matchedSkills = [];
  const missingSkills = [];

  // 1. Skill Matching
  cSkills.forEach((skill) => {
    if (!skill || typeof skill !== "string") return;
    const regex = new RegExp(`\\b${escapeRegExp(skill.trim())}\\b`, "i");
    if (regex.test(jobFullText)) {
      matchedSkills.push(skill.trim());
    }
  });

  // Find some required skills that candidate doesn't list
  COMMON_SKILLS_DICTIONARY.forEach((skill) => {
    const hasInJob = new RegExp(`\\b${escapeRegExp(skill)}\\b`, "i").test(jobFullText);
    const hasInCandidate = cSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (hasInJob && !hasInCandidate && missingSkills.length < 5) {
      missingSkills.push(skill);
    }
  });

  // 2. Title & Role Keyword Overlap
  let titleScore = 0;
  const jobTitle = (job.title || "").toLowerCase();
  const headlineWords = (candidateHeadline || "")
    .toLowerCase()
    .split(/[\s/,-]+/)
    .filter((w) => w.length > 2);

  headlineWords.forEach((word) => {
    if (jobTitle.includes(word)) {
      titleScore += 10;
    }
  });
  titleScore = Math.min(30, titleScore);

  // 3. Calculate Overall Score
  // Skill match ratio
  const skillRatio = cSkills.length > 0 ? (matchedSkills.length / Math.min(10, cSkills.length)) : 0;
  const rawSkillScore = Math.min(55, Math.round(skillRatio * 55));

  // Category bonus
  let categoryScore = 0;
  if (job.category && (candidateHeadline.toLowerCase().includes(job.category.toLowerCase()) || jobFullText.includes(job.category.toLowerCase()))) {
    categoryScore = 15;
  }

  let totalScore = rawSkillScore + titleScore + categoryScore;

  // If candidate has matched skills, give boost
  if (matchedSkills.length >= 4) totalScore += 10;
  else if (matchedSkills.length >= 2) totalScore += 5;

  // Clamp score
  let finalScore = Math.min(98, Math.max(0, totalScore));

  // If there are zero matching skills and title didn't match at all, score is low
  if (matchedSkills.length === 0 && titleScore === 0) {
    finalScore = Math.min(25, finalScore);
  }

  // Label badge
  let matchBadge = "Good Match";
  if (finalScore >= 80) matchBadge = "Strong Match";
  else if (finalScore >= 60) matchBadge = "Great Match";
  else if (finalScore >= 40) matchBadge = "Fair Match";
  else matchBadge = "Potential Match";

  // Reason summary
  let matchReason = "";
  if (matchedSkills.length > 0) {
    const preview = matchedSkills.slice(0, 3).join(", ");
    const extra = matchedSkills.length > 3 ? ` +${matchedSkills.length - 3} more` : "";
    matchReason = `Matches ${matchedSkills.length} of your skills (${preview}${extra})`;
  } else if (titleScore > 0) {
    matchReason = `Matches your target title: ${candidateHeadline}`;
  } else {
    matchReason = "Matches your professional background";
  }

  return {
    matchScore: finalScore,
    matchedSkills,
    missingSkills,
    matchBadge,
    matchReason,
  };
};

module.exports = {
  parsePdfBuffer,
  extractTextWithGemini,
  extractTextFromPdfBuffer,
  extractTextFromResumeUrl,
  analyzeResumeSkillsAndHeadline,
  analyzeResumeFromUrl,
  calculateJobMatch,
};
