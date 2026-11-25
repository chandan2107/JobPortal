import { Briefcase, Building2, MapPin, Calendar, Clock } from "lucide-react";
import moment from "moment";

const JobDashboardCard = ({ job }) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-zinc-950/60 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/60 rounded-xl flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {job.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
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
            ? "bg-green-50 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-300 border border-green-100 dark:border-emerald-800/60"
            : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700"
        }`}
      >
        {job.isClosed ? "Closed" : "Active"}
      </span>
    </div>
  );
};

export default JobDashboardCard;