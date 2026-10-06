import { useState } from "react";

const SalaryRangeSlider = ({ filters, handleFilterChange }) => {
  const [minSalary, setMinSalary] = useState(filters?.minSalary || "");
const [maxSalary, setMaxSalary] = useState(filters?.maxSalary || "");

  return (
  <div className="space-y-4">
    
    <div className="space-y-3 flex gap-4">
      
      {/* Min Salary */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Min Salary
        </label>
        <input
          type="number"
          placeholder="0"
          min="0"
          step="1000"
          className="w-full px-2.5 py-2 text-sm rounded-md border border-gray-300 
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition"
          value={minSalary || ""}
          onChange={({ target }) => setMinSalary(target.value)}
          onBlur={() =>
            handleFilterChange(
              "minSalary",
              minSalary ? parseInt(minSalary) : ""
            )
          }
        />
      </div>

      {/* Max Salary */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Max Salary
        </label>
        <input
          type="number"
          placeholder="No limit"
          min="0"
          step="1000"
          className="w-full px-2.5 py-2 text-sm rounded-md border border-gray-300 
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition"
          value={maxSalary || ""}
          onChange={({ target }) => setMaxSalary(target.value)}
          onBlur={() =>
            handleFilterChange(
              "maxSalary",
              maxSalary ? parseInt(maxSalary) : ""
            )
          }
        />
      </div>
    </div>

    {/* Display current range */}
    {(minSalary || maxSalary) && (
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
        <span className="font-medium text-gray-700">Range:</span>{" "}
        {minSalary
          ? `₹${parseInt(minSalary).toLocaleString("en-IN")}`
          : "₹0"}{" "}
        -{" "}
        {maxSalary
          ? `₹${parseInt(maxSalary).toLocaleString("en-IN")}`
          : "No limit"}
      </div>
    )}
    
  </div>
);
};

export default SalaryRangeSlider;