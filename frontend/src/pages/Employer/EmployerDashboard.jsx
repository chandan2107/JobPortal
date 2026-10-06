import { useEffect, useState } from "react";
import JobDashboardCard from "../../components/cards/JobDashboardCard";
import ApplicantDashboardCard from "../../components/cards/ApplicantDashboardCard";
import {
  Plus, Briefcase, Users, CheckCircle, TrendingUp, ArrowUpRight
} from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/layout/LoadingSpinner";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => {
  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100", badge: "bg-blue-50 text-blue-700 border-blue-100" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100", badge: "bg-purple-50 text-purple-700 border-purple-100" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 p-6 relative overflow-hidden group">
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300 bg-blue-600" />
      <div className="flex justify-between items-start mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
};

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardOverView = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW);
      if (response.status === 200) setDashboardData(response.data);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashboardOverView();
  }, []);

  return (
    <DashboardLayout activeMenu="employer-dashboard">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-7xl mx-auto space-y-7">
          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Track your job postings and applicants
              </p>
            </div>
            <button
              onClick={() => navigate("/post-job")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              Post a Job
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              title="Active Jobs"
              value={dashboardData?.counts?.totalActiveJobs || 0}
              icon={Briefcase}
              trend
              trendValue={`${dashboardData?.counts?.trends?.activeJobs || 0}%`}
              color="blue"
            />
            <StatCard
              title="Total Applicants"
              value={dashboardData?.counts?.totalApplications || 0}
              icon={Users}
              trend
              trendValue={`${dashboardData?.counts?.trends?.totalApplicants || 0}`}
              color="green"
            />
            <StatCard
              title="Hired"
              value={dashboardData?.counts?.totalHired || 0}
              icon={CheckCircle}
              trend
              trendValue={`${dashboardData?.counts?.trends?.totalHired || 0}%`}
              color="purple"
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Job Posts</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Your latest postings</p>
                </div>
                <button
                  onClick={() => navigate("/manage-jobs")}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  View all
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                {dashboardData?.data?.recentJobs?.length ? (
                  dashboardData.data.recentJobs.slice(0, 4).map((job, index) => (
                    <JobDashboardCard key={index} job={job} />
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No job posts yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Applications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Latest candidate activity</p>
                </div>
                <button
                  onClick={() => navigate("/manage-jobs")}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  View all
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                {dashboardData?.data?.recentApplications?.length ? (
                  dashboardData.data.recentApplications.slice(0, 4).map((data, index) => (
                    <ApplicantDashboardCard
                      key={index}
                      applicant={data?.applicant || ""}
                      position={data?.job?.title || ""}
                      time={moment(data?.updatedAt).fromNow()}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No applications yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">Quick Actions</h3>
              <p className="text-xs text-gray-500 mt-0.5">Common tasks to help you get started</p>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Post New Job", icon: Plus, path: "/post-job", desc: "Create a new job listing" },
                { title: "Review Applications", icon: Users, path: "/manage-jobs", desc: "Review applicant profiles" },
                { title: "Company Settings", icon: Briefcase, path: "/company-profile", desc: "Update company info" },
              ].map((action) => (
                <button
                  key={action.path}
                  className="flex items-center gap-4 p-5 bg-gray-50 hover:bg-blue-50/80 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 text-left group shadow-sm"
                  onClick={() => navigate(action.path)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <action.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployerDashboard;