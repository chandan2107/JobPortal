const fs = require("fs");
const path = require("path");
const User = require("../models/User");

// @desc Update user profile (name, avatar, company details, job seeker career details)
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      avatar,
      companyName,
      companyDescription,
      companyLogo,
      resume,
      jobTitle,
      phone,
      location,
      bio,
      skills,
      linkedin,
      github,
      website,
    } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (resume !== undefined) {
      const isNewResume = Boolean(resume && resume !== user.resume);
      user.resume = resume;

      if (isNewResume) {
        try {
          const { analyzeResumeFromUrl } = require("../routes/atsHelpers");
          const analysis = await analyzeResumeFromUrl(resume);
          if (analysis.text) user.resumeExtractedText = analysis.text;
          if (analysis.skills && analysis.skills.length > 0) {
            user.resumeSkills = analysis.skills;
            // Merge extracted skills into profile skills if not already present
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
        } catch (resumeErr) {
          console.warn("[User Profile] Resume analysis upon upload warning:", resumeErr.message);
        }
      }
    }

    // Career profile fields (for jobSeeker and general users)
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (website !== undefined) user.website = website;

    // If employer, allow updating company info
    if (user.role === "employer") {
      if (companyName !== undefined) user.companyName = companyName;
      if (companyDescription !== undefined) user.companyDescription = companyDescription;
      if (companyLogo !== undefined) user.companyLogo = companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
      jobTitle: user.jobTitle || "",
      phone: user.phone || "",
      location: user.location || "",
      bio: user.bio || "",
      skills: user.skills || [],
      linkedin: user.linkedin || "",
      github: user.github || "",
      website: user.website || "",
      resumeSkills: user.resumeSkills || [],
      resumeHeadline: user.resumeHeadline || "",
      verificationStatus: user.verificationStatus || "none",
      verificationNote: user.verificationNote || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete resume file (JobSeeker only)
exports.deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "jobseeker" && user.role !== "jobSeeker") {
      return res.status(403).json({ message: "Only jobseekers can delete resume" });
    }

    if (resumeUrl && !resumeUrl.includes("cloudinary.com")) {
      const fileName = resumeUrl?.split("/")?.pop();
      if (fileName) {
        const filePath = path.join(__dirname, "../uploads", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    user.resume = "";
    user.resumeExtractedText = "";
    user.resumeSkills = [];
    user.resumeHeadline = "";
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get user public profile
exports.getPublicProfile = async (req, res) => {
     try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found"})

        res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};