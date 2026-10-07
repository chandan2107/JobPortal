import { useState, useEffect, useMemo } from "react";
import ApplicantProfilePreview from "../../components/cards/ApplicantProfilePreview";
import {
  Users, Calendar, MapPin, Briefcase, Eye, ArrowLeft,
  Zap, CheckCircle, AlertCircle, XCircle, X, Loader2, ArrowUpDown,
  LayoutGrid, ListFilter, Search, FileText, Clock, Sparkles, ChevronDown
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { getInitials, openResumeUrl } from "../../utils/helper";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatusBadge from "../../components/layout/StatusBadge";

// ATS score color/label helpers
const getScoreColor = (score) => {
  if (score >= 80) return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700", icon: CheckCircle };
  if (score >= 60) return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700", icon: CheckCircle };
  if (score >= 40) return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", icon: AlertCircle };
  return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", icon: XCircle };
};

// Kanban Pipeline Stages Configuration
const KANBAN_STAGES = [
  { id: "Applied", label: "Applied", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700", border: "border-slate-200", headerBg: "bg-slate-50 text-slate-800" },
  { id: "In Review", label: "In Review", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700", border: "border-blue-200", headerBg: "bg-blue-50/80 text-blue-900" },
  { id: "Shortlisted", label: "Shortlisted", dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700", border: "border-purple-200", headerBg: "bg-purple-50/80 text-purple-900" },
  { id: "Interview", label: "Interview", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700", border: "border-amber-200", headerBg: "bg-amber-50/80 text-amber-900" },
  { id: "Accepted", label: "Accepted", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-200", headerBg: "bg-emerald-50/80 text-emerald-900" },
  { id: "Rejected", label: "Rejected", dot: "bg-rose-500", badge: "bg-rose-100 text-rose-700", border: "border-rose-200", headerBg: "bg-rose-50/80 text-rose-900" },
];

// ATS Result Modal
const ATSModal = ({ atsResult, applicantName, onClose }) => {
  if (!atsResult) return null;
  const colors = getScoreColor(atsResult.score);
  const Icon = colors.icon;
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (atsResult.score / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b px-5 py-3.5 flex items-center justify-between`}>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ATS Match Score</p>
            <h3 className="text-sm font-bold text-gray-900">{applicantName}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/60 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* Score Circle & Summary */}
          <div className="flex items-center gap-4 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <div className="relative flex-shrink-0">
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                  cx="34" cy="34" r="28" fill="none"
                  stroke={atsResult.score >= 80 ? "#16a34a" : atsResult.score >= 60 ? "#2563eb" : atsResult.score >= 40 ? "#d97706" : "#dc2626"}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 34 34)"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-extrabold ${colors.text}`}>{atsResult.score}</span>
                <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.badge} mb-1`}>
                <Icon className="w-3 h-3" />
                {atsResult.label}
              </span>
              <p className="text-xs text-gray-600 leading-snug line-clamp-3">{atsResult.summary}</p>
            </div>
          </div>

          {/* Strengths */}
          {atsResult.strengths?.length > 0 && (
            <div className="bg-green-50/40 p-3 rounded-xl border border-green-100/60">
              <p className="text-[11px] font-bold text-green-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>✅</span> Strengths
              </p>
              <ul className="space-y-1">
                {atsResult.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <span className="text-green-500 font-bold flex-shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {atsResult.gaps?.length > 0 && (
            <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100/60">
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>⚠️</span> Skill Gaps
              </p>
              <ul className="space-y-1">
                {atsResult.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <span className="text-amber-500 font-bold flex-shrink-0">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-4 pb-3.5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationViewer = () => {
  const location = useLocation();
  const initialJobId = location.state?.jobId || null;
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || "all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Drag and Drop state
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // ATS state per application
  const [atsScores, setAtsScores] = useState({});
  const [atsLoading, setAtsLoading] = useState({});
  const [atsModal, setAtsModal] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = selectedJobId && selectedJobId !== "all"
        ? API_PATHS.APPLICATIONS.GET_ALL_APPLICATIONS(selectedJobId)
        : API_PATHS.APPLICATIONS.GET_ALL_EMPLOYER_APPLICATIONS;
      const response = await axiosInstance.get(url);
      const apps = response.data || [];
      setApplications(apps);

      // Pre-populate ATS scores from database
      const existingScores = {};
      apps.forEach((app) => {
        if (
          app.atsResult &&
          typeof app.atsResult === "object" &&
          typeof app.atsResult.score === "number" &&
          app.atsResult.summary
        ) {
          existingScores[app._id] = app.atsResult;
        }
      });
      setAtsScores(existingScores);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId]);

  // Extract unique jobs for the job selector filter
  const uniqueJobs = useMemo(() => {
    const jobsMap = new Map();
    applications.forEach((app) => {
      if (app.job && app.job._id) {
        jobsMap.set(app.job._id, app.job.title);
      }
    });
    return Array.from(jobsMap.entries()).map(([id, title]) => ({ id, title }));
  }, [applications]);

  // Filtered & Sorted applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          (app.applicant?.name || "").toLowerCase().includes(q) ||
          (app.applicant?.email || "").toLowerCase().includes(q) ||
          (app.job?.title || "").toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const scoreA = atsScores[a._id]?.score ?? a.atsScore ?? -1;
      const scoreB = atsScores[b._id]?.score ?? b.atsScore ?? -1;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      const nameA = (a.applicant?.name || "").toLowerCase();
      const nameB = (b.applicant?.name || "").toLowerCase();

      switch (sortBy) {
        case "ats-desc":
          return scoreB - scoreA;
        case "ats-asc":
          return scoreA - scoreB;
        case "date-asc":
          return dateA - dateB;
        case "date-desc":
          return dateB - dateA;
        case "name-asc":
          return nameA.localeCompare(nameB);
        case "name-desc":
          return nameB.localeCompare(nameA);
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [applications, atsScores, searchQuery, sortBy]);

  // Group applications by status for Kanban Board
  const kanbanColumns = useMemo(() => {
    const columns = {};
    KANBAN_STAGES.forEach((stage) => {
      columns[stage.id] = [];
    });

    filteredApplications.forEach((app) => {
      const status = app.status || "Applied";
      if (columns[status]) {
        columns[status].push(app);
      } else {
        // Fallback for unexpected status
        if (!columns["Applied"]) columns["Applied"] = [];
        columns["Applied"].push(app);
      }
    });

    return columns;
  }, [filteredApplications]);

  // Group applications per job for List View
  const groupedApplications = useMemo(() => {
    return filteredApplications.reduce((acc, app) => {
      const id = app.job?._id || "general";
      if (!acc[id]) {
        acc[id] = {
          job: app.job || { title: "General Applications", location: "N/A", type: "Full-time" },
          applications: [],
        };
      }
      acc[id].applications.push(app);
      return acc;
    }, {});
  }, [filteredApplications]);

  // Status Change Handler with Brevo notification feedback
  const handleStatusChange = async (appId, newStatus) => {
    const targetApp = applications.find((a) => a._id === appId);
    if (!targetApp || targetApp.status === newStatus) return;

    const previousStatus = targetApp.status;
    const applicantName = targetApp.applicant?.name || "Candidate";

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );

    try {
      await axiosInstance.put(API_PATHS.APPLICATIONS.UPDATE_STATUS(appId), {
        status: newStatus,
      });
      toast.success(
        <div>
          <p className="font-semibold text-sm">{applicantName} moved to {newStatus}</p>
          <p className="text-xs text-gray-500">✉️ Notification email sent via Brevo</p>
        </div>,
        { duration: 4000 }
      );
    } catch (err) {
      // Revert optimistic update on failure
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: previousStatus } : a))
      );
      toast.error(err?.response?.data?.message || "Failed to update status. Please try again.");
    }
  };

  // Drag & Drop event handlers
  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData("text/plain", appId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (stageId) => {
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const appId = e.dataTransfer.getData("text/plain") || draggedAppId;
    if (appId) {
      handleStatusChange(appId, stageId);
    }
    setDraggedAppId(null);
  };

  const handleDownloadResume = (resumeUrl) => {
    openResumeUrl(resumeUrl);
  };

  const handleATSScore = async (application) => {
    const appId = application._id;
    const applicantName = application.applicant?.name || "Applicant";
    if (atsScores[appId]) {
      setAtsModal({ result: atsScores[appId], name: applicantName });
      return;
    }

    setAtsLoading((prev) => ({ ...prev, [appId]: true }));
    try {
      const response = await axiosInstance.post(`/api/ats/score/${appId}`);
      setAtsScores((prev) => ({ ...prev, [appId]: response.data }));
      setAtsModal({ result: response.data, name: applicantName });
      toast.success("ATS Score generated and saved!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to get ATS score. Please try again.");
    } finally {
      setAtsLoading((prev) => ({ ...prev, [appId]: false }));
    }
  };

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate("/manage-jobs")}
              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all shadow-sm"
              title="Back to Manage Jobs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Candidate Pipeline</h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
                  {filteredApplications.length} Candidates
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                Drag and drop candidates across stages — applicants are automatically notified via Brevo.
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ListFilter className="w-4 h-4" />
              List View
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name, email, or role..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-xl text-xs font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Job Filter Dropdown */}
            {uniqueJobs.length > 0 && (
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-xl px-3 py-2 outline-none cursor-pointer pr-7 transition-colors"
                >
                  <option value="all">All Jobs ({uniqueJobs.length})</option>
                  {uniqueJobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-xl px-3 py-2 outline-none cursor-pointer transition-colors"
            >
              <option value="date-desc">Newest Applied</option>
              <option value="date-asc">Oldest Applied</option>
              <option value="ats-desc">ATS Score: High to Low</option>
              <option value="ats-asc">ATS Score: Low to High</option>
              <option value="name-asc">Candidate: A to Z</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {KANBAN_STAGES.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 animate-pulse h-96">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-28 bg-gray-100 rounded-xl" />
                <div className="h-28 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No candidates match your criteria</h3>
            <p className="text-gray-500 text-xs max-w-sm">
              {searchQuery ? "Try refining your search terms or clearing the filter." : "Applications will appear here once job seekers apply."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : viewMode === "kanban" ? (
          /* ─────────────────────────────────────────────────────────── */
          /*  KANBAN PIPELINE BOARD VIEW                                 */
          /* ─────────────────────────────────────────────────────────── */
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1340px] items-start">
              {KANBAN_STAGES.map((stage) => {
                const stageApps = kanbanColumns[stage.id] || [];
                const isOver = dragOverStage === stage.id;

                return (
                  <div
                    key={stage.id}
                    onDragOver={(e) => handleDragOver(e, stage.id)}
                    onDragLeave={() => handleDragLeave(stage.id)}
                    onDrop={(e) => handleDrop(e, stage.id)}
                    className={`flex-1 min-w-[220px] max-w-[260px] rounded-2xl border transition-all duration-200 flex flex-col ${
                      isOver
                        ? "bg-blue-50/50 border-blue-400 ring-2 ring-blue-300 ring-offset-1"
                        : "bg-gray-50/70 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Column Header */}
                    <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                        <h4 className="text-xs font-bold text-gray-900">{stage.label}</h4>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                        {stageApps.length}
                      </span>
                    </div>

                    {/* Column Body / Drop Zone */}
                    <div className="p-2.5 space-y-2.5 min-h-[460px] flex-1">
                      {stageApps.length === 0 ? (
                        <div
                          className={`h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-3 transition-colors ${
                            isOver ? "border-blue-400 bg-blue-50/60" : "border-gray-200 bg-white/40"
                          }`}
                        >
                          <p className="text-[11px] font-medium text-gray-400">
                            {isOver ? "Drop candidate here" : "No candidates"}
                          </p>
                        </div>
                      ) : (
                        stageApps.map((app) => {
                          const appId = app._id;
                          const cachedScore = atsScores[appId];
                          const isScoring = atsLoading[appId];
                          const scoreColors = cachedScore ? getScoreColor(cachedScore.score) : null;
                          const isBeingDragged = draggedAppId === appId;

                          return (
                            <div
                              key={appId}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, appId)}
                              className={`bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group relative ${
                                isBeingDragged ? "opacity-40 scale-95" : "opacity-100"
                              }`}
                            >
                              {/* Drag Handle Indicator */}
                              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-gray-400">⋮⋮</span>
                              </div>

                              {/* Candidate Info */}
                              <div className="flex items-start gap-2.5 mb-2.5">
                                {app.applicant?.avatar ? (
                                  <img
                                    src={app.applicant.avatar}
                                    alt={app.applicant.name || "Applicant"}
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {getInitials(app.applicant?.name || "Applicant")}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h5
                                    onClick={() => setSelectedApplicant(app)}
                                    className="text-xs font-bold text-gray-900 truncate hover:text-blue-600 cursor-pointer"
                                  >
                                    {app.applicant?.name || "Anonymous Candidate"}
                                  </h5>
                                  <p className="text-[11px] text-gray-500 truncate">
                                    {app.applicant?.email || "No email"}
                                  </p>
                                </div>
                              </div>

                              {/* Applied Position Badge */}
                              <div className="mb-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md truncate max-w-full">
                                  <Briefcase className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{app.job?.title || "Role"}</span>
                                </span>
                              </div>

                              {/* ATS Score & Date Row */}
                              <div className="flex items-center justify-between gap-1 mb-3 pt-1 border-t border-gray-50">
                                {cachedScore ? (
                                  <button
                                    onClick={() => setAtsModal({ result: cachedScore, name: app.applicant?.name || "Applicant" })}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full hover:opacity-85 transition-opacity ${scoreColors.badge}`}
                                    title="Click to view ATS breakdown"
                                  >
                                    <Zap className="w-2.5 h-2.5" />
                                    ATS {cachedScore.score}%
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleATSScore(app)}
                                    disabled={isScoring}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 transition-colors disabled:opacity-50"
                                  >
                                    {isScoring ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                    Score ATS
                                  </button>
                                )}

                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {moment(app.createdAt).fromNow(true)}
                                </span>
                              </div>

                              {/* Actions & Move Dropdown */}
                              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 w-full min-w-0">
                                <button
                                  onClick={() => setSelectedApplicant(app)}
                                  className="flex-1 min-w-0 py-1 px-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 truncate"
                                >
                                  <Eye className="w-3 h-3 shrink-0" />
                                  <span className="truncate">View</span>
                                </button>
                                
                                {app.applicant?.resume || app.resume ? (
                                  <button
                                    onClick={() => handleDownloadResume(app.applicant?.resume || app.resume)}
                                    className="shrink-0 py-1 px-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center"
                                    title="View Resume"
                                  >
                                    <FileText className="w-3 h-3" />
                                  </button>
                                ) : null}

                                {/* Quick Move Menu for accessibility / non-drag */}
                                <div className="relative shrink-0">
                                  <select
                                    value={stage.id}
                                    onChange={(e) => handleStatusChange(appId, e.target.value)}
                                    className="appearance-none w-[68px] text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg pl-2 pr-4 py-1 outline-none cursor-pointer transition-colors truncate"
                                    title="Move stage directly"
                                  >
                                    <option disabled value={stage.id}>Move</option>
                                    {KANBAN_STAGES.filter((s) => s.id !== stage.id).map((s) => (
                                      <option key={s.id} value={s.id}>➔ {s.label}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-2.5 h-2.5 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────── */
          /*  TABLE / LIST VIEW                                          */
          /* ─────────────────────────────────────────────────────────── */
          <div className="space-y-6">
            {Object.values(groupedApplications).map(({ job, applications: jobApps }) => (
              <div key={job._id || "general"} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Job Group Header */}
                <div className="bg-gray-50/80 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {job.location && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                          <Briefcase className="w-3 h-3" />
                          {job.type}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-2xs">
                    {jobApps.length} Candidates
                  </span>
                </div>

                {/* Candidate Rows */}
                <div className="divide-y divide-gray-100">
                  {jobApps.map((application) => {
                    const appId = application._id;
                    const cachedScore = atsScores[appId];
                    const isScoring = atsLoading[appId];
                    const scoreColors = cachedScore ? getScoreColor(cachedScore.score) : null;

                    return (
                      <div
                        key={appId}
                        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
                      >
                        {/* Candidate Identity */}
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          {application.applicant?.avatar ? (
                            <img
                              src={application.applicant.avatar}
                              alt={application.applicant.name || "Applicant"}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {getInitials(application.applicant?.name || "Applicant")}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4
                              onClick={() => setSelectedApplicant(application)}
                              className="text-sm font-bold text-gray-900 truncate hover:text-blue-600 cursor-pointer"
                            >
                              {application.applicant?.name || "Anonymous Applicant"}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">{application.applicant?.email || "No email"}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                <Calendar className="w-3 h-3" />
                                Applied {moment(application.createdAt).format("Do MMM YYYY")}
                              </span>

                              {cachedScore && (
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${scoreColors.badge}`}
                                  onClick={() => setAtsModal({ result: cachedScore, name: application.applicant?.name || "Applicant" })}
                                >
                                  <Zap className="w-3 h-3" />
                                  ATS {cachedScore.score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Select & Action Buttons */}
                        <div className="flex items-center gap-2.5 w-full lg:w-auto">
                          {/* Status Picker with Brevo trigger */}
                          <div className="relative">
                            <select
                              value={application.status || "Applied"}
                              onChange={(e) => handleStatusChange(appId, e.target.value)}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 outline-none cursor-pointer transition-colors"
                            >
                              {KANBAN_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* ATS Score Button */}
                          <button
                            onClick={() => handleATSScore(application)}
                            disabled={isScoring}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-purple-300 text-purple-700 bg-purple-50/60 rounded-xl hover:bg-purple-100 transition-colors text-xs font-semibold disabled:opacity-60"
                          >
                            {isScoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            {isScoring ? "Scoring..." : "ATS Score"}
                          </button>

                          {/* View Button */}
                          <button
                            onClick={() => setSelectedApplicant(application)}
                            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ATS Score Modal */}
      {atsModal && (
        <ATSModal
          atsResult={atsModal.result}
          applicantName={atsModal.name}
          onClose={() => setAtsModal(null)}
        />
      )}

      {/* Profile Modal */}
      {selectedApplicant && (
        <ApplicantProfilePreview
          selectedApplicant={selectedApplicant}
          setSelectedApplicant={setSelectedApplicant}
          handleDownloadResume={handleDownloadResume}
          handleClose={() => {
            setSelectedApplicant(null);
            fetchApplications();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ApplicationViewer;