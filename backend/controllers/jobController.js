const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJob = require("../models/Saved");
const { analyzeResumeFromUrl, calculateJobMatch } = require("../routes/atsHelpers");

// @desc Create a new job (Employer only)
exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    if (req.user.verificationStatus !== "approved") {
      return res.status(403).json({
        message: "Your company must be verified by admin before posting jobs.",
        verificationStatus: req.user.verificationStatus,
      });
    }

    const jobData = { ...req.body };
    if (!jobData.vacancies || isNaN(jobData.vacancies)) {
      delete jobData.vacancies;
    } else {
      jobData.vacancies = Number(jobData.vacancies);
    }

    const job = await Job.create({ ...jobData, company: req.user._id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
    const {
  location,
  category,
  type,
  minSalary,
  maxSalary,
  userId,
  keyword,
} = req.query;

const query = {
  isClosed: false,
  ...(location && { location: { $regex: location, $options: "i" } }),
  ...(category && { category }),
  ...(type && { type }),
};

const andConditions = [];
if (keyword) {
  andConditions.push({
    $or: [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { requirements: { $regex: keyword, $options: "i" } },
    ],
  });
}
if (minSalary) {
  andConditions.push({
    salaryMax: { $gte: Number(minSalary) },
  });
}
if (maxSalary) {
  andConditions.push({
    salaryMin: { $lte: Number(maxSalary) },
  });
}
if (andConditions.length > 0) {
  query.$and = andConditions;
}
  try {
    const jobs = await Job.find(query).populate("company", "name companyName companyLogo");

let savedJobIds = [];
let appliedJobStatusMap = {};

if (userId) {
  // Saved Jobs
  const savedJobs = await SavedJob.find({ jobSeeker: userId }).select("job");
  savedJobIds = savedJobs.map((s) => String(s.job));

  // Applications
  const applications = await Application.find({ applicant: userId });
  applications.forEach((app) => {
    appliedJobStatusMap[String(app.job)] = app.status;
  });
}
// Add isSaved and applicationStatus to each job
const jobsWithExtras = jobs.map((job) => {
  const jobIdStr = String(job._id);
  return {
    ...job.toObject(),
    isSaved: savedJobIds.includes(jobIdStr),
    applicationStatus: appliedJobStatusMap[jobIdStr] || null,
  };
});

res.json(jobsWithExtras);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get jobs for logged in user (Employer can see posted jobs)
exports.getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    if (role !== "employer") {
      return res.status(403).json({message: "Access denied"});
    }

    // Get all jobs posted by employer
    const jobs = await Job.find({ company: userId })
      .populate("company", "name companyName companyLogo")
      .lean(); // .lean() makes jobs plain JS objects so we can add new fields

    // Count applications for each job
    const jobsWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return {
          ...job,
          applicationCount,
        };
      })
    );

    res.json(jobsWithApplicationCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const { userId } = req.query;

    const job = await Job.findById(req.params.id).populate("company", "name companyName companyLogo");

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    let applicationStatus = null;
    let isSaved = false;

    if (userId) {
      const application = await Application.findOne({
        job: job._id,
        applicant: userId,
      }).select("status");

      if (application) {
        applicationStatus = application.status;
      }

      const savedItem = await SavedJob.findOne({
        job: job._id,
        jobSeeker: userId,
      });

      if (savedItem) {
        isSaved = true;
      }
    }

    const applicationCount = await Application.countDocuments({ job: job._id });

    res.json({
      ...job.toObject(),
      applicationStatus,
      isSaved,
      applicationCount,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update a job (Employer only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

if (!job) {
  return res.status(404).json({
    message: "Job not found",
  });
}

if (job.company.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    message: "Not authorized to update this job",
  });
}

    const updateData = { ...req.body };
    if (updateData.vacancies === "" || updateData.vacancies === null) {
      job.vacancies = undefined;
      delete updateData.vacancies;
    } else if (updateData.vacancies !== undefined && !isNaN(updateData.vacancies)) {
      updateData.vacancies = Number(updateData.vacancies);
    }

    Object.assign(job, updateData);
    const updated = await job.save();

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete a job (Employer only)
exports.deleteJob = async (req, res) => {
  try {
     const job = await Job.findById(req.params.id);

if (!job) {
  return res.status(404).json({
    message: "Job not found",
  });
}

if (job.company.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    message: "Not authorized to delete this job",
  });
}

await job.deleteOne();

res.json({
  message: "Job deleted successfully",
});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Toggle Close Status for a job (Employer only)
exports.toggleCloseJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

if (!job) {
  return res.status(404).json({
    message: "Job not found",
  });
}

if (job.company.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    message: "Not authorized to close this job",
  });
}

job.isClosed = !job.isClosed;
await job.save();

res.json({
  message: "Job marked as closed",
});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get recommended jobs based on candidate's uploaded resume / profile skills
exports.getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "jobSeeker" && user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can view recommended jobs" });
    }

    // If user has a resume URL but resume hasn't been parsed yet, parse it now
    if (user.resume && (!user.resumeExtractedText || !user.resumeSkills || user.resumeSkills.length === 0)) {
      try {
        console.log(`[Job Recommendations] Parsing resume on-the-fly for user ${user._id}`);
        const analysis = await analyzeResumeFromUrl(user.resume);
        if (analysis.text) user.resumeExtractedText = analysis.text;
        if (analysis.skills && analysis.skills.length > 0) {
          user.resumeSkills = analysis.skills;
          const currentLower = new Set((user.skills || []).map((s) => s.toLowerCase()));
          const merged = [...(user.skills || [])];
          analysis.skills.forEach((s) => {
            if (!currentLower.has(s.toLowerCase())) {
              merged.push(s);
              currentLower.add(s.toLowerCase());
            }
          });
          user.skills = merged;
        }
        if (analysis.headline) {
          user.resumeHeadline = analysis.headline;
          if (!user.jobTitle) user.jobTitle = analysis.headline;
        }
        await user.save();
      } catch (parseErr) {
        console.warn("[Job Recommendations] Resume parsing warning:", parseErr.message);
      }
    }

    const candidateSkills = [
      ...new Set([
        ...(user.resumeSkills || []),
        ...(user.skills || []),
      ]),
    ];
    const candidateHeadline = user.resumeHeadline || user.jobTitle || "Developer";

    // If user has no resume and no skills
    if (!user.resume && candidateSkills.length === 0) {
      return res.json({
        hasResume: false,
        resumeUrl: "",
        resumeHeadline: "",
        resumeSkills: [],
        recommendedJobs: [],
        message: "Upload your resume in Profile to receive tailored job recommendations.",
      });
    }

    // Fetch all active open jobs
    const jobs = await Job.find({ isClosed: false }).populate(
      "company",
      "name companyName companyLogo"
    );

    // Fetch user's saved and applied jobs for UI state
    const savedJobs = await SavedJob.find({ jobSeeker: userId }).select("job");
    const savedJobIds = savedJobs.map((s) => String(s.job));

    const applications = await Application.find({ applicant: userId });
    const appliedJobStatusMap = {};
    applications.forEach((app) => {
      appliedJobStatusMap[String(app.job)] = app.status;
    });

    // Score and annotate every active job
    const scoredJobs = jobs.map((job) => {
      const match = calculateJobMatch(
        job,
        candidateSkills,
        candidateHeadline,
        user.resumeExtractedText || ""
      );
      const jobIdStr = String(job._id);

      return {
        ...job.toObject(),
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        matchBadge: match.matchBadge,
        matchReason: match.matchReason,
        isSaved: savedJobIds.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap[jobIdStr] || null,
      };
    });

    // Sort by match score descending
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Filter to top matches (score >= 30, or at least top 6 if available)
    const filteredRecommendations = scoredJobs.filter((j) => j.matchScore >= 30);
    const topRecommended = (filteredRecommendations.length > 0 ? filteredRecommendations : scoredJobs).slice(0, 10);

    res.json({
      hasResume: Boolean(user.resume),
      resumeUrl: user.resume || "",
      resumeHeadline: candidateHeadline,
      resumeSkills: candidateSkills,
      recommendedJobs: topRecommended,
      totalRecommended: topRecommended.length,
    });
  } catch (err) {
    console.error("[Job Recommendations] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Get live market trends aggregated from active jobs
// @route GET /api/jobs/trends?track=All|Engineering|Design|Data/AI|DevOps
exports.getJobTrends = async (req, res) => {
  try {
    const track = req.query.track || "All";
    const allJobs = await Job.find({ isClosed: false }).lean();

    const TRACK_KEYWORDS = {
      Engineering: ["engineer", "developer", "frontend", "backend", "full stack", "fullstack", "software", "react", "node", "java", "web", "mobile", "it"],
      Design: ["design", "ui", "ux", "figma", "product design", "graphic", "creative"],
      "Data/AI": ["data", "ai", "ml", "machine learning", "analytics", "python", "llm", "science", "deep learning", "nlp"],
      DevOps: ["devops", "cloud", "aws", "docker", "kubernetes", "ci/cd", "sre", "infrastructure", "terraform", "linux"],
    };

    const matchesTrack = (job, selectedTrack) => {
      if (selectedTrack === "All" || !TRACK_KEYWORDS[selectedTrack]) return true;
      const haystack = `${job.title || ""} ${job.category || ""} ${job.requirements || ""} ${job.description || ""}`.toLowerCase();
      return TRACK_KEYWORDS[selectedTrack].some((kw) => haystack.includes(kw));
    };

    const filteredJobs = allJobs.filter((job) => matchesTrack(job, track));

    const SKILL_CATALOG = [
      "React",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Python",
      "Next.js",
      "SQL",
      "MongoDB",
      "AWS",
      "Docker",
      "Kubernetes",
      "Tailwind CSS",
      "Figma",
      "UI/UX",
      "GraphQL",
      "REST APIs",
      "Git",
      "CI/CD",
      "Machine Learning",
      "TensorFlow",
      "PyTorch",
      "Java",
      "Go",
      "PostgreSQL",
      "Redis",
      "Linux",
      "Terraform",
    ];

    const skillCounts = {};
    SKILL_CATALOG.forEach((s) => {
      skillCounts[s] = 0;
    });

    let salaryMinSum = 0;
    let salaryMaxSum = 0;
    let salaryCount = 0;
    let remoteCount = 0;
    const jobTypeCounts = {};
    const roleMap = {};

    filteredJobs.forEach((job) => {
      const text = `${job.title || ""} ${job.requirements || ""} ${job.description || ""}`.toLowerCase();
      SKILL_CATALOG.forEach((skill) => {
        const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
        if (regex.test(text)) {
          skillCounts[skill] += 1;
        }
      });

      if (job.salaryMin || job.salaryMax) {
        salaryMinSum += Number(job.salaryMin || job.salaryMax || 0);
        salaryMaxSum += Number(job.salaryMax || job.salaryMin || 0);
        salaryCount += 1;
      }

      if (job.type === "Remote" || /remote/i.test(job.location || "")) {
        remoteCount += 1;
      }

      const typeLabel = (job.type || "Full-Time").trim();
      jobTypeCounts[typeLabel] = (jobTypeCounts[typeLabel] || 0) + 1;

      const roleName = (job.category || job.title || "General").trim();
      if (!roleMap[roleName]) {
        roleMap[roleName] = { role: roleName, count: 0, minSum: 0, maxSum: 0, salCount: 0 };
      }
      roleMap[roleName].count += 1;
      if (job.salaryMin || job.salaryMax) {
        roleMap[roleName].minSum += Number(job.salaryMin || job.salaryMax || 0);
        roleMap[roleName].maxSum += Number(job.salaryMax || job.salaryMin || 0);
        roleMap[roleName].salCount += 1;
      }
    });

    const totalJobs = filteredJobs.length;
    const rankedSkills = Object.entries(skillCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalJobs > 0 ? Math.min(100, Math.round((count / totalJobs) * 100)) : 0,
      }));

    const roleDemand = Object.values(roleMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((r) => ({
        role: r.role,
        count: r.count,
        share: totalJobs > 0 ? Math.round((r.count / totalJobs) * 100) : 0,
        avgSalaryMin: r.salCount > 0 ? Math.round(r.minSum / r.salCount) : 0,
        avgSalaryMax: r.salCount > 0 ? Math.round(r.maxSum / r.salCount) : 0,
      }));

    const avgSalaryMin = salaryCount > 0 ? Math.round(salaryMinSum / salaryCount) : 0;
    const avgSalaryMax = salaryCount > 0 ? Math.round(salaryMaxSum / salaryCount) : 0;
    const remoteShare = totalJobs > 0 ? Math.round((remoteCount / totalJobs) * 100) : 0;
    const [topJobType = "Full-Time", topJobTypeCount = 0] =
      Object.entries(jobTypeCounts).sort((a, b) => b[1] - a[1])[0] || [];
    const topJobTypeShare = totalJobs > 0 ? Math.round((topJobTypeCount / totalJobs) * 100) : 0;
    const fastestGrowingRole = roleDemand[0]?.role || (track === "All" ? "Full Stack" : track);

    res.json({
      track,
      activeJobs: totalJobs,
      avgSalaryMin,
      avgSalaryMax,
      remoteCount,
      remoteShare,
      topJobType,
      topJobTypeShare,
      fastestGrowingRole,
      topSkills: rankedSkills,
      roleDemand,
    });
  } catch (err) {
    console.error("[Job Trends] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};