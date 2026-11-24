import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Bot,
  FileText,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  History,
  Volume2,
  Video,
  Clock,
  Layers,
  Award,
  ChevronRight,
  Target,
  BookOpen,
} from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import { useAuth } from "../../../context/AuthContext";

const PRESET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Python Developer",
  "Java Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Cloud Solutions Architect",
  "Product Manager",
  "UI/UX Designer",
  "Mobile App Developer (React Native/Flutter)",
  "Cybersecurity Analyst",
];

const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const urlJobId = searchParams.get("jobId");
  const initialMode = urlJobId ? "job" : "quick";

  const [mode, setMode] = useState(initialMode); // "quick" | "resume" | "job"
  const [role, setRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [difficulty, setDifficulty] = useState("fresher"); // "fresher" | "mid" | "senior"
  const [interviewType, setInterviewType] = useState("mixed"); // "technical" | "behavioral" | "mixed"
  const [questionCount, setQuestionCount] = useState(5); // 3 | 5 | 10
  const [voiceId, setVoiceId] = useState("orpheus"); // "orpheus" | "luna" | "asteria"
  const [voiceSpeed, setVoiceSpeed] = useState(0.88); // 0.85 | 0.95 | 1.0
  const [pauseBuffer, setPauseBuffer] = useState(5.5); // 5.5s (allows 5-6s pause tolerance before AI responds)

  // Resume mode states
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Job mode states
  const [selectedJobId, setSelectedJobId] = useState(urlJobId || "");
  const [jobDetails, setJobDetails] = useState(null);
  const [loadingJob, setLoadingJob] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  // Starting state
  const [starting, setStarting] = useState(false);

  // Load saved resumes when switching to resume mode
  useEffect(() => {
    if (mode === "resume" && resumes.length === 0) {
      fetchResumes();
    }
  }, [mode]);

  // Load job details if urlJobId is present
  useEffect(() => {
    if (urlJobId) {
      setSelectedJobId(urlJobId);
      fetchJobDetails(urlJobId);
    }
    if (mode === "job") {
      fetchSavedJobs();
    }
  }, [urlJobId, mode]);

  const fetchResumes = async () => {
    try {
      setLoadingResumes(true);
      const res = await axiosInstance.get(API_PATHS.RESUMES.GET_ALL);
      if (res.data?.success) {
        setResumes(res.data.resumes || []);
        if (res.data.resumes?.length > 0) {
          setSelectedResumeId(res.data.resumes[0]._id);
          // If resume has personalInfo.jobTitle, suggest it
          if (res.data.resumes[0].personalInfo?.jobTitle) {
            setRole(res.data.resumes[0].personalInfo.jobTitle);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load resumes:", err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const fetchJobDetails = async (id) => {
    try {
      setLoadingJob(true);
      const res = await axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(id));
      if (res.data) {
        setJobDetails(res.data);
        if (res.data.title) {
          setRole(res.data.title);
        }
      }
    } catch (err) {
      console.error("Failed to load job details:", err);
      toast.error("Could not load target job details.");
    } finally {
      setLoadingJob(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.SAVED_JOBS.GET_SAVED_JOBS);
      if (res.data) {
        // saved jobs might return array of objects with .job
        const list = Array.isArray(res.data)
          ? res.data.map((item) => item.job || item)
          : [];
        setSavedJobs(list.filter((j) => j && j._id));
      }
    } catch (err) {
      console.error("Failed to load saved jobs:", err);
    }
  };

  const handleStartInterview = async () => {
    const finalRole = customRole.trim() || role;

    if (!finalRole) {
      toast.error("Please enter or select a job role.");
      return;
    }

    if (mode === "resume" && !selectedResumeId) {
      toast.error("Please select a resume or build one first.");
      return;
    }

    if (mode === "job" && !selectedJobId) {
      toast.error("Please select a target job posting.");
      return;
    }

    try {
      setStarting(true);
      const payload = {
        mode,
        role: finalRole,
        difficulty,
        interviewType,
        questionCount,
        voiceId,
        voiceSpeed,
        pauseBuffer,
        resumeId: mode === "resume" ? selectedResumeId : undefined,
        jobId: mode === "job" ? selectedJobId : undefined,
      };

      const res = await axiosInstance.post(
        API_PATHS.MOCK_INTERVIEW.START,
        payload
      );

      if (res.data?.success) {
        toast.success("Interview session initialized! Entering room...");
        navigate(`/mock-interview/${res.data.interviewId}/room`, {
          state: {
            vapiAssistant: res.data.vapiAssistant,
            vapiPublicKey: res.data.vapiPublicKey,
            session: res.data.session,
          },
        });
      }
    } catch (err) {
      console.error("Failed to start mock interview:", err);
      toast.error(err.response?.data?.message || "Failed to start interview session.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 transition-colors pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Bot className="w-3.5 h-3.5" />
              AI Voice Interview Simulator
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Practice Job Interviews with AI
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base mt-1 max-w-2xl">
              Experience realistic voice interviews powered by Vapi. Get live real-time speech captions and comprehensive post-interview feedback on accuracy, communication, and confidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/mock-interview/history"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-all shadow-xs"
            >
              <History className="w-4 h-4 text-blue-500" />
              Past Interviews
            </Link>
          </div>
        </div>

        {/* 3 Mode Selection Cards */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Step 1: Choose Interview Mode
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode 1: Quick Practice */}
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                mode === "quick"
                  ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  {mode === "quick" && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Quick Practice
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Pick any tech role and jump straight into an AI voice interview session.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                <span>Preset & Custom Roles</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Mode 2: Resume-Based */}
            <button
              type="button"
              onClick={() => setMode("resume")}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                mode === "resume"
                  ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                  : "bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  {mode === "resume" && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Resume-Based
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  AI reads your saved resume and asks deep-dive questions about your actual projects.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <span>Personalized Analysis</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Mode 3: Job-Specific */}
            <button
              type="button"
              onClick={() => setMode("job")}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                mode === "job"
                  ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  {mode === "job" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Job-Specific
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Interview for real job postings on the portal based on their exact description and skills.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span>Targeted Preparation</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Role & Interview Format */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-7 shadow-sm">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Step 2: Role & Interview Format
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Set your target role, difficulty level, and round structure.
            </p>
          </div>

          {/* Mode 2 Specific: Resume Picker */}
          {mode === "resume" && (
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Select Your Resume
                </label>
                <Link
                  to="/resume-builder"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Manage Resumes →
                </Link>
              </div>

              {loadingResumes ? (
                <div className="py-4 text-center text-xs text-zinc-500">Loading your resumes...</div>
              ) : resumes.length === 0 ? (
                <div className="py-4 text-center space-y-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    You don't have any saved resumes yet. Build one to get personalized questions!
                  </p>
                  <Link
                    to="/resume-builder"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                  >
                    Create Resume
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resumes.map((res) => (
                    <button
                      key={res._id}
                      type="button"
                      onClick={() => {
                        setSelectedResumeId(res._id);
                        if (res.personalInfo?.jobTitle) setRole(res.personalInfo.jobTitle);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedResumeId === res._id
                          ? "bg-white dark:bg-zinc-900 border-indigo-500 ring-2 ring-indigo-500/20"
                          : "bg-white/80 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                          {res.title || "Untitled Resume"}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {res.personalInfo?.jobTitle || "Role not set"} • {res.skills?.length || 0} skills
                        </div>
                      </div>
                      {selectedResumeId === res._id && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mode 3 Specific: Job Picker */}
          {mode === "job" && (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                Target Job Posting
              </label>

              {loadingJob ? (
                <div className="py-4 text-center text-xs text-zinc-500">Loading job specifications...</div>
              ) : jobDetails ? (
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500 ring-2 ring-emerald-500/20 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                        {jobDetails.title}
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {jobDetails.company?.companyName || jobDetails.company?.name || "Company"} • {jobDetails.location || "Remote"}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                      {jobDetails.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {jobDetails.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Select one of your saved jobs to simulate an interview specifically for that role:
                  </p>
                  {savedJobs.length === 0 ? (
                    <div className="text-center py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-2">No saved jobs found.</p>
                      <Link
                        to="/find-jobs"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                      >
                        Browse Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                      {savedJobs.map((j) => (
                        <button
                          key={j._id}
                          type="button"
                          onClick={() => {
                            setSelectedJobId(j._id);
                            fetchJobDetails(j._id);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            selectedJobId === j._id
                              ? "bg-white dark:bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/20"
                              : "bg-white/80 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                              {j.title}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {j.company?.companyName || j.company?.name || "Company"}
                            </div>
                          </div>
                          {selectedJobId === j._id && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Job Role Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Target Role / Job Title
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setCustomRole("");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRESET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Or enter custom role (e.g. AI Engineer)..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Difficulty & Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Difficulty Level */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
                {[
                  { id: "fresher", label: "Fresher" },
                  { id: "mid", label: "Mid-Level" },
                  { id: "senior", label: "Senior" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id)}
                    className={`py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      difficulty === item.id
                        ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Type */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Focus Area
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
                {[
                  { id: "mixed", label: "Mixed" },
                  { id: "technical", label: "Technical" },
                  { id: "behavioral", label: "Behavioral" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInterviewType(item.id)}
                    className={`py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      interviewType === item.id
                        ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count (Configurable: 3, 5, 10) */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Questions Count
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
                {[
                  { count: 3, label: "3 Quick" },
                  { count: 5, label: "5 Standard" },
                  { count: 10, label: "10 Deep" },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setQuestionCount(item.count)}
                    className={`py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      questionCount === item.count
                        ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Voice & Pacing Preferences */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-7 shadow-sm">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              Step 3: Voice & Pacing Preferences
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Choose your interviewer voice, speaking speed, and thinking pause buffer.
            </p>
          </div>

          {/* Voice Persona & Speech Pace Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interviewer Persona & Tone */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Interviewer Voice</span>
                <span className="text-[10px] text-blue-500 font-semibold">Deepgram Aura-2</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "orpheus", label: "Alex", desc: "Calm (Male)" },
                  { id: "luna", label: "Sarah", desc: "Warm (Female)" },
                  { id: "asteria", label: "Asteria", desc: "Dynamic (Female)" },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVoiceId(v.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      voiceId === v.id
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white">{v.label}</span>
                      {voiceId === v.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                      {v.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Speaking Speed / Pace */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Speaking Cadence</span>
                <span className="text-[10px] text-emerald-500 font-semibold">Adaptive pacing</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { speed: 0.85, label: "Calm", desc: "0.85x clarity" },
                  { speed: 0.95, label: "Balanced", desc: "0.95x natural" },
                  { speed: 1.0, label: "Standard", desc: "1.0x baseline" },
                ].map((s) => (
                  <button
                    key={s.speed}
                    type="button"
                    onClick={() => setVoiceSpeed(s.speed)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      voiceSpeed === s.speed
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white">{s.label}</span>
                      {voiceSpeed === s.speed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                      {s.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Candidate Thinking Pause Tolerance */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Thinking Pause Allowance</span>
              <span className="text-[10px] text-amber-500 font-semibold">Prevents premature cut-offs</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  buffer: 5.5,
                  label: "5 - 6s Gap (Recommended)",
                  desc: "Generous buffer for structured technical thinking",
                },
                {
                  buffer: 4.0,
                  label: "4s Gap (Balanced)",
                  desc: "Moderate pause tolerance for steady flow",
                },
                {
                  buffer: 2.5,
                  label: "2 - 3s Gap (Snappy)",
                  desc: "Quick conversational back-and-forth pace",
                },
              ].map((b) => (
                <button
                  key={b.buffer}
                  type="button"
                  onClick={() => setPauseBuffer(b.buffer)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    pauseBuffer === b.buffer
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20"
                      : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">{b.label}</span>
                    {pauseBuffer === b.buffer && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                    {b.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compact Tip Strip */}
          <div className="px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
            <Volume2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>
              Allow microphone access when prompted. The AI listens patiently for your full answer and generates a detailed scorecard afterward.
            </span>
          </div>

          {/* Start CTA Button */}
          <div className="pt-1">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={starting}
              onClick={handleStartInterview}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 cursor-pointer transition-all disabled:opacity-50"
            >
              {starting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing AI Voice Room...</span>
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  <span>Start Voice Interview ({questionCount} Questions)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSetupPage;
