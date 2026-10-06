const statusConfig = {
  Applied: {
    bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-400",
  },
  "In Review": {
    bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", dot: "bg-blue-500",
  },
  Interview: {
    bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100", dot: "bg-yellow-400",
  },
  Accepted: {
    bg: "bg-green-50", text: "text-green-700", border: "border-green-100", dot: "bg-green-500",
  },
  Hired: {
    bg: "bg-green-50", text: "text-green-700", border: "border-green-100", dot: "bg-green-500",
  },
  Rejected: {
    bg: "bg-red-50", text: "text-red-700", border: "border-red-100", dot: "bg-red-400",
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