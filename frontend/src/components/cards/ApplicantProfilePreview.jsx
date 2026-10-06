import { Download, X, CheckCircle, Clock, User, Briefcase, MapPin } from "lucide-react";
import { useState } from "react";
import { getInitials, openResumeUrl } from "../../utils/helper";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import StatusBadge from "../layout/StatusBadge";

const statusOptions = [
  { value: "Applied", label: "Applied", color: "bg-gray-100 text-gray-700" },
  { value: "In Review", label: "In Review", color: "bg-blue-50 text-blue-700" },
  { value: "Rejected", label: "Rejected", color: "bg-red-50 text-red-700" },
  { value: "Accepted", label: "Accepted", color: "bg-green-50 text-green-700" },
];

const ApplicantProfilePreview = ({
  selectedApplicant,
  setSelectedApplicant,
  handleDownloadResume,
  handleClose,
}) => {
  const [currentStatus, setCurrentStatus] = useState(selectedApplicant.status);
  const [loading, setLoading] = useState(false);

  const onChangeStatus = async (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        API_PATHS.APPLICATIONS.UPDATE_STATUS(selectedApplicant._id),
        { status: newStatus }
      );
      if (response.status === 200) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
        toast.success("Status updated successfully");
      }
    } catch (err) {
      setCurrentStatus(selectedApplicant.status);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Blue top accent */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Applicant Profile</h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Applicant Info */}
          <div className="flex items-center gap-4">
            {selectedApplicant?.applicant?.avatar ? (
              <img
                src={selectedApplicant.applicant.avatar}
                alt={selectedApplicant.applicant.name || "Applicant"}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-50 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                {getInitials(selectedApplicant?.applicant?.name || "Applicant")}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 text-base truncate">
                {selectedApplicant?.applicant?.name || "Applicant"}
              </h4>
              <p className="text-sm text-gray-500 truncate">{selectedApplicant?.applicant?.email || "No email"}</p>
              <StatusBadge status={currentStatus} />
            </div>
          </div>

          {/* Job Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Applied Position</p>
            <p className="font-semibold text-gray-900">{selectedApplicant?.job?.title || "Position"}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {selectedApplicant?.job?.location || "Remote"}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {selectedApplicant?.job?.type || "Full-time"}
              </span>
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Applied Date
              </span>
              <span className="font-semibold text-gray-900">
                {moment(selectedApplicant.createdAt).format("Do MMM YYYY")}
              </span>
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Update Application Status
            </label>
            <select
              value={currentStatus}
              onChange={onChangeStatus}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm disabled:opacity-60 cursor-pointer"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {loading && (
              <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                Updating status...
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                const resumeUrl = [
                  selectedApplicant?.applicant?.resume,
                  selectedApplicant?.resume,
                ].find(u => u && typeof u === "string" && !u.startsWith("blob:"));
                openResumeUrl(resumeUrl);
              }}
              disabled={
                !([selectedApplicant?.applicant?.resume, selectedApplicant?.resume]
                  .find(u => u && typeof u === "string" && !u.startsWith("blob:")))
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              View Resume
            </button>
            <button
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm font-semibold text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfilePreview;