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
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
        aria-label="Open Profile Sidebar"
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <span className="text-sm">
              {companyName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        )}

        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {companyName}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize">{userRole || "User"}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
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
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={(e) => onToggle && onToggle(e)}
            />

            {/* Full-Height Sliding Sidebar */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between z-50 overflow-hidden text-zinc-900 dark:text-zinc-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-hide [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                  <button
                    onClick={(e) => onToggle && onToggle(e)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 rounded-xl transition-colors cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Card Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-blue-50/40 dark:from-blue-950/20 to-white dark:to-zinc-900">
                  <div className="flex items-start gap-4">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile Avatar"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white dark:border-zinc-800 shadow-md flex-shrink-0">
                        {companyName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {companyName}
                      </h3>
                      <p className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        <Mail className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-zinc-400" />
                        {email}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mt-2 capitalize">
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Home className="w-4 h-4" />
                    </div>
                    <span>Home Page</span>
                  </button>
                  <button
                    onClick={(e) => {
                      navigate(userRole === "jobSeeker" ? "/profile" : "/company-profile");
                      if (onToggle) onToggle(e);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span>{userRole === "employer" ? "Employer Dashboard" : "Browse All Jobs"}</span>
                  </button>

                  {/* Job Seeker Career Tools Only */}
                  {userRole !== "employer" && (
                    <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                      <div className="px-4 py-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Career Tools
                      </div>

                      <button
                        onClick={(e) => {
                          if (onToggle) onToggle(e);
                          navigate("/resume-builder");
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span>Resume Builder</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                          New
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          if (onToggle) onToggle(e);
                          navigate("/ats-scanner");
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span>ATS Score</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                          AI
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          if (onToggle) onToggle(e);
                          navigate("/mock-interview");
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <Bot className="w-4 h-4" />
                          </div>
                          <span>Mock Interview</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                          AI
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          toast.success("Current Trends feature coming soon!");
                          if (onToggle) onToggle(e);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                <button
                  onClick={(e) => {
                    onLogout();
                    if (onToggle) onToggle(e);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer"
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
