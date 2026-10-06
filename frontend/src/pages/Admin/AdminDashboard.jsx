import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, CheckCircle, XCircle, Clock, Users,
  LogOut, RefreshCw, Search, ChevronDown, AlertCircle, ShieldCheck
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";

/* ─── Status config ─── */
const STATUS_CONFIG = {
  none:     { label: "Not Requested", color: "bg-gray-100 text-gray-600",   dot: "bg-gray-400" },
  pending:  { label: "Pending",       color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  approved: { label: "Approved",      color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  rejected: { label: "Rejected",      color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.none;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ─── Reject Modal ─── */
const RejectModal = ({ employer, onConfirm, onClose }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-1">Reject Verification</h3>
        <p className="text-sm text-gray-500 mb-4">
          Rejecting <strong>{employer?.companyName || employer?.name}</strong>. Provide a reason (optional).
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Incomplete company information, invalid contact details..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">
            Reject
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Main Dashboard ─── */
const AdminDashboard = () => {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEmployers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.ADMIN.GET_EMPLOYERS);
      setEmployers(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/admin-login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  const handleApprove = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      await axiosInstance.put(API_PATHS.ADMIN.APPROVE_EMPLOYER(id));
      setEmployers((prev) => prev.map((e) => e._id === id ? { ...e, verificationStatus: "approved" } : e));
      showToast("Employer approved & notified via email.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const handleReject = async (reason) => {
    const id = rejectTarget._id;
    setRejectTarget(null);
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      await axiosInstance.put(API_PATHS.ADMIN.REJECT_EMPLOYER(id), { reason });
      setEmployers((prev) => prev.map((e) => e._id === id ? { ...e, verificationStatus: "rejected", verificationNote: reason } : e));
      showToast("Employer rejected & notified via email.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  /* Stats */
  const stats = {
    total:    employers.length,
    pending:  employers.filter((e) => e.verificationStatus === "pending").length,
    approved: employers.filter((e) => e.verificationStatus === "approved").length,
    rejected: employers.filter((e) => e.verificationStatus === "rejected").length,
  };

  /* Filter + search */
  const filtered = employers.filter((e) => {
    const matchFilter = filter === "all" || e.verificationStatus === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.companyName?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
              toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Admin Panel</p>
              <p className="text-xs text-gray-400">Job Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">{adminUser?.email}</span>
            <button onClick={fetchEmployers} title="Refresh"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={adminLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Employers", value: stats.total,    icon: Users,        color: "from-blue-500 to-blue-600",    text: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Pending Review",  value: stats.pending,  icon: Clock,        color: "from-amber-500 to-orange-500", text: "text-amber-600",  bg: "bg-amber-50" },
            { label: "Approved",        value: stats.approved, icon: CheckCircle,  color: "from-green-500 to-emerald-600",text: "text-green-600",  bg: "bg-green-50" },
            { label: "Rejected",        value: stats.rejected, icon: XCircle,      color: "from-red-500 to-rose-600",     text: "text-red-600",    bg: "bg-red-50" },
          ].map(({ label, value, icon: Icon, color, text, bg }) => (
            <motion.div key={label} whileHover={{ y: -2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${text}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Employer table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Employer Verification Requests</h2>
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employers…"
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 w-full sm:w-52"
                />
              </div>
              {/* Filter */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="none">Not Requested</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No employers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employer</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((employer) => (
                    <motion.tr key={employer._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/60 transition-colors">
                      {/* Employer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {employer.avatar ? (
                            <img src={employer.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-violet-600">{employer.name?.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{employer.name}</p>
                            <p className="text-xs text-gray-400">{employer.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Company */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {employer.companyLogo ? (
                            <img src={employer.companyLogo} alt="" className="w-8 h-8 rounded-lg object-contain bg-gray-50 border border-gray-100 p-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{employer.companyName || <span className="text-gray-400 italic text-xs">No company name</span>}</p>
                            {employer.verificationNote && employer.verificationStatus === "rejected" && (
                              <p className="text-xs text-red-500 mt-0.5 max-w-xs truncate">{employer.verificationNote}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={employer.verificationStatus || "none"} />
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        {employer.verificationStatus === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(employer._id)}
                              disabled={actionLoading[employer._id]}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading[employer._id] ? (
                                <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(employer)}
                              disabled={actionLoading[employer._id]}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : employer.verificationStatus === "approved" ? (
                          <button
                            onClick={() => setRejectTarget(employer)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Revoke
                          </button>
                        ) : employer.verificationStatus === "rejected" ? (
                          <button
                            onClick={() => handleApprove(employer._id)}
                            disabled={actionLoading[employer._id]}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 text-green-600 text-xs font-semibold rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Re-approve
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No request yet</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          employer={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
