const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendApprovalEmail, sendRejectionEmail } = require("../config/mailer");

/* ─────────────── Admin credentials (from .env) ─────────────── */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000,  // 8 hours
};

const generateAdminToken = () =>
  jwt.sign({ role: "admin", email: ADMIN_EMAIL || "admin" }, process.env.ADMIN_JWT_SECRET, { expiresIn: "8h" });

/* ─────────────── Admin Login ─────────────── */
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({ message: "Admin credentials not configured in .env" });
  }
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }
  const token = generateAdminToken();
  res.cookie("adminToken", token, adminCookieOptions);
  res.json({ message: "Admin logged in", email: ADMIN_EMAIL, token });
};

/* ─────────────── Admin Logout ─────────────── */
exports.adminLogout = (req, res) => {
  res.clearCookie("adminToken", { ...adminCookieOptions, maxAge: 0 });
  res.json({ message: "Admin logged out" });
};

/* ─────────────── Get Admin Identity ─────────────── */
exports.getAdminMe = (req, res) => {
  res.json({ email: req.admin.email, role: "admin" });
};

/* ─────────────── Get All Employers (with verification info) ─────────────── */
exports.getAllEmployers = async (req, res) => {
  try {
    const employers = await User.find({ role: "employer" })
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });
    res.json(employers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────── Get Pending Employers ─────────────── */
exports.getPendingEmployers = async (req, res) => {
  try {
    const employers = await User.find({ role: "employer", verificationStatus: "pending" })
      .select("-password -otp -otpExpiry")
      .sort({ updatedAt: -1 });
    res.json(employers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────── Approve Employer ─────────────── */
exports.approveEmployer = async (req, res) => {
  try {
    const employer = await User.findById(req.params.id);
    if (!employer || employer.role !== "employer") {
      return res.status(404).json({ message: "Employer not found" });
    }

    employer.verificationStatus = "approved";
    employer.verificationNote = "";
    await employer.save();

    // Notify employer by email
    await sendApprovalEmail(employer.email, employer.companyName || employer.name);

    res.json({ message: "Employer approved successfully", employer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────── Reject Employer ─────────────── */
exports.rejectEmployer = async (req, res) => {
  try {
    const { reason } = req.body;
    const employer = await User.findById(req.params.id);
    if (!employer || employer.role !== "employer") {
      return res.status(404).json({ message: "Employer not found" });
    }

    employer.verificationStatus = "rejected";
    employer.verificationNote = reason || "Your application did not meet our requirements.";
    await employer.save();

    // Notify employer by email
    await sendRejectionEmail(employer.email, employer.companyName || employer.name, employer.verificationNote);

    res.json({ message: "Employer rejected", employer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

