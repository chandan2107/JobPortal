import toast from "react-hot-toast";
import { BASE_URL } from "./apiPaths";

// validation functions
export const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  return '';
};

export const validateAvatar = (file) => {
  if (!file) return '';
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return 'Avatar must be JPG or PNG file';
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return "Avatar must be less than 5MB";
  }
  return "";
};

export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Opens resume PDF directly via backend proxy (sets correct Content-Type: application/pdf)
export const openResumeUrl = (url) => {
  if (!url || typeof url !== "string" || url.startsWith("blob:")) {
    toast.error("No resume found. Please upload your resume on the Profile page.");
    return;
  }
  const proxyUrl = `${BASE_URL}/api/auth/proxy-resume?url=${encodeURIComponent(url)}`;
  window.open(proxyUrl, "_blank", "noopener,noreferrer");
};

// Format salary in Indian Rupees (INR)
export const formatSalaryInINR = (min, max) => {
  if (!min && !max) return "Not specified";
  const formatNum = (num) => {
    if (!num && num !== 0) return "";
    const n = Number(num);
    if (isNaN(n)) return num;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  if (min && max) {
    return `${formatNum(min)} – ${formatNum(max)}`;
  }
  return formatNum(min || max);
};

// Compact salary formatting for cards (e.g. ₹50k - ₹1.5L/mo or ₹50,000 - ₹1.5L)
export const formatCompactSalaryInINR = (min, max) => {
  if (!min && !max) return "Salary Negotiable";
  const formatNum = (num) => {
    if (!num && num !== 0) return "";
    const n = Number(num);
    if (isNaN(n)) return num;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  if (min && max) {
    return `${formatNum(min)} - ${formatNum(max)}/mo`;
  }
  return formatNum(min || max);
};