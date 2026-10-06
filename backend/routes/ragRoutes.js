const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const ragService = require("../services/ragService");
const Application = require("../models/Application");
const Job = require("../models/Job");

const router = express.Router();

// ─── GET /api/rag/health ────────────────────────────────────────────────────
// Public endpoint to verify Qdrant connection and collection status.
router.get("/health", async (req, res) => {
  try {
    const status = await ragService.getHealthStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// ─── POST /api/rag/index-resume/:applicationId ─────────────────────────────
// Employer-only: indexes an applicant's resume into Qdrant for RAG retrieval.
// This is called manually or can be triggered automatically during ATS scoring.
router.post("/index-resume/:applicationId", protect, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can index resumes." });
    }

    const application = await Application.findById(req.params.applicationId)
      .populate("applicant", "name resume")
      .populate("job", "title description requirements company");

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Get resume text — reuse the PDF extraction logic from atsRoutes
    const resumeUrl = [application.applicant?.resume, application.resume].find(
      (u) => u && typeof u === "string" && !u.startsWith("blob:")
    );

    if (!resumeUrl) {
      return res.status(400).json({ message: "No valid resume URL found." });
    }

    // Dynamic import of the PDF extraction helper from atsRoutes
    const { extractTextFromResumeUrl } = require("./atsHelpers");

    let resumeText;
    try {
      resumeText = await extractTextFromResumeUrl(resumeUrl);
    } catch (err) {
      return res.status(502).json({ message: "Could not read resume: " + err.message });
    }

    const chunksIndexed = await ragService.indexResume({
      resumeText,
      applicationId: application._id.toString(),
      jobId: application.job._id.toString(),
      userId: application.applicant._id.toString(),
      applicantName: application.applicant.name,
    });

    res.json({
      message: `Resume indexed successfully.`,
      chunksIndexed,
      applicationId: application._id,
    });
  } catch (err) {
    console.error("[RAG Route] Index resume error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/rag/index-job/:jobId ────────────────────────────────────────
// Employer-only: indexes a job description into Qdrant.
router.post("/index-job/:jobId", protect, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can index jobs." });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Verify the employer owns this job
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only index your own job postings." });
    }

    const chunksIndexed = await ragService.indexJob({
      jobId: job._id.toString(),
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      employerId: job.company.toString(),
    });

    res.json({
      message: `Job indexed successfully.`,
      chunksIndexed,
      jobId: job._id,
    });
  } catch (err) {
    console.error("[RAG Route] Index job error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/rag/search-resumes ──────────────────────────────────────────
// Employer-only: semantic search across indexed resumes.
// Body: { query: string, jobId?: string, applicationId?: string, limit?: number }
router.post("/search-resumes", protect, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can search resumes." });
    }

    const { query, jobId, applicationId, limit } = req.body;

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return res.status(400).json({ message: "Please provide a search query (min 3 chars)." });
    }

    const results = await ragService.searchResumes({
      query: query.trim(),
      filter: {
        ...(jobId && { jobId }),
        ...(applicationId && { applicationId }),
      },
      limit: limit || 5,
    });

    res.json({ query: query.trim(), results });
  } catch (err) {
    console.error("[RAG Route] Search resumes error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/rag/search-jobs ─────────────────────────────────────────────
// Job seeker: semantic search across indexed jobs.
// Body: { query: string, limit?: number }
router.post("/search-jobs", protect, async (req, res) => {
  try {
    const { query, limit } = req.body;

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return res.status(400).json({ message: "Please provide a search query (min 3 chars)." });
    }

    const results = await ragService.searchJobs({
      query: query.trim(),
      limit: limit || 5,
    });

    res.json({ query: query.trim(), results });
  } catch (err) {
    console.error("[RAG Route] Search jobs error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
