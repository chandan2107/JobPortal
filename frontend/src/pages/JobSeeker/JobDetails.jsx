import {
  MapPin,
  IndianRupee,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Bookmark,
  Users,
  Bot,
  Briefcase,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import moment from "moment";
import StatusBadge from "../../components/layout/StatusBadge";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { user, isAuthenticated } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const getJobDetailsById = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.JOBS.GET_JOB_BY_ID(jobId),
        { params: { userId: user?._id || null } }
      );
      setJobDetails(response.data);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to apply for jobs");
      navigate("/login");
      return;
    }
    try {
      setApplying(true);
      if (jobId) {
        await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId));
        toast.success("Applied to job successfully!");
      }
      await getJobDetailsById();
    } catch (err) {
      const errorMsg = err?.response?.data?.message;
      toast.error(errorMsg || "Something went wrong! Try again later");
    } finally {
      setApplying(false);
    }
  };

  const toggleSaveJob = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to save jobs");
      navigate("/login");
      return;
    }
    try {
      if (jobDetails?.isSaved) {
        await axiosInstance.delete(API_PATHS.SAVED_JOBS.UNSAVE_JOB(jobId));
        toast.success("Job removed from saved jobs!");
        setJobDetails((prev) => ({ ...prev, isSaved: false }));
      } else {
        await axiosInstance.post(API_PATHS.SAVED_JOBS.SAVE_JOB(jobId));
        toast.success("Job saved successfully!");
        setJobDetails((prev) => ({ ...prev, isSaved: true }));
      }
    } catch (err) {
      console.error("Error toggling save job:", err);
      toast.error("Something went wrong! Try again later");
    }
  };

  useEffect(() => {
    if (jobId) getJobDetailsById();
  }, [jobId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#090c15] transition-colors">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-28 animate-pulse" />
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 animate-pulse">
            <div className="flex gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-gray-100 dark:bg-zinc-800 rounded-lg w-2/3" />
                <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded-lg w-1/3" />
                <div className="flex gap-2 mt-2">
                  <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded-full w-24" />
                  <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded-full w-20" />
                  <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded-full w-28" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-24 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 animate-pulse" />
            <div className="h-24 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 animate-pulse" />
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 animate-pulse space-y-3">
            <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded w-1/4" />
            <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-5/6" />
            <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#090c15] pb-16 transition-colors">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
        </button>

        {!jobDetails ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-12 text-center">
            <Briefcase className="w-10 h-10 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Job not found</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5">
              This job posting may have been removed or is no longer available.
            </p>
            <button
              onClick={() => navigate("/find-jobs")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Hero Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
              <div className="flex flex-col gap-6">
                {/* Top row: Logo + Title + Top-right Save Button */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 sm:gap-5 items-start min-w-0 flex-1">
                    {jobDetails?.company?.companyLogo ? (
                      <img
                        src={jobDetails.company.companyLogo}
                        alt="Company Logo"
                        className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl object-contain border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                        {jobDetails.title}
                      </h1>
                      <p className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm mb-3">
                        <Building2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        {jobDetails.company?.companyName || jobDetails.company?.name}
                      </p>

                      {/* Metadata Pills (neutral + blue accent) */}
                      <div className="flex flex-wrap items-center gap-2">
                        {jobDetails.location && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 px-3 py-1 rounded-full font-medium">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                            {jobDetails.location}
                          </span>
                        )}
                        {jobDetails.type && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-3 py-1 rounded-full font-semibold">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            {jobDetails.type}
                          </span>
                        )}
                        {jobDetails.category && (
                          <span className="text-xs text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 px-3 py-1 rounded-full font-medium">
                            {jobDetails.category}
                          </span>
                        )}
                        {jobDetails.vacancies && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 px-3 py-1 rounded-full font-medium">
                            <Users className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                            {jobDetails.vacancies} {Number(jobDetails.vacancies) === 1 ? "Vacancy" : "Vacancies"}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 px-3 py-1 rounded-full">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                          {jobDetails.createdAt ? moment(jobDetails.createdAt).format("Do MMM YYYY") : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {user && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={toggleSaveJob}
                      aria-label={jobDetails?.isSaved ? "Remove from saved jobs" : "Save job"}
                      title={jobDetails?.isSaved ? "Remove from saved jobs" : "Save job"}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                        jobDetails?.isSaved
                          ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400"
                          : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-blue-300 dark:hover:border-blue-700"
                      }`}
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          jobDetails?.isSaved
                            ? "fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400"
                            : ""
                        }`}
                      />
                    </motion.button>
                  )}
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {user && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(`/mock-interview?jobId=${jobDetails?._id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                        title="Practice AI voice interview for this job posting"
                      >
                        <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Practice Interview</span>
                      </motion.button>
                    )}
                  </div>

                  <div>
                    {jobDetails?.applicationStatus ? (
                      <StatusBadge status={jobDetails.applicationStatus} />
                    ) : (
                      <button
                        onClick={applyToJob}
                        disabled={applying}
                        className="w-full sm:w-auto px-7 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 inline-flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
                      >
                        {applying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {applying ? "Applying..." : "Apply Now"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Compensation & Applicants Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Salary Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                      Compensation
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{jobDetails.salaryMin?.toLocaleString("en-IN")} – ₹{jobDetails.salaryMax?.toLocaleString("en-IN")}
                      <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 ml-1.5">per month</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Applicants Count Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                      Total Applicants
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {jobDetails.applicationCount || 0}
                      <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 ml-1.5">
                        candidate{jobDetails.applicationCount !== 1 ? "s" : ""} applied
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5 mb-4">
                <span className="w-1 h-5 bg-blue-600 dark:bg-blue-500 rounded-full inline-block" />
                About This Role
              </h3>
              <div className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
                {jobDetails.description}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5 mb-4">
                <span className="w-1 h-5 bg-blue-500 dark:bg-blue-400 rounded-full inline-block" />
                What We're Looking For
              </h3>
              <div className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
                {jobDetails.requirements}
              </div>
            </div>

            {/* Bottom Apply */}
            {!jobDetails?.applicationStatus && (
              <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-0.5">Ready to apply?</p>
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    Submit your application for <strong className="text-gray-800 dark:text-zinc-200">{jobDetails.title}</strong>
                  </p>
                </div>
                <button
                  onClick={applyToJob}
                  disabled={applying}
                  className="w-full sm:w-auto flex-shrink-0 px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 inline-flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
                >
                  {applying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;