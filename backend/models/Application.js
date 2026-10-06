const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        job: {type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true},
        applicant: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        resume: {type: String},
        status: {
            type: String,
            enum: ["Applied", "In Review", "Shortlisted", "Interview", "Accepted", "Rejected"],
            default: "Applied",
        },
        atsScore: { type: Number, default: null },
        atsResult: {
            score: Number,
            label: String,
            summary: String,
            strengths: [String],
            gaps: [String],
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Application", applicationSchema);
