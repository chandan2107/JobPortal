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
  MapPin,
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
  Pencil,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import uploadImage from "../../utils/uploadimage";
import { openResumeUrl } from "../../utils/helper";
import Navbar from "../../components/layout/Navbar";

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

  const [isEditing, setIsEditing] = useState(false);

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
        const returnedUser = response.data ? { ...updatedData, ...response.data } : updatedData;
        setProfileData(returnedUser);
        updateUser(returnedUser);
        if (type === "resume") {
          toast.success(
            <div>
              <p className="font-semibold text-sm">Resume uploaded & analyzed!</p>
              <p className="text-xs text-gray-500 mt-0.5">Check your Dashboard for personalized job recommendations.</p>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.success("Photo uploaded successfully!");
        }
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
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setSkillInput("");
    setIsEditing(false);
  };

  const handleDeleteResume = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.DELETE_RESUME, {
        resumeUrl: user.resume,
      });
      if (response.status === 200) {
        toast.success("Resume deleted successfully!");
        const cleared = { ...formData, resume: "" };
        setFormData(cleared);
        setProfileData(cleared);
        updateUser(cleared);
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

  const resumeUrl = user?.resume || profileData?.resume;
  const hasResume = Boolean(resumeUrl && !resumeUrl.startsWith("blob:"));
  const hasLinks = Boolean(
    profileData.linkedin?.trim() || profileData.github?.trim() || profileData.website?.trim()
  );

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

        {/* ── Main Profile Hero Card ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden mb-6">
          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group">
                <img
                  src={formData?.avatar || "https://via.placeholder.com/150"}
                  alt="Avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white dark:border-zinc-800 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/50"
                />
                {uploading?.avatar && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer shadow-md hover:bg-blue-700 transition-colors border-2 border-white dark:border-zinc-900">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "avatar")}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {profileData.name || "Job Seeker"}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    Job Seeker
                  </span>
                </div>

                {profileData.jobTitle && (
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {profileData.jobTitle}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400 font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    {profileData.email}
                  </span>
                  {profileData.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      {profileData.phone}
                    </span>
                  )}
                  {profileData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      {profileData.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action CTAs & Edit Button */}
            <div className="flex flex-wrap items-center gap-3 pt-4 md:pt-0 border-t md:border-0 border-slate-100 dark:border-zinc-800">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setFormData({ ...profileData });
                      setIsEditing(true);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2.5 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || uploading.avatar || uploading.resume}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── VIEW MODE (Only Available Details) ── */}
        {!isEditing ? (
          <div className="space-y-6">
            {/* 1. Personal & Contact Info Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Personal & Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {profileData.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Email Address
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {profileData.email || "—"}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      Verified
                    </span>
                  </div>
                </div>

                {profileData.jobTitle?.trim() && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Professional Headline
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {profileData.jobTitle}
                    </p>
                  </div>
                )}

                {profileData.phone?.trim() && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Phone Number
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {profileData.phone}
                    </p>
                  </div>
                )}

                {profileData.location?.trim() && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {profileData.location}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Professional Bio Card (only if available) */}
            {profileData.bio?.trim() && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-3">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Professional Bio / Executive Summary
                  </h2>
                </div>
                <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {profileData.bio}
                </p>
              </div>
            )}

            {/* 3. Skills & Core Competencies Card (only if available) */}
            {profileData.skills?.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    Skills & Core Competencies
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Online Profiles & Portfolio Links (only if any link is available) */}
            {hasLinks && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Online Profiles & Portfolio Links
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {profileData.linkedin?.trim() && (
                    <a
                      href={profileData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                        <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                        LinkedIn
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                    </a>
                  )}
                  {profileData.github?.trim() && (
                    <a
                      href={profileData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                        <Github className="w-4 h-4 text-slate-800 dark:text-zinc-200" />
                        GitHub
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                    </a>
                  )}
                  {profileData.website?.trim() && (
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                        <Globe className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        Website / Portfolio
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 5. Primary Resume Document (only if attached) */}
            {hasResume && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Primary Resume Document
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/60 shadow-xs">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          Primary Resume Attached
                        </p>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Ready for 1-click applications & ATS scans
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openResumeUrl(resumeUrl)}
                    className="px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Document
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── EDIT MODE (Full Form) ── */
          <div className="space-y-6">
            {/* Auto-fill callout badge */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    Connected to AI Resume Builder & Job Applications
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Details saved here are automatically available when generating resumes or applying with 1-click.
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Basic & Contact Info Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Personal & Contact Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Your core contact details visible on resumes and shared with hiring managers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Professional Headline / Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
                    placeholder="e.g. Full Stack Developer | React & Node.js"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    <span>Email Address</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      Verified
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-500 dark:text-zinc-400 cursor-not-allowed outline-none text-sm font-medium"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Email is tied to your account login.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
                    placeholder="+1 (555) 012-3456"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Location / City, Country
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                </div>
              </div>
            </div>

            {/* 2. Professional Bio Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Professional Bio / Executive Summary
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Summarize your background, passions, and core engineering or domain strengths.
                </p>
              </div>

              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full p-4 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 leading-relaxed resize-none"
                placeholder="Passionate software engineer with 3+ years building high-traffic web applications with React, Node.js, and cloud platforms. Proven track record delivering responsive UIs and robust backend APIs..."
              />
            </div>

            {/* 3. Skills & Technologies Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  Skills & Core Competencies
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
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
                  className="flex-1 px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
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
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Your Active Skills ({formData.skills.length})
                  </label>
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl">
                    {formData.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-bold shadow-2xs group hover:border-slate-300 dark:hover:border-zinc-600 transition-colors"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove skill"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                  No skills added yet. Add your skills above or click from suggestions below.
                </div>
              )}

              {/* Quick-add popular suggestions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
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
                      className="px-2.5 py-1 bg-white dark:bg-zinc-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-600 dark:text-zinc-300 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      {popularSkill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Portfolios & Online Links Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Online Profiles & Portfolio Links
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Give hiring teams direct access to your work, code repositories, and professional network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    <Github className="w-3.5 h-3.5 text-slate-800 dark:text-zinc-200" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleInputChange("github", e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    Website / Portfolio
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* 5. Resume Document Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Primary Resume Document 
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Used for quick job submissions, RAG AI resume queries, and ATS compatibility scans.
                </p>
              </div>

              {(() => {
                const rawUrl = user?.resume || formData?.resume;
                if (rawUrl && !rawUrl.startsWith("blob:")) {
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/60 shadow-xs">
                          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              Primary Resume Attached
                            </p>
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Ready for 1-click applications & ATS scans</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => openResumeUrl(rawUrl)}
                          className="px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                          className="p-2 text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-800/60"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <label className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-blue-50/40 dark:hover:bg-blue-950/20 block group">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/80 flex items-center justify-center mb-3 transition-colors">
                      <UploadCloud className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Click to upload your resume
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Supports PDF, DOC, DOCX up to 5MB</span>
                    {uploading.resume && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-lg">
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4 sm:p-5 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Remember to save your changes to update your profile across the portal.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-xs font-bold cursor-pointer"
                >
                  Cancel
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
      </div>
    </div>
  );
};

export default UserProfile;
