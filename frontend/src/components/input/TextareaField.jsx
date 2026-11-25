import { AlertCircle } from "lucide-react";

const TextareaField = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 6,
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

      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full rounded-xl border px-4 py-2 text-sm outline-none transition
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20"
              : "border-gray-300 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20"
          }
          ${disabled ? "bg-gray-100 dark:bg-zinc-800/50 cursor-not-allowed text-gray-500 dark:text-zinc-500" : "bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"}
        `}
        {...props}
      />

      {error && (
        <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default TextareaField;