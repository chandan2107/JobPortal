import { Bookmark, Building, Building2, Calendar, MapPin } from "lucide-react";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../layout/StatusBadge";

const JobCard = ({ job, onClick, onToggleSave, onApply, saved, hideApply }) => {
  const { user } = useAuth();

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
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-400 transition-all cursor-pointer relative group" onClick={onClick}>
      {/* Company Logo / Fallback */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1">
          {job?.company?.companyLogo ? (
            <img
              src={job?.company?.companyLogo}
              alt="Company Logo"
              className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-200 p-1"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 p-1">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* Title & Company */}
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{job?.title}</h3>
            <p className="flex items-center text-sm text-gray-600 mt-1">
              <Building className="w-4 h-4 mr-1" />
              {job?.company?.companyName}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {user && (
        <button
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
        >
          <Bookmark
            className={`w-5 h-5 transition-colors ${
              job?.isSaved || saved ? "text-blue-600 fill-blue-600" : "text-gray-400 hover:text-blue-600"
            }`}
          />
        </button>
      )}

      {/* Location, Type, Category */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          <MapPin className="w-4 h-4 mr-1" />
          {job?.location}
        </span>
        <span
          className={`px-3 py-1 rounded-full font-medium ${
            job?.type === "Full-Time"
              ? "bg-green-100 text-green-800 border border-green-200"
              : job?.type === "Part-Time"
              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
              : job?.type === "Contract"
              ? "bg-purple-100 text-purple-800 border border-purple-200"
              : "bg-blue-100 text-blue-800 border border-blue-200"
          }`}
        >
          {job?.type}
        </span>
        <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">{job?.category}</span>
        {job?.vacancies && (
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            {job.vacancies} {Number(job.vacancies) === 1 ? "Opening" : "Openings"}
          </span>
        )}
      </div>

      {/* Posted Date */}
      <div className="flex items-center text-sm text-gray-500 mb-6 mt-4 border-t border-gray-200 pt-4">
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {job?.createdAt
            ? moment(job.createdAt).format("Do MMM YYYY")
            : "N/A"}
        </span>
      </div>

      {/* Salary + Status + Apply */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-gray-900">{formatSalary(job?.salaryMin, job?.salaryMax)}</div>

        {!saved && (
          <>
            {job?.applicationStatus && (
              <StatusBadge status={job?.applicationStatus} />
            )}

            {!hideApply && (
              <button
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply();
                }}
              >
                Apply Now
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobCard;