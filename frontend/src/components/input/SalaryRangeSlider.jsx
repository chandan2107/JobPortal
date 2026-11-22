import { useState, useEffect } from "react";

const SalaryRangeSlider = ({ filters, handleFilterChange }) => {
  const [minSalary, setMinSalary] = useState(filters?.minSalary || "");
  const [maxSalary, setMaxSalary] = useState(filters?.maxSalary || "");

  useEffect(() => {
    setMinSalary(filters?.minSalary || "");
    setMaxSalary(filters?.maxSalary || "");
  }, [filters?.minSalary, filters?.maxSalary]);

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-2.5">
        {/* Min Salary */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            Min (₹)
          </label>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="1000"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            value={minSalary || ""}
            onChange={({ target }) => setMinSalary(target.value)}
            onBlur={() =>
              handleFilterChange(
                "minSalary",
                minSalary ? parseInt(minSalary, 10) : ""
              )
            }
          />
        </div>

        {/* Max Salary */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            Max (₹)
          </label>
          <input
            type="number"
            placeholder="No limit"
            min="0"
            step="1000"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            value={maxSalary || ""}
            onChange={({ target }) => setMaxSalary(target.value)}
            onBlur={() =>
              handleFilterChange(
                "maxSalary",
                maxSalary ? parseInt(maxSalary, 10) : ""
              )
            }
          />
        </div>
      </div>

      {/* Display current range */}
      {(minSalary || maxSalary) && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-2 flex items-center justify-between font-mono">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Selected:</span>{" "}
          <span>
            {minSalary
              ? `₹${parseInt(minSalary, 10).toLocaleString("en-IN")}`
              : "₹0"}{" "}
            -{" "}
            {maxSalary
              ? `₹${parseInt(maxSalary, 10).toLocaleString("en-IN")}`
              : "Unlimited"}
          </span>
        </div>
      )}
    </div>
  );
};

export default SalaryRangeSlider;