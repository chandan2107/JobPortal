import { Clock } from "lucide-react";

const ApplicantDashboardCard = ({ applicant, position, time }) => {
  const initials = applicant?.name
    ? applicant.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-zinc-950/60 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        {applicant?.avatar ? (
          <img
            src={applicant.avatar}
            alt={applicant.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-zinc-800 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {applicant?.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{position}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500 flex-shrink-0">
        <Clock className="w-3 h-3" />
        <span>{time}</span>
      </div>
    </div>
  );
};

export default ApplicantDashboardCard;