import React, { useState, useMemo } from "react";
import {
  X, Check, FileText, Code, BarChart3, Megaphone,
  LayoutGrid, Palette, Cloud, Brain, Shield, DollarSign,
  ArrowRight, Search, Globe, Server, Smartphone, Database, Cpu, Users
} from "lucide-react";
import { SAMPLE_RESUMES } from "./sampleResumes";

const ROLE_ICONS = {
  "software-engineer": Code,
  "frontend-engineer": Globe,
  "backend-engineer": Server,
  "mobile-developer": Smartphone,
  "devops-engineer": Cloud,
  "cybersecurity-analyst": Shield,
  "data-analyst": BarChart3,
  "data-engineer": Database,
  "ai-engineer": Brain,
  "ml-engineer": Cpu,
  "product-manager": LayoutGrid,
  "uiux-designer": Palette,
  "engineering-manager": Users,
  "marketing-manager": Megaphone,
  "financial-analyst": DollarSign,
};

const CATEGORY_MAP = {
  "software-engineer": "tech",
  "frontend-engineer": "tech",
  "backend-engineer": "tech",
  "mobile-developer": "tech",
  "devops-engineer": "tech",
  "cybersecurity-analyst": "tech",
  "data-analyst": "data-ai",
  "data-engineer": "data-ai",
  "ai-engineer": "data-ai",
  "ml-engineer": "data-ai",
  "product-manager": "design-product",
  "uiux-designer": "design-product",
  "engineering-manager": "tech",
  "marketing-manager": "business",
  "financial-analyst": "business",
};

const FILTER_TABS = [
  { id: "all", label: "All Roles" },
  { id: "tech", label: "Engineering" },
  { id: "data-ai", label: "Data & AI" },
  { id: "design-product", label: "Design & Product" },
  { id: "business", label: "Business & Growth" },
];

const SampleResumeModal = ({ isOpen, onClose, onSelectSample, hasExistingData }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const filteredSamples = useMemo(() => {
    return SAMPLE_RESUMES.filter((sample) => {
      const matchesTab = activeTab === "all" || CATEGORY_MAP[sample.id] === activeTab;
      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const roleMatch = (sample.role || "").toLowerCase().includes(q);
      const headlineMatch = (sample.headline || "").toLowerCase().includes(q);
      const categoryMatch = (sample.category || "").toLowerCase().includes(q);
      return roleMatch || headlineMatch || categoryMatch;
    });
  }, [activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleCardClick = (sample) => {
    if (hasExistingData) {
      setConfirmingId(sample.id);
    } else {
      onSelectSample(sample.data);
      onClose();
    }
  };

  const handleConfirmLoad = (sample) => {
    onSelectSample(sample.data);
    onClose();
    setConfirmingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        setConfirmingId(null);
        onClose();
      }}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-300 dark:border-zinc-700 max-w-5xl w-full overflow-hidden flex flex-col max-h-[88vh] text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close */}
        <div className="px-6 sm:px-8 py-5 border-b border-zinc-300 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800 flex items-center justify-center shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Choose a Sample Resume
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Select an industry template pre-filled with realistic experience and metrics.
            </p>
          </div>

          <button
            onClick={() => {
              setConfirmingId(null);
              onClose();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar: Category Tabs & Search */}
        <div className="px-6 sm:px-8 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-8.5 pr-7 py-1.5 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Spacious Cards Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {filteredSamples.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No sample resumes found</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Try selecting another category or clearing your search.</p>
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredSamples.map((sample) => {
                const Icon = ROLE_ICONS[sample.id] || FileText;
                const isConfirming = confirmingId === sample.id;

                return (
                  <div
                    key={sample.id}
                    onClick={() => !isConfirming && handleCardClick(sample)}
                    className={`text-left p-5 sm:p-6 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md ${
                      isConfirming
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm ring-2 ring-amber-400/20"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-400 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 px-2 py-0.5 rounded uppercase tracking-wider">
                          {sample.badge}
                        </span>
                      </div>

                      {/* Role Title & Headline */}
                      <h4 className="text-base font-bold text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-1.5">
                        {sample.role}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                        {sample.headline}
                      </p>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-4 mt-5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 capitalize">
                        {sample.template} template
                      </span>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmLoad(sample)}
                            className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-all cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Replace</span>
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                          <span>Use Sample</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SampleResumeModal;
