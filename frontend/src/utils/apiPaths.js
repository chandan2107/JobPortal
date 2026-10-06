export const BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "")
  : "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    VERIFY_OTP: "/api/auth/verify-otp",
    LOGOUT: "/api/auth/logout",
    GET_ME: "/api/auth/me",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/user/profile",
    DELETE_RESUME: "/api/user/resume",
    REQUEST_VERIFICATION: "/api/auth/request-verification",
  },

  ADMIN: {
    LOGIN: "/api/admin/login",
    LOGOUT: "/api/admin/logout",
    GET_ME: "/api/admin/me",
    GET_EMPLOYERS: "/api/admin/employers",
    APPROVE_EMPLOYER: (id) => `/api/admin/employers/${id}/approve`,
    REJECT_EMPLOYER: (id) => `/api/admin/employers/${id}/reject`,
  },

  DASHBOARD: {
    OVERVIEW: "/api/analytics/overview",
  },

  JOBS: {
    GET_ALL_JOBS: "/api/jobs",
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,
    SAVE_JOB: (id) => `/api/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
    GET_SAVED_JOBS: "/api/save-jobs/my",
  },

  SAVED_JOBS: {
    SAVE_JOB: (id) => `/api/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
    GET_SAVED_JOBS: "/api/save-jobs/my",
  },

  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/applications/${id}`,
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    GET_MY_APPLICATIONS: "/api/applications/my",
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
  },

  ATS: {
    SCAN: "/api/ats/jobseeker/scan",
    CHAT: "/api/ats/jobseeker/chat",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", // Upload profile picture
  },

  AI: {
    POLISH_EXPERIENCE: "/api/ai/polish-experience",
    POLISH_PROJECT: "/api/ai/polish-project",
    GENERATE_SUMMARIES: "/api/ai/generate-summaries",
    SUGGEST_SKILLS: "/api/ai/suggest-skills",
  },

  RESUMES: {
    GET_ALL: "/api/resumes",
    GET_BY_ID: (id) => `/api/resumes/${id}`,
    CREATE: "/api/resumes",
    UPDATE: (id) => `/api/resumes/${id}`,
    DELETE: (id) => `/api/resumes/${id}`,
    SYNC: "/api/resumes/sync",
  },
};



export default API_PATHS;