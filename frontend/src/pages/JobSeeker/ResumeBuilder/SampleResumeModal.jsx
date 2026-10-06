import React, { useState } from "react";
import {
  X, Check, FileText, Sparkles, Code, BarChart3, Megaphone,
  LayoutGrid, Palette, Cloud, Brain, Shield, DollarSign,
  ArrowRight, AlertCircle
} from "lucide-react";
import { SAMPLE_RESUMES } from "./sampleResumes";

const ROLE_ICONS = {
  "software-engineer": Code,
  "data-analyst": BarChart3,
  "marketing-manager": Megaphone,
  "product-manager": LayoutGrid,
  "uiux-designer": Palette,
  "devops-engineer": Cloud,
  "ai-engineer": Brain,
  "cybersecurity-analyst": Shield,
  "financial-analyst": DollarSign,
};

const SampleResumeModal = ({ isOpen, onClose, onSelectSample, hasExistingData }) => {
  const [confirmingId, setConfirmingId] = useState(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        setConfirmingId(null);
        onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-blue-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Load Sample Resume
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Instant Pre-fill
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose a role below to load realistic, professionally tailored content
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setConfirmingId(null);
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_RESUMES.map((sample) => {
              const Icon = ROLE_ICONS[sample.id] || FileText;
              const isConfirming = confirmingId === sample.id;

              return (
                <div
                  key={sample.id}
                  onClick={() => !isConfirming && handleCardClick(sample)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between cursor-pointer group hover:shadow-md ${
                    isConfirming
                      ? "border-amber-400 bg-amber-50/50 shadow-sm ring-2 ring-amber-400/20"
                      : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 bg-white"
                  }`}
                >
                  {/* Card Content */}
                  <div>
                    {/* Icon & Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs border ${sample.lightBg}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {sample.badge}
                      </span>
                    </div>

                    {/* Role Title & Headline */}
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight mb-1">
                      {sample.role}
                    </h4>
                    <p className="text-xs text-gray-500 leading-snug mb-3">
                      {sample.headline}
                    </p>

                    {/* Key skills pills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(sample.data?.skills || []).slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-200/80 px-1.5 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {(sample.data?.skills?.length || 0) > 4 && (
                        <span className="text-[10px] font-medium text-gray-400 self-center">
                          +{sample.data.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-400 capitalize">
                      {sample.template} template
                    </span>

                    {isConfirming ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-200/60 rounded-md transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmLoad(sample)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-2xs transition-all cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Replace
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all">
                        Load Resume
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleResumeModal;
