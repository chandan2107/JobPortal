import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, FileText, Clock, Trash2, Edit3, Home,
  ChevronRight, LayoutTemplate, Sparkles, Loader2,
  Search, Copy, ArrowUpDown, X
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import SampleResumeModal from "./SampleResumeModal";

const TEMPLATE_COLORS = {
  classic:   "from-gray-700 to-gray-900",
  modern:    "from-slate-600 to-slate-800",
  minimal:   "from-gray-400 to-gray-600",
  bold:      "from-violet-500 to-indigo-600",
  executive: "from-gray-200 to-gray-400",
  clean:     "from-gray-100 to-gray-300",
};

const TEMPLATE_NAMES = {
  classic:   "Classic",
  modern:    "Modern",
  minimal:   "Minimal",
  bold:      "Bold",
  executive: "Executive",
  clean:     "Clean",
};

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

  // Clean legacy shared key on mount
  useEffect(() => {
    try {
      localStorage.removeItem("resumes");
    } catch {}
  }, []);

  // Load resumes: from Cloud (MongoDB) for logged-in user, or local cache for guest
  useEffect(() => {
    if (authLoading) return; // Wait until auth state is resolved to prevent cross-account leaks

    const fetchResumes = async () => {
      setLoading(true);
      const localStored = JSON.parse(localStorage.getItem(userStorageKey) || "[]");

      if (isAuthenticated && userId) {
        try {
          // Strictly fetch resumes belonging to this authenticated user
          const res = await axiosInstance.get(API_PATHS.RESUMES.GET_ALL);
          const cloudData = res.data || [];

          // Format cloud data
          const formatted = cloudData.map((r) => ({
            ...r,
            id: r.customId || r._id || r.id,
          }));

          // Sort newest first
          formatted.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
          setResumes(formatted);
          localStorage.setItem(userStorageKey, JSON.stringify(formatted));
        } catch (err) {
          console.warn("[ResumeList] Cloud fetch error, using user local fallback:", err);
          localStored.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
          setResumes(localStored);
        }
      } else {
        // Guest mode - scoped only to guest storage
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

    // Save to user-scoped local cache first
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
      _id: undefined, // ensure MongoDB generates a fresh unique ID
      title: newTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Update user-scoped local cache
    const stored = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
    stored.unshift(clonedResume);
    localStorage.setItem(userStorageKey, JSON.stringify(stored));

    // 2. Update state immediately
    setResumes((prev) => [clonedResume, ...prev]);
    toast.success(`Duplicated "${newTitle}"!`);

    // 3. Persist to MongoDB cloud
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

    // Local remove from user-scoped storage
    const stored = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
    const updated = stored.filter(r => (r.id !== id && r.customId !== id && r._id !== id));
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
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
           " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 leading-tight">Resume Builder</h1>
              <p className="text-[11px] text-gray-500">Create, edit, and sync resumes to your cloud account</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/find-jobs")}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Go Home</span>
            </button>

            <button
              onClick={() => setShowSampleModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Start with a realistic sample resume"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Load Sample</span>
            </button>

            <button
              onClick={createResume}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Resume
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {(loading || authLoading) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-bold text-gray-600">Loading your resumes from cloud...</p>
          </div>
        ) : resumes.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
              <LayoutTemplate className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No resumes yet</h2>
            <p className="text-gray-500 max-w-sm mb-8 text-sm leading-relaxed">
              Create your first professional resume in minutes with our guided builder, AI writing assistants, and cloud persistence.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={createResume}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Blank Resume
              </button>
              <button
                onClick={() => setShowSampleModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Load Sample Resume
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header with Search and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">My Resumes</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {searchQuery ? (
                    <span>Found {sortedResumes.length} of {resumes.length} resume{resumes.length !== 1 ? "s" : ""}</span>
                  ) : (
                    <span>{resumes.length} resume{resumes.length !== 1 ? "s" : ""}</span>
                  )}
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, role, skill..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 shadow-2xs transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-semibold text-gray-700 bg-transparent border-none outline-none cursor-pointer pr-1"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title-asc">Title (A–Z)</option>
                    <option value="title-desc">Title (Z–A)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Create New Card */}
              <button
                onClick={createResume}
                className="group border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-blue-50/50 min-h-[200px] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700 transition-colors">Create Blank Resume</p>
                <p className="text-xs text-gray-400 mt-1">Start from scratch</p>
              </button>

              {/* Load Sample Card */}
              <button
                onClick={() => setShowSampleModal(true)}
                className="group border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-emerald-50/50 min-h-[200px] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors">Load Sample Resume</p>
                <p className="text-xs text-gray-400 mt-1">Software Eng, Data, Marketing</p>
              </button>

              {/* Empty Search Matches State */}
              {sortedResumes.length === 0 && searchQuery && (
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 p-6">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-700">No resumes match "{searchQuery}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching with a different job title, company, or skill.</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Resume Cards */}
              {sortedResumes.map(resume => {
                const targetId = resume.customId || resume._id || resume.id;
                const gradientClass = TEMPLATE_COLORS[resume.template] || TEMPLATE_COLORS.modern;
                const templateName = TEMPLATE_NAMES[resume.template] || "Modern";
                const name = resume.personalInfo?.fullName || resume.title || "Untitled";

                return (
                  <div
                    key={targetId}
                    onClick={() => navigate(`/resume-builder/${targetId}`)}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden cursor-pointer group"
                  >
                    {/* Thumbnail Preview Bar */}
                    <div className={`h-28 bg-gradient-to-br ${gradientClass} flex items-center justify-center relative`}>
                      <FileText className="w-10 h-10 text-white/50" />
                      <div className="absolute bottom-2 right-2">
                        <span className="text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                          {templateName}
                        </span>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                          <Edit3 className="w-3 h-3" />
                          Edit Resume
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{resume.title || "Untitled Resume"}</h3>
                          <p className="text-xs text-gray-500 truncate">{name !== resume.title ? name : resume.personalInfo?.jobTitle || "No title"}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => duplicateResume(e, resume)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Duplicate / Clone resume"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => deleteResume(e, targetId)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Updated {formatDate(resume.updatedAt || resume.createdAt)}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-2">
                          {(resume.skills || []).slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{s}</span>
                          ))}
                          {(resume.skills || []).length > 2 && (
                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{resume.skills.length - 2}</span>
                          )}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
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
