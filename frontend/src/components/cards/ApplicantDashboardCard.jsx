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
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-blue-50/80 hover:border-blue-300 transition-all duration-200 group shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        {applicant?.avatar ? (
          <img
            src={applicant.avatar}
            alt={applicant.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
            {applicant?.name}
          </h4>
          <p className="text-xs text-gray-500 truncate">{position}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
        <Clock className="w-3 h-3" />
        <span>{time}</span>
      </div>
    </div>
  );
};

export default ApplicantDashboardCard;