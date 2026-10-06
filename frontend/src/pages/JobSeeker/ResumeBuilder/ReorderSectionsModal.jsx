import React, { useState } from "react";
import {
  X, GripVertical, Eye, EyeOff,
  Check, RotateCcw, Sparkles, Layers,
  FileText, Briefcase, GraduationCap, FolderOpen, Code, Award
} from "lucide-react";
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
  SECTION_METADATA,
  SECTION_PRESETS
} from "./sectionConfig";

const ICONS = {
  FileText,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Code,
  Award,
};

const ReorderSectionsModal = ({
  isOpen,
  onClose,
  sectionOrder = DEFAULT_SECTION_ORDER,
  sectionVisibility = DEFAULT_SECTION_VISIBILITY,
  onChangeOrder,
  onToggleVisibility,
  resumeData = {},
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  if (!isOpen) return null;

  const currentOrder = sectionOrder && sectionOrder.length > 0
    ? sectionOrder
    : DEFAULT_SECTION_ORDER;

  const currentVisibility = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...(sectionVisibility || {}),
  };

  const handleMove = (fromIndex, toIndex) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= currentOrder.length || toIndex >= currentOrder.length) return;
    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    onChangeOrder(newOrder);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    handleMove(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getItemCount = (key) => {
    switch (key) {
      case "summary":
        return resumeData.summary ? "1 summary" : "Empty";
      case "experience":
        return `${resumeData.experience?.length || 0} entries`;
      case "education":
        return `${resumeData.education?.length || 0} entries`;
      case "projects":
        return `${resumeData.projects?.length || 0} projects`;
      case "skills":
        return `${resumeData.skills?.length || 0} skills`;
      case "certifications":
        return `${resumeData.certifications?.length || 0} certs`;
      default:
        return "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Reorder Sections & Visibility
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Drag cards to rearrange sections • Click 👁 to hide or show on resume
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100 bg-gray-50/50">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
            Quick Layout Presets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SECTION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChangeOrder(preset.order)}
                className="text-left p-2.5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 bg-white transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-900 group-hover:text-blue-700">
                    {preset.label}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1 leading-tight">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Reorderable Section List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-2.5">
          {currentOrder.map((sectionKey, index) => {
            const meta = SECTION_METADATA[sectionKey] || {
              label: sectionKey,
              shortLabel: sectionKey,
              iconName: "FileText",
            };
            const Icon = ICONS[meta.iconName] || FileText;
            const isVisible = currentVisibility[sectionKey] !== false;
            const isDragging = draggedIndex === index;

            return (
              <div
                key={sectionKey}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all select-none ${
                  isDragging
                    ? "opacity-50 border-blue-400 bg-blue-50/60 shadow-inner"
                    : isVisible
                    ? "border-gray-200 bg-white hover:border-gray-300 shadow-2xs"
                    : "border-gray-200 bg-gray-50/80 text-gray-400"
                }`}
              >
                {/* Left: Drag Handle, Number, Icon & Label */}
                <div className="flex items-center gap-3">
                  <div
                    className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-700"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <span className="w-5 text-center text-xs font-bold text-gray-400">
                    #{index + 1}
                  </span>

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-2xs ${
                      isVisible
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs font-bold ${
                          isVisible ? "text-gray-900" : "text-gray-400 line-through"
                        }`}
                      >
                        {meta.label}
                      </h4>
                      {!isVisible && (
                        <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {getItemCount(sectionKey)}
                    </p>
                  </div>
                </div>

                {/* Right: Eye Visibility Toggle */}
                <div className="flex items-center gap-1.5">
                  {/* Eye Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleVisibility(sectionKey)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isVisible
                        ? "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                        : "text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                    }`}
                    title={isVisible ? "Click to hide from resume" : "Click to show on resume"}
                  >
                    {isVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[11px] hidden sm:inline">Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[11px] hidden sm:inline">Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onChangeOrder(DEFAULT_SECTION_ORDER);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default Order
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReorderSectionsModal;
