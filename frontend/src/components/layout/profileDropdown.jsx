import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, User, Bookmark, Briefcase, LayoutDashboard, LogOut, Mail, Building2, FileText, Sparkles, Bot, TrendingUp, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProfileDropdown = ({
  isOpen,
  onToggle,
  avatar,
  companyName,
  email,
  onLogout,
  userRole,
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Profile Trigger Button */}
      <button
        onClick={(e) => onToggle && onToggle(e)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100/80 transition-colors group cursor-pointer"
        aria-label="Open Profile Sidebar"
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <span className="text-base">
              {companyName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        )}

        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            {companyName}
          </p>
          <p className="text-xs text-gray-500 capitalize">{userRole || "User"}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>

      {/* Full-Height Framer Motion Profile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs"
              onClick={(e) => onToggle && onToggle(e)}
            />

            {/* Full-Height Sliding Sidebar */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col justify-between z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-hide [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50/50">
                  <button
                    onClick={(e) => onToggle && onToggle(e)}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Card Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-b from-blue-50/40 to-white">
                  <div className="flex items-start gap-4">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile Avatar"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-white shadow-md flex-shrink-0">
                        {companyName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {companyName}
                      </h3>
                      <p className="flex items-center text-xs text-gray-500 truncate mt-0.5">
                        <Mail className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-400" />
                        {email}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 mt-2 capitalize">
                        {userRole === "employer" ? "Employer Account" : "Job Seeker"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nav Links */}
                <div className="p-4 space-y-1">
                  <button
                    onClick={(e) => {
                      navigate("/");
                      if (onToggle) onToggle(e);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                      <Home className="w-4 h-4" />
                    </div>
                    <span>Home Page</span>
                  </button>
                  <button
                    onClick={(e) => {
                      navigate(userRole === "jobSeeker" ? "/profile" : "/company-profile");
                      if (onToggle) onToggle(e);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <span>View & Edit Profile</span>
                  </button>

                  {userRole === "jobSeeker" ? (
                    <button
                      onClick={(e) => {
                        navigate("/saved-jobs");
                        if (onToggle) onToggle(e);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <span>Saved Jobs</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        navigate("/manage-jobs");
                        if (onToggle) onToggle(e);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span>Manage Jobs</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      navigate(userRole === "employer" ? "/employer-dashboard" : "/find-jobs");
                      if (onToggle) onToggle(e);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span>{userRole === "employer" ? "Employer Dashboard" : "Browse All Jobs"}</span>
                  </button>

                  {/* Job Seeker Career Tools Only */}
                  {userRole !== "employer" && (
                    <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
                      <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Career Tools
                      </div>

                      <button
                        onClick={(e) => {
                          if (onToggle) onToggle(e);
                          navigate("/resume-builder");
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 group-hover:bg-blue-100 flex items-center justify-center text-indigo-600 group-hover:text-blue-600 transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span>Resume Builder</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                          New
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          if (onToggle) onToggle(e);
                          navigate("/ats-scanner");
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-50 group-hover:bg-blue-100 flex items-center justify-center text-amber-600 group-hover:text-blue-600 transition-colors">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span>ATS Score</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                          AI
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          toast.success("Mock Interview feature coming soon!");
                          if (onToggle) onToggle(e);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 group-hover:bg-blue-100 flex items-center justify-center text-emerald-600 group-hover:text-blue-600 transition-colors">
                            <Bot className="w-4 h-4" />
                          </div>
                          <span>Mock Interview</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                          AI
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          toast.success("Current Trends feature coming soon!");
                          if (onToggle) onToggle(e);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-50 group-hover:bg-blue-100 flex items-center justify-center text-purple-600 group-hover:text-blue-600 transition-colors">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <span>Current Trends</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer / Sign Out */}
              <div className="p-6 border-t border-gray-200 bg-gray-50/60">
                <button
                  onClick={(e) => {
                    onLogout();
                    if (onToggle) onToggle(e);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileDropdown;
