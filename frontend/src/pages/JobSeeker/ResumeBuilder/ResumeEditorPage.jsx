import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  ArrowLeft, Download, Share2, Eye, EyeOff, ChevronDown, ChevronUp,
  Plus, Trash2, Palette, User, Briefcase, GraduationCap,
  Code, FolderOpen, Award, Check, X, Calendar, Trophy, Sparkles,
  Wand2, Loader2, Bot, RefreshCw, Zap, FileText, Minus, Maximize2,
  PanelRightClose, PanelRightOpen, GripVertical,
  ArrowUpDown, Layers
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import SampleResumeModal from "./SampleResumeModal";
import ReorderSectionsModal from "./ReorderSectionsModal";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY, SECTION_METADATA } from "./sectionConfig";
import TemplateClassic   from "./templates/TemplateClassic";
import TemplateModern    from "./templates/TemplateModern";
import TemplateMinimal   from "./templates/TemplateMinimal";
import TemplateSwiss     from "./templates/TemplateSwiss";
import TemplateNordic    from "./templates/TemplateNordic";
import TemplateMono      from "./templates/TemplateMono";
import TemplateEditorial from "./templates/TemplateEditorial";
import TemplateBold      from "./templates/TemplateBold";
import TemplateExecutive from "./templates/TemplateExecutive";
import TemplateClean     from "./templates/TemplateClean";

// ─── Templates registry ─────────────────────────────────────────────
const TEMPLATES = [
  { id: "minimal",   label: "Minimal",    description: "Typography-first",  preview: "bg-gray-400",    component: TemplateMinimal },
  { id: "swiss",     label: "Swiss Grid", description: "Precision & bold",  preview: "bg-zinc-800 text-white", component: TemplateSwiss },
  { id: "nordic",    label: "Nordic",     description: "Airy & serene",     preview: "bg-stone-400 text-white", component: TemplateNordic },
  { id: "mono",      label: "Tech Mono",  description: "Developer minimal", preview: "bg-neutral-800 text-emerald-400", component: TemplateMono },
  { id: "editorial", label: "Editorial",  description: "Refined serif",     preview: "bg-neutral-900 text-amber-100", component: TemplateEditorial },
  { id: "clean",     label: "Clean",      description: "Simple & crisp",    preview: "bg-gray-200 text-gray-700", component: TemplateClean },
  { id: "modern",    label: "Modern",     description: "Dark sidebar",      preview: "bg-slate-700 text-white", component: TemplateModern },
  { id: "classic",   label: "Classic",    description: "Traditional serif", preview: "bg-gray-800 text-white", component: TemplateClassic },
  { id: "bold",      label: "Bold",       description: "Vibrant header",    preview: "bg-violet-600 text-white", component: TemplateBold },
  { id: "executive", label: "Executive",  description: "Centered B&W",      preview: "bg-white border border-gray-400 text-black", component: TemplateExecutive },
];

// ─── Defaults ────────────────────────────────────────────────────────
const EMPTY_RESUME = {
  title: "My Resume",
  template: "modern",
  personalInfo: { fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", website: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
};

const EMPTY_EXP  = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" };
const EMPTY_EDU  = { degree: "", school: "", location: "", startDate: "", endDate: "", gpa: "" };
const EMPTY_PROJ = { name: "", technologies: [], link: "", description: "" };
const EMPTY_CERT = { type: "certification", name: "", issuer: "", date: "" };

// ─── Collapsible Reorderable Section Card ───────────────────────────
const Section = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  accent = "text-blue-500",
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`border rounded-xl overflow-hidden mb-3 shadow-2xs transition-all ${
        isDragging
          ? "opacity-50 border-blue-400 bg-blue-50/50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="w-full flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50/60 hover:to-white transition-all">
        {/* Left: Drag handle & Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {draggable && (
            <div
              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-700 flex-shrink-0"
              title="Drag to reorder card"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 font-semibold text-[13px] text-gray-800 truncate cursor-pointer text-left flex-1"
          >
            {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${accent}`} />}
            <span className="truncate">{title}</span>
          </button>
        </div>

        {/* Right: Expand / Collapse */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
            title={open ? "Collapse" : "Expand"}
          >
            {open
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>
      {open && <div className="px-4 pb-4 pt-3 space-y-3 bg-white border-t border-gray-100">{children}</div>}
    </div>
  );
};

