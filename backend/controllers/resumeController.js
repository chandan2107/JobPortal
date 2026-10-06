const mongoose = require("mongoose");
const Resume = require("../models/Resume");

// Helper to check valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to find a resume belonging to user by _id or customId
const findUserResume = async (userId, id) => {
  if (!id || id === "undefined" || id === "null") return null;
  const query = { user: userId };
  if (isValidObjectId(id)) {
    query.$or = [{ _id: id }, { customId: id }];
  } else {
    query.customId = id;
  }
  return Resume.findOne(query);
};

// @desc    Get all resumes of the logged-in user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error("[ResumeController] getResumes error:", error);
    res.status(500).json({ message: "Failed to fetch resumes", error: error.message });
  }
};

// @desc    Get a single resume by _id or customId
// @route   GET /api/resumes/:id
// @access  Private
exports.getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await findUserResume(req.user._id, id);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    console.error("[ResumeController] getResumeById error:", error);
    res.status(500).json({ message: "Failed to fetch resume", error: error.message });
  }
};

// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Private
exports.createResume = async (req, res) => {
  try {
    const {
      customId,
      id,
      title = "Untitled Resume",
      template = "modern",
      personalInfo = {},
      summary = "",
      experience = [],
      education = [],
      skills = [],
      projects = [],
      certifications = [],
    } = req.body;

    const targetCustomId = customId || id || `resume_${Date.now()}`;

    // Check if resume with this customId already exists for this user
    let existing = await Resume.findOne({ user: req.user._id, customId: targetCustomId });
    if (existing) {
      existing.title = title;
      existing.template = template;
      existing.personalInfo = personalInfo;
      existing.summary = summary;
      existing.experience = experience;
      existing.education = education;
      existing.skills = skills;
      existing.projects = projects;
      existing.certifications = certifications;
      await existing.save();
      return res.status(200).json(existing);
    }

    const newResume = new Resume({
      user: req.user._id,
      customId: targetCustomId,
      title,
      template,
      personalInfo,
      summary,
      experience,
      education,
      skills,
      projects,
      certifications,
    });

    const saved = await newResume.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("[ResumeController] createResume error:", error);
    res.status(500).json({ message: "Failed to create resume", error: error.message });
  }
};

// @desc    Update an existing resume (or upsert if customId)
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    let resume = await findUserResume(req.user._id, id);

    const updateFields = req.body;

    if (!resume) {
      // Upsert if client is saving a newly created customId resume
      const targetCustomId = updateFields.customId || updateFields.id || id;
      resume = new Resume({
        user: req.user._id,
        customId: targetCustomId,
        title: updateFields.title || "Untitled Resume",
        template: updateFields.template || "modern",
        personalInfo: updateFields.personalInfo || {},
        summary: updateFields.summary || "",
        experience: updateFields.experience || [],
        education: updateFields.education || [],
        skills: updateFields.skills || [],
        projects: updateFields.projects || [],
        certifications: updateFields.certifications || [],
      });
      await resume.save();
      return res.status(201).json(resume);
    }

    // Update existing
    if (updateFields.title !== undefined) resume.title = updateFields.title;
    if (updateFields.template !== undefined) resume.template = updateFields.template;
    if (updateFields.personalInfo !== undefined) resume.personalInfo = updateFields.personalInfo;
    if (updateFields.summary !== undefined) resume.summary = updateFields.summary;
    if (updateFields.experience !== undefined) resume.experience = updateFields.experience;
    if (updateFields.education !== undefined) resume.education = updateFields.education;
    if (updateFields.skills !== undefined) resume.skills = updateFields.skills;
    if (updateFields.projects !== undefined) resume.projects = updateFields.projects;
    if (updateFields.certifications !== undefined) resume.certifications = updateFields.certifications;

    const saved = await resume.save();
    res.json(saved);
  } catch (error) {
    console.error("[ResumeController] updateResume error:", error);
    res.status(500).json({ message: "Failed to update resume", error: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await findUserResume(req.user._id, id);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await Resume.deleteOne({ _id: resume._id });
    res.json({ message: "Resume deleted successfully", id });
  } catch (error) {
    console.error("[ResumeController] deleteResume error:", error);
    res.status(500).json({ message: "Failed to delete resume", error: error.message });
  }
};

// @desc    Sync local resumes into MongoDB (migration from localStorage)
// @route   POST /api/resumes/sync
// @access  Private
exports.syncResumes = async (req, res) => {
  try {
    const { localResumes } = req.body;

    if (!Array.isArray(localResumes) || localResumes.length === 0) {
      // Return current cloud resumes
      const cloudResumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
      return res.json(cloudResumes);
    }

    for (const item of localResumes) {
      const targetId = item.id || item.customId;
      if (!targetId) continue;

      const existing = await findUserResume(req.user._id, targetId);

      if (!existing) {
        // Create new cloud copy from local item
        await Resume.create({
          user: req.user._id,
          customId: targetId,
          title: item.title || "Untitled Resume",
          template: item.template || "modern",
          personalInfo: item.personalInfo || {},
          summary: item.summary || "",
          experience: item.experience || [],
          education: item.education || [],
          skills: item.skills || [],
          projects: item.projects || [],
          certifications: item.certifications || [],
        });
      }
    }

    // Return the combined cloud resumes
    const allCloudResumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(allCloudResumes);
  } catch (error) {
    console.error("[ResumeController] syncResumes error:", error);
    res.status(500).json({ message: "Failed to sync resumes", error: error.message });
  }
};
