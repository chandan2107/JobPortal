import { useState, useEffect, useMemo } from "react";
import ApplicantProfilePreview from "../../components/cards/ApplicantProfilePreview";
import {
  Users, Calendar, MapPin, Briefcase, Eye, ArrowLeft,
  Zap, CheckCircle, AlertCircle, XCircle, X, Loader2, ArrowUpDown
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { getInitials, openResumeUrl } from "../../utils/helper";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";

// ATS score color/label helpers
const getScoreColor = (score) => {
  if (score >= 80) return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700", icon: CheckCircle };
  if (score >= 60) return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700", icon: CheckCircle };
  if (score >= 40) return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", icon: AlertCircle };
  return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", icon: XCircle };
};

// ATS Result Modal
const ATSModal = ({ atsResult, applicantName, onClose }) => {
  if (!atsResult) return null;
  const colors = getScoreColor(atsResult.score);
  const Icon = colors.icon;
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (atsResult.score / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
  const jobId = location.state?.jobId || null;
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc"); // "date-desc" | "date-asc" | "ats-desc" | "ats-asc" | "name-asc" | "name-desc"

  // ATS state per application
  const [atsScores, setAtsScores] = useState({}); // { [applicationId]: { score, label, ... } }
  const [atsLoading, setAtsLoading] = useState({}); // { [applicationId]: true/false }
  const [atsModal, setAtsModal] = useState(null); // { result, name }

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = jobId
        ? API_PATHS.APPLICATIONS.GET_ALL_APPLICATIONS(jobId)
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
  }, [jobId]);

  // Group and sort applications per job
  const groupedApplications = useMemo(() => {
    const grouped = applications.reduce((acc, app) => {
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

    // Sort applicants within each job group
    Object.values(grouped).forEach((group) => {
      group.applications.sort((a, b) => {
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
    });

    return grouped;
  }, [applications, atsScores, sortBy]);

  const handleDownloadResume = (resumeUrl) => {
    openResumeUrl(resumeUrl);
  };

  const handleATSScore = async (application) => {
    const appId = application._id;
    const applicantName = application.applicant?.name || "Applicant";
    if (atsScores[appId]) {
      // Already scored — just show the modal
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Sort Options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/manage-jobs")}
              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Applications Overview</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Review and manage all candidate applications
              </p>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer pr-1"
            >
              <option value="date-desc">Date Applied: Newest First</option>
              <option value="date-asc">Date Applied: Oldest First</option>
              <option value="ats-desc">ATS Score: High to Low</option>
              <option value="ats-asc">ATS Score: Low to High</option>
              <option value="name-asc">Applicant Name: A to Z</option>
              <option value="name-desc">Applicant Name: Z to A</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedApplications).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-9 h-9 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Applications will appear here once candidates start applying to your job postings.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedApplications).map(({ job, applications }) => (
              <div key={job._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Job Header */}
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                          <Briefcase className="w-3 h-3" />
                          {job.type}
                        </span>
                        <span className="text-xs font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                          {job.category}
                        </span>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-sm font-bold text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full">
                      {applications.length} Applicant{applications.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Applicants List */}
                <div className="divide-y divide-gray-50">
                  {applications.map((application) => {
                    const appId = application._id;
                    const cachedScore = atsScores[appId];
                    const isScoring = atsLoading[appId];
                    const scoreColors = cachedScore ? getScoreColor(cachedScore.score) : null;

                    return (
                      <div
                        key={appId}
                        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 px-6 py-5 hover:bg-gray-50 transition-colors group"
                      >
                        {/* Applicant Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {application.applicant?.avatar ? (
                            <img
                              src={application.applicant.avatar}
                              alt={application.applicant.name || "Applicant"}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                              {getInitials(application.applicant?.name || "Applicant")}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {application.applicant?.name || "Anonymous Applicant"}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{application.applicant?.email || "No email"}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                <Calendar className="w-3 h-3" />
                                Applied {moment(application.createdAt).format("Do MMM YYYY")}
                              </span>
                              {/* Inline score badge (after scoring or from database) */}
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

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full lg:w-auto transition-opacity duration-200">
                          {/* ATS Score Button */}
                          <button
                            onClick={() => handleATSScore(application)}
                            disabled={isScoring}
                            title="Check ATS Resume Score vs Job Description"
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-purple-400 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isScoring ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                            {isScoring ? "Scoring..." : "ATS Score"}
                          </button>

                          {/* View Button */}
                          <button
                            onClick={() => setSelectedApplicant(application)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-semibold text-sm"
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