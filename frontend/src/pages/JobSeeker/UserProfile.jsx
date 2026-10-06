import { useEffect, useState } from "react";
import {
  Save,
  X,
  Trash2,
  User,
  Mail,
  FileText,
  Camera,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  ArrowUpRight,
  Sparkles,
  ArrowLeft,
  Phone,
  Globe,
  Linkedin,
  Github,
  Code,
  AlignLeft,
  Plus,
  ExternalLink,
  UploadCloud,
  Check,
  Filter,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import uploadImage from "../../utils/uploadimage";
import { openResumeUrl } from "../../utils/helper";
import Navbar from "../../components/layout/Navbar";
import StatusBadge from "../../components/layout/StatusBadge";
import moment from "moment";

const POPULAR_SKILLS = [
  "React",
  "Node.js",
  "JavaScript",
  "TypeScript",
  "Python",
  "SQL",
  "Tailwind CSS",
  "MongoDB",
  "Express",
  "Git",
  "Next.js",
  "Docker",
  "REST APIs",
  "UI/UX Design",
];

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: "profile" | "applications"
  const initialTab = searchParams.get("tab") === "applications" ? "applications" : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [appFilter, setAppFilter] = useState("all");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    resume: user?.resume || "",
    jobTitle: user?.jobTitle || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    website: user?.website || "",
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [skillInput, setSkillInput] = useState("");
  const [uploading, setUploading] = useState({ avatar: false, resume: false });
  const [saving, setSaving] = useState(false);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "applications" ? { tab: "applications" } : {});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const imgUploadRes = await uploadImage(file);
      const url = imgUploadRes.imageUrl || "";
      const updatedData = { ...formData, [type]: url };
      setFormData(updatedData);

      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, updatedData);
      if (response.status === 200) {
        setProfileData(updatedData);
        updateUser(updatedData);
        toast.success(`${type === "avatar" ? "Photo" : "Resume"} uploaded successfully!`);
      }
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file, type);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, formData);
      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setProfileData({ ...formData });
        updateUser({ ...formData });
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setFormData({ ...profileData });

  const handleDeleteResume = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.DELETE_RESUME, {
        resumeUrl: user.resume,
      });
      if (response.status === 200) {
        toast.success("Resume deleted successfully!");
        setProfileData({ ...formData, resume: "" });
        updateUser({ ...formData, resume: "" });
      }
    } catch (error) {
      toast.error("Failed to delete resume");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const userData = {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      resume: user?.resume || "",
      jobTitle: user?.jobTitle || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
      skills: user?.skills || [],
      linkedin: user?.linkedin || "",
      github: user?.github || "",
      website: user?.website || "",
    };
    setProfileData(userData);
    setFormData({ ...userData });

    if (user) {
      fetchMyApplications();
    }
  }, [user]);

  const handleAddSkill = (skillToAdd) => {
    const raw = typeof skillToAdd === "string" ? skillToAdd : skillInput;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const currentSkills = formData.skills || [];
    if (!currentSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({ ...prev, skills: [...currentSkills, trimmed] }));
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }));
  };

  // Compute application stats
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
    <div className="min-h-screen bg-slate-50/70 pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto mt-6 px-4 sm:px-6">
        {/* Top Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-xs uppercase tracking-wider mb-5 group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* ── Main Profile Hero Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group">
                <img
                  src={formData?.avatar || "https://via.placeholder.com/150"}
                  alt="Avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md ring-2 ring-blue-100"
                />
                {uploading?.avatar && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer shadow-md hover:bg-blue-700 transition-colors border-2 border-white">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "avatar")}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {formData.name || "Job Seeker"}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Job Seeker
                  </span>
                </div>

                <p className="text-sm font-semibold text-blue-600">
                  {formData.jobTitle || "Add headline (e.g. Full Stack Developer) in settings"}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {formData.email}
                  </span>
                  {formData.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {formData.phone}
                    </span>
                  )}
                  {formData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {formData.location}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {user?.resume ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Resume Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      No Resume Attached
                    </span>
                  )}

                  {formData.skills?.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                      {formData.skills.length} Skill{formData.skills.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
              <button
                onClick={() => navigate("/resume-builder")}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold transition-all text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                Resume Builder
              </button>
              <button
                onClick={() => navigate("/find-jobs")}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </button>
            </div>
          </div>

          {/* ── Modern Navigation Tabs ── */}
          <div className="flex items-center gap-2 px-6 sm:px-8 border-t border-slate-200 bg-slate-50/50">
            <button
              onClick={() => handleTabChange("profile")}
              className={`flex items-center gap-2 py-3.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "border-blue-600 text-blue-600 bg-white shadow-2xs -mb-[1px]"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60"
              }`}
            >
              <User className="w-4 h-4" />
              Career Profile & Details
            </button>

            <button
              onClick={() => handleTabChange("applications")}
              className={`flex items-center gap-2 py-3.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "applications"
                  ? "border-blue-600 text-blue-600 bg-white shadow-2xs -mb-[1px]"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              My Job Applications
              <span
                className={`ml-1 px-2 py-0.5 text-[10px] rounded-full font-bold ${
                  activeTab === "applications"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {totalApplied}
              </span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: CAREER PROFILE & SETTINGS ── */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Auto-fill callout badge */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Connected to AI Resume Builder & Job Applications
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Details saved here are automatically available when generating resumes or applying with 1-click.
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Basic & Contact Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Personal & Contact Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your core contact details visible on resumes and shared with hiring managers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Professional Headline / Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                    placeholder="e.g. Full Stack Developer | React & Node.js"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    <span>Email Address</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none text-sm font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Email is tied to your account login.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                    placeholder="+1 (555) 012-3456"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Location / City, Country
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                </div>
              </div>
            </div>

            {/* 2. Professional Bio Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-indigo-600" />
                  Professional Bio / Executive Summary
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Summarize your background, passions, and core engineering or domain strengths.
                </p>
              </div>

              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full p-4 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-sm font-medium leading-relaxed resize-none"
                placeholder="Passionate software engineer with 3+ years building high-traffic web applications with React, Node.js, and cloud platforms. Proven track record delivering responsive UIs and robust backend APIs..."
              />
            </div>

            {/* 3. Skills & Technologies Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-500" />
                  Skills & Core Competencies
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add technologies and hard skills to power ATS matching and resume auto-population.
                </p>
              </div>

              {/* Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill (e.g. Next.js, Kubernetes) and press Enter"
                  className="flex-1 px-4 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>

              {/* Current Active Tags */}
              {formData.skills && formData.skills.length > 0 ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Your Active Skills ({formData.skills.length})
                  </label>
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
                    {formData.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-bold shadow-2xs group hover:border-slate-300 transition-colors"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove skill"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl text-amber-800 text-xs">
                  No skills added yet. Add your skills above or click from suggestions below.
                </div>
              )}

              {/* Quick-add popular suggestions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Popular Suggestions (Click to Add)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.filter(
                    (s) => !(formData.skills || []).some((myS) => myS.toLowerCase() === s.toLowerCase())
                  ).map((popularSkill) => (
                    <button
                      key={popularSkill}
                      type="button"
                      onClick={() => handleAddSkill(popularSkill)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-slate-400" />
                      {popularSkill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Portfolios & Online Links Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Online Profiles & Portfolio Links
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Give hiring teams direct access to your work, code repositories, and professional network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    <Github className="w-3.5 h-3.5 text-slate-800" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleInputChange("github", e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    Website / Portfolio
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 5. Resume Document Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Primary Resume Document (PDF)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used for quick job submissions, RAG AI resume queries, and ATS compatibility scans.
                </p>
              </div>

              {(() => {
                const rawUrl = user?.resume || formData?.resume;
                if (rawUrl && !rawUrl.startsWith("blob:")) {
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-200 rounded-2xl">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-xs">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              Primary Resume Attached
                            </p>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Ready for 1-click applications & ATS scans</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => openResumeUrl(rawUrl)}
                          className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Document
                        </button>

                        <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
                          <UploadCloud className="w-3.5 h-3.5" />
                          Replace
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleImageChange(e, "resume")}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleDeleteResume}
                          title="Delete Resume"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-blue-50/40 block group">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                      <UploadCloud className="w-7 h-7 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Click to upload your resume
                    </span>
                    <span className="text-xs text-slate-500 mt-1">Supports PDF, DOC, DOCX up to 5MB</span>
                    {uploading.resume && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        Uploading document...
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleImageChange(e, "resume")}
                      className="hidden"
                    />
                  </label>
                );
              })()}
            </div>

            {/* Bottom Sticky-feel Save Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Remember to save your changes to update your profile across the portal.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-xs font-bold cursor-pointer"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploading.avatar || uploading.resume}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY JOB APPLICATIONS ── */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Applied */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Applied
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalApplied}</p>
                <p className="text-xs text-slate-500 mt-0.5">Submitted applications</p>
              </div>

              {/* Selected / Accepted */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Selected
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{selectedCount}</p>
                <p className="text-xs text-slate-500 mt-0.5">Offers & hires</p>
              </div>

              {/* In Review */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    In Review
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{inReviewCount}</p>
                <p className="text-xs text-slate-500 mt-0.5">Under evaluation</p>
              </div>

              {/* Rejected */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Rejected
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{rejectedCount}</p>
                <p className="text-xs text-slate-500 mt-0.5">Unsuccessful</p>
              </div>
            </div>

            {/* Filter Pills Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setAppFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    appFilter === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({totalApplied})
                </button>
                <button
                  onClick={() => setAppFilter("in_review")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    appFilter === "in_review"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50"
                  }`}
                >
                  In Review ({inReviewCount})
                </button>
                <button
                  onClick={() => setAppFilter("selected")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    appFilter === "selected"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50"
                  }`}
                >
                  Selected ({selectedCount})
                </button>
                <button
                  onClick={() => setAppFilter("rejected")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    appFilter === "rejected"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50"
                  }`}
                >
                  Rejected ({rejectedCount})
                </button>
              </div>

              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Showing {filteredApplications.length} of {totalApplied} applications
              </span>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              {loadingApps ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {applications.length === 0 ? "No applications submitted yet" : "No applications in this category"}
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
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
                      className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-sm bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        {app.job?.company?.companyLogo ? (
                          <img
                            src={app.job.company.companyLogo}
                            alt="Company Logo"
                            className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white p-1 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                        )}

                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {app.job?.title || "Job Title N/A"}
                          </h3>
                          <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {app.job?.company?.companyName || app.job?.company?.name || "Company"}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {app.job?.location && (
                              <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {app.job.location}
                              </span>
                            )}
                            {app.job?.type && (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                {app.job.type}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Calendar className="w-3 h-3" />
                              Applied {moment(app.createdAt).format("Do MMM YYYY")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <StatusBadge status={app.status || "Applied"} />

                        {app.job?._id && (
                          <button
                            onClick={() => navigate(`/job/${app.job._id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
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
        )}
      </div>
    </div>
  );
};

export default UserProfile;