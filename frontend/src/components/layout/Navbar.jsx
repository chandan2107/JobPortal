import { useState, useEffect } from "react";
import { Briefcase, Bookmark } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
  <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div className="container mx-auto px-9">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">JobPortal</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            Home
          </Link>
          <Link
            to="/find-jobs"
            className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            Find Jobs
          </Link>
          {user && user.role !== "employer" && (
            <>
              <Link
                to="/resume-builder"
                className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors flex items-center gap-1.5"
              >
                Resume Builder
              </Link>
              <Link
                to="/ats-scanner"
                className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors flex items-center gap-1.5"
              >
                ATS Score
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons */}
<div className="flex items-center gap-4 relative">
  {user && (
    <button
      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
      onClick={() => navigate("/saved-jobs")}
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
    <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
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