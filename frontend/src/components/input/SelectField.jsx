import { AlertCircle } from "lucide-react";

const SelectField = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-zinc-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-zinc-500">
            <Icon size={18} />
          </div>
        )}

        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full rounded-xl border px-4 py-2 text-sm outline-none transition appearance-none
            ${Icon ? "pl-10" : "pl-4"}
            ${disabled ? "bg-gray-100 dark:bg-zinc-800/50 cursor-not-allowed text-gray-500 dark:text-zinc-500" : "bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100"}
            ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20"
                : "border-gray-300 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20"
            }
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-zinc-500">
          <svg
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SelectField;