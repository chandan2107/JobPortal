import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Grid, List, X, Sparkles, FileText,
  ArrowRight, CheckCircle2, ChevronRight, Building2, RefreshCw,
  ArrowUpDown, ChevronDown, Check, Clock, TrendingUp, ArrowDown, Bot
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
      className={`fixed inset-0 z-50 lg:hidden ${
        showMobileFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      } transition-opacity duration-300`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 transform ${
          showMobileFilters ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">Filters</h3>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 h-[calc(100vh-70px)] overflow-y-auto">
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

  const [sortBy, setSortBy] = useState("recent");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const sortOptions = [
    { id: "recent", label: "Most Recent", icon: Clock },
    { id: "salary_desc", label: "Highest Salary", icon: TrendingUp },
    { id: "salary_asc", label: "Lowest Salary", icon: ArrowDown },
    ...(recommendationData?.hasResume
      ? [{ id: "match", label: "Best AI Match", icon: Sparkles }]
      : []),
  ];

  const currentSortOption =
    sortOptions.find((opt) => opt.id === sortBy) || sortOptions[0];

  // Sort displayed jobs
  const sortedJobs = [...displayedJobs].sort((a, b) => {
    if (sortBy === "salary_desc") {
      const aSal = Number(a.salaryMax || a.salaryMin || 0);
      const bSal = Number(b.salaryMax || b.salaryMin || 0);
      return bSal - aSal;
    }
    if (sortBy === "salary_asc") {
      const aSal = Number(a.salaryMin || a.salaryMax || 0);
      const bSal = Number(b.salaryMin || b.salaryMax || 0);
      return aSal - bSal;
    }
    if (sortBy === "match") {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    // Default: "recent"
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  if (jobs.length === 0 && loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 transition-colors relative overflow-hidden">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#1e2638_1px,transparent_1px)] [background-size:24px_24px] opacity-70 dark:opacity-30" />

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-9 py-8">
        {/* Search Header */}
        <SearchHeader filters={filters} handleFilterChange={handleFilterChange} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-1/4">
            <div className="bg-white dark:bg-zinc-900/90 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 sticky top-24 backdrop-blur-xs">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mb-5 tracking-tight">
                Filter Jobs
              </h3>
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />

              {/* AI Mock Interview Promotion Widget */}
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 dark:border-blue-900/50 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Bot className="w-4 h-4" />
                  <span>AI Mock Interview</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Practice voice interviews with real-time feedback before your actual interview.
                </p>
                <button
                  onClick={() => navigate("/mock-interview")}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            {/* Results Header */}
            <div className="relative z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white dark:bg-zinc-900/90 p-3.5 sm:p-4 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs">
              
              {/* Left: Tab Switcher & Result Count */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  All Jobs ({jobs.length})
                </button>

                {recommendationData?.hasResume && recommendedJobs.length > 0 && (
                  <button
                    onClick={() => setActiveTab("recommended")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "recommended"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Recommended ({recommendedJobs.length})</span>
                  </button>
                )}

                <span className="hidden md:inline-block text-xs text-zinc-400 dark:text-zinc-500 font-medium pl-1">
                  • {sortedJobs.length} {sortedJobs.length === 1 ? "job found" : "jobs found"}
                </span>
              </div>

              {/* Right: Sort Dropdown + Mobile Filter + View Mode */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors text-xs font-semibold border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                {/* Custom Sort Dropdown */}
                <div className="relative z-40" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((prev) => !prev)}
                    aria-expanded={isSortOpen}
                    aria-haspopup="listbox"
                    aria-label={`Sort by: ${currentSortOption.label}`}
                    className={`flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none ${
                      isSortOpen
                        ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-950 dark:text-white shadow-xs"
                        : "bg-zinc-100/90 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700/80"
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-zinc-400 dark:text-zinc-500 hidden sm:inline">Sort:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {currentSortOption.label}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                        isSortOpen ? "rotate-180 text-zinc-700 dark:text-zinc-200" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        role="listbox"
                        className="absolute right-0 top-full mt-1.5 z-50 w-48 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-950/10 dark:shadow-black/50 backdrop-blur-md"
                      >
                        <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Sort by
                        </div>
                        <div className="space-y-0.5">
                          {sortOptions.map((option) => {
                            const isSelected = sortBy === option.id;
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setSortBy(option.id);
                                  setIsSortOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                                  isSelected
                                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                                    }`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </span>
                                  <span>{option.label}</span>
                                </div>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === "list"
                          ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700"
                          : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Grid / List */}
            {sortedJobs.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900/90 rounded-2xl p-12 sm:p-16 text-center shadow-xs border border-zinc-200 dark:border-zinc-800 flex flex-col items-center backdrop-blur-xs">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white mb-2 tracking-tight">
                  {activeTab === "recommended" ? "No recommendations yet" : "No matching jobs found"}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md font-normal leading-relaxed">
                  {activeTab === "recommended"
                    ? "Try uploading your resume or adding more skills in your profile to unlock tailored recommendations."
                    : "Try adjusting your keyword, location, or salary filters to explore available opportunities."}
                </p>
                <button
                  onClick={activeTab === "recommended" ? () => setActiveTab("all") : clearAllFilters}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  {activeTab === "recommended" ? "View All Jobs" : "Clear All Filters"}
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start"
                    : "space-y-4"
                }
              >
                {sortedJobs.map((job) => (
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