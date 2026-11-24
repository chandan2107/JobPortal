import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  History,
  Bot,
  Award,
  Clock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";

const InterviewHistoryPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all"); // "all" | "quick" | "resume" | "job"

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.MOCK_INTERVIEW.GET_HISTORY);
      if (res.data?.interviews) {
        setInterviews(res.data.interviews);
      }
    } catch (err) {
      console.error("Failed to fetch interview history:", err);
      toast.error("Could not load past interviews.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this interview record?")) return;

    try {
      const res = await axiosInstance.delete(API_PATHS.MOCK_INTERVIEW.DELETE(id));
      if (res.data?.success) {
        toast.success("Interview deleted.");
        setInterviews((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete interview session.");
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    if (filterMode === "all") return true;
    return item.mode === filterMode;
  });

  // Calculate Stats
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter((i) => i.report?.overallScore > 0);
  const avgScore = completedInterviews.length
    ? Math.round(
        completedInterviews.reduce((acc, curr) => acc + (curr.report.overallScore || 0), 0) /
          completedInterviews.length
      )
    : 0;
  const totalSeconds = interviews.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  const formatTimer = (totalSec = 0) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 transition-colors pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold text-xs uppercase tracking-wider group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <History className="w-3.5 h-3.5" />
              Practice Records
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Mock Interview History
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Review your past voice interviews, score trends, and personalized feedback reports.
            </p>
          </div>

          <Link
            to="/mock-interview"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Bot className="w-4 h-4" />
            <span>Start New Interview</span>
          </Link>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
              <span>Total Sessions</span>
              <Bot className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {totalInterviews}
            </div>
            <div className="text-[11px] text-zinc-400">Completed or in-progress rounds</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
              <span>Average Score</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {avgScore > 0 ? `${avgScore} / 100` : "N/A"}
            </div>
            <div className="text-[11px] text-zinc-400">Across evaluated sessions</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
              <span>Practice Time</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {totalMinutes} mins
            </div>
            <div className="text-[11px] text-zinc-400">Total voice conversation</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          {[
            { id: "all", label: "All Sessions" },
            { id: "quick", label: "Quick Practice" },
            { id: "resume", label: "Resume-Based" },
            { id: "job", label: "Job-Specific" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterMode === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Sessions */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Loading interview history...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mx-auto">
              <Bot className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                No Interview Sessions Found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Take your first AI voice interview to simulate real questions and get a detailed scorecard.
              </p>
            </div>
            <Link
              to="/mock-interview"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Start Interview Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInterviews.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/mock-interview/${item._id}/report`)}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.mode === "job"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                        : item.mode === "resume"
                        ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                        : "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {item.mode === "job" ? (
                      <Briefcase className="w-5 h-5" />
                    ) : item.mode === "resume" ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.role}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {item.difficulty}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span>•</span>
                      <span>{formatTimer(item.duration)}</span>
                      <span>•</span>
                      <span>{item.interviewType || "mixed"} round</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                  {/* Score */}
                  {item.report?.overallScore > 0 ? (
                    <div className="text-right">
                      <div className="text-xs font-semibold text-zinc-400">Score</div>
                      <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {item.report.overallScore} / 100
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-900">
                        Pending Report
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete interview"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default InterviewHistoryPage;
