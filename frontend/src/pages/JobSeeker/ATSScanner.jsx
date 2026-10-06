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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-100" />
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
        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">/ 100</span>
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

  // State: Section toggles
  const [expandedSections, setExpandedSections] = useState({
    strengths: true,
    weaknesses: true,
    missingSkills: true,
    improvements: true,
    keywords: false,
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
      Excellent: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Award },
      Good: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
      Fair: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle },
      Poor: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
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
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                ATS Resume Scanner
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Analyze your resume against any job description for ATS compatibility
              </p>
            </div>
          </div>
        </div>

        {/* ─── INPUT SECTION ─── */}
        {!result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Resume Upload */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  Upload Resume
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">PDF format, up to 10 MB</p>
              </div>
              <div className="p-6">
                {!resumeFile ? (
                  <label
                    className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all block ${
                      dragOver
                        ? "border-indigo-400 bg-indigo-50/50 scale-[1.01]"
                        : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-indigo-500" />
                    </div>
                    <span className="text-sm font-bold text-indigo-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-400 mt-1.5">
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
                  <div className="flex items-center justify-between p-5 bg-indigo-50 border border-indigo-200 rounded-2xl">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(resumeFile.size / 1024).toFixed(1)} KB • PDF
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Job Description
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Paste the full job posting you're applying for
                </p>
              </div>
              <div className="p-6">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here…&#10;&#10;Include the title, responsibilities, requirements, and qualifications for best results."
                  className="w-full h-[260px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-sm font-medium text-gray-700 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 font-medium">
                    {jobDescription.length} characters
                  </span>
                  {jobDescription.length > 0 && jobDescription.length < 20 && (
                    <span className="text-xs text-amber-500 font-semibold">
                      Minimum 20 characters required
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Button */}
        {!result && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleScan}
              disabled={scanning || !resumeFile || jobDescription.trim().length < 20}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
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
        {scanning && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-700 mt-6">Scanning your resume with AI…</p>
            <p className="text-xs text-gray-400 mt-1">This typically takes 10-20 seconds</p>
          </div>
        )}

        {/* ─── RESULTS SECTION ─── */}
        {result && (
          <div className="space-y-6">
            {/* Top Bar: Score + Summary + New Scan */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
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
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">ATS Analysis Complete</h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{result.summary}</p>

                    {/* Format Score */}
                    {result.formatScore != null && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Format Score
                          </span>
                          <span className="text-xs font-extrabold text-gray-900">{result.formatScore}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
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
                          <p className="text-xs text-gray-500 mt-1.5">{result.formatFeedback}</p>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          setResult(null);
                          setResumeFile(null);
                          setChatMessages([]);
                          setSessionId(null);
                          setJobDescription("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-all border border-gray-200"
                      >
                        New Scan
                      </button>
                      <button
                        onClick={() => setChatOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat with AI Assistant
                      </button>
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
                  iconColor="text-emerald-500"
                  iconBg="bg-emerald-50 border-emerald-100"
                  items={result.strengths}
                  expanded={expandedSections.strengths}
                  onToggle={() => toggleSection("strengths")}
                  itemColor="text-emerald-700"
                  itemBg="bg-emerald-50"
                  itemBorder="border-emerald-100"
                />
              )}

              {/* Weaknesses */}
              {result.weaknesses?.length > 0 && (
                <AnalysisCard
                  title="Weaknesses"
                  icon={AlertTriangle}
                  iconColor="text-amber-500"
                  iconBg="bg-amber-50 border-amber-100"
                  items={result.weaknesses}
                  expanded={expandedSections.weaknesses}
                  onToggle={() => toggleSection("weaknesses")}
                  itemColor="text-amber-700"
                  itemBg="bg-amber-50"
                  itemBorder="border-amber-100"
                />
              )}

              {/* Missing Skills */}
              {result.missingSkills?.length > 0 && (
                <AnalysisCard
                  title="Missing Skills"
                  icon={Target}
                  iconColor="text-red-500"
                  iconBg="bg-red-50 border-red-100"
                  items={result.missingSkills}
                  expanded={expandedSections.missingSkills}
                  onToggle={() => toggleSection("missingSkills")}
                  itemColor="text-red-700"
                  itemBg="bg-red-50"
                  itemBorder="border-red-100"
                  chips
                />
              )}

              {/* Improvement Suggestions */}
              {result.improvements?.length > 0 && (
                <AnalysisCard
                  title="Improvement Suggestions"
                  icon={Lightbulb}
                  iconColor="text-indigo-500"
                  iconBg="bg-indigo-50 border-indigo-100"
                  items={result.improvements}
                  expanded={expandedSections.improvements}
                  onToggle={() => toggleSection("improvements")}
                  itemColor="text-indigo-700"
                  itemBg="bg-indigo-50"
                  itemBorder="border-indigo-100"
                  numbered
                />
              )}
            </div>

            {/* Keyword Analysis */}
            {result.keywordMatch && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection("keywords")}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-gray-900">Keyword Analysis</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {result.keywordMatch.matched?.length || 0} matched •{" "}
                        {result.keywordMatch.missing?.length || 0} missing
                      </p>
                    </div>
                  </div>
                  {expandedSections.keywords ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedSections.keywords && (
                  <div className="px-6 pb-6 space-y-4">
                    {/* Matched */}
                    {result.keywordMatch.matched?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                          ✓ Keywords Found in Resume
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.keywordMatch.matched.map((kw, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Missing */}
                    {result.keywordMatch.missing?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                          ✗ Keywords Missing from Resume
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.keywordMatch.missing.map((kw, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold"
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
      </div>

      {/* ─── CHATBOT DRAWER ─── */}
      {result && (
        <>
          {/* Backdrop when chat is expanded to full view */}
          {chatOpen && chatExpanded && (
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
              onClick={() => setChatExpanded(false)}
            />
          )}

          {/* Floating Chat Toggle (when closed) */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-indigo-300 hover:shadow-xl hover:shadow-indigo-400 transition-all flex items-center justify-center z-50 hover:scale-105 active:scale-95 group"
              title="Chat with AI Assistant"
            >
              <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Chat Panel (Docked or Expanded) */}
          {chatOpen && (
            <div
              className={`fixed z-50 bg-white border border-gray-200 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
                chatExpanded
                  ? "inset-2 sm:inset-6 md:inset-10 lg:inset-14 max-w-5xl mx-auto rounded-3xl"
                  : "bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[500px] h-[calc(100vh-60px)] sm:h-[660px] sm:rounded-2xl"
              }`}
            >
              {/* Chat Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">AI Resume Assistant</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-200">Grounded in your uploaded resume & target job</p>
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gray-50/50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-3.5 rounded-2xl ${
                        chatExpanded ? "text-[15px]" : "text-sm"
                      } leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-md shadow-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-tl-md shadow-xs"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div>
                          <div
                            className="prose prose-sm max-w-none text-gray-800 leading-relaxed [&>p]:mb-2.5 [&>ul]:mb-2.5 [&>ol]:mb-2.5 [&>p:last-child]:mb-0 [&>strong]:text-gray-900 [&>strong]:font-bold"
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
                            <div className="mt-3.5 pt-3 border-t border-gray-100">
                              <button
                                onClick={() =>
                                  setExpandedExcerpts((prev) => ({
                                    ...prev,
                                    [i]: !prev[i],
                                  }))
                                }
                                className="flex items-center justify-between w-full px-3 py-2 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/80 rounded-xl text-left transition-all group cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Database className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                                  <span className="text-xs font-bold text-indigo-900 truncate">
                                    Qdrant RAG Inspector ({msg.ragExcerpts.length} resume excerpt{msg.ragExcerpts.length > 1 ? "s" : ""} retrieved)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 flex-shrink-0 ml-2">
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
                                      className="p-3 bg-white border border-indigo-100 rounded-xl shadow-xs text-xs"
                                    >
                                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-gray-100">
                                        <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                                          <span className="w-4 h-4 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-black">
                                            {excerpt.index}
                                          </span>
                                          Resume Chunk #{excerpt.index}
                                        </span>
                                        {excerpt.relevance != null && (
                                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                                            {excerpt.relevance}% Match
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-gray-700 font-mono text-[11px] leading-relaxed whitespace-pre-wrap bg-gray-50/80 p-2.5 rounded-lg border border-gray-200/50">
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
                            <p className="text-[11px] text-gray-400 mt-2 font-medium flex items-center gap-1.5">
                              <Database className="w-3 h-3 text-indigo-500" />
                              Referenced {msg.ragChunks} resume section{msg.ragChunks > 1 ? "s" : ""} from Qdrant
                            </p>
                          )}

                          {/* Copy button */}
                          <div className="mt-2 flex items-center justify-end">
                            <button
                              onClick={() => copyToClipboard(msg.content, i)}
                              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
                              title="Copy answer"
                            >
                              {copiedIndex === i ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-bold">Copied!</span>
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
                      <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Questions */}
              {chatMessages.length <= 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
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
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <div className="px-4 py-3.5 border-t border-gray-200 flex-shrink-0 bg-white">
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
                    placeholder="Ask about missing skills, tailored summaries, or ATS optimization…"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-sm font-medium"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
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
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${iconBg} border rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="text-left">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {expanded ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
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
                  <span className={`w-6 h-6 rounded-lg ${itemColor} bg-white border ${itemBorder} flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
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
