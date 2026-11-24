import { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layout/Navbar";
import StatusBadge from "../../components/layout/StatusBadge";
import moment from "moment";

const Applications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [appFilter, setAppFilter] = useState("all");

  const fetchMyApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await axiosInstance.get(API_PATHS.APPLICATIONS.GET_MY_APPLICATIONS);
      setApplications(res.data || []);
    } catch (err) {
      console.error("Error fetching my applications:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyApplications();
    } else {
      setLoadingApps(false);
    }
  }, [user]);

  const totalApplied = applications.length;
  const selectedCount = applications.filter(
    (app) => app.status === "Accepted" || app.status === "Selected"
  ).length;
  const inReviewCount = applications.filter(
    (app) => app.status === "In Review" || app.status === "Applied"
  ).length;
  const rejectedCount = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  const filteredApplications = applications.filter((app) => {
    if (appFilter === "all") return true;
    if (appFilter === "selected") return app.status === "Accepted" || app.status === "Selected";
    if (appFilter === "in_review") return app.status === "In Review" || app.status === "Applied";
    if (appFilter === "rejected") return app.status === "Rejected";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#090c15] pb-20 transition-colors">
      <Navbar />

      <div className="max-w-6xl mx-auto mt-6 px-4 sm:px-6">
        {/* Top Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-semibold text-xs uppercase tracking-wider mb-5 group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Job Applications
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Track the status of your submitted job applications
            </p>
          </div>

          <button
            onClick={() => navigate("/find-jobs")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Briefcase className="w-4 h-4" />
            Browse Jobs
          </button>
        </div>

        <div className="space-y-6">
          {/* Overview Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Applied */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Applied
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{totalApplied}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Submitted applications</p>
            </div>

            {/* Selected / Accepted */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Selected
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{selectedCount}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Offers & hires</p>
            </div>

            {/* In Review */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  In Review
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{inReviewCount}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Under evaluation</p>
            </div>

            {/* Rejected */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Rejected
                </span>
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800/60 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{rejectedCount}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Unsuccessful</p>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setAppFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appFilter === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                All ({totalApplied})
              </button>
              <button
                onClick={() => setAppFilter("in_review")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appFilter === "in_review"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/70 border border-amber-200/50 dark:border-amber-800/50"
                }`}
              >
                In Review ({inReviewCount})
              </button>
              <button
                onClick={() => setAppFilter("selected")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appFilter === "selected"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200/50 dark:border-emerald-800/50"
                }`}
              >
                Selected ({selectedCount})
              </button>
              <button
                onClick={() => setAppFilter("rejected")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appFilter === "rejected"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/70 border border-red-200/50 dark:border-red-800/50"
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>

            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium hidden sm:inline">
              Showing {filteredApplications.length} of {totalApplied} applications
            </span>
          </div>

          {/* Applications List */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
            {loadingApps ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 animate-pulse space-y-3">
                    <div className="h-5 bg-slate-200 dark:bg-zinc-700 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {applications.length === 0 ? "No applications submitted yet" : "No applications in this category"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
                  {applications.length === 0
                    ? "Explore active job listings and start applying to your dream roles."
                    : "Try switching filters to view all your applications."}
                </p>
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm text-sm cursor-pointer"
                >
                  Search & Apply Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-sm bg-white dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      {app.job?.company?.companyLogo ? (
                        <img
                          src={app.job.company.companyLogo}
                          alt="Company Logo"
                          className="w-12 h-12 rounded-xl object-contain border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {app.job?.title || "Job Title N/A"}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                          {app.job?.company?.companyName || app.job?.company?.name || "Company"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {app.job?.location && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-1 rounded-md font-medium">
                              <MapPin className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                              {app.job.location}
                            </span>
                          )}
                          {app.job?.type && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60">
                              {app.job.type}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            Applied {moment(app.createdAt).format("Do MMM YYYY")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-zinc-800">
                      <StatusBadge status={app.status || "Applied"} />

                      {app.job?._id && (
                        <button
                          onClick={() => navigate(`/job/${app.job._id}`)}
                          className="p-2 text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
                          title="View Job Details"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
