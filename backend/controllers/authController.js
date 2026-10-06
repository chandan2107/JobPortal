const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendOtpEmail, sendAdminVerificationRequestEmail } = require("../config/mailer");

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

    // Send OTP email via Resend
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

    // Email admin using Resend
    try {
      await sendAdminVerificationRequestEmail(user);
    } catch (mailErr) {
      console.warn("⚠️ Failed to email admin verification request:", mailErr.message);
    }

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