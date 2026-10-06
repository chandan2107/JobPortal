import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";

const ManageJobs = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const itemsPerPage = 8;

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "applicants") { aVal = Number(aVal); bVal = Number(bVal); }
      return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredAndSortedJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const handleStatusChange = async (jobId) => {
    try {
      await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));
      getPostedJobs(true);
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(jobId));
      setJobs(jobs.filter((job) => job.id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="w-3.5 h-3.5 text-gray-300" />;
    return sortDirection === "asc"
      ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
      : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />;
  };

  const getPostedJobs = async (disableLoader) => {
    if (!disableLoader) setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
      if (response.status === 200) {
        setJobs(
          (response.data || []).map((job) => ({
            id: job._id,
            title: job?.title,
            company: job?.company?.name,
            status: job?.isClosed ? "Closed" : "Active",
            applicants: job?.applicationCount || 0,
            datePosted: moment(job?.createdAt).format("DD-MM-YYYY"),
            logo: job?.company?.companyLogo,
            rawJob: job,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { getPostedJobs(); }, []);

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
            <p className="text-gray-500 text-sm mt-0.5">Manage your postings and track applications</p>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 text-sm"
            onClick={() => navigate("/post-job")}
          >
            <Plus className="w-4 h-4" />
            Add New Job
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-5 border-b border-gray-200">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
            <p className="text-sm text-gray-400 font-medium ml-auto whitespace-nowrap hidden lg:block">
              {filteredAndSortedJobs.length} job{filteredAndSortedJobs.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredAndSortedJobs.length === 0 && !isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">No jobs found</h3>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th
                      className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-1.5">
                        Job Title <SortIcon field="title" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1.5">
                        Status <SortIcon field="status" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("applicants")}
                    >
                      <div className="flex items-center gap-1.5">
                        Applicants <SortIcon field="applicants" />
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                              <div className="space-y-1.5">
                                <div className="h-3.5 bg-gray-100 rounded w-36" />
                                <div className="h-3 bg-gray-100 rounded w-24" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-16" /></td>
                          <td className="px-6 py-4"><div className="h-3.5 bg-gray-100 rounded w-20" /></td>
                          <td className="px-6 py-4"><div className="flex justify-end gap-2"><div className="h-8 bg-gray-100 rounded-lg w-8" /><div className="h-8 bg-gray-100 rounded-lg w-8" /></div></td>
                        </tr>
                      ))
                    : paginatedJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                  {job.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                                job.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-300"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  job.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                                }`}
                              />
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-200 transition-colors"
                              onClick={() => navigate("/applicants", { state: { jobId: job.id } })}
                            >
                              <Users className="w-3.5 h-3.5" />
                              {job.applicants} Candidate{job.applicants !== 1 ? "s" : ""}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                onClick={() => navigate(`/post-job?jobId=${job.id}`, { state: { jobId: job.id, jobData: job.rawJob } })}
                                title="Edit Job"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {job.status === "Active" ? (
                                <button
                                  onClick={() => handleStatusChange(job.id)}
                                  className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                                  title="Close Job"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(job.id)}
                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                    title="Activate Job"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                    title="Delete Job"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span>–
                <span className="font-semibold text-gray-900">
                  {Math.min(startIndex + itemsPerPage, filteredAndSortedJobs.length)}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{filteredAndSortedJobs.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm font-semibold rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageJobs;