import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import AppLogo from "../../../components/layout/AppLogo";

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#090c15]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors"
    >
      <div className="w-full px-6 lg:px-12 h-16 relative flex items-center justify-between">
        
        {/* Logo (Left) */}
        <Link to="/" className="cursor-pointer z-10" aria-label="JobPortal Home">
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

        {/* Centered Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
          <Link
            to="/find-jobs"
            className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            Find Jobs
          </Link>
          {(!isAuthenticated || user?.role === "employer") && (
            <button
              onClick={() =>
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login"
                )
              }
              className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              For Employers
            </button>
          )}
        </nav>

        {/* Right side: Theme toggle + Auth */}
        <div className="flex items-center space-x-3 z-10">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
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

          {/* Auth button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Hi, {user?.name || user?.fullname || "User"}
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate(
                    user?.role === "employer"
                      ? "/employer-dashboard"
                      : "/find-jobs"
                  )
                }
                className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-5 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-5 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer shadow-xs"
            >
              Login
            </motion.button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#090c15] px-6 py-4 space-y-3 text-sm font-semibold overflow-hidden"
          >
            <Link
              to="/find-jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-700 dark:text-zinc-300 py-1"
            >
              Find Jobs
            </Link>
            {(!isAuthenticated || user?.role === "employer") && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(
                    isAuthenticated && user?.role === "employer"
                      ? "/employer-dashboard"
                      : "/login"
                  );
                }}
                className="block text-zinc-700 dark:text-zinc-300 py-1 text-left w-full cursor-pointer"
              >
                For Employers
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;