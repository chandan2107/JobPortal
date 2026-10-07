import { useState, useEffect } from "react";
import {
  Search, Filter, Grid, List, X, Sparkles, FileText,
  ArrowRight, CheckCircle2, ChevronRight, Building2, RefreshCw
} from "lucide-react";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import SearchHeader from "./components/SearchHeader";
import FilterContent from "./components/FilterContent";
import JobCard from "../../components/cards/JobCard";

const JobSeekerDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendationData, setRecommendationData] = useState(null);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "recommended"
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    category: "",
    type: "",
    minSalary: "",
    maxSalary: "",
  });

  // Sidebar collapse states
  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    salary: true,
    categories: true,
  });

  // Function to fetch jobs from API
  const fetchJobs = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filterParams.keyword) params.append("keyword", filterParams.keyword);
      if (filterParams.location) params.append("location", filterParams.location);
      if (filterParams.minSalary) params.append("minSalary", filterParams.minSalary);
      if (filterParams.maxSalary) params.append("maxSalary", filterParams.maxSalary);
      if (filterParams.type) params.append("type", filterParams.type);
      if (filterParams.category) params.append("category", filterParams.category);
      if (user) params.append("userId", user?._id);

      const response = await axiosInstance.get(
        `${API_PATHS.JOBS.GET_ALL_JOBS}?${params.toString()}`
      );

      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data.jobs || [];

      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs. Please try again later.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const apiFilters = { ...filters, userId: user?._id };

      const hasFilters = Object.values(apiFilters).some(
        (value) => value !== "" && value !== false && value !== null && value !== undefined
      );

      if (hasFilters) {
        fetchJobs(apiFilters);
      } else {
        fetchJobs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters, user]);

  // Fetch AI recommended jobs based on uploaded resume
  const fetchRecommendedJobs = async () => {
    if (!isAuthenticated || !user || user.role === "employer") return;
    try {
      setLoadingRecommended(true);
      const res = await axiosInstance.get(API_PATHS.JOBS.GET_RECOMMENDED);
      if (res.data) {
        setRecommendationData(res.data);
        setRecommendedJobs(res.data.recommendedJobs || []);
      }
    } catch (err) {
      console.warn("Could not fetch recommended jobs:", err?.message);
    } finally {
      setLoadingRecommended(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && user.role !== "employer") {
      fetchRecommendedJobs();
    }
  }, [isAuthenticated, user?._id, user?.resume]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      keyword: "",
      location: "",
      category: "",
      type: "",
      minSalary: "",
      maxSalary: "",
    });
  };

  const MobileFilterOverlay = () => (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${showMobileFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} transition-opacity duration-300`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
      <div className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${showMobileFilters ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Filters</h3>
          <button onClick={() => setShowMobileFilters(false)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto">
          <FilterContent
            toggleSection={toggleSection}
            clearAllFilters={clearAllFilters}
            expandedSections={expandedSections}
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  );

  const toggleSaveJob = async (jobId, isSaved) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to save jobs");
      navigate("/login");
      return;
    }
    try {
      if (isSaved) {
        await axiosInstance.delete(API_PATHS.SAVED_JOBS.UNSAVE_JOB(jobId));
        toast.success("Job removed successfully!");
      } else {
        await axiosInstance.post(API_PATHS.SAVED_JOBS.SAVE_JOB(jobId));
        toast.success("Job saved successfully!");
      }
      fetchJobs();
      fetchRecommendedJobs();
    } catch (err) {
      console.log("Error:", err);
      toast.error("Something went wrong! Try again later");
    }
  };

  const applyToJob = async (jobId) => {
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
      fetchJobs();
      fetchRecommendedJobs();
    } catch (err) {
      console.log("Error:", err);
      const errorMsg = err?.response?.data?.message;
      toast.error(errorMsg || "Something went wrong! Try again later");
    }
  };

  // Merge match score info into jobs for display
  const matchMap = new Map((recommendedJobs || []).map((r) => [String(r._id), r]));
  const enrichedJobs = jobs.map((j) => {
    const rec = matchMap.get(String(j._id));
    if (rec) {
      return {
        ...j,
        matchScore: rec.matchScore,
        matchedSkills: rec.matchedSkills,
        matchBadge: rec.matchBadge,
        matchReason: rec.matchReason,
      };
    }
    return j;
  });

  const displayedJobs = activeTab === "recommended" ? recommendedJobs : enrichedJobs;

  if (jobs.length === 0 && loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <SearchHeader filters={filters} handleFilterChange={handleFilterChange} />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-1/4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Filter Jobs</h3>
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "all"
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Jobs ({jobs.length})
                </button>

                {recommendationData?.hasResume && recommendedJobs.length > 0 && (
                  <button
                    onClick={() => setActiveTab("recommended")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "recommended"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    Recommended ({recommendedJobs.length})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">
                  <Filter className="w-5 h-5" />
                  Filters
                </button>

                {/* View Mode Toggle */}
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-xl border border-gray-200">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "grid"
                          ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                          : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                          : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Grid */}
            {displayedJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-200 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-50 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="w-24 h-24 bg-white shadow-sm border border-gray-200 rounded-3xl flex items-center justify-center mb-6 relative z-10">
                  <Search className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight relative z-10">
                  {activeTab === "recommended" ? "No recommendations yet" : "No jobs found"}
                </h3>
                <p className="text-lg text-gray-500 mb-8 max-w-md relative z-10 font-medium">
                  {activeTab === "recommended"
                    ? "Try updating your resume with more skills or exploring all open jobs."
                    : "Try adjusting your search criteria or filters to find what you're looking for."}
                </p>
                <button
                  onClick={activeTab === "recommended" ? () => setActiveTab("all") : clearAllFilters}
                  className="px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative z-10"
                >
                  {activeTab === "recommended" ? "View All Jobs" : "Clear All Filters"}
                </button>
              </div>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6"
                  : "space-y-4 lg:space-y-6"
              }>
                {displayedJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onClick={() => navigate(`/job/${job._id}`)}
                    onToggleSave={() => toggleSaveJob(job._id, job.isSaved)}
                    onApply={() => applyToJob(job._id)}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <MobileFilterOverlay />
    </div>
  );
};

export default JobSeekerDashboard;