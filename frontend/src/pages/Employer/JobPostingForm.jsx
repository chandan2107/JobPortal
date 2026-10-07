import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  AlertCircle, MapPin, IndianRupee, Briefcase, Users, Eye, Send, ArrowLeft, ShieldAlert, ShieldCheck
} from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import toast from "react-hot-toast";
import InputField from "../../components/input/InputField";
import LocationInput from "../../components/input/LocationInput";
import SelectField from "../../components/input/SelectField";
import TextareaField from "../../components/input/TextareaField";
import JobPostingPreview from "../../components/cards/JobPostingPreview";
import { useAuth } from "../../context/AuthContext";

const JobPostingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobId = location.state?.jobId || searchParams.get("jobId") || null;
  const initialJobData = location.state?.jobData || null;
  const { user, checkAuthStatus } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Sync latest user verification status on page load
  useEffect(() => {
    const syncStatus = async () => {
      try {
        if (checkAuthStatus) {
          await checkAuthStatus();
        }
      } catch (err) {
        console.warn("Failed to sync auth status:", err);
      } finally {
        setCheckingAuth(false);
      }
    };
    syncStatus();
  }, []);

  const verificationStatus = user?.verificationStatus || "none";
  const isVerified = verificationStatus === "approved";

  const [formData, setFormData] = useState({
    jobTitle: initialJobData?.title || "",
    location: initialJobData?.location || "",
    category: initialJobData?.category || "",
    jobType: initialJobData?.type || "",
    description: initialJobData?.description || "",
    requirements: initialJobData?.requirements || "",
    salaryMin: initialJobData?.salaryMin != null ? String(initialJobData.salaryMin) : "",
    salaryMax: initialJobData?.salaryMax != null ? String(initialJobData.salaryMax) : "",
    vacancies: initialJobData?.vacancies != null ? String(initialJobData.vacancies) : "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (data) => {
    const errs = {};
    if (!data.jobTitle.trim()) errs.jobTitle = "Job title is required";
    if (!data.category) errs.category = "Please select a category";
    if (!data.jobType) errs.jobType = "Please select a job type";
    if (!data.description.trim()) errs.description = "Job description is required";
    if (!data.requirements.trim()) errs.requirements = "Requirements are required";
    if (!data.salaryMin || !data.salaryMax) {
      errs.salary = "Both min and max salary are required";
    } else if (parseInt(data.salaryMin) >= parseInt(data.salaryMax)) {
      errs.salary = "Max salary must be greater than min salary";
    }
    if (data.vacancies && (isNaN(data.vacancies) || parseInt(data.vacancies) < 1)) {
      errs.vacancies = "Vacancies must be at least 1";
    }
    return errs;
  };

  const isFormValid = () => Object.keys(validateForm(formData)).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsSubmitting(true);
    const jobPayload = {
      title: formData.jobTitle.trim(),
      description: formData.description.trim(),
      requirements: formData.requirements.trim(),
      location: formData.location.trim(),
      category: formData.category,
      type: formData.jobType,
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      vacancies: formData.vacancies ? Number(formData.vacancies) : undefined,
    };

    try {
      const response = jobId
        ? await axiosInstance.put(API_PATHS.JOBS.UPDATE_JOB(jobId), jobPayload)
        : await axiosInstance.post(API_PATHS.JOBS.POST_JOB, jobPayload);

      if (response.status === 201 || response.status === 200) {
        toast.success(jobId ? "Job Updated Successfully!" : "Job Posted Successfully!");
      }
      navigate("/manage-jobs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post/update job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchJobDetails = async () => {
      if (jobId) {
        try {
          const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(jobId));
          const jobData = response.data;
          if (jobData && isMounted) {
            setFormData({
              jobTitle: jobData.title || "",
              location: jobData.location || "",
              category: jobData.category || "",
              jobType: jobData.type || "",
              description: jobData.description || "",
              requirements: jobData.requirements || "",
              salaryMin: jobData.salaryMin != null ? String(jobData.salaryMin) : "",
              salaryMax: jobData.salaryMax != null ? String(jobData.salaryMax) : "",
              vacancies: jobData.vacancies != null ? String(jobData.vacancies) : "",
            });
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
          if (isMounted) toast.error("Could not load job details for editing");
        }
      } else if (isMounted) {
        setFormData({
          jobTitle: "",
          location: "",
          category: "",
          jobType: "",
          description: "",
          requirements: "",
          salaryMin: "",
          salaryMax: "",
          vacancies: "",
        });
      }
    };
    fetchJobDetails();
    return () => { isMounted = false; };
  }, [jobId]);

  if (isPreview) {
    return (
      <DashboardLayout activeMenu="post-job">
        <JobPostingPreview formData={formData} setIsPreview={setIsPreview} />
      </DashboardLayout>
    );
  }

  if (checkingAuth) {
    return (
      <DashboardLayout activeMenu="post-job">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Verifying access...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Verification Gate ───
  if (!isVerified) {
    const STATUS = {
      none:     { icon: ShieldAlert, color: "text-gray-500",  bg: "bg-gray-50",   border: "border-gray-200", title: "Company Not Verified",    msg: "You need to get your company verified before you can post jobs." },
      pending:  { icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-50",  border: "border-amber-200",title: "Verification Pending",      msg: "Your company verification is under review. You can post jobs once approved." },
      rejected: { icon: ShieldAlert, color: "text-red-500",   bg: "bg-red-50",    border: "border-red-200",  title: "Verification Rejected",    msg: "Your company verification was rejected. Please update your profile and re-submit." },
    };
    const cfg = STATUS[verificationStatus] || STATUS.none;
    const Icon = cfg.icon;
    return (
      <DashboardLayout activeMenu="post-job">
        <div className="max-w-2xl mx-auto mt-8">
          <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-8 text-center`}>
            <div className={`w-16 h-16 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center mx-auto mb-4`}>
              <Icon className={`w-8 h-8 ${cfg.color}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{cfg.title}</h2>
            <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">{cfg.msg}</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={() => navigate("/company-profile")}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                Go to Company Profile
              </button>
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="post-job">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {jobId ? "Edit Job Posting" : "Post a New Job"}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {jobId ? "Update the details for this listing" : "Fill in the details to create your job posting"}
            </p>
          </div>
          <button
            onClick={() => setIsPreview(true)}
            disabled={!isFormValid()}
            className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700" />
          <div className="p-6 sm:p-8 space-y-6">
            <InputField
              label="Job Title"
              id="jobTitle"
              placeholder="e.g., Senior Frontend Developer"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              error={errors.jobTitle}
              required
              icon={Briefcase}
            />

            <LocationInput
              label="Location"
              id="location"
              placeholder="e.g., Moscow, Russia or Remote"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              error={errors.location}
              icon={MapPin}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <SelectField
                label="Category"
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                options={CATEGORIES}
                placeholder="Select a category"
                error={errors.category}
                required
                icon={Briefcase}
              />
              <SelectField
                label="Job Type"
                id="jobType"
                value={formData.jobType}
                onChange={(e) => handleInputChange("jobType", e.target.value)}
                options={JOB_TYPES}
                placeholder="Select job type"
                error={errors.jobType}
                required
                icon={Briefcase}
              />
              <InputField
                label="Vacancies (Optional)"
                id="vacancies"
                type="number"
                min="1"
                placeholder="e.g., 3"
                value={formData.vacancies}
                onChange={(e) => handleInputChange("vacancies", e.target.value)}
                error={errors.vacancies}
                icon={Users}
              />
            </div>

            <TextareaField
              label="Job Description"
              id="description"
              placeholder="Describe the role and key responsibilities..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={errors.description}
              helperText="Include responsibilities, day-to-day tasks, and what the role entails"
              required
            />

            <TextareaField
              label="Requirements"
              id="requirements"
              placeholder="List key qualifications and skills..."
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              error={errors.requirements}
              helperText="Include required skills, education, and experience level"
              required
            />

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Salary Range (INR ₹) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    placeholder="Min salary (₹)"
                    value={formData.salaryMin}
                    onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-sm"
                  />
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    placeholder="Max salary (₹)"
                    value={formData.salaryMax}
                    onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-sm"
                  />
                </div>
              </div>
              {errors.salary && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.salary}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid()}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {jobId ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {jobId ? "Update Job" : "Publish Job"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;