import { ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORIES, JOB_TYPES } from "../../../utils/data";
import SalaryRangeSlider from "../../../components/Input/SalaryRangeSlider";

// Simple reusable section component
const FilterSection = ({ title, children, isExpanded, onToggle }) => {
  return (
    <div className="border-b border-gray-200 py-4 last:border-0 last:pb-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between text-left py-2 hover:bg-gray-50 rounded-lg transition-colors group">
        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && <div className="mt-4 px-1">{children}</div>}
    </div>
  );
};

// Main filter content wrapper
const FilterContent = ({
  toggleSection,
  clearAllFilters,
  expandedSections,
  filters,
  handleFilterChange,
}) => {

  return <>
  <div className="flex justify-between items-center mb-6">
  <h4 className="font-semibold text-gray-900 hidden lg:block">Active Filters</h4>
  <button onClick={clearAllFilters} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
    Clear All
  </button>
</div>

<FilterSection
  title="Job Type"
  isExpanded={expandedSections?.jobType}
  onToggle={() => toggleSection("jobType")}
>
  <div className="space-y-3">
    {JOB_TYPES.map((type) => (
      <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 outline-none cursor-pointer"
          checked={filters?.type === type.value}
          onChange={(e) =>
            handleFilterChange("type", e.target.checked ? type.value : "")
          }
        />
        <span className="text-sm text-gray-600 group-hover:text-gray-900">{type.value}</span>
      </label>
    ))}
  </div>
</FilterSection>

<FilterSection
  title="Salary Range"
  isExpanded={expandedSections?.salary}
  onToggle={() => toggleSection("salary")}
>
  <SalaryRangeSlider
    filters={filters}
    handleFilterChange={handleFilterChange}
  />
</FilterSection>

<FilterSection
  title="Category"
  isExpanded={expandedSections?.categories}
  onToggle={() => toggleSection("categories")}
>
  <div className="space-y-3">
    {CATEGORIES.map((type) => (
      <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 outline-none cursor-pointer"
          checked={filters?.category === type.value}
          onChange={(e) =>
            handleFilterChange(
              "category",
              e.target.checked ? type.value : "")
          }
        />
        <span className="text-sm text-gray-600 group-hover:text-gray-900">{type.label}</span>
      </label>
    ))}
  </div>
</FilterSection>

  </>
};

export default FilterContent;