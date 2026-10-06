import {
  MapPin,
  IndianRupee,
  ArrowLeft,
  Building2,
  Calendar,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Users,
} from "lucide-react";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";

const JobPostingPreview = ({ formData, setIsPreview }) => {
  const { user } = useAuth();

  const categoryLabel =
    CATEGORIES.find((c) => c.value === formData.category)?.label ||
    formData.category ||
    "General";

  const jobTypeLabel =
    JOB_TYPES.find((j) => j.value === formData.jobType)?.label ||
    formData.jobType ||
    "Full-Time";

  const formatSalary = (min, max) => {
    if (!min && !max) return "Not specified";
    const minVal = min ? Number(min).toLocaleString("en-IN") : "0";
    const maxVal = max ? Number(max).toLocaleString("en-IN") : "0";
    return `₹${minVal} – ₹${maxVal}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Job Posting Preview</h2>
              <span className="text-xs bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2.5 py-0.5 rounded-full font-semibold">
                Preview Mode
              </span>
            </div>
            <p className="text-blue-100 text-xs mt-0.5">
              This is how your job posting will appear to job seekers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPreview(false)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl border border-white/20 backdrop-blur-md font-semibold text-sm transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Edit
        </button>
      </div>

      {/* Main Details Container */}
      <div className="space-y-6">
        {/* Hero Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                {user?.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt="Company Logo"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain border border-gray-200 bg-white p-2 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                )}

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                    {formData.jobTitle || "Untitled Job"}
                  </h1>

                  <p className="flex items-center text-blue-600 font-semibold text-sm mb-4">
                    <Building2 className="w-4 h-4 mr-1.5" />
                    {user?.companyName || user?.name || "Your Company"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {formData.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {formData.location}
                      </span>
                    )}

                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {jobTypeLabel}
                    </span>

                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                      {categoryLabel}
                    </span>

                    {formData.vacancies && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        <Users className="w-3.5 h-3.5" />
                        {formData.vacancies} {Number(formData.vacancies) === 1 ? "Vacancy" : "Vacancies"}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {moment().format("Do MMM YYYY")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Apply Button preview */}
              <div className="sm:flex-shrink-0">
                <button
                  disabled
                  className="w-full sm:w-auto px-7 py-3 bg-blue-600/80 text-white rounded-xl font-semibold shadow-sm cursor-not-allowed opacity-80 flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Apply Now (Preview)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Compensation Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Compensation
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatSalary(formData.salaryMin, formData.salaryMax)}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  per month
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block" />
            About This Role
          </h3>
          <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-gray-50/50 p-5 rounded-xl border border-gray-200">
            {formData.description || "No description provided."}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block" />
            What We're Looking For
          </h3>
          <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-indigo-50/30 p-5 rounded-xl border border-indigo-200">
            {formData.requirements || "No requirements provided."}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-end pt-4">
          <button
            onClick={() => setIsPreview(false)}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPreview;