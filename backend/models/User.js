const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
name: { type: String, required: true },
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
role: { type: String, enum: ["jobSeeker", "employer"], required: true },
avatar: String,
resume: String,
// For job seeker profile
jobTitle: { type: String, default: "" },
phone: { type: String, default: "" },
location: { type: String, default: "" },
bio: { type: String, default: "" },
skills: { type: [String], default: [] },
linkedin: { type: String, default: "" },
github: { type: String, default: "" },
website: { type: String, default: "" },
// Resume analysis & recommendation metadata
resumeExtractedText: { type: String, default: "" },
resumeSkills: { type: [String], default: [] },
resumeHeadline: { type: String, default: "" },
// for employer
companyName: String,
companyDescription: String,
companyLogo: String,
// OTP verification
otp: String,
otpExpiry: Date,
// Company verification by admin
verificationStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
verificationNote: String,  // Admin rejection reason
}, { timestamps: true });


// Encrypt password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});




//match entered password

userSchema.methods.matchPassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
