import { ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORIES, JOB_TYPES } from "../../../utils/data";
import SalaryRangeSlider from "../../../components/input/SalaryRangeSlider";

// Simple reusable section component
const FilterSection = ({ title, children, isExpanded, onToggle }) => {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 py-3.5 last:border-0 last:pb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-1.5 px-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-xl transition-colors group cursor-pointer"
      >
        <span className="font-bold text-xs uppercase tracking-wider text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        )}
      </button>

      {isExpanded && <div className="mt-3 px-1">{children}</div>}
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
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden lg:block">
          Active Filters
        </h4>
        <button
          onClick={clearAllFilters}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
        >
          Clear All
        </button>
      </div>

      <FilterSection
        title="Job Type"
        isExpanded={expandedSections?.jobType}
        onToggle={() => toggleSection("jobType")}
      >
        <div className="space-y-2.5">
          {JOB_TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 focus:ring-blue-500 outline-none cursor-pointer"
                checked={filters?.type === type.value}
                onChange={(e) =>
                  handleFilterChange("type", e.target.checked ? type.value : "")
                }
              />
              <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 transition-colors">
                {type.value}
              </span>
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
        <div className="space-y-2.5">
          {CATEGORIES.map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 focus:ring-blue-500 outline-none cursor-pointer"
                checked={filters?.category === type.value}
                onChange={(e) =>
                  handleFilterChange(
                    "category",
                    e.target.checked ? type.value : ""
                  )
                }
              />
              <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 transition-colors">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );
};

export default FilterContent;