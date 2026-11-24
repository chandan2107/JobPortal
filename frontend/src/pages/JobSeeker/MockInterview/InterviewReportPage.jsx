import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  History,
  FileText,
  ChevronDown,
  ChevronUp,
  Bot,
  Brain,
  MessageSquare,
  Clock,
  Printer,
  HelpCircle,
} from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";

const InterviewReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Accordion state for question analysis
  const [openQuestions, setOpenQuestions] = useState({});
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  useEffect(() => {
    fetchSessionAndGenerateReport();
  }, [id]);

  const fetchSessionAndGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch current session
      const res = await axiosInstance.get(API_PATHS.MOCK_INTERVIEW.GET_BY_ID(id));

      const sessionData = res.data?.session;
      if (!sessionData) {
        throw new Error("Interview session not found.");
      }

      setSession(sessionData);

      // 2. Check if report is already generated
      if (sessionData.report && sessionData.report.overallScore > 0) {
        setLoading(false);
        // Pre-open the first question
        setOpenQuestions({ 0: true });
        return;
      }

      // 3. If transcript exists but report is missing, call generate-report
      if (sessionData.transcript && sessionData.transcript.length > 0) {
        setGenerating(true);
        const reportRes = await axiosInstance.post(
          API_PATHS.MOCK_INTERVIEW.GENERATE_REPORT(id),
          {}
        );
        if (reportRes.data?.session) {
          setSession(reportRes.data.session);
          setOpenQuestions({ 0: true });
        }
      } else {
        toast.error("No transcript was captured during this session.");
      }
    } catch (err) {
      console.error("Failed to load interview report:", err);
      setError(err.response?.data?.message || err.message || "Failed to load report.");
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const toggleQuestion = (index) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-blue-500 stroke-blue-500 bg-blue-500/10 border-blue-500/30";
    if (score >= 40) return "text-amber-500 stroke-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-red-500 stroke-red-500 bg-red-500/10 border-red-500/30";
  };

  const formatTimer = (totalSec = 0) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 transition-colors pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Top Back / Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold text-xs uppercase tracking-wider group transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </button>

          <div className="flex items-center gap-3">
            <Link
              to="/mock-interview/history"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-blue-500" />
              <span>Interview History</span>
            </Link>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Print / Save PDF</span>
            </button>

            <Link
              to="/mock-interview"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </Link>
          </div>
        </div>

        {/* Loading / Generating State */}
        {(loading || generating) && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                AI Evaluator is Analyzing Your Interview...
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Evaluating answer accuracy, communication clarity, problem-solving, and formulating question-by-question recommendations.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && !generating && error && (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h4 className="font-bold text-red-700 dark:text-red-400 text-sm">Unable to generate report</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{error}</p>
            <button
              onClick={fetchSessionAndGenerateReport}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Report Content */}
        {!loading && !generating && session && session.report && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Hero Card */}
            <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {session.mode === "job" ? "Job-Specific Round" : session.mode === "resume" ? "Resume-Based Round" : "Quick Practice"}
                    </span>
                    <span className="text-xs text-zinc-400">
                      • {session.difficulty?.toUpperCase()} LEVEL
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {session.role} Interview Report
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>
                      Duration:{" "}
                      {formatTimer(
                        session.duration ||
                          (session.transcript?.length
                            ? Math.max(...session.transcript.map((t) => Number(t.timestamp) || 0))
                            : 0)
                      )}
                    </span>
                  </p>
                </div>

                {/* Score Dial & Readiness */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-200 dark:text-zinc-700"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={session.report.overallScore >= 75 ? "text-emerald-500" : session.report.overallScore >= 50 ? "text-blue-500" : "text-amber-500"}
                        strokeDasharray={`${session.report.overallScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                        {session.report.overallScore}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-zinc-400">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Overall Readiness
                    </div>
                    <div className="text-base font-bold text-zinc-900 dark:text-white">
                      {session.report.readinessLevel || "In Progress"}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Performance score
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary text */}
              {session.report.summary && (
                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50/60 dark:bg-zinc-800/30 p-4 rounded-xl">
                  <div className="font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Executive Summary:
                  </div>
                  {session.report.summary}
                </div>
              )}
            </div>

            {/* Strengths & Weaknesses 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths Card */}
              <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Key Strengths</span>
                </div>
                <div className="space-y-2.5">
                  {session.report.strengths?.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                  <AlertCircle className="w-5 h-5" />
                  <span>Growth Areas / Weaknesses</span>
                </div>
                <div className="space-y-2.5">
                  {session.report.weaknesses?.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            {session.report.improvements && session.report.improvements.length > 0 && (
              <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  Actionable Recommendations to Ace Your Next Round
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {session.report.improvements.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-xs text-zinc-700 dark:text-zinc-300 space-y-1.5"
                    >
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        Action #{idx + 1}
                      </div>
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question-by-Question Deep Dive Analysis */}
            {session.report.questionAnalysis && session.report.questionAnalysis.length > 0 && (
              <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Question-by-Question Deep Dive ({session.report.questionAnalysis.length} Questions Evaluated)
                  </h3>
                </div>

                <div className="space-y-4">
                  {session.report.questionAnalysis.map((qa, index) => {
                    const isOpen = Boolean(openQuestions[index]);
                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-800/30 transition-all"
                      >
                        {/* Accordion Header */}
                        <button
                          type="button"
                          onClick={() => toggleQuestion(index)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors"
                        >
                          <div className="flex items-start gap-3 pr-4">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-bold text-sm text-zinc-900 dark:text-white">
                                {qa.question}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                Your response: "{qa.answer || "N/A"}"
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                qa.score >= 8
                                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                  : qa.score >= 5
                                  ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                  : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                              }`}
                            >
                              {qa.score}/10
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                        </button>

                        {/* Accordion Body */}
                        {isOpen && (
                          <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 text-xs">
                            {/* Candidate's Recorded Answer */}
                            <div className="space-y-1">
                              <span className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">
                                What You Answered:
                              </span>
                              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 italic">
                                "{qa.answer}"
                              </div>
                            </div>

                            {/* Evaluator Feedback */}
                            <div className="space-y-1">
                              <span className="font-bold uppercase tracking-wider text-blue-500 text-[10px]">
                                Evaluator Critique & Feedback:
                              </span>
                              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-zinc-700 dark:text-zinc-300">
                                {qa.feedback}
                              </div>
                            </div>

                            {/* Ideal Model Answer */}
                            {qa.idealAnswer && (
                              <div className="space-y-1">
                                <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-[10px]">
                                  Model / Ideal Answer Blueprint:
                                </span>
                                <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                                  {qa.idealAnswer}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Conversation Log (Collapsible) */}
            <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <button
                type="button"
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 font-bold text-base text-zinc-900 dark:text-white">
                  <FileText className="w-5 h-5 text-zinc-500" />
                  <span>Full Verbatim Dialogue Transcript ({session.transcript?.length || 0} turns)</span>
                </div>
                {showFullTranscript ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {showFullTranscript && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 font-mono text-xs max-h-96 overflow-y-auto pr-2">
                  {session.transcript?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        item.role === "ai"
                          ? "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40 text-blue-950 dark:text-blue-200"
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-400 font-sans font-bold">
                        <span>{item.role === "ai" ? "Alex (AI Interviewer)" : "You (Candidate)"}</span>
                        <span>{formatTimer(item.timestamp)}</span>
                      </div>
                      <p className="font-sans text-xs">{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InterviewReportPage;
