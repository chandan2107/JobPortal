import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Zap,
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Shield,
  Lightbulb,
  X,
  Search,
  Award,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Database,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";

// ─── Score Ring Component ───────────────────────────────────────────────────
const ScoreRing = ({ score, size = 180, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: "#10b981", bg: "rgba(16,185,129,0.08)", text: "text-emerald-500", glow: "0 0 40px rgba(16,185,129,0.3)" };
    if (s >= 60) return { stroke: "#3b82f6", bg: "rgba(59,130,246,0.08)", text: "text-blue-500", glow: "0 0 40px rgba(59,130,246,0.3)" };
    if (s >= 40) return { stroke: "#f59e0b", bg: "rgba(245,158,11,0.08)", text: "text-amber-500", glow: "0 0 40px rgba(245,158,11,0.3)" };
    return { stroke: "#ef4444", bg: "rgba(239,68,68,0.08)", text: "text-red-500", glow: "0 0 40px rgba(239,68,68,0.3)" };
  };

  const colors = getColor(animatedScore);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" style={{ filter: `drop-shadow(${colors.glow})` }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-100 dark:text-zinc-800" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-5xl font-black ${colors.text}`}>{animatedScore}</span>
        <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 tracking-widest uppercase mt-1">/ 100</span>
      </div>
    </div>
  );
};

// ─── Main ATS Scanner Page ──────────────────────────────────────────────────
const ATSScanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // State: Upload & Input
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // State: Analysis
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // State: Scan History
  const [showHistory, setShowHistory] = useState(false);
  const [viewedFromHistory, setViewedFromHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await axiosInstance.get(API_PATHS.ATS.HISTORY);
      setHistory(res.data?.scans || []);
    } catch (err) {
      toast.error("Could not load scan history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleToggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next) {
      fetchHistory();
    }
  };

  const handleDeleteHistory = async (scanId) => {
    try {
      await axiosInstance.delete(API_PATHS.ATS.DELETE_HISTORY(scanId));
      setHistory((prev) => prev.filter((item) => item._id !== scanId));
      toast.success("Scan removed from history.");
    } catch {
      toast.error("Failed to delete scan.");
    }
  };

  const handleViewHistoryReport = (scan) => {
    setResult({
      score: scan.score,
      label: scan.label,
      formatScore: scan.formatScore,
      formatFeedback: scan.formatFeedback,
      summary: scan.summary,
      strengths: scan.strengths || [],
      weaknesses: scan.weaknesses || [],
      missingSkills: scan.missingSkills || [],
      improvements: scan.improvements || [],
      keywordMatch: scan.keywordMatch || { matched: [], missing: [] },
    });
    setViewedFromHistory(true);
    setShowHistory(false);
  };

  // State: Section toggles
  const [expandedSections, setExpandedSections] = useState({
    strengths: true,
    weaknesses: true,
    missingSkills: true,
    improvements: true,
    keywords: true,
    format: true,
  });

  // State: Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [expandedExcerpts, setExpandedExcerpts] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading]);

  // ── File handling ──
  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10 MB.");
      return;
    }
    setResumeFile(file);
    setResult(null);
    setChatMessages([]);
    setSessionId(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    setResult(null);
    setChatMessages([]);
    setSessionId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── ATS Scan ──
  const handleScan = async () => {
    if (!resumeFile) {
      toast.error("Please upload your resume first.");
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      toast.error("Please enter a job description (at least 20 characters).");
      return;
    }

    setScanning(true);
    setResult(null);
    setViewedFromHistory(false);
    setChatMessages([]);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const response = await axiosInstance.post(API_PATHS.ATS.SCAN, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 min for AI processing
      });

      setResult(response.data);
      setSessionId(response.data.sessionId);
      toast.success("ATS analysis complete!");

      // Add initial chatbot greeting
      setChatMessages([
        {
          role: "assistant",
          content:
            "👋 Hi! I've analyzed your uploaded resume against this job description. I'm ready to answer any questions about your resume, missing keywords, strengths, or how to tailor your experience for this role. What would you like to know?",
        },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  // ── Chatbot ──
  const handleSendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    const userMessage = { role: "user", content: msg };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.ATS.CHAT, {
        message: msg,
        sessionId,
        jobDescription: jobDescription.slice(0, 3000),
        history: chatMessages.slice(-8),
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.reply,
          ragChunks: response.data.ragChunksUsed,
          ragExcerpts: response.data.ragExcerpts || [],
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getLabelInfo = (label) => {
    const map = {
      Excellent: { color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60", icon: Award },
      Good: { color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60", icon: CheckCircle2 },
      Fair: { color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60", icon: AlertTriangle },
      Poor: { color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60", icon: XCircle },
    };
    return map[label] || map.Fair;
  };

  // Quick-question suggestions for the chatbot
  const quickQuestions = [
    "How can I improve my score?",
    "What keywords should I add?",
    "Is my resume ATS-friendly?",
    "Rewrite my summary for this job",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#090c15] pb-16 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => {
            if (showHistory) {
              setShowHistory(false);
            } else if (viewedFromHistory && result) {
              setResult(null);
              setViewedFromHistory(false);
              setShowHistory(true);
            } else {
              navigate(-1);
            }
          }}
          className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              ATS Resume{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-400">
                Scanner
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium mt-1">
              Analyze your resume against any job description for ATS compatibility
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleHistory}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm font-semibold text-gray-700 dark:text-zinc-200 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            {showHistory ? "Back to Scanner" : "History"}
          </button>
        </div>

        {/* ─── HISTORY SECTION ─── */}
        {showHistory && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-300 dark:border-zinc-700 shadow-sm p-6 mb-8">
            <div className="border-b border-gray-300 dark:border-zinc-700 pb-4 mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Past ATS Scores
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Click View Report on any past scan to inspect the full breakdown
              </p>
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl bg-gray-100 dark:bg-zinc-800/60 animate-pulse"
                  />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  No past ATS scans yet
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 mb-4">
                  Run your first resume scan to save and track your ATS scores here.
                </p>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Start New Scan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((scan) => {
                  const info = getLabelInfo(scan.label);
                  const scoreColor =
                    scan.score >= 80
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60"
                      : scan.score >= 60
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60"
                      : scan.score >= 40
                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60"
                      : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60";

                  return (
                    <div
                      key={scan._id}
                      className="p-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center flex-shrink-0 ${scoreColor}`}
                        >
                          <span className="text-lg font-black leading-none">{scan.score}</span>
                          <span className="text-[9px] font-bold uppercase opacity-75">/ 100</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-md">
                              {scan.jobSnippet || "Job Description Scan"}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${info.color}`}>
                              {scan.label} Match
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            <span className="font-medium truncate max-w-[200px]">{scan.fileName}</span>
                            {scan.formatScore != null && (
                              <>
                                <span>•</span>
                                <span>Format: {scan.formatScore}%</span>
                              </>
                            )}
                            <span>•</span>
                            <span>
                              {new Date(scan.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleViewHistoryReport(scan)}
                          className="px-4 py-2 bg-[#3c8ee0] hover:bg-[#2d7bc9] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Report
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHistory(scan._id)}
                          title="Delete scan"
                          className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── INPUT SECTION ─── */}
        {!showHistory && !result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Resume Upload */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-300 dark:border-zinc-700 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-300 dark:border-zinc-700">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  Upload Resume
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">PDF format, up to 10 MB</p>
              </div>
              <div className="p-6">
                {!resumeFile ? (
                  <label
                    className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all block ${
                      dragOver
                        ? "border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 scale-[1.01]"
                        : "border-gray-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 rounded-2xl flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">
                      Only PDF files are supported
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/60 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                          {(resumeFile.size / 1024).toFixed(1)} KB • PDF
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-2 text-gray-400 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors flex-shrink-0"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-300 dark:border-zinc-700 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-300 dark:border-zinc-700">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  Job Description
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Paste the full job posting you're applying for
                </p>
              </div>
              <div className="p-6">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here…&#10;&#10;Include the title, responsibilities, requirements, and qualifications for best results."
                  className="w-full h-[260px] px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-400 dark:focus:border-blue-500 transition-all outline-none text-sm font-medium text-gray-700 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                    {jobDescription.length} characters
                  </span>
                  {jobDescription.length > 0 && jobDescription.length < 20 && (
                    <span className="text-xs text-amber-500 dark:text-amber-400 font-semibold">
                      Minimum 20 characters required
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Button */}
        {!showHistory && !result && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleScan}
              disabled={scanning || !resumeFile || jobDescription.trim().length < 20}
              className="px-10 py-4 bg-[#3c8ee0] hover:bg-[#2d7bc9] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-950/50 hover:shadow-xl hover:shadow-blue-300 dark:hover:shadow-blue-900/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing your resume…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        )}

        {/* Scanning Animation */}
        {!showHistory && scanning && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-100 dark:border-blue-900/60 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-zinc-200 mt-6">Scanning your resume with AI…</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">This typically takes 10-20 seconds</p>
          </div>
        )}

        {/* ─── RESULTS SECTION ─── */}
        {!showHistory && result && (
          <div className="space-y-6">
            {/* Top Bar: Score + Summary + New Scan */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-300 dark:border-zinc-700 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Score Ring */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <ScoreRing score={result.score} />
                    <div className="mt-3">
                      {(() => {
                        const info = getLabelInfo(result.label);
                        const Icon = info.icon;
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border ${info.color}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {result.label} Match
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">ATS Analysis Complete</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed mb-4">{result.summary}</p>

                    {/* Format Score */}
                    {result.formatScore != null && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <BarChart3 className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                          <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                            Format Score
                          </span>
                          <span className="text-xs font-extrabold text-gray-900 dark:text-white">{result.formatScore}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${result.formatScore}%`,
                              background:
                                result.formatScore >= 80
                                  ? "linear-gradient(90deg, #10b981, #059669)"
                                  : result.formatScore >= 60
                                  ? "linear-gradient(90deg, #3b82f6, #2563eb)"
                                  : "linear-gradient(90deg, #f59e0b, #d97706)",
                            }}
                          />
                        </div>
                        {result.formatFeedback && (
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5">{result.formatFeedback}</p>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          setResult(null);
                          setViewedFromHistory(false);
                          setResumeFile(null);
                          setChatMessages([]);
                          setSessionId(null);
                          setJobDescription("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded-xl font-semibold text-xs transition-all border border-gray-200 dark:border-zinc-700"
                      >
                        New Scan
                      </button>
                      {!viewedFromHistory && (
                        <button
                          onClick={() => setChatOpen(true)}
                          className="px-5 py-2.5 bg-[#3c8ee0] hover:bg-[#2d7bc9] text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat with AI Assistant
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Detail Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <AnalysisCard
                  title="Strengths"
                  icon={CheckCircle2}
                  iconColor="text-emerald-500 dark:text-emerald-400"
                  iconBg="bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/60"
                  items={result.strengths}
                  expanded={expandedSections.strengths}
                  onToggle={() => toggleSection("strengths")}
                  itemColor="text-emerald-700 dark:text-emerald-300"
                  itemBg="bg-emerald-50 dark:bg-emerald-950/30"
                  itemBorder="border-emerald-100 dark:border-emerald-800/50"
                />
              )}

              {/* Weaknesses */}
              {result.weaknesses?.length > 0 && (
                <AnalysisCard
                  title="Weaknesses"
                  icon={AlertTriangle}
                  iconColor="text-amber-500 dark:text-amber-400"
                  iconBg="bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-800/60"
                  items={result.weaknesses}
                  expanded={expandedSections.weaknesses}
                  onToggle={() => toggleSection("weaknesses")}
                  itemColor="text-amber-700 dark:text-amber-300"
                  itemBg="bg-amber-50 dark:bg-amber-950/30"
                  itemBorder="border-amber-100 dark:border-amber-800/50"
                />
              )}

              {/* Left Column: Missing Skills + Keyword Analysis stacked as separate dropdowns */}
              {(result.missingSkills?.length > 0 || result.keywordMatch) && (
                <div className="space-y-6">
                  {result.missingSkills?.length > 0 && (
                    <AnalysisCard
                      title="Missing Skills"
                      icon={Target}
                      iconColor="text-red-500 dark:text-red-400"
                      iconBg="bg-red-50 border-red-100 dark:bg-red-950/40 dark:border-red-800/60"
                      items={result.missingSkills}
                      expanded={expandedSections.missingSkills}
                      onToggle={() => toggleSection("missingSkills")}
                      itemColor="text-red-700 dark:text-red-300"
                      itemBg="bg-red-50 dark:bg-red-950/30"
                      itemBorder="border-red-100 dark:border-red-800/50"
                      chips
                    />
                  )}

                  {result.keywordMatch && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-300 dark:border-zinc-700 shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleSection("keywords")}
                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Keyword Analysis</h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                              {result.keywordMatch.matched?.length || 0} matched •{" "}
                              {result.keywordMatch.missing?.length || 0} missing
                            </p>
                          </div>
                        </div>
                        {expandedSections.keywords ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                        )}
                      </button>

                      {expandedSections.keywords && (
                        <div className="px-6 pb-6 space-y-4">
                          {result.keywordMatch.matched?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                                ✓ Keywords Found in Resume
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {result.keywordMatch.matched.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs font-semibold"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.keywordMatch.missing?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2">
                                ✗ Keywords Missing from Resume
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {result.keywordMatch.missing.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 rounded-lg text-xs font-semibold"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Improvement Suggestions */}
              {result.improvements?.length > 0 && (
                <AnalysisCard
                  title="Improvement Suggestions"
                  icon={Lightbulb}
                  iconColor="text-blue-500 dark:text-blue-400"
                  iconBg="bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-800/60"
                  items={result.improvements}
                  expanded={expandedSections.improvements}
                  onToggle={() => toggleSection("improvements")}
                  itemColor="text-blue-700 dark:text-blue-300"
                  itemBg="bg-blue-50 dark:bg-blue-950/30"
                  itemBorder="border-blue-100 dark:border-blue-800/50"
                  numbered
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── CHATBOT DRAWER ─── */}
      {result && !viewedFromHistory && (
        <>
          {/* Backdrop when chat is expanded to full view */}
          {chatOpen && chatExpanded && (
            <div
              className="fixed inset-0 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
              onClick={() => setChatExpanded(false)}
            />
          )}

          {/* Floating Chat Toggle (when closed) */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-[#3c8ee0] hover:bg-[#2d7bc9] text-white rounded-2xl shadow-lg shadow-blue-300 dark:shadow-blue-950/60 hover:shadow-xl hover:shadow-blue-400 transition-all flex items-center justify-center z-50 hover:scale-105 active:scale-95 group cursor-pointer"
              title="Chat with AI Assistant"
            >
              <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Chat Panel (Docked or Expanded) */}
          {chatOpen && (
            <div
              className={`fixed z-50 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
                chatExpanded
                  ? "inset-2 sm:inset-6 md:inset-10 lg:inset-14 max-w-5xl mx-auto rounded-3xl"
                  : "bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[500px] h-[calc(100vh-60px)] sm:h-[660px] sm:rounded-2xl"
              }`}
            >
              {/* Chat Header */}
              <div className="px-5 py-4 bg-[#3c8ee0] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">AI Resume Assistant</h3>
                    <p className="text-[11px] text-blue-100">Grounded in your uploaded resume & target job</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setChatExpanded(!chatExpanded)}
                    className="p-2 hover:bg-white/15 rounded-xl transition-colors text-white"
                    title={chatExpanded ? "Collapse to side" : "Expand to full view"}
                  >
                    {chatExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setChatOpen(false);
                      setChatExpanded(false);
                    }}
                    className="p-2 hover:bg-white/15 rounded-xl transition-colors text-white"
                    title="Close chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gray-50/50 dark:bg-zinc-950/60">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-3.5 rounded-2xl ${
                        chatExpanded ? "text-[15px]" : "text-sm"
                      } leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-md shadow-sm"
                          : "bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 rounded-tl-md shadow-xs"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div>
                          <div
                            className="prose prose-sm max-w-none text-gray-800 dark:text-zinc-200 leading-relaxed [&>p]:mb-2.5 [&>ul]:mb-2.5 [&>ol]:mb-2.5 [&>p:last-child]:mb-0 [&>strong]:text-gray-900 dark:[&>strong]:text-white [&>strong]:font-bold"
                            dangerouslySetInnerHTML={{
                              __html: msg.content
                                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                .replace(/^- (.*)/gm, "<li>$1</li>")
                                .replace(/(<li>.*<\/li>)/gs, "<ul class='list-disc pl-4 space-y-1'>$1</ul>")
                                .replace(/^\d+\. (.*)/gm, "<li>$1</li>")
                                .replace(/\n/g, "<br/>"),
                            }}
                          />

                          {/* Reference Inspector Card (Accordion) */}
                          {msg.ragExcerpts && msg.ragExcerpts.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
                              <button
                                onClick={() =>
                                  setExpandedExcerpts((prev) => ({
                                    ...prev,
                                    [i]: !prev[i],
                                  }))
                                }
                                className="flex items-center justify-between w-full px-3 py-2 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 rounded-xl text-left transition-all group cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200 truncate">
                                    Qdrant RAG Inspector ({msg.ragExcerpts.length} resume excerpt{msg.ragExcerpts.length > 1 ? "s" : ""} retrieved)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2">
                                  <span>{expandedExcerpts[i] ? "Hide" : "Inspect"}</span>
                                  {expandedExcerpts[i] ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </div>
                              </button>

                              {expandedExcerpts[i] && (
                                <div className="mt-2.5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                  {msg.ragExcerpts.map((excerpt, eIdx) => (
                                    <div
                                      key={eIdx}
                                      className="p-3 bg-white dark:bg-zinc-950 border border-blue-100 dark:border-blue-900/60 rounded-xl shadow-xs text-xs"
                                    >
                                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-gray-100 dark:border-zinc-800">
                                        <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                                          <span className="w-4 h-4 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-[10px] font-black">
                                            {excerpt.index}
                                          </span>
                                          Resume Chunk #{excerpt.index}
                                        </span>
                                        {excerpt.relevance != null && (
                                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-[10px] font-bold">
                                            {excerpt.relevance}% Match
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-gray-700 dark:text-zinc-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap bg-gray-50/80 dark:bg-zinc-900 p-2.5 rounded-lg border border-gray-200/50 dark:border-zinc-800">
                                        {excerpt.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fallback chip if ragChunks exists without full excerpts */}
                          {(!msg.ragExcerpts || msg.ragExcerpts.length === 0) && msg.ragChunks > 0 && (
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2 font-medium flex items-center gap-1.5">
                              <Database className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                              Referenced {msg.ragChunks} resume section{msg.ragChunks > 1 ? "s" : ""} from Qdrant
                            </p>
                          )}

                          {/* Copy button */}
                          <div className="mt-2 flex items-center justify-end">
                            <button
                              onClick={() => copyToClipboard(msg.content, i)}
                              className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
                              title="Copy answer"
                            >
                              {copiedIndex === i ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Questions */}
              {chatMessages.length <= 1 && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-900">
                  <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Quick Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setChatInput(q);
                          setTimeout(() => {
                            const userMessage = { role: "user", content: q };
                            setChatMessages((prev) => [...prev, userMessage]);
                            setChatLoading(true);
                            axiosInstance
                              .post(API_PATHS.ATS.CHAT, {
                                message: q,
                                sessionId,
                                jobDescription: jobDescription.slice(0, 3000),
                                history: chatMessages.slice(-8),
                              })
                              .then((res) => {
                                setChatMessages((prev) => [
                                  ...prev,
                                  {
                                    role: "assistant",
                                    content: res.data.reply,
                                    ragChunks: res.data.ragChunksUsed,
                                    ragExcerpts: res.data.ragExcerpts || [],
                                  },
                                ]);
                              })
                              .catch(() => {
                                setChatMessages((prev) => [
                                  ...prev,
                                  { role: "assistant", content: "Sorry, something went wrong. Please try again." },
                                ]);
                              })
                              .finally(() => setChatLoading(false));
                            setChatInput("");
                          }, 50);
                        }}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <div className="px-4 py-3.5 border-t border-gray-300 dark:border-zinc-700 flex-shrink-0 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about your resume..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-400 dark:focus:border-blue-500 transition-all outline-none text-sm font-medium text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="w-10 h-10 bg-[#3c8ee0] hover:bg-[#2d7bc9] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4 -translate-x-[1px] translate-y-[1px]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Reusable Analysis Card Component ───────────────────────────────────────
const AnalysisCard = ({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  items,
  expanded,
  onToggle,
  itemColor,
  itemBg,
  itemBorder,
  chips = false,
  numbered = false,
}) => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-300 dark:border-zinc-700 shadow-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${iconBg} border rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="text-left">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {expanded ? (
        <ChevronUp className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
      )}
    </button>

    {expanded && (
      <div className="px-6 pb-6">
        {chips ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 ${itemBg} ${itemColor} border ${itemBorder} rounded-lg text-xs font-semibold`}
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 ${itemBg} border ${itemBorder} rounded-xl`}>
                {numbered ? (
                  <span className={`w-6 h-6 rounded-lg ${itemColor} bg-white dark:bg-zinc-900 border ${itemBorder} flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                    {i + 1}
                  </span>
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${iconColor.replace("text-", "bg-")} mt-2 flex-shrink-0`} />
                )}
                <p className={`text-sm ${itemColor} font-medium leading-relaxed`}>{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

export default ATSScanner;
