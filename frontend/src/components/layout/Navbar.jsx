import { useState, useEffect } from "react";
import { Bookmark, Sun, Moon } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ProfileDropdown from "./ProfileDropdown";
import AppLogo from "./AppLogo";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getNavLinkClass = (isActive) =>
    isActive
      ? "text-blue-600 dark:text-blue-400 font-bold text-sm transition-colors flex items-center gap-1.5"
      : "text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm transition-colors flex items-center gap-1.5";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <header className="bg-white/90 dark:bg-[#090c15]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-6 lg:px-9">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="cursor-pointer" aria-label="JobPortal Home">
            <motion.div
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="group flex items-center gap-2.5"
            >
              <motion.div
                variants={{
                  initial: { scale: 1, rotate: 0 },
                  hover: { scale: 1.08, rotate: -3 },
                  tap: { scale: 0.95 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center"
              >
                <AppLogo className="h-6 sm:h-[26px] w-auto" />
              </motion.div>
              <span className="text-xl sm:text-[22px] font-extrabold tracking-tight select-none flex items-center">
                <span className="text-zinc-950 dark:text-white group-hover:text-sky-500 transition-colors duration-300">
                  Job
                </span>
                <span className="text-sky-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-300">
                  Portal
                </span>
              </span>
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={getNavLinkClass(pathname === "/")}
            >
              Home
            </Link>
            <Link
              to="/find-jobs"
              className={getNavLinkClass(
                pathname === "/find-jobs" || pathname.startsWith("/job/")
              )}
            >
              Find Jobs
            </Link>
            {user && user.role !== "employer" && (
              <>
                <Link
                  to="/resume-builder"
                  className={getNavLinkClass(pathname.startsWith("/resume-builder"))}
                >
                  Resume Builder
                </Link>
                <Link
                  to="/ats-scanner"
                  className={getNavLinkClass(
                    pathname.startsWith("/ats-scanner") ||
                      pathname.startsWith("/ats-score")
                  )}
                >
                  ATS Score
                </Link>
                <Link
                  to="/mock-interview"
                  className={getNavLinkClass(pathname.startsWith("/mock-interview"))}
                >
                  Mock Interview
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions: Theme Toggle + Saved Jobs + Auth */}
          <div className="flex items-center gap-3 relative">
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Moon className="w-4 h-4 text-zinc-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {user && (
              <button
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                onClick={() => navigate("/saved-jobs")}
                aria-label="Saved jobs"
              >
                <Bookmark className="w-5 h-5" />
              </button>
            )}

            {isAuthenticated ? (
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onToggle={(e) => {
                  e?.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                avatar={user?.avatar || ""}
                companyName={user?.name || ""}
                email={user?.email || ""}
                userRole={user?.role || ""}
                onLogout={logout}
              />
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;