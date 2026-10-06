import { Briefcase, Building2, MapPin, Calendar, Clock } from "lucide-react";
import moment from "moment";

const JobDashboardCard = ({ job }) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-blue-50/80 hover:border-blue-300 transition-all duration-200 group shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
            {job.title}
          </h4>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
            <span className="mx-1">·</span>
            <Calendar className="w-3 h-3 flex-shrink-0" />
            {moment(job.createdAt).format("Do MMM")}
          </p>
        </div>
      </div>

      <span
        className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
          !job.isClosed
            ? "bg-green-50 text-green-700 border border-green-100"
            : "bg-gray-100 text-gray-500 border border-gray-200"
        }`}
      >
        {job.isClosed ? "Closed" : "Active"}
      </span>
    </div>
  );
};

export default JobDashboardCard;