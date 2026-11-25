import { useState, useEffect } from "react";
import { Briefcase, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { NAVIGATION_MENU } from "../../utils/data";
import ProfileDropdown from "./ProfileDropdown";
import AppLogo from "./AppLogo";

const NavigationItem = ({ item, isActive, onClick, isCollapsed }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center p-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group cursor-pointer ${
        isActive
          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 shadow-sm shadow-blue-50 dark:shadow-none"
          : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/70 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      <Icon
        className={`h-5 w-5 flex-shrink-0 ${
          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-zinc-400"
        }`}
      />
      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
    </button>
  );
};

const DashboardLayout = ({ activeMenu, children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId);
    navigate(`/${itemId}`);

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sidebarCollapsed = !isMobile && false;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#090c15] overflow-hidden transition-colors">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        } ${sidebarCollapsed ? "w-16" : "w-64"} bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800`}
      >
        {/* Company Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-zinc-800">
          {!sidebarCollapsed ? (
            <Link className="group flex items-center gap-2.5" to="/">
              <AppLogo className="h-6 w-auto" />
              <span className="text-xl font-extrabold tracking-tight flex items-center">
                <span className="text-zinc-950 dark:text-white group-hover:text-sky-500 transition-colors duration-300">
                  Job
                </span>
                <span className="text-sky-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-300">
                  Portal
                </span>
              </span>
            </Link>
          ) : (
            <Link to="/" className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm mx-auto group hover:scale-105 transition-transform" title="Go to Home">
              <Briefcase className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)] scrollbar-hide">
          {NAVIGATION_MENU.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={handleNavigation}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button className="w-full flex items-center p-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors group cursor-pointer" onClick={logout}>
            <LogOut className="h-5 w-5 flex-shrink-0 group-hover:text-red-700 dark:group-hover:text-red-300" />
            {!sidebarCollapsed && <span className="ml-3 group-hover:text-red-700 dark:group-hover:text-red-300">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 z-0 h-screen overflow-y-auto ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Top navbar */}
        <header className="bg-white dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-30 shadow-sm transition-colors">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {isMobile && (
                <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Welcome Back!</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 hidden sm:block">
                  Here's what's happening today.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
              </button>

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
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 md:p-8 bg-gray-50 dark:bg-[#090c15] transition-colors">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;