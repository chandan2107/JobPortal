import React, { useState } from 'react'
import {motion} from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import uploadImage from "../../utils/uploadimage";
import {
  User,
  Mail,
  Lock,
  Upload,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  AlertCircle,
  CheckCircle,
  Loader,
  Briefcase,
} from "lucide-react";
import { validateAvatar, validateEmail, validatePassword } from '../../utils/helper';

const SignUp = () => {

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect already-authenticated users away from signup
  if (isAuthenticated && user) {
    const dest = user.role === 'employer' ? '/employer-dashboard' : '/find-jobs';
    navigate(dest, { replace: true });
    return null;
  }

  const [formData, setFormData] =useState({
    fullName: "",
    email: "",
    password: "",
    role:"",
    avatar : null,
  });

const [formState, setFormState] = useState ({
  loading: false,
  errors: {},
  showPassword: false,
  avatarPreview: null,
  success: false,
});

  // handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // clear error when starts typing
    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: '' }
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role: role
    }));
    if(formState.errors.role){
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, role: '' }
      }));
    }

  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error=validateAvatar(file);
      if (error) {
        setFormState((prev) => ({
          ...prev,
          errors: { ...prev.errors, avatar: error }
        }));
        return;
      } 
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormState((prev) => ({
          ...prev,
          avatarPreview: e.target.result,
          errors: { ...prev.errors, avatar: '' }
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  const validateForm = () => {
    const errors = {
      fullName: !formData.fullName ? "Enter full name":"",
      email:validateEmail(formData.email),
      password:validatePassword(formData.password),
      role:!formData.role? "Please select a role":"",
      avatar:""
    };

    //remove empty errors
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) 
        delete errors[key];
      
  });
  setFormState((prev) => ({
    ...prev,
    errors
  }));
  return Object.keys(errors).length === 0;
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    if(!validateForm()) return;

    setFormState((prev) => ({
      ...prev,
      loading: true,
      
    }));

    try {
      let avatarUrl = "";

// Upload image if present
if (formData.avatar) {
  const imgUploadRes = await uploadImage(formData.avatar);
  avatarUrl = imgUploadRes.imageUrl || "";
}

const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
  name: formData.fullName,
  email: formData.email,
  password: formData.password,
  role: formData.role,
  avatar: avatarUrl || "",
});

// Cookie is set by backend — just update React state
login(response.data);

setFormState((prev) => ({
  ...prev,
  loading: false,
  success: true,
  errors: {},
}));

// Redirect based on role
const dest = formData.role === "employer" ? "/employer-dashboard" : "/find-jobs";
setTimeout(() => {
  navigate(dest, { replace: true });
}, 1500);
    } catch (error) {
      console.log("error",error)
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: { submit: error.response?.data?.message || "Registration failed. Please try again." },
      }));
    }
  };

  
    if (formState.success) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm w-full"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">Welcome to job portal your account has been successfully created.</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Redirecting to your dashboard...
            </p>
          </motion.div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100"
        >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join thousands of professionals finding their dream jobs 
        </p>

      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/*full name*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" 
            name="fullName" value={formData.fullName} 
            onChange={handleInputChange}  
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              formState.errors.fullName ? "border-red-500":"border-gray-300" } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            </div>
            {formState.errors.fullName && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4"/>
                {formState.errors.fullName}
              </p>
            )}
        </div>
        {/*email*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input type="email" 
            name="email" value={formData.email} 
            onChange={handleInputChange}  
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              formState.errors.email ? "border-red-500":"border-gray-300" } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          {formState.errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4"/>
              {formState.errors.email}
            </p>
          )}
        </div>

        {/*password*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input type={formState.showPassword ? "text" : "password"} 
            name="password" value={formData.password} 
            onChange={handleInputChange}  
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              formState.errors.password ? "border-red-500":"border-gray-300" } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder='create a strong password'
            />
            <button type="button" onClick={() => setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
              {formState.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formState.errors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4"/>
              {formState.errors.password}
            </p>
          )}
        </div>

        {/*Avatar Upload*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture (optional)</label>
          <div className="mt-1 flex items-center space-x-5">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                {formState.avatarPreview ? (
                  <img src={formState.avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-400"/>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <input type="file" 
                id="avatar" 
                onChange={handleAvatarChange}  
                className="sr-only"
                accept='.jpg,.jpeg,.png'
              />
              <label htmlFor="avatar" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </label>
              <p className="mt-1 text-xs text-gray-500"> JPG, PNG up to 5MB</p>
            </div>
          </div>
          {formState.errors.avatar && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4"/>
              {formState.errors.avatar}
            </p>
          )}
        </div>
      

        {/*Role Selection*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">I am a *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button type="button" onClick={() => handleRoleChange("jobSeeker")} className={`flex items-start space-x-3 p-4 rounded-xl border text-left transition-colors ${formData.role === "jobSeeker" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500":"border-gray-200 bg-white hover:border-gray-300"}`}>
              <UserCheck className={`w-6 h-6 flex-shrink-0 mt-0.5 ${formData.role === "jobSeeker" ? "text-blue-600" : "text-gray-400"}`} />
              <div>
                <div className="font-medium text-gray-900">Job seeker</div>
                <div className="text-sm text-gray-500 mt-1">
                  Looking for opportunities
                </div>
              </div>
            </button>
            <button type="button" onClick={() => handleRoleChange("employer")} className={`flex items-start space-x-3 p-4 rounded-xl border text-left transition-colors ${formData.role === "employer" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500":"border-gray-200 bg-white hover:border-gray-300"}`}>
              <Building2 className={`w-6 h-6 flex-shrink-0 mt-0.5 ${formData.role === "employer" ? "text-blue-600" : "text-gray-400"}`} />
              <div>
                <div className="font-medium text-gray-900">Employer</div>
                <div className="text-sm text-gray-500 mt-1">
                  Hiring talent
                </div>
              </div>
            </button>
          </div>
          {formState.errors.role && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4"/>
              {formState.errors.role}
            </p>
          )}
        </div>
          {/*Submit error */}
          {formState.errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {formState.errors.submit}
                  </h3>
                </div>
              </div>
            </div>
          )}
          {/*Submit button*/}
          <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled={formState.loading}>
            {formState.loading ? (
              <>
              <Loader className="w-5 h-5 mr-2 animate-spin"/>
              <span>Creating account...</span>
              </>
            ):(
              <span>Create Account</span>
            )}
          </button>

          {/*Login link*/}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Already have an account? {" "}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Log in
              </a>
            </p>
        </div>
      </form>
    </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
