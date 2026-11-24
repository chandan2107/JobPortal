import { Bookmark, Building, Building2, Calendar, MapPin, Sparkles } from "lucide-react";
import moment from "moment";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const JobCard = ({ job, onClick, onToggleSave, onApply, saved, hideApply }) => {
  const { user } = useAuth();

  const isSaved = Boolean(job?.isSaved || saved);
  const isApplied = Boolean(job?.applicationStatus);

  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary negotiable";
    const formatNumber = (num) => {
      if (!num && num !== 0) return "";
      const n = Number(num);
      if (isNaN(n)) return num;
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
      if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
      return `₹${n.toLocaleString("en-IN")}`;
    };
    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)}/m`;
    }
    return formatNumber(min || max);
  };

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-zinc-300 dark:hover:border-zinc-700 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between backdrop-blur-xs text-zinc-900 dark:text-zinc-100"
    >
      <div>
        {/* Company Logo, Title, and Bookmark Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {job?.company?.companyLogo ? (
              <img
                src={job?.company?.companyLogo}
                alt="Company Logo"
                className="w-11 h-11 rounded-xl object-contain bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1 flex-shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 p-1 flex-shrink-0">
                <Building2 className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-[17px] font-bold text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 leading-snug">
                {job?.title}
              </h3>
              <p className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                <Building className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-zinc-400 dark:text-zinc-500" />
                <span className="truncate">{job?.company?.companyName}</span>
              </p>
            </div>
          </div>

          {/* Animated Bookmark Save Button */}
          {user && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.82 }}
              className={`p-2 -mr-1 -mt-1 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${
                isSaved
                  ? "bg-blue-50 dark:bg-blue-950/60"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
            >
              <motion.div
                animate={
                  isSaved
                    ? { scale: [1, 1.4, 0.9, 1], rotate: [0, -15, 6, 0] }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <Bookmark
                  className={`w-4.5 h-4.5 transition-colors duration-200 ${
                    isSaved
                      ? "text-blue-600 fill-blue-600"
                      : "text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                />
              </motion.div>
            </motion.button>
          )}
        </div>

        {/* Tags Row: AI Match Pill + Location + Type + Category */}
        <div className="flex flex-wrap items-center gap-1.5">
          {job?.matchScore != null && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded-lg">
              <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              {job.matchScore}% Match
            </span>
          )}

          <span className="inline-flex items-center text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80">
            <MapPin className="w-3 h-3 mr-1 text-zinc-400" />
            {job?.location}
          </span>

          <span
            className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-lg font-semibold border ${
              job?.type === "Full-Time"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                : job?.type === "Part-Time"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                : job?.type === "Contract"
                ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
                : "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60"
            }`}
          >
            {job?.type}
          </span>

          <span className="inline-flex items-center text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80">
            {job?.category}
          </span>

          {job?.vacancies && (
            <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800/60">
              {job.vacancies} {Number(job.vacancies) === 1 ? "Opening" : "Openings"}
            </span>
          )}
        </div>
      </div>

      {/* Anchored Bottom Footer: Salary + Posted Date on left, Status + Apply on right */}
      <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <div className="text-base sm:text-[17px] font-bold font-mono text-zinc-950 dark:text-white truncate">
            {formatSalary(job?.salaryMin, job?.salaryMax)}
          </div>
          <div className="flex items-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            <Calendar className="w-3 h-3 mr-1 text-zinc-400" />
            <span>{job?.createdAt ? moment(job.createdAt).fromNow() : "Recently posted"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!saved && !hideApply && (
            <button
              disabled={isApplied}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-all ${
                isApplied
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 cursor-pointer"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isApplied) onApply();
              }}
            >
              {isApplied ? "Applied" : "Apply Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;