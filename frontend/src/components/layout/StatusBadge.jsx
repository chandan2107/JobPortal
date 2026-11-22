const statusConfig = {
  Applied: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-700 dark:text-zinc-300",
    border: "border-zinc-200 dark:border-zinc-700",
    dot: "bg-zinc-400 dark:bg-zinc-500",
  },
  "In Review": {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800/60",
    dot: "bg-blue-500",
  },
  Shortlisted: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/60",
    dot: "bg-purple-500",
  },
  Interview: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/60",
    dot: "bg-amber-500",
  },
  Accepted: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  Hired: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  Rejected: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/60",
    dot: "bg-rose-500",
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.Applied;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;