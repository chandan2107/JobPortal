import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FileText, Clock, Trash2, Edit3,
  Sparkles, Loader2, Search, Copy, ArrowUpDown, X,
  ArrowUpRight, Check, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import Navbar from "../../../components/layout/Navbar";
import SampleResumeModal from "./SampleResumeModal";

const TEMPLATE_ACCENTS = {
  classic:   { badge: "Classic", tone: "from-zinc-700 to-zinc-900" },
  modern:    { badge: "Modern", tone: "from-blue-600 to-indigo-700" },
  minimal:   { badge: "Minimal", tone: "from-zinc-500 to-zinc-700" },
  bold:      { badge: "Bold", tone: "from-indigo-600 to-purple-700" },
  executive: { badge: "Executive", tone: "from-slate-700 to-slate-900" },
  clean:     { badge: "Clean", tone: "from-sky-600 to-blue-700" },
};

const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "title-asc", label: "Title (A–Z)" },
  { id: "title-desc", label: "Title (Z–A)" },
];

const ResumeListPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const userId = user?._id || user?.id;
  const userStorageKey = userId ? `resumes_${userId}` : "resumes_guest";

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Clean legacy shared key on mount
  useEffect(() => {
    try {
      localStorage.removeItem("resumes");
    } catch {}
  }, []);

  // Close sort dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Load resumes: from Cloud (MongoDB) for logged-in user, or local cache for guest
  useEffect(() => {
    if (authLoading) return;

    const fetchResumes = async () => {
      setLoading(true);
      const localStored = JSON.parse(localStorage.getItem(userStorageKey) || "[]");

      if (isAuthenticated && userId) {
        try {
          const res = await axiosInstance.get(API_PATHS.RESUMES.GET_ALL);
          const cloudData = res.data || [];

          const formatted = cloudData.map((r) => ({
            ...r,
            id: r.customId || r._id || r.id,
          }));

          formatted.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
          setResumes(formatted);
          localStorage.setItem(userStorageKey, JSON.stringify(formatted));
        } catch (err) {
          console.warn("[ResumeList] Cloud fetch error, using user local fallback:", err);
          localStored.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
          setResumes(localStored);
        }
      } else {
        localStored.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        setResumes(localStored);
      }

      setLoading(false);
    };

    fetchResumes();
  }, [isAuthenticated, userId, authLoading, userStorageKey]);

  const createResume = async () => {
    const id = `resume_${Date.now()}`;
    const newResume = {
      id,
      customId: id,
      title: "Untitled Resume",
      template: "modern",
      personalInfo: {
        fullName: "",
        jobTitle: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        website: "",
      },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stored = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
    stored.unshift(newResume);
    localStorage.setItem(userStorageKey, JSON.stringify(stored));

    if (isAuthenticated && userId) {
      try {
        await axiosInstance.post(API_PATHS.RESUMES.CREATE, newResume);
      } catch (err) {
        console.error("Cloud create error:", err);
      }
    }

    navigate(`/resume-builder/${id}`);
  };

  const createResumeFromSample = async (sampleData) => {
    const id = `resume_${Date.now()}`;
    const newResume = {
      ...sampleData,
      id,
      customId: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stored = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
    stored.unshift(newResume);
    localStorage.setItem(userStorageKey, JSON.stringify(stored));

    if (isAuthenticated && userId) {
      try {
        await axiosInstance.post(API_PATHS.RESUMES.CREATE, newResume);
      } catch (err) {
        console.error("Cloud create error:", err);
      }
    }

    navigate(`/resume-builder/${id}`);
  };

  const duplicateResume = async (e, resumeToClone) => {
    e.stopPropagation();

    const newId = `resume_${Date.now()}`;
    const cleanTitle = resumeToClone.title || "Untitled Resume";
    const newTitle = cleanTitle.includes("(Copy)")
      ? `${cleanTitle.replace(/\s*\(\d+\)$/, "")} (${Date.now().toString().slice(-3)})`
      : `${cleanTitle} (Copy)`;

    const clonedResume = {
      ...resumeToClone,
      id: newId,
      customId: newId,
      _id: undefined,
      title: newTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stored = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
    stored.unshift(clonedResume);
    localStorage.setItem(userStorageKey, JSON.stringify(stored));

    setResumes((prev) => [clonedResume, ...prev]);
    toast.success(`Duplicated "${newTitle}"!`);

    if (isAuthenticated && userId) {
      try {
        const res = await axiosInstance.post(API_PATHS.RESUMES.CREATE, clonedResume);
        if (res.data?._id) {
          clonedResume._id = res.data._id;
        }
      } catch (err) {
        console.error("Cloud duplicate error:", err);
      }
    }
  };

  const deleteResume = async (e, id) => {
    e.stopPropagation();

    const stored = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
    const updated = stored.filter((r) => r.id !== id && r.customId !== id && r._id !== id);
    localStorage.setItem(userStorageKey, JSON.stringify(updated));
    setResumes(updated);

    if (isAuthenticated && userId) {
      try {
        await axiosInstance.delete(API_PATHS.RESUMES.DELETE(id));
      } catch (err) {
        console.error("Cloud delete error:", err);
      }
    }

    toast.success("Resume deleted.");
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const filteredResumes = resumes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (r.title || "").toLowerCase().includes(q);
    const nameMatch = (r.personalInfo?.fullName || "").toLowerCase().includes(q);
    const roleMatch = (r.personalInfo?.jobTitle || "").toLowerCase().includes(q);
    const skillsMatch = (r.skills || []).some((s) => (s || "").toLowerCase().includes(q));
    return titleMatch || nameMatch || roleMatch || skillsMatch;
  });

  const sortedResumes = [...filteredResumes].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    }
    if (sortBy === "oldest") {
      return new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0);
    }
    if (sortBy === "title-asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "title-desc") {
      return (b.title || "").localeCompare(a.title || "");
    }
    return 0;
  });

  const currentSortOption = SORT_OPTIONS.find((opt) => opt.id === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 transition-colors relative overflow-hidden flex flex-col justify-between">
      {/* Background Architectural Dot Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40" />

      {/* Global Navbar */}
      <Navbar />

      <main className="relative z-10 flex-1 container mx-auto px-4 sm:px-6 lg:px-9 py-8 sm:py-10 max-w-6xl">
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-zinc-300 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
              <FileText className="w-3.5 h-3.5" />
              <span>RESUME BUILDER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Create clean, ATS-optimized{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-400">
                resumes.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl font-normal leading-relaxed">
              Design professional resumes with step-by-step guidance, industry-tested templates, live PDF export, and cloud autosave.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setShowSampleModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Load Sample</span>
            </button>

            <button
              onClick={createResume}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Resume</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {(loading || authLoading) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
            <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          /* Empty State - Human, clean aesthetic */
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-10 sm:p-14 text-center shadow-sm border border-zinc-300 dark:border-zinc-700 flex flex-col items-center max-w-xl mx-auto">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl flex items-center justify-center mb-4 text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white mb-2 tracking-tight">
              No resumes yet
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm font-normal leading-relaxed">
              Start by creating a blank resume or choose one of our pre-filled industry samples to customize your experience.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={createResume}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Blank Resume</span>
              </button>
              <button
                onClick={() => setShowSampleModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Choose a Sample</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Controls Bar: Search & Sort with crisp, visible borders */}
            <div className="relative z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl shadow-sm border border-zinc-300 dark:border-zinc-700">
              {/* Left: Heading */}
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                  My Resumes
                </h2>
              </div>

              {/* Right: Search + Sort Dropdown */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, role, skill..."
                    className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Custom Sort Dropdown */}
                <div className="relative z-40" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((prev) => !prev)}
                    aria-expanded={isSortOpen}
                    aria-haspopup="listbox"
                    aria-label={`Sort by: ${currentSortOption.label}`}
                    className={`flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none whitespace-nowrap shadow-2xs ${
                      isSortOpen
                        ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-500 text-zinc-950 dark:text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400 font-normal">Sort:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {currentSortOption.label}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                        isSortOpen ? "rotate-180 text-zinc-900 dark:text-zinc-100" : ""
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
                        className="absolute right-0 top-full mt-1.5 z-50 w-44 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-xl shadow-zinc-950/10 dark:shadow-black/50"
                      >
                        <div className="space-y-0.5">
                          {SORT_OPTIONS.map((option) => {
                            const isSelected = sortBy === option.id;
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
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                                  isSelected
                                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                                }`}
                              >
                                <span>{option.label}</span>
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
              </div>
            </div>

            {/* Grid of Cards with crisp visible borders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature Action Card 1: Create Blank Resume */}
              <div
                onClick={createResume}
                className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-zinc-900 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 p-5 text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[220px] shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all shadow-2xs">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600">
                        BLANK
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold tracking-tight text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Create Blank Resume
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed font-normal">
                    Start from scratch with our step-by-step guided section editor.
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>Start from blank</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature Action Card 2: Load Sample */}
              <div
                onClick={() => setShowSampleModal(true)}
                className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-zinc-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 p-5 text-left transition-all cursor-pointer group flex flex-col justify-between min-h-[220px] shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-white transition-all shadow-2xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600">
                        SAMPLE
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold tracking-tight text-zinc-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Start with a Sample
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed font-normal">
                    Pre-fill realistic roles for Software Engineers, Product, Design & Marketing.
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>Explore 9 roles</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* No Search Matches */}
              {sortedResumes.length === 0 && searchQuery && (
                <div className="col-span-full py-16 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6">
                  <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    No resumes match "{searchQuery}"
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Try searching with a different keyword or clear your query.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Existing User Resume Cards */}
              {sortedResumes.map((resume) => {
                const targetId = resume.customId || resume._id || resume.id;
                const templateMeta = TEMPLATE_ACCENTS[resume.template] || TEMPLATE_ACCENTS.modern;
                const name = resume.personalInfo?.fullName || resume.title || "Untitled Resume";
                const role = resume.personalInfo?.jobTitle || "Professional Resume";

                return (
                  <div
                    key={targetId}
                    onClick={() => navigate(`/resume-builder/${targetId}`)}
                    className="rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-500 dark:hover:border-zinc-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
                  >
                    {/* Real Document Thumbnail Header with crisp borders */}
                    <div className="h-20 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-300 dark:border-zinc-700 p-3.5 relative flex flex-col justify-between group-hover:bg-blue-50/30 dark:group-hover:bg-blue-950/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
                            {templateMeta.badge}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                          Edit <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
                        {role}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      {/* Title & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-[15px] font-bold text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {resume.title || "Untitled Resume"}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {name !== resume.title ? name : role}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => duplicateResume(e, resume)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Duplicate resume"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => deleteResume(e, targetId)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Delete resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Footer: Timestamp */}
                      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Updated {formatDate(resume.updatedAt || resume.createdAt)}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Sample Resume Selector Modal */}
      <SampleResumeModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
        onSelectSample={createResumeFromSample}
        hasExistingData={false}
      />
    </div>
  );
};

export default ResumeListPage;
