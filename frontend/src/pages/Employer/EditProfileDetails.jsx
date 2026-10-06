import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { ArrowLeft } from "lucide-react";

const EditProfileDetails = ({
  formData,
  handleImageChange,
  handleInputChange,
  handleSave,
  handleCancel,
  saving,
  uploading,
}) => {
  return (
    <DashboardLayout activeMenu="company-profile">
      {formData && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm group transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="border-b border-gray-100 pb-6">
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-gray-500 mt-1">Update your company and personal details here.</p>
              </div>

              {/* Edit Form */}
              <div className="space-y-8">
                <div className="space-y-8">
                  {/* Personal Information */}
<div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
  <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>

  {/* Avatar Upload */}
  <div className="flex items-center gap-6 mb-6">
    <div className="relative">
      <img
        src={formData?.avatar || "https://via.placeholder.com/150"}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
      />
      {uploading?.avatar && (
        <div className="absolute inset-0 bg-white/50 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>

    <div>
      <label className="cursor-pointer">
        <span className="inline-block px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">Choose avatar</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, "avatar")}
          className="hidden"
        />
      </label>
    </div>
  </div>

      {/* Name Input */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
  <input
    type="text"
    value={formData.name}
    onChange={(e) => handleInputChange("name", e.target.value)}
    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
    placeholder="Enter your full name"
  />
</div>

{/* Email (Read-only) */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
  <input
    type="email"
    value={formData.email}
    disabled
    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
  />
</div>
</div>

      {/* Company Information */}
<div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
  <h2 className="text-lg font-bold text-gray-900 mb-6">Company Information</h2>

  {/* Company Logo Upload */}
  <div className="flex items-center gap-6 mb-6">
    <div className="relative">
      <img
        src={formData.companyLogo || "https://via.placeholder.com/150"}
        alt="Company Logo"
        className="w-24 h-24 rounded-xl object-contain border border-gray-200 bg-white p-2 shadow-sm"
      />
      {uploading.logo && (
        <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>

    <div>
      <label className="cursor-pointer">
        <span className="inline-block px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">Choose company logo</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, "logo")}
          className="hidden"
        />
      </label>
    </div>
  </div>

      {/* Company Name */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
  <input
    type="text"
    value={formData.companyName}
    onChange={(e) => handleInputChange("companyName", e.target.value)}
    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
    placeholder="Enter company name"
  />
</div>

{/* Company Description */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Description</label>
  <textarea
    value={formData.companyDescription}
    onChange={(e) => handleInputChange("companyDescription", e.target.value)}
    rows={4}
    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors resize-none"
    placeholder="Describe your company."
  />
</div>

</div>

                </div>

        {/* Action Buttons */}
<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
  <button onClick={handleCancel} className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
    <span>Cancel</span>
  </button>

  <button
    onClick={handleSave}
    disabled={saving || uploading.avatar || uploading.logo}
    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
  >
    {saving && (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
    )}
    <span>{saving ? "Saving..." : "Save Changes"}</span>
  </button>
</div>

              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EditProfileDetails;