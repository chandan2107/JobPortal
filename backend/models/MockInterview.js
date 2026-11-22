const mongoose = require("mongoose");

const mockInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Interview Configuration
    mode: {
      type: String,
      enum: ["quick", "resume", "job"],
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["fresher", "mid", "senior"],
      default: "fresher",
    },
    interviewType: {
      type: String,
      enum: ["technical", "behavioral", "mixed"],
      default: "mixed",
    },
    questionCount: {
      type: Number,
      default: 5,
      min: 3,
      max: 15,
    },
    voiceId: {
      type: String,
      default: "orpheus",
    },
    voiceSpeed: {
      type: Number,
      default: 0.88,
    },
    pauseBuffer: {
      type: Number,
      default: 5.5,
    },
    interviewerName: {
      type: String,
      default: "Alex",
    },

    // Context References
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    resumeContext: {
      type: String,
      default: "",
    },
    jobContext: {
      type: String,
      default: "",
    },

    // Vapi metadata & call session
    vapiCallId: {
      type: String,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },

    // Transcript captured during voice interaction
    transcript: [
      {
        role: {
          type: String,
          enum: ["ai", "user"],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Number, // seconds from start of interview
          default: 0,
        },
      },
    ],

    // Detailed AI Report
    report: {
      overallScore: { type: Number, default: 0 }, // 0 - 100
      readinessLevel: { type: String, default: "" }, // e.g. "Interview Ready", "Needs Practice"
      summary: { type: String, default: "" },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      improvements: [{ type: String }],
      skillBreakdown: {
        technicalAccuracy: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        confidence: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 },
      },
      questionAnalysis: [
        {
          question: { type: String },
          answer: { type: String },
          score: { type: Number }, // 0 - 10
          feedback: { type: String },
          idealAnswer: { type: String },
        },
      ],
    },

    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MockInterview", mockInterviewSchema);
