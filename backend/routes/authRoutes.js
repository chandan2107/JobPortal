const express = require("express");
const https = require("https");
const { register, login, logout, getMe, verifyOtp, requestVerification } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadToCloudinary, cloudinary } = require("../config/cloudinary");

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/request-verification", protect, requestVerification);

// File/Image upload route via Cloudinary
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const isPdf = req.file.mimetype === "application/pdf";
    const originalName = req.file.originalname || "file";
    const cleanName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = Date.now();

    let result;

    if (isPdf) {
      result = await uploadToCloudinary(req.file.buffer, "job_portal_resumes", {
        public_id: `${timestamp}_${cleanName}.pdf`,
        resource_type: "raw",
      });
    } else {
      result = await uploadToCloudinary(req.file.buffer, "job_portal_images", {
        public_id: `${timestamp}_${cleanName}`,
        resource_type: "auto",
      });
    }

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "Failed to upload file to Cloudinary", error: error.message });
  }
});

// PDF Resume Proxy — fetches PDF directly from Cloudinary and pipes it with
// Content-Type: application/pdf so Chrome renders it inline.
// Requires "Allow delivery of PDF and ZIP files" enabled in Cloudinary Settings > Security.
router.get("/proxy-resume", (req, res) => {
  const rawUrl = decodeURIComponent(req.query.url || "");

  if (!rawUrl.startsWith("https://res.cloudinary.com/")) {
    return res.status(400).json({ message: "Only Cloudinary URLs are allowed." });
  }

  console.log(`[proxy-resume] Fetching: ${rawUrl}`);

  https.get(rawUrl, (cloudRes) => {
    const status = cloudRes.statusCode;
    console.log(`[proxy-resume] Status: ${status}, content-type: ${cloudRes.headers["content-type"]}`);

    if (status !== 200) {
      let body = "";
      cloudRes.on("data", (chunk) => { body += chunk.toString(); });
      cloudRes.on("end", () => {
        console.error(`[proxy-resume] Error: ${body.slice(0, 300)}`);
        res.status(502).json({ message: `Cloudinary returned HTTP ${status}` });
      });
      return;
    }

    // Pipe with correct headers — browser renders inline as PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="resume.pdf"');
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    cloudRes.pipe(res);
  }).on("error", (err) => {
    console.error("[proxy-resume] HTTPS error:", err.message);
    if (!res.headersSent) res.status(502).json({ message: "Network error reaching Cloudinary." });
  });
});


module.exports = router;