// ─── Generic field ─────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = "text", rows, hint }) => (
  <div>
    {label && (
      <label className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
        {type === "month" && <Calendar className="w-3 h-3 text-blue-400" />}
        {label}
      </label>
    )}
    {rows ? (
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:bg-white transition resize-none leading-relaxed"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:bg-white transition"
      />
    )}
    {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

// ─── Tag input (for skills / project technologies) ─────────────────
const TagInput = ({ label, tags = [], onChange, placeholder }) => {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed)) { setInput(""); return; }
    onChange([...tags, trimmed]);
    setInput("");
  };

  const remove = (i) => onChange(tags.filter((_, idx) => idx !== i));

  return (
    <div>
      {label && (
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      )}
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder={placeholder || "Type and press Enter..."}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            >
              {tag}
              <button onClick={() => remove(i)} className="hover:text-red-500 transition-colors ml-0.5">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Editor ────────────────────────────────────────────────────
const ResumeEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [resume, setResume] = useState(EMPTY_RESUME);
  const [activeTab, setActiveTab] = useState("personal");
  const [showTemplates, setShowTemplates] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // ── Cloud Persistence State ──
  const [cloudStatus, setCloudStatus] = useState("saved"); // "saved" | "saving" | "local" | "error"
  const debounceTimerRef = useRef(null);

  // ── AI Writing Assistants State ──
  const [aiLoading, setAiLoading] = useState({
    polishingIndex: null,
    polishingProjectIndex: null,
    generatingSummary: false,
    suggestingSkills: false,
  });
  const [aiSummaries, setAiSummaries] = useState(null);
  const [suggestedSkills, setSuggestedSkills] = useState([]);

  // ── Sample Resume Modal State ──
  const [showSampleModal, setShowSampleModal] = useState(false);

  // ── Focus Mode (Full-width writing mode) ──
  const [focusMode, setFocusMode] = useState(false);

  // ── Preview Zoom & A4 Page Indicator State ──
  const [zoom, setZoom] = useState(85);
  const [isFitScreen, setIsFitScreen] = useState(false);
  const [contentHeight, setContentHeight] = useState(1123);
  const previewContainerRef = useRef(null);

  // Measure content height to accurately detect A4 page breaks (1123px)
  useEffect(() => {
    if (!printRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target) {
          setContentHeight(entry.target.scrollHeight || 1123);
        }
      }
    });
    observer.observe(printRef.current);
    return () => observer.disconnect();
  }, [resume, resume.template]);

  const handleFitToScreen = () => {
    if (!previewContainerRef.current) return;
    const container = previewContainerRef.current;
    const availableHeight = container.clientHeight - 90;
    const availableWidth = container.clientWidth - 48;

    const scaleY = availableHeight / 1123;
    const scaleX = availableWidth / 794;
    const fitScale = Math.min(scaleX, scaleY, 1);
    const fitPercent = Math.max(50, Math.min(130, Math.round(fitScale * 100)));

    setZoom(fitPercent);
    setIsFitScreen(true);
  };

  const handleZoomIn = () => {
    setIsFitScreen(false);
    setZoom((prev) => Math.min(150, Math.round((prev + 10) / 10) * 10));
  };

  const handleZoomOut = () => {
    setIsFitScreen(false);
    setZoom((prev) => Math.max(50, Math.round((prev - 10) / 10) * 10));
  };

  const hasExistingData = Boolean(
    resume.personalInfo?.fullName?.trim() ||
    resume.summary?.trim() ||
    (resume.experience && resume.experience.length > 0) ||
    (resume.education && resume.education.length > 0) ||
    (resume.projects && resume.projects.length > 0)
  );

  const handleSelectSample = (sampleData) => {
    const updated = {
      ...sampleData,
      id: resume.id || id,
      customId: resume.customId || id,
      _id: resume._id,
      createdAt: resume.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResume(updated);
    saveResume(updated);
    toast.success(`🎉 Loaded sample ${sampleData.personalInfo?.jobTitle || "resume"}! Customize the text to match your journey.`);
  };

  // 1a. AI Polish Experience (2 compact bullets)
  const handleAiPolishExperience = async (index) => {
    const exp = resume.experience?.[index];
    if (!exp) return;

    if (!exp.description || exp.description.trim().length < 5) {
      toast.error("Please enter some rough notes or text first for AI to polish.");
      return;
    }

    setAiLoading((prev) => ({ ...prev, polishingIndex: index }));
    try {
      const res = await axiosInstance.post(API_PATHS.AI.POLISH_EXPERIENCE, {
        text: exp.description,
        jobTitle: exp.title,
        company: exp.company,
      });

      if (res.data?.polished) {
        updateItem("experience", index, { description: res.data.polished });
        toast.success("✨ Work experience polished (1 point, 25-30 words)!");
      }
    } catch (err) {
      console.error("AI Polish error:", err);
      toast.error(err.response?.data?.message || "Failed to polish description.");
    } finally {
      setAiLoading((prev) => ({ ...prev, polishingIndex: null }));
    }
  };

  // 1b. AI Polish Project (Strictly 1 point, 25 to 30 words)
  const handleAiPolishProject = async (index) => {
    const proj = resume.projects?.[index];
    if (!proj) return;

    if (!proj.description || proj.description.trim().length < 5) {
      toast.error("Please enter some rough notes about your project first.");
      return;
    }

    setAiLoading((prev) => ({ ...prev, polishingProjectIndex: index }));
    try {
      const res = await axiosInstance.post(API_PATHS.AI.POLISH_PROJECT, {
        text: proj.description,
        projectName: proj.name,
        technologies: proj.technologies,
      });

      if (res.data?.polished) {
        updateItem("projects", index, { description: res.data.polished });
        toast.success("✨ Project description polished (1 point, 25-30 words)!");
      }
    } catch (err) {
      console.error("AI Polish Project error:", err);
      toast.error(err.response?.data?.message || "Failed to polish project description.");
    } finally {
      setAiLoading((prev) => ({ ...prev, polishingProjectIndex: null }));
    }
  };

  // 2. AI Generate Summaries
  const handleAiGenerateSummaries = async () => {
    const jobTitle = resume.personalInfo?.jobTitle || user?.jobTitle || "Professional";
    setAiLoading((prev) => ({ ...prev, generatingSummary: true }));
    try {
      const expContext = (resume.experience || [])
        .map((e) => `${e.title || "Role"} at ${e.company || "Company"}: ${e.description || ""}`)
        .join("; ");

      const res = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARIES, {
        jobTitle,
        skills: resume.skills?.length ? resume.skills : user?.skills,
        experienceSummary: expContext,
      });

      if (res.data?.summaries?.length) {
        setAiSummaries(res.data.summaries);
        toast.success("✨ 3 tailored professional summaries generated! Pick your favorite.");
      }
    } catch (err) {
      console.error("AI Summary error:", err);
      toast.error(err.response?.data?.message || "Failed to generate summaries.");
    } finally {
      setAiLoading((prev) => ({ ...prev, generatingSummary: false }));
    }
  };

  const handleApplySummary = (summaryText) => {
    update({ summary: summaryText });
    setAiSummaries(null);
    toast.success("Summary applied to resume!");
  };

  // 3. AI Suggest Skills
  const handleAiSuggestSkills = async () => {
    const jobTitle = resume.personalInfo?.jobTitle || user?.jobTitle;
    if (!jobTitle || jobTitle.trim().length < 2) {
      toast.error("Please enter a Job Title / Headline in the Personal tab first.");
      return;
    }

    setAiLoading((prev) => ({ ...prev, suggestingSkills: true }));
    try {
      const res = await axiosInstance.post(API_PATHS.AI.SUGGEST_SKILLS, {
        jobTitle,
        currentSkills: resume.skills || [],
      });

      if (res.data?.skills?.length) {
        setSuggestedSkills(res.data.skills);
        toast.success(`✨ Found ${res.data.skills.length} trending skills for ${jobTitle}!`);
      } else {
        toast("No additional new skills suggested.", { icon: "ℹ️" });
      }
    } catch (err) {
      console.error("AI Skills error:", err);
      toast.error(err.response?.data?.message || "Failed to suggest skills.");
    } finally {
      setAiLoading((prev) => ({ ...prev, suggestingSkills: false }));
    }
  };

  const handleAddSuggestedSkill = (skill) => {
    const current = resume.skills || [];
    if (!current.includes(skill)) {
      update({ skills: [...current, skill] });
    }
    setSuggestedSkills((prev) => prev.filter((s) => s !== skill));
    toast.success(`Added "${skill}"!`);
  };

  const handleAddAllSuggestedSkills = () => {
    if (!suggestedSkills.length) return;
    const current = resume.skills || [];
    const merged = [...new Set([...current, ...suggestedSkills])];
    update({ skills: merged });
    setSuggestedSkills([]);
    toast.success("All suggested skills added to your resume!");
  };

  const handleImportProfile = () => {
    if (!user) {
      toast.error("Please log in to import profile details.");
      return;
    }

    const hasAnyProfileData =
      user.name ||
      user.jobTitle ||
      user.email ||
      user.phone ||
      user.location ||
      user.bio ||
      (user.skills && user.skills.length > 0) ||
      user.linkedin ||
      user.website ||
      user.github;

    if (!hasAnyProfileData) {
      toast("No career details found in your profile. You can add them in your Profile page.", {
        icon: "ℹ️",
      });
      return;
    }

    const updatedPersonalInfo = {
      fullName: user.name || resume.personalInfo.fullName || "",
      jobTitle: user.jobTitle || resume.personalInfo.jobTitle || "",
      email: user.email || resume.personalInfo.email || "",
      phone: user.phone || resume.personalInfo.phone || "",
      location: user.location || resume.personalInfo.location || "",
      linkedin: user.linkedin || resume.personalInfo.linkedin || "",
      website: user.website || user.github || resume.personalInfo.website || "",
    };

    const updatedSummary = user.bio || resume.summary || "";
    const profileSkills = Array.isArray(user.skills) ? user.skills : [];
    const mergedSkills = [...new Set([...(resume.skills || []), ...profileSkills])];

    update({
      personalInfo: updatedPersonalInfo,
      summary: updatedSummary,
      skills: mergedSkills,
    });

    toast.success("Profile details imported into resume!");
  };

  // 1. Initial Load: check localStorage first for instant rendering, then fetch from MongoDB
  useEffect(() => {
    if (!id) return;

    // Fast local restore
    const stored = JSON.parse(localStorage.getItem("resumes") || "[]");
    const localFound = stored.find(r => (r.id === id || r.customId === id || r._id === id));
    if (localFound) {
      setResume(localFound);
    } else {
      setResume({ ...EMPTY_RESUME, id, customId: id });
    }

    // Cloud fetch if authenticated
    if (isAuthenticated && user) {
      axiosInstance.get(API_PATHS.RESUMES.GET_BY_ID(id))
        .then((res) => {
          if (res.data) {
            const cloudResume = {
              ...res.data,
              id: res.data.customId || res.data._id || id,
            };
            setResume(cloudResume);

            // Update local cache
            const idx = stored.findIndex(r => (r.id === id || r.customId === id || r._id === id));
            if (idx >= 0) stored[idx] = cloudResume;
            else stored.unshift(cloudResume);
            localStorage.setItem("resumes", JSON.stringify(stored));
            setCloudStatus("saved");
          }
        })
        .catch((err) => {
          // If 404 on cloud and we have localFound, push localFound to cloud
          if (err.response?.status === 404 && localFound) {
            axiosInstance.put(API_PATHS.RESUMES.UPDATE(id), localFound)
              .then(() => setCloudStatus("saved"))
              .catch(() => setCloudStatus("error"));
          } else {
            setCloudStatus("local");
          }
        });
    } else {
      setCloudStatus("local");
    }
  }, [id, isAuthenticated, user]);

  // 2. Debounced Cloud Save & Immediate Local Cache
  const saveResume = useCallback((updated) => {
    // Immediate local cache save
    const stored = JSON.parse(localStorage.getItem("resumes") || "[]");
    const idx = stored.findIndex(r => (r.id === id || r.customId === id || r._id === id));
    const toSave = { ...updated, id, updatedAt: new Date().toISOString() };
    if (idx >= 0) stored[idx] = toSave;
    else stored.push({ ...toSave, createdAt: new Date().toISOString() });
    localStorage.setItem("resumes", JSON.stringify(stored));

    // Cloud persistence if logged in
    if (isAuthenticated && user) {
      setCloudStatus("saving");
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          await axiosInstance.put(API_PATHS.RESUMES.UPDATE(id), toSave);
          setCloudStatus("saved");
        } catch (err) {
          console.warn("[ResumeEditor] Cloud auto-save failed, saved locally:", err);
          setCloudStatus("error");
        }
      }, 700);
    } else {
      setCloudStatus("local");
    }
  }, [id, isAuthenticated, user]);

  const update = (patch) => {
    const next = { ...resume, ...patch };
    setResume(next);
    saveResume(next);
  };

  const updatePersonal = (field, val) => update({ personalInfo: { ...resume.personalInfo, [field]: val } });
  const addItem    = (key, empty) => update({ [key]: [...(resume[key] || []), { ...empty }] });
  const removeItem = (key, i)     => update({ [key]: resume[key].filter((_, idx) => idx !== i) });
  const updateItem = (key, i, patch) =>
    update({ [key]: resume[key].map((it, idx) => idx === i ? { ...it, ...patch } : it) });

  // ── Section Reorder & Visibility Handlers ──
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [draggingItem, setDraggingItem] = useState(null);

  const moveItem = (key, fromIndex, toIndex) => {
    const list = [...(resume[key] || [])];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    update({ [key]: list });
  };

  const toggleSectionVisibility = (sectionKey) => {
    const currentVis = {
      ...DEFAULT_SECTION_VISIBILITY,
      ...(resume.sectionVisibility || {}),
    };
    const nextVis = {
      ...currentVis,
      [sectionKey]: !currentVis[sectionKey],
    };
    update({ sectionVisibility: nextVis });
    toast.success(
      nextVis[sectionKey]
        ? `${SECTION_METADATA[sectionKey]?.label || sectionKey} is now visible on resume`
        : `${SECTION_METADATA[sectionKey]?.label || sectionKey} is now hidden from resume`
    );
  };

  const handleUpdateSectionOrder = (newOrder) => {
    update({ sectionOrder: newOrder });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: resume.personalInfo?.fullName || resume.title || "Resume",
    pageStyle: `@page { size: A4; margin: 0; } body { margin: 0; } @media print { body * { visibility: hidden; } #resume-print, #resume-print * { visibility: visible; } #resume-print { position: absolute; left: 0; top: 0; width: 100%; transform: none !important; } .no-print { display: none !important; } }`,
  });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${resume.personalInfo?.fullName || "My"}'s Resume`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch { toast.error("Could not share."); }
  };

  const ActiveTemplate = TEMPLATES.find(t => t.id === resume.template)?.component || TemplateModern;

  const tabs = [
    { id: "personal",       label: "Personal",   icon: User,           accent: "text-blue-500" },
    { id: "experience",     label: "Experience",  icon: Briefcase,      accent: "text-emerald-500" },
    { id: "education",      label: "Education",   icon: GraduationCap,  accent: "text-violet-500" },
    { id: "skills",         label: "Skills",      icon: Code,           accent: "text-amber-500" },
    { id: "projects",       label: "Projects",    icon: FolderOpen,     accent: "text-indigo-500" },
    { id: "certifications", label: "Certs",       icon: Award,          accent: "text-orange-500" },
  ];

  // Helper bar for Section Visibility & Reorder inside each tab
  const SectionHeaderBar = ({ sectionKey, title }) => {
    const isVisible = resume.sectionVisibility?.[sectionKey] !== false;
    return (
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between p-2.5 bg-gray-50/90 border border-gray-200/90 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Section Visibility:</span>
            <button
              type="button"
              onClick={() => toggleSectionVisibility(sectionKey)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isVisible
                  ? "bg-white text-blue-700 border border-blue-200 shadow-2xs hover:bg-blue-50"
                  : "bg-gray-200/80 text-gray-600 border border-gray-300 hover:bg-gray-300"
              }`}
            >
              {isVisible ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Visible on Resume</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                  <span>Hidden from Resume</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowReorderModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Reorder Sections</span>
          </button>
        </div>

        {!isVisible && (
          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900 shadow-2xs">
            <span className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>This section is currently <strong>hidden</strong> from your resume preview and PDF export.</span>
            </span>
            <button
              type="button"
              onClick={() => toggleSectionVisibility(sectionKey)}
              className="px-2.5 py-1 text-xs font-bold text-rose-800 bg-white border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Show Section
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/resume-builder")}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors group flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
            <input
              value={resume.title}
              onChange={e => update({ title: e.target.value })}
              className="text-sm font-bold text-gray-900 bg-transparent border-none outline-none min-w-0 w-32 sm:w-48 truncate"
              placeholder="Resume Title"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowSampleModal(true)}
              title="Load realistic sample resume to overcome writer's block"
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Load Sample</span>
              <span className="md:hidden hidden sm:inline">Sample</span>
            </button>

            <button
              onClick={handleImportProfile}
              title="Import career details from your profile"
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span className="hidden sm:inline">Import from Profile</span>
            </button>

            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg border transition-all ${
                showTemplates ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Template</span>
            </button>

            {/* Focus Mode / Collapse Toggle */}
            <button
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              title={focusMode ? "Show live preview (⇥)" : "Focus Mode: Hide preview for full-width writing (⇥)"}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                focusMode
                  ? "border-blue-400 bg-blue-50 text-blue-700 shadow-2xs font-bold"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              {focusMode ? (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline">Show Preview</span>
                </>
              ) : (
                <>
                  <PanelRightClose className="w-3.5 h-3.5 text-gray-500" />
                  <span className="hidden md:inline">Focus Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => setMobilePreview(!mobilePreview)}
              className="sm:hidden flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-bold px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>

        {/* Template Slider */}
        {showTemplates && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 py-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Choose a Template</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide snap-x">
              {TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => { update({ template: tpl.id }); setShowTemplates(false); }}
                  className={`snap-start flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-28 cursor-pointer ${
                    resume.template === tpl.id
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Mini preview swatch */}
                  <div className={`w-14 h-10 rounded-md ${tpl.preview} flex items-center justify-center overflow-hidden relative`}>
                    <div className="absolute inset-0 flex flex-col gap-0.5 p-1 opacity-40">
                      <div className="h-1.5 bg-current rounded-sm w-full" />
                      <div className="h-0.5 bg-current rounded-sm w-3/4" />
                      <div className="h-0.5 bg-current rounded-sm w-1/2 mt-0.5" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-gray-900">{tpl.label}</p>
                    <p className="text-[9px] text-gray-400 leading-tight">{tpl.description}</p>
                  </div>
                  {resume.template === tpl.id && (
                    <div className="absolute mt-0.5">
                      <Check className="w-3 h-3 text-blue-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
        {/* ─── LEFT FORM PANEL ─── */}
        <div
          className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-200 ${
            mobilePreview
              ? "hidden"
              : focusMode
                ? "flex-1 w-full"
                : "flex-shrink-0 w-full sm:w-[500px] lg:w-[540px] xl:w-[560px]"
          } sm:flex`}
        >
          {/* Section tabs */}
          <div className={`flex items-center justify-between border-b border-gray-100 bg-gray-50/80 transition-all ${
            focusMode ? "px-6 sm:px-10 lg:px-14 py-3 sm:py-3.5" : "px-3 sm:px-4 py-2.5 gap-1"
          }`}>
            <div className={`flex overflow-x-auto scrollbar-hide flex-1 items-center ${
              focusMode ? "gap-2.5 sm:gap-4 md:gap-6 justify-center" : "gap-1"
            }`}>
              {tabs.map(t => {
                const isSectionHidden = t.id !== "personal" && resume.sectionVisibility?.[t.id] === false;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-shrink-0 flex items-center transition-all whitespace-nowrap cursor-pointer ${
                      focusMode
                        ? "gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs hover:shadow-xs"
                        : "gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                    } ${
                      activeTab === t.id
                        ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                        : isSectionHidden
                        ? "text-gray-400 hover:bg-white hover:text-gray-600 line-through"
                        : "text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-xs"
                    }`}
                  >
                    <t.icon className={`${focusMode ? "w-4 h-4 sm:w-4.5 sm:h-4.5" : "w-3.5 h-3.5"} ${activeTab === t.id ? t.accent : isSectionHidden ? "text-gray-300" : "text-gray-400"}`} />
                    <span>{t.label}</span>
                    {isSectionHidden && (
                      <EyeOff className="w-3 h-3 text-rose-400 ml-0.5" title="Hidden on resume" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions: Reorder Sections & Focus Mode */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setShowReorderModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-white hover:text-blue-700 hover:bg-blue-50/50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
                title="Reorder Sections & Toggle Visibility (👁)"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden lg:inline">Reorder</span>
              </button>

              {/* Quick Focus Mode toggle icon */}
              <button
                type="button"
                onClick={() => setFocusMode(!focusMode)}
                className="hidden sm:flex items-center p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                title={focusMode ? "Show live preview (⇥)" : "Focus Mode: Full width editor (⇥)"}
              >
                {focusMode ? (
                  <PanelRightOpen className="w-4 h-4 text-blue-600" />
                ) : (
                  <PanelRightClose className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Form scroll area */}
          <div className={`flex-1 overflow-y-auto ${focusMode ? "px-6 sm:px-10 lg:px-14 py-6" : "px-5 sm:px-8 py-5"} space-y-4`}>
            <div className={focusMode ? "max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full space-y-6" : "w-full space-y-4"}>
              {focusMode && (
                <div className="px-5 py-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-blue-50/90 border border-blue-200/80 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-blue-900 shadow-2xs">
                  <span className="flex items-center gap-2.5 font-medium">
                    <Maximize2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span><strong>Expanded View:</strong> High-productivity workspace with expanded inputs and full section spacing.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFocusMode(false)}
                    className="font-bold text-blue-700 hover:text-blue-800 bg-white px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 shadow-2xs transition-colors cursor-pointer text-xs"
                  >
                    Show Preview ⇥
                  </button>
                </div>
              )}

            {/* ─ Personal ─ */}
            {activeTab === "personal" && (
              <div className="space-y-4 sm:space-y-5">
                <div className={focusMode ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" : "grid grid-cols-1 gap-4"}>
                  <Field label="Full Name" value={resume.personalInfo.fullName} onChange={v => updatePersonal("fullName", v)} placeholder="John Doe" />
                  <Field label="Job Title / Headline" value={resume.personalInfo.jobTitle} onChange={v => updatePersonal("jobTitle", v)} placeholder="Full Stack Developer" />
                </div>
                <div className={focusMode ? "grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6" : "grid grid-cols-2 gap-3"}>
                  <Field label="Email" type="email" value={resume.personalInfo.email} onChange={v => updatePersonal("email", v)} placeholder="john@email.com" />
                  <Field label="Phone" value={resume.personalInfo.phone} onChange={v => updatePersonal("phone", v)} placeholder="+91 9000000000" />
                  <Field label="Location" value={resume.personalInfo.location} onChange={v => updatePersonal("location", v)} placeholder="Hyderabad, India" />
                </div>
                <div className={focusMode ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" : "space-y-4"}>
                  <Field
                    label="LinkedIn URL"
                    value={resume.personalInfo.linkedin}
                    onChange={v => updatePersonal("linkedin", v)}
                    placeholder="linkedin.com/in/johndoe"
                    hint="Will show as clickable 'LinkedIn' in the resume"
                  />
                  <Field
                    label="Website / Portfolio URL"
                    value={resume.personalInfo.website}
                    onChange={v => updatePersonal("website", v)}
                    placeholder="johndoe.dev"
                    hint="Will show as clickable 'Portfolio' in the resume"
                  />
                </div>
                {/* Professional Summary with AI Generator */}
                <div className="border-t border-gray-100 pt-3 space-y-2.5">
                  <SectionHeaderBar sectionKey="summary" title="Professional Summary" />
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                      Professional Summary
                    </label>
                    <button
                      type="button"
                      onClick={handleAiGenerateSummaries}
                      disabled={aiLoading.generatingSummary}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-violet-700 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 border border-violet-200 rounded-lg shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Analyze your role, skills & background to create 3 polished summaries"
                    >
                      {aiLoading.generatingSummary ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                          <span>AI Generate Summary</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Generated Summaries Tray */}
                  {aiSummaries && (
                    <div className="p-3.5 bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/90 border border-violet-200 rounded-xl space-y-3 shadow-xs animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                          <Wand2 className="w-3.5 h-3.5 text-violet-600" />
                          Select an AI-Crafted Summary
                        </p>
                        <button
                          type="button"
                          onClick={() => setAiSummaries(null)}
                          className="text-gray-400 hover:text-gray-600 p-0.5"
                          title="Close suggestions"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {aiSummaries.map((s, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 bg-white border border-violet-100 rounded-xl hover:border-violet-300 hover:shadow-xs transition-all"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wider">
                                {s.style || s.title || `Option ${sIdx + 1}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleApplySummary(s.text)}
                                className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Use This
                              </button>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">{s.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Field
                    value={resume.summary}
                    onChange={v => update({ summary: v })}
                    placeholder="Write a compelling 2–3 sentence summary of your background and goals, or click 'AI Generate Summary' above..."
                    rows={5}
                  />
                </div>
              </div>
            )}

            {/* ─ Experience ─ */}
            {activeTab === "experience" && (
              <div className="space-y-3">
                <SectionHeaderBar sectionKey="experience" title="Work Experience" />
                {(resume.experience || []).map((exp, i) => (
                  <Section
                    key={i}
                    title={exp.title || exp.company || `Experience ${i + 1}`}
                    icon={Briefcase}
                    defaultOpen={i === 0}
                    accent="text-emerald-500"
                    draggable
                    onDragStart={() => setDraggingItem({ section: "experience", index: i })}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggingItem?.section === "experience" && draggingItem.index !== i) {
                        moveItem("experience", draggingItem.index, i);
                        setDraggingItem({ section: "experience", index: i });
                      }
                    }}
                    onDragEnd={() => setDraggingItem(null)}
                    isDragging={draggingItem?.section === "experience" && draggingItem?.index === i}
                  >
                    <div className={focusMode ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-3"}>
                      <Field label="Job Title" value={exp.title} onChange={v => updateItem("experience", i, { title: v })} placeholder="Software Engineer" />
                      <Field label="Company" value={exp.company} onChange={v => updateItem("experience", i, { company: v })} placeholder="Google" />
                      <Field label="Location" value={exp.location} onChange={v => updateItem("experience", i, { location: v })} placeholder="Remote / Hyderabad" />
                    </div>
                    <div className={focusMode ? "grid grid-cols-1 md:grid-cols-3 gap-4 items-center" : "space-y-3"}>
                      <div className="grid grid-cols-2 gap-3 md:col-span-2">
                        <Field label="Start" type="month" value={exp.startDate} onChange={v => updateItem("experience", i, { startDate: v })} />
                        <Field label="End" type="month" value={exp.endDate} onChange={v => updateItem("experience", i, { endDate: v })} />
                      </div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={e => updateItem("experience", i, { current: e.target.checked, endDate: e.target.checked ? "" : exp.endDate })}
                          className="accent-blue-600 w-3.5 h-3.5"
                        />
                        Currently working here
                      </label>
                    </div>

                    {/* Description with AI Polish Button */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          Description & Achievements (1 Point • 25–30 Words)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAiPolishExperience(i)}
                          disabled={aiLoading.polishingIndex === i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 rounded-lg shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                          title="Generate strictly 1 concise bullet point of 25 to 30 words"
                        >
                          {aiLoading.polishingIndex === i ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                              <span>Polishing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                              <span>AI Polish</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={exp.description}
                        onChange={e => updateItem("experience", i, { description: e.target.value })}
                        placeholder="• Spearheaded development of... (or type rough notes and click AI Polish)"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:bg-white transition resize-none leading-relaxed"
                      />
                    </div>

                    <button onClick={() => removeItem("experience", i)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-semibold pt-1 border-t border-gray-100 w-full mt-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Remove Entry
                    </button>
                  </Section>
                ))}
                <button
                  onClick={() => addItem("experience", EMPTY_EXP)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all mt-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
            )}

            {/* ─ Education ─ */}
            {activeTab === "education" && (
              <div className="space-y-3">
                <SectionHeaderBar sectionKey="education" title="Education & Degrees" />
                {(resume.education || []).map((edu, i) => (
                  <Section
                    key={i}
                    title={edu.degree || edu.school || `Education ${i + 1}`}
                    icon={GraduationCap}
                    defaultOpen={i === 0}
                    accent="text-violet-500"
                    draggable
                    onDragStart={() => setDraggingItem({ section: "education", index: i })}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggingItem?.section === "education" && draggingItem.index !== i) {
                        moveItem("education", draggingItem.index, i);
                        setDraggingItem({ section: "education", index: i });
                      }
                    }}
                    onDragEnd={() => setDraggingItem(null)}
                    isDragging={draggingItem?.section === "education" && draggingItem?.index === i}
                  >
                    <div className={focusMode ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-3"}>
                      <Field label="Degree / Course" value={edu.degree} onChange={v => updateItem("education", i, { degree: v })} placeholder="B.Tech Computer Science" />
                      <Field label="School / University" value={edu.school} onChange={v => updateItem("education", i, { school: v })} placeholder="JNTU Hyderabad" />
                      <Field label="Location" value={edu.location} onChange={v => updateItem("education", i, { location: v })} placeholder="Hyderabad, India" />
                    </div>
                    <div className={focusMode ? "grid grid-cols-1 md:grid-cols-3 gap-4 items-center" : "space-y-3"}>
                      <div className="grid grid-cols-2 gap-3 md:col-span-2">
                        <Field label="Start" type="month" value={edu.startDate} onChange={v => updateItem("education", i, { startDate: v })} />
                        <Field label="End" type="month" value={edu.endDate} onChange={v => updateItem("education", i, { endDate: v })} />
                      </div>
                      <Field label="GPA / Percentage" value={edu.gpa} onChange={v => updateItem("education", i, { gpa: v })} placeholder="8.5 / 10" />
                    </div>
                    <button onClick={() => removeItem("education", i)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-semibold pt-1 border-t border-gray-100 w-full mt-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Remove Entry
                    </button>
                  </Section>
                ))}
                <button
                  onClick={() => addItem("education", EMPTY_EDU)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-400 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-all mt-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
            )}

            {/* ─ Skills ─ */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <SectionHeaderBar sectionKey="skills" title="Skills & Competencies" />
                {/* AI Suggest Skills Card */}
                <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      AI Skill Suggestions
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Get 10–15 trending skills for{" "}
                      <strong>{resume.personalInfo?.jobTitle || "your target role"}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiSuggestSkills}
                    disabled={aiLoading.suggestingSkills}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading.suggestingSkills ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Suggest Skills</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Suggested Skills Tray */}
                {suggestedSkills.length > 0 && (
                  <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-2 shadow-2xs animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                        Recommended for {resume.personalInfo?.jobTitle || "Your Role"} ({suggestedSkills.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddAllSuggestedSkills}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                        >
                          + Add All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSuggestedSkills([])}
                          className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {suggestedSkills.map((skill, skIdx) => (
                        <button
                          key={skIdx}
                          type="button"
                          onClick={() => handleAddSuggestedSkill(skill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition-all hover:scale-105 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3 text-amber-600" />
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {user?.skills && user.skills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const mergedSkills = [...new Set([...(resume.skills || []), ...user.skills])];
                      update({ skills: mergedSkills });
                      toast.success(`Imported ${user.skills.length} skills from Profile!`);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl w-full justify-center transition-all cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Import {user.skills.length} skills from your Profile
                  </button>
                )}
                
                <TagInput
                  label="Skills"
                  tags={resume.skills || []}
                  onChange={tags => update({ skills: tags })}
                  placeholder="e.g. React.js, Python, Figma..."
                />
              </div>
            )}

            {/* ─ Projects ─ */}
            {activeTab === "projects" && (
              <div className="space-y-3">
                <SectionHeaderBar sectionKey="projects" title="Key Projects" />
                {(resume.projects || []).map((proj, i) => (
                  <Section
                    key={i}
                    title={proj.name || `Project ${i + 1}`}
                    icon={FolderOpen}
                    defaultOpen={i === 0}
                    accent="text-indigo-500"
                    draggable
                    onDragStart={() => setDraggingItem({ section: "projects", index: i })}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggingItem?.section === "projects" && draggingItem.index !== i) {
                        moveItem("projects", draggingItem.index, i);
                        setDraggingItem({ section: "projects", index: i });
                      }
                    }}
                    onDragEnd={() => setDraggingItem(null)}
                    isDragging={draggingItem?.section === "projects" && draggingItem?.index === i}
                  >
                    <div className={focusMode ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                      <Field label="Project Name" value={proj.name} onChange={v => updateItem("projects", i, { name: v })} placeholder="Job Portal App" />
                      <Field
                        label="Project Link / GitHub"
                        value={proj.link}
                        onChange={v => updateItem("projects", i, { link: v })}
                        placeholder="github.com/user/project"
                      />
                    </div>
                    <TagInput
                      label="Technologies Used"
                      tags={Array.isArray(proj.technologies) ? proj.technologies : proj.technologies ? [proj.technologies] : []}
                      onChange={tags => updateItem("projects", i, { technologies: tags })}
                      placeholder="e.g. React, Node.js..."
                    />

                    {/* Project Description with AI Polish (1 Point • 25–30 Words) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          Project Description 
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAiPolishProject(i)}
                          disabled={aiLoading.polishingProjectIndex === i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 rounded-lg shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                          title="Generate strictly 1 concise bullet point of 25 to 30 words"
                        >
                          {aiLoading.polishingProjectIndex === i ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                              <span>Polishing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                              <span>AI Polish</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={proj.description}
                        onChange={e => updateItem("projects", i, { description: e.target.value })}
                        placeholder="• Engineered a high-performance web application... (or type rough notes and click AI Polish)"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:bg-white transition resize-none leading-relaxed"
                      />
                    </div>

                    <button onClick={() => removeItem("projects", i)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-semibold pt-1 border-t border-gray-100 w-full mt-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Remove Entry
                    </button>
                  </Section>
                ))}
                <button
                  onClick={() => addItem("projects", EMPTY_PROJ)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all mt-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>
            )}

            {/* ─ Certifications & Hackathons ─ */}
            {activeTab === "certifications" && (
              <div className="space-y-3">
                <SectionHeaderBar sectionKey="certifications" title="Certifications & Hackathons" />
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => addItem("certifications", { ...EMPTY_CERT, type: "certification" })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-dashed border-amber-300 text-amber-700 bg-amber-50 rounded-xl text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" /> Add Certification
                  </button>
                  <button
                    onClick={() => addItem("certifications", { ...EMPTY_CERT, type: "hackathon" })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-dashed border-orange-300 text-orange-700 bg-orange-50 rounded-xl text-xs font-bold hover:bg-orange-100 transition cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Add Hackathon
                  </button>
                </div>

                {(resume.certifications || []).map((cert, i) => (
                  <Section
                    key={i}
                    title={
                      <span className="flex items-center gap-1.5">
                        {cert.type === "hackathon"
                          ? <Trophy className="w-3.5 h-3.5 text-orange-500" />
                          : <Award className="w-3.5 h-3.5 text-amber-500" />}
                        {cert.name || (cert.type === "hackathon" ? `Hackathon ${i + 1}` : `Certification ${i + 1}`)}
                      </span>
                    }
                    defaultOpen={i === 0}
                    accent="text-amber-500"
                    draggable
                    onDragStart={() => setDraggingItem({ section: "certifications", index: i })}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggingItem?.section === "certifications" && draggingItem.index !== i) {
                        moveItem("certifications", draggingItem.index, i);
                        setDraggingItem({ section: "certifications", index: i });
                      }
                    }}
                    onDragEnd={() => setDraggingItem(null)}
                    isDragging={draggingItem?.section === "certifications" && draggingItem?.index === i}
                  >
                    {/* Type badge */}
                    <div className="flex gap-2">
                      {["certification", "hackathon"].map(type => (
                        <button
                          key={type}
                          onClick={() => updateItem("certifications", i, { type })}
                          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all capitalize cursor-pointer ${
                            cert.type === type
                              ? type === "hackathon"
                                ? "bg-orange-100 border-orange-300 text-orange-700"
                                : "bg-amber-100 border-amber-300 text-amber-700"
                              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {type === "hackathon" ? "🏆 Hackathon" : "📜 Certification"}
                        </button>
                      ))}
                    </div>
                    <div className={focusMode ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-3"}>
                      <Field
                        label={cert.type === "hackathon" ? "Hackathon Name" : "Certification Name"}
                        value={cert.name}
                        onChange={v => updateItem("certifications", i, { name: v })}
                        placeholder={cert.type === "hackathon" ? "Smart India Hackathon 2024" : "AWS Solutions Architect"}
                      />
                      <Field
                        label={cert.type === "hackathon" ? "Organizer" : "Issued By"}
                        value={cert.issuer}
                        onChange={v => updateItem("certifications", i, { issuer: v })}
                        placeholder={cert.type === "hackathon" ? "Ministry of Education" : "Amazon Web Services"}
                      />
                      <Field label="Date" type="month" value={cert.date} onChange={v => updateItem("certifications", i, { date: v })} />
                    </div>
                    <button onClick={() => removeItem("certifications", i)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-semibold pt-1 border-t border-gray-100 w-full mt-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Remove Entry
                    </button>
                  </Section>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT PREVIEW PANEL ─── */}
        <div
          ref={previewContainerRef}
          className={`flex-1 bg-gray-200/80 overflow-auto p-4 sm:p-6 flex flex-col justify-start items-center relative transition-all ${
            mobilePreview
              ? "flex"
              : focusMode
                ? "hidden"
                : "hidden sm:flex"
          }`}
        >
          {mobilePreview && (
            <button
              onClick={() => setMobilePreview(false)}
              className="sm:hidden mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Editor
            </button>
          )}

          {/* Scalable A4 Canvas Container */}
          <div
            className="transition-all duration-150 flex flex-col items-center"
            style={{
              width: `${794 * (zoom / 100)}px`,
              minHeight: `${Math.max(1123, contentHeight) * (zoom / 100)}px`,
            }}
          >
            <div
              style={{
                width: "794px",
                minHeight: "1123px",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
              className="relative flex-shrink-0"
            >
              <div
                id="resume-print"
                ref={printRef}
                className="bg-white shadow-2xl rounded-sm overflow-hidden relative"
                style={{ width: "794px", minHeight: "1123px" }}
              >
                <ActiveTemplate data={resume} />

                {/* A4 Page-Cut / 1-Page Indicators at every 1123px */}
                {Array.from({ length: Math.floor(contentHeight / 1123) }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const topPos = pageNum * 1123;
                  return (
                    <div
  key={pageNum}
  className="no-print absolute left-0 right-0 pointer-events-none z-30"
  style={{ top: `${topPos - 12}px` }}
>
  <div className="border-t border-dashed border-gray-300" />

  <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-2 text-[9px] text-gray-400">
    Page {pageNum}
  </span>
</div>
                  );
                })}
              </div>
            </div>
          </div>

          

          {/* Floating Zoom & Fit Pill */}
          <div className="sticky bottom-4 z-40 flex items-center justify-center pointer-events-none mt-4 pb-2">
            <div className="pointer-events-auto bg-gray-900/90 hover:bg-gray-900 text-white backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl border border-gray-700/60 flex items-center gap-2 text-xs transition-all select-none">
              {/* Zoom Out Button */}
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                title="Zoom Out (-10%)"
                className="p-1 rounded-md hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Current Zoom % button (click to reset 100%) */}
              <button
                type="button"
                onClick={() => { setZoom(100); setIsFitScreen(false); }}
                title="Click to reset to 100%"
                className="w-11 text-center font-bold text-[11px] hover:text-blue-400 transition-colors cursor-pointer"
              >
                {Math.round(zoom)}%
              </button>

              {/* Zoom In Button */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 150}
                title="Zoom In (+10%)"
                className="p-1 rounded-md hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-gray-700" />

              {/* Fit to Screen Button */}
              <button
                type="button"
                onClick={handleFitToScreen}
                title="Fit entire A4 height to screen"
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                  isFitScreen ? "bg-blue-600 text-white" : "hover:bg-gray-800 text-gray-300 hover:text-white"
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                Fit
              </button>

              {/* 100% Button */}
              <button
                type="button"
                onClick={() => { setZoom(100); setIsFitScreen(false); }}
                title="View actual 100% size"
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  zoom === 100 && !isFitScreen ? "bg-gray-800 text-white" : "hover:bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                100%
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Resume Selector Modal */}
      <SampleResumeModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
        onSelectSample={handleSelectSample}
        hasExistingData={hasExistingData}
      />

      {/* Reorder Sections & Visibility Modal */}
      <ReorderSectionsModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        sectionOrder={resume.sectionOrder || DEFAULT_SECTION_ORDER}
        sectionVisibility={resume.sectionVisibility || DEFAULT_SECTION_VISIBILITY}
        onChangeOrder={handleUpdateSectionOrder}
        onToggleVisibility={toggleSectionVisibility}
        resumeData={resume}
      />
    </div>
  );
};

export default ResumeEditorPage;
