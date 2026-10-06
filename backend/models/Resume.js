const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Optional client ID to seamlessly map existing localStorage or client-generated IDs
    customId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Resume",
      trim: true,
    },
    template: {
      type: String,
      default: "modern",
    },
    personalInfo: {
      fullName: { type: String, default: "" },
      jobTitle: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    summary: {
      type: String,
      default: "",
    },
    experience: [
      {
        title: { type: String, default: "" },
        company: { type: String, default: "" },
        location: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        current: { type: Boolean, default: false },
        description: { type: String, default: "" },
      },
    ],
    education: [
      {
        degree: { type: String, default: "" },
        school: { type: String, default: "" },
        location: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        gpa: { type: String, default: "" },
      },
    ],
    skills: {
      type: [String],
      default: [],
    },
    projects: [
      {
        name: { type: String, default: "" },
        technologies: { type: [String], default: [] },
        link: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],
    certifications: [
      {
        type: { type: String, default: "certification" }, // certification or hackathon
        name: { type: String, default: "" },
        issuer: { type: String, default: "" },
        date: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual id mapping for frontend consistency
resumeSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    // Expose id as customId or _id
    ret.id = ret.customId || ret._id.toString();
    return ret;
  },
});

module.exports = mongoose.model("Resume", resumeSchema);
