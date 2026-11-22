import React, { useState } from "react";
import { X, GripVertical, Eye, EyeOff } from "lucide-react";
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
  SECTION_METADATA,
} from "./sectionConfig";

const ReorderSectionsModal = ({
  isOpen,
  onClose,
  sectionOrder = DEFAULT_SECTION_ORDER,
  sectionVisibility = DEFAULT_SECTION_VISIBILITY,
  onChangeOrder,
  onToggleVisibility,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  if (!isOpen) return null;

  const currentOrder =
    sectionOrder && sectionOrder.length > 0
      ? sectionOrder
      : DEFAULT_SECTION_ORDER;

  const currentVisibility = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...(sectionVisibility || {}),
  };

  const handleMove = (fromIndex, toIndex) => {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= currentOrder.length ||
      toIndex >= currentOrder.length
    )
      return;
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
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    handleMove(draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Reorder Sections
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Drag to reorder or click the eye icon to hide a section
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section List */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {currentOrder.map((sectionKey, index) => {
            const meta = SECTION_METADATA[sectionKey] || {
              label: sectionKey,
            };
            const isVisible = currentVisibility[sectionKey] !== false;
            const isDragging = draggedIndex === index;
            const isTarget = dragOverIndex === index && draggedIndex !== index;

            return (
              <div
                key={sectionKey}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-colors select-none ${
                  isDragging
                    ? "opacity-40 border-blue-400 bg-blue-50"
                    : isTarget
                    ? "border-blue-500 bg-blue-50/50"
                    : isVisible
                    ? "border-gray-200 bg-white hover:border-gray-300"
                    : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
              >
                {/* Drag Handle & Label */}
                <div className="flex items-center gap-3">
                  <div
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isVisible ? "text-gray-800" : "text-gray-400 line-through"
                    }`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Eye Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleVisibility(sectionKey)}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    isVisible
                      ? "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                  }`}
                  title={isVisible ? "Hide section" : "Show section"}
                >
                  {isVisible ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onChangeOrder(DEFAULT_SECTION_ORDER)}
            className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
          >
            Reset to default
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReorderSectionsModal;
