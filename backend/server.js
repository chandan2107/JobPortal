require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobsRoutes = require("./routes/savedJobRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const atsRoutes = require("./routes/atsRoutes");
const atsJobseekerRoutes = require("./routes/atsJobseekerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ragRoutes = require("./routes/ragRoutes");
const aiAssistantRoutes = require("./routes/aiAssistantRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const { initializeCollections: initRAG } = require("./services/ragService");



const app = express();

// Trust reverse proxy (Render, Heroku, Cloudflare) for secure cookies and accurate IPs
app.set("trust proxy", 1);

// Middleware to handle CORS
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl) or allowed domains
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  })
);


// Connect Database
connectDB().then(() => {
  // Initialize Qdrant vector collections for RAG (non-blocking)
  if (process.env.QDRANT_URL) {
    initRAG().catch((err) =>
      console.warn("[RAG] Qdrant init skipped:", err.message)
    );
  } else {
    console.log("[RAG] QDRANT_URL not set — RAG features disabled.");
  }
});


// Middleware
app.use(express.json());
app.use(cookieParser());

//routes

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/save-jobs", savedJobsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/ats", atsJobseekerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/ai", aiAssistantRoutes);
app.use("/api/resumes", resumeRoutes);

// Root health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    message: "🚀 Job Portal API server is up and running!",
    timestamp: new Date().toISOString(),
  });
});


//serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

//start sever 
const PORT= process.env.PORT || 5000;
app.listen(PORT, () => console.log(`sever running on port ${PORT}`));
