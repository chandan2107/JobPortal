const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { sendOtpEmail } = require("../config/mailer");

// Cookie options
const cookieOptions = {
  httpOnly: true,                                  // JS cannot read the cookie
  secure: process.env.NODE_ENV === "production",   // HTTPS only in prod
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 60 * 24 * 60 * 60 * 1000,              // 60 days in ms
};

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JT_SECRET, { expiresIn: "60d" });
};

// Generate a 6-digit numeric OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, avatar, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role, avatar });
    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
      resume: user.resume || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 1 — Validate credentials and send OTP email (no JWT yet)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Persist OTP (hashed) to DB
    user.otp = hashedOtp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOtpEmail(user.email, otp);

    res.json({
      message: "OTP sent to your email",
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Step 2 — Verify OTP and issue JWT
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No pending OTP. Please login again." });
    }

    // Check expiry
    if (new Date() > user.otpExpiry) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Issue JWT
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
      resume: user.resume || "",
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Request company verification — employer only
exports.requestVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can request verification" });
    }

    // Require profile completeness
    if (!user.companyName || !user.companyDescription || !user.companyLogo) {
      return res.status(400).json({
        message: "Please complete your company profile (name, logo, and description) before requesting verification.",
      });
    }

    if (user.verificationStatus === "approved") {
      return res.status(400).json({ message: "Your company is already verified." });
    }

    if (user.verificationStatus === "pending") {
      return res.status(400).json({ message: "Your verification request is already pending review." });
    }

    user.verificationStatus = "pending";
    user.verificationNote = "";
    await user.save();

    // Email admin
    const adminTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await adminTransporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: "darkn8546@gmail.com",
      subject: `🔔 New Verification Request — ${user.companyName}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(99,102,241,.12)">
          <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:36px 32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">📋 New Verification Request</h1>
          </div>
          <div style="padding:32px">
            <p style="color:#374151;font-size:15px">A new employer has requested company verification on Job Portal.</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px">Company Name</td><td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px">${user.companyName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Employer Email</td><td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px">${user.email}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Employer Name</td><td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px">${user.name}</td></tr>
            </table>
            <a href="http://localhost:5173/admin-login" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#6366f1;color:#fff;border-radius:10px;font-weight:600;text-decoration:none">Open Admin Panel →</a>
          </div>
          <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center">
            <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} Job Portal</p>
          </div>
        </div>
      `,
    });

    res.json({
      message: "Verification request submitted. Admin will review within 24 hours.",
      verificationStatus: "pending",
    });
  } catch (err) {
    console.error("Verification request error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Logout — clear the cookie
exports.logout = (req, res) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: 0 });
  res.json({ message: "Logged out successfully" });
};

// Get logged-in user
exports.getMe = async (req, res) => {
  res.json(req.user);
};