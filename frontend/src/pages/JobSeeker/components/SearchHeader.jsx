import { MapPin, Search } from "lucide-react";
import LocationInput from "../../../components/input/LocationInput";

const SearchHeader = ({ filters, handleFilterChange }) => {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs p-6 md:p-8 backdrop-blur-xs mb-8 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-400">
              Dream Job
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
            Discover opportunities that match your skills and passion with transparent compensation
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Job title, skill, or keyword"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all outline-none text-sm"
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>

          <div className="relative sm:w-56">
            <LocationInput
              placeholder="Location or 'Remote'"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              icon={MapPin}
            />
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-blue-500/20 whitespace-nowrap text-xs sm:text-sm flex items-center gap-2 justify-center cursor-pointer">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;