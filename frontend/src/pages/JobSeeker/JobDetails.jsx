import { MapPin, IndianRupee, Building2, Clock, Calendar, CheckCircle2, ArrowLeft, Bookmark, Users } from "lucide-react";
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
      if (jobId) {
        await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId));
        toast.success("Applied to job successfully!");
      }
      getJobDetailsById();
    } catch (err) {
      const errorMsg = err?.response?.data?.message;
      toast.error(errorMsg || "Something went wrong! Try again later");
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse">
            <div className="flex gap-6">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-gray-100 rounded-lg w-2/3" />
                <div className="h-5 bg-gray-100 rounded-lg w-1/3" />
                <div className="flex gap-2 mt-2">
                  <div className="h-6 bg-gray-100 rounded-full w-24" />
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-3">
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
        </button>

        {jobDetails && (
          <div className="space-y-5">
            {/* Hero Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Top blue accent */}
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700" />

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                  {/* Logo + Title */}
                  <div className="flex gap-5 items-start">
                    {jobDetails?.company?.companyLogo ? (
                      <img
                        src={jobDetails.company.companyLogo}
                        alt="Company Logo"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-contain border border-gray-200 bg-white p-2 shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-8 h-8 text-blue-500" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">
                        {jobDetails.title}
                      </h1>
                      <p className="flex items-center text-blue-600 font-semibold text-sm mb-3">
                        <Building2 className="w-4 h-4 mr-1.5" />
                        {jobDetails.company?.companyName || jobDetails.company?.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {jobDetails.location}
                        </span>
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {jobDetails.type}
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                          {jobDetails.category}
                        </span>
                        {jobDetails.vacancies && (
                          <span className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full font-semibold">
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                            {jobDetails.vacancies} {Number(jobDetails.vacancies) === 1 ? "Vacancy" : "Vacancies"}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          {jobDetails.applicationCount || 0} Candidate{jobDetails.applicationCount !== 1 ? "s" : ""} Applied
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {jobDetails.createdAt ? moment(jobDetails.createdAt).format("Do MMM YYYY") : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Save & Apply / Status */}
                  <div className="flex items-center gap-3 sm:flex-shrink-0">
                    {user && (
                      <button
                        onClick={toggleSaveJob}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition-all ${
                          jobDetails?.isSaved
                            ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                        title={jobDetails?.isSaved ? "Remove from saved jobs" : "Save job"}
                      >
                        <Bookmark className={`w-4 h-4 ${jobDetails?.isSaved ? "fill-blue-600 text-blue-600" : "text-gray-500"}`} />
                        <span>{jobDetails?.isSaved ? "Saved" : "Save Job"}</span>
                      </button>
                    )}

                    {jobDetails?.applicationStatus ? (
                      <StatusBadge status={jobDetails.applicationStatus} />
                    ) : (
                      <button
                        onClick={applyToJob}
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Compensation & Applicants Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Salary Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Compensation
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{jobDetails.salaryMin?.toLocaleString("en-IN")} – ₹{jobDetails.salaryMax?.toLocaleString("en-IN")}
                      <span className="text-sm font-medium text-gray-400 ml-2">per month</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Applicants Count Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Total Applicants
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {jobDetails.applicationCount || 0}
                      <span className="text-sm font-medium text-gray-500 ml-2">
                        candidate{jobDetails.applicationCount !== 1 ? "s" : ""} applied
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
                About This Role
              </h3>
              <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {jobDetails.description}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-1 h-6 bg-blue-400 rounded-full inline-block" />
                What We're Looking For
              </h3>
              <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {jobDetails.requirements}
              </div>
            </div>

            {/* Bottom Apply */}
            {!jobDetails?.applicationStatus && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900 mb-1">Ready to apply?</p>
                  <p className="text-sm text-gray-500">Submit your application for <strong>{jobDetails.title}</strong></p>
                </div>
                <button
                  onClick={applyToJob}
                  className="flex-shrink-0 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Apply Now
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