import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

const LocationInput = ({
  label,
  id = "location",
  placeholder = "e.g., London, UK or Remote",
  value = "",
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon = MapPin,
  className = "",
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const isSelectingRef = useRef(false);

  const GEOAPIFY_API_KEY =
    import.meta.env.VITE_GEOAPIFY_API_KEY || "75b685ca43a24e5aa7d5c716e33264e3";

  // Handle value change helper to support both event object or raw string
  const triggerChange = (newValue) => {
    if (!onChange) return;
    // Create a synthetic event if component expects e.target.value
    const syntheticEvent = {
      target: { name: id, id, value: newValue },
    };
    onChange(syntheticEvent);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Geoapify autocomplete suggestions
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const query = value?.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query
          )}&apiKey=${GEOAPIFY_API_KEY}`
        );

        if (!response.ok) throw new Error("Failed to fetch locations");

        const data = await response.json();
        const features = data.features || [];

        const formattedSuggestions = features.map((feat) => {
          const p = feat.properties;
          return {
            id: p.place_id || Math.random().toString(),
            formatted: p.formatted,
            mainText: p.name || p.city || p.address_line1 || p.formatted,
            subText: p.address_line2 || [p.state, p.country].filter(Boolean).join(", "),
          };
        });

        setSuggestions(formattedSuggestions);
        setIsOpen(formattedSuggestions.length > 0);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error("Geoapify error:", err);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, GEOAPIFY_API_KEY]);

  const handleSelectSuggestion = (suggestion) => {
    isSelectingRef.current = true;
    triggerChange(suggestion.formatted);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-1 w-full relative ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            isSelectingRef.current = false;
            onChange(e);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all
            ${Icon ? "pl-10" : "pl-4"}
            ${isLoading ? "pr-10" : "pr-4"}
            ${disabled ? "bg-zinc-100 dark:bg-zinc-800/40 cursor-not-allowed text-zinc-400" : "bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800"}
            ${
              error
                ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-zinc-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            }
          `}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-blue-500">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80 animate-in fade-in zoom-in-95 duration-150">
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              onClick={() => handleSelectSuggestion(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2.5 cursor-pointer flex items-start gap-3 transition-colors ${
                highlightedIndex === index
                  ? "bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">{item.mainText}</p>
                {item.subText && item.subText !== item.mainText && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{item.subText}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default LocationInput;
