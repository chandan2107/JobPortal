import { useState } from "react";
import {
  Building2, Mail, Edit3, User, FileText, ArrowLeft,
  ShieldCheck, ShieldX, Clock, ShieldAlert, CheckCircle, Loader, AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import uploadImage from "../../utils/uploadimage";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EditProfileDetails from "./EditProfileDetails";
import { motion } from "framer-motion";

/* ─── Verification status config ─── */
const VERIFY_CONFIG = {
  none: {
    icon: ShieldAlert,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
    label: "Not Verified",
    desc: "Submit your complete company profile to request verification.",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    label: "Pending Review",
    desc: "Your verification request is under review. We'll notify you within 24 hours.",
  },
  approved: {
    icon: ShieldCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    label: "Verified",
    desc: "Your company is verified. You can now post jobs.",
  },
  rejected: {
    icon: ShieldX,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    label: "Rejected",
    desc: "Your verification was rejected. Update your profile and try again.",
  },
};

const EmployerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    companyName: user?.companyName || "",
    companyDescription: user?.companyDescription || "",
    companyLogo: user?.companyLogo || "",
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });
  const [uploading, setUploading] = useState({ avatar: false, logo: false });
  const [saving, setSaving] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Live verification status from user context
  const verificationStatus = user?.verificationStatus || "none";
  const verificationNote = user?.verificationNote || "";
  const verifyCfg = VERIFY_CONFIG[verificationStatus] || VERIFY_CONFIG.none;
  const VerifyIcon = verifyCfg.icon;

  // Profile completeness check
  const isProfileComplete =
    !!(profileData.companyName && profileData.companyDescription && profileData.companyLogo);

  const canRequestVerification =
    isProfileComplete &&
    verificationStatus !== "approved" &&
    verificationStatus !== "pending";

  const missingFields = [];
  if (!profileData.companyName) missingFields.push("Company Name");
  if (!profileData.companyDescription) missingFields.push("Company Description");
  if (!profileData.companyLogo) missingFields.push("Company Logo");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const imgUploadRes = await uploadImage(file);
      const imageUrl = imgUploadRes.imageUrl || "";
      const field = type === "avatar" ? "avatar" : "companyLogo";
      handleInputChange(field, imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file, type);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, formData);
      if (response.status === 200) {
        toast.success("Profile Updated Successfully!");
        setProfileData({ ...formData });
        updateUser({ ...formData });
        setEditMode(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setEditMode(false);
  };

  const handleRequestVerification = async () => {
    setVerifyLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.REQUEST_VERIFICATION);
      toast.success(res.data.message || "Verification request submitted!");
      updateUser({ verificationStatus: "pending" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit verification request");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (editMode) {
    return (
      <EditProfileDetails
        formData={formData}
        handleImageChange={handleImageChange}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        saving={saving}
        uploading={uploading}
      />
    );
  }

  return (
    <DashboardLayout activeMenu="company-profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employer Profile</h2>
            <p className="text-gray-500 text-sm mt-0.5">Manage your company and personal information</p>
          </div>
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 text-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* ─── Verification Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border ${verifyCfg.border} ${verifyCfg.bg} p-5`}
        >
          <div className="flex items-start gap-4 flex-wrap">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${verifyCfg.bg} border ${verifyCfg.border}`}>
              <VerifyIcon className={`w-6 h-6 ${verifyCfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm">Company Verification</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${verifyCfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${verifyCfg.color}`} />
                  {verifyCfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{verifyCfg.desc}</p>

              {/* Rejection note */}
              {verificationStatus === "rejected" && verificationNote && (
                <div className="mt-2 flex items-start gap-1.5 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Admin note:</strong> {verificationNote}</span>
                </div>
              )}

              {/* Missing fields warning */}
              {verificationStatus !== "approved" && verificationStatus !== "pending" && missingFields.length > 0 && (
                <div className="mt-2 flex items-start gap-1.5 text-sm text-amber-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Complete these fields first: <strong>{missingFields.join(", ")}</strong></span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0">
              {verificationStatus === "approved" ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  <CheckCircle className="w-5 h-5" /> Verified
                </span>
              ) : verificationStatus === "pending" ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" /> Under Review
                </span>
              ) : (
                <button
                  onClick={handleRequestVerification}
                  disabled={!canRequestVerification || verifyLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {verifyLoading ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Request Verification</>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Personal Information
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-50 border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-blue-50">
                      <span className="text-xl font-bold text-blue-600">
                        {(profileData.name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-base truncate">
                    {profileData.name || "Your Name"}
                  </h4>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-sm truncate">{profileData.email}</span>
                  </div>
                  <span className="inline-block mt-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                    Employer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Company Information
                </h3>
              </div>
              <div className="flex items-center gap-4">
                {profileData.companyLogo ? (
                  <img
                    src={profileData.companyLogo}
                    alt="Company Logo"
                    className="w-16 h-16 rounded-xl object-contain bg-gray-50 border border-gray-200 p-1.5 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-blue-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-base truncate">
                    {profileData.companyName || "Company Name"}
                  </h4>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-sm">Company</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Description */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                About Company
              </h3>
            </div>
            {profileData.companyDescription ? (
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                {profileData.companyDescription}
              </p>
            ) : (
              <div className="py-8 flex flex-col items-center text-center border-2 border-dashed border-gray-200 rounded-xl">
                <FileText className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-400">No description added yet.</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-3 text-sm text-blue-600 font-semibold hover:underline"
                >
                  Add description
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfilePage;