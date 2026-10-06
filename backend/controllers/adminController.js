const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../config/mailer");  // reuse the transporter

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
  res.json({ message: "Admin logged in", email: ADMIN_EMAIL });
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

/* ─────────────── Email Helpers ─────────────── */
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendApprovalEmail = async (to, companyName) => {
  await transporter.sendMail({
    from: `"Job Portal Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: "✅ Company Verification Approved — Job Portal",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(34,197,94,.12)">
        <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:36px 32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">🎉 Verification Approved!</h1>
        </div>
        <div style="padding:32px">
          <p style="color:#374151;font-size:15px">Great news! <strong>${companyName}</strong> has been <strong>verified</strong> on Job Portal.</p>
          <p style="color:#374151;font-size:15px">You can now <strong>post jobs</strong> and start hiring talented professionals.</p>
          <a href="http://localhost:5173/post-job" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#22c55e;color:#fff;border-radius:10px;font-weight:600;text-decoration:none">Start Posting Jobs →</a>
        </div>
        <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center">
          <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} Job Portal</p>
        </div>
      </div>
    `,
  });
};

const sendRejectionEmail = async (to, companyName, reason) => {
  await transporter.sendMail({
    from: `"Job Portal Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Company Verification Update — Job Portal",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(239,68,68,.10)">
        <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:36px 32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Verification Update</h1>
        </div>
        <div style="padding:32px">
          <p style="color:#374151;font-size:15px">We have reviewed the verification request for <strong>${companyName}</strong>.</p>
          <p style="color:#374151;font-size:15px">Unfortunately, we could not approve it at this time.</p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:16px 0">
            <p style="color:#991b1b;font-size:14px;margin:0"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p style="color:#374151;font-size:15px">Please update your company profile and request verification again.</p>
        </div>
        <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center">
          <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} Job Portal</p>
        </div>
      </div>
    `,
  });
};
