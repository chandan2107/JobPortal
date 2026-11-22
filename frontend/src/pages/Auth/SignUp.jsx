import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import uploadImage from '../../utils/uploadimage';
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
  ArrowRight,
} from 'lucide-react';
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

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
    avatar: null,
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    avatarPreview: null,
    success: false,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: '' },
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role: role,
    }));
    if (formState.errors.role) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, role: '' },
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateAvatar(file);
      if (error) {
        setFormState((prev) => ({
          ...prev,
          errors: { ...prev.errors, avatar: error },
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormState((prev) => ({
          ...prev,
          avatarPreview: ev.target.result,
          errors: { ...prev.errors, avatar: '' },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {
      fullName: !formData.fullName.trim() ? 'Full name is required' : '',
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      role: !formData.role ? 'Please select a role' : '',
    };

    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    setFormState((prev) => ({
      ...prev,
      errors,
    }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      let avatarUrl = '';
      if (formData.avatar) {
        const imgUploadRes = await uploadImage(formData.avatar);
        avatarUrl = imgUploadRes.imageUrl || '';
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        avatar: avatarUrl || '',
      });

      login(response.data);

      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));

      const dest = formData.role === 'employer' ? '/employer-dashboard' : '/find-jobs';
      setTimeout(() => {
        navigate(dest, { replace: true });
      }, 1200);
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: { submit: error.response?.data?.message || 'Registration failed. Please try again.' },
      }));
    }
  };

  if (formState.success) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-4 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#1e2638_1px,transparent_1px)] [background-size:24px_24px] opacity-70 dark:opacity-40" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white dark:bg-zinc-900/90 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-center max-w-sm w-full"
        >
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2 tracking-tight">Account Created!</h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
            Welcome to JobPortal. Your account is ready.
          </p>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Redirecting to your dashboard…</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      
      {/* Background Dot Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#1e2638_1px,transparent_1px)] [background-size:24px_24px] opacity-70 dark:opacity-40" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm p-6 sm:p-8 backdrop-blur-xs transition-colors"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Create Account
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Join thousands of tech professionals and hiring teams
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    formState.errors.fullName
                      ? 'border-rose-500 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'
                  } focus:outline-none`}
                  placeholder="Alex Morgan"
                />
              </div>
              {formState.errors.fullName && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {formState.errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    formState.errors.email
                      ? 'border-rose-500 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'
                  } focus:outline-none`}
                  placeholder="alex@company.com"
                />
              </div>
              {formState.errors.email && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {formState.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                </div>
                <input
                  type={formState.showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    formState.errors.password
                      ? 'border-rose-500 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'
                  } focus:outline-none`}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formState.errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {formState.errors.password}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                I want to *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('jobSeeker')}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.role === 'jobSeeker'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/60 dark:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <UserCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    formData.role === 'jobSeeker' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'
                  }`} />
                  <div>
                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Job Seeker</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Looking for opportunities</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('employer')}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.role === 'employer'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/60 dark:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <Building2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    formData.role === 'employer' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'
                  }`} />
                  <div>
                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Employer</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Hiring top talent</div>
                  </div>
                </button>
              </div>
              {formState.errors.role && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {formState.errors.role}
                </p>
              )}
            </div>

            {/* Avatar Upload (optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                  {formState.avatarPreview ? (
                    <img src={formState.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar"
                    onChange={handleAvatarChange}
                    className="sr-only"
                    accept=".jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="avatar"
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{formState.avatarPreview ? 'Change Photo' : 'Upload Photo'}</span>
                  </label>
                  <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">JPG or PNG up to 5MB</p>
                </div>
              </div>
              {formState.errors.avatar && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {formState.errors.avatar}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {formState.errors.submit && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 flex gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{formState.errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={formState.loading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shadow-blue-500/25 mt-4"
            >
              {formState.loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <span className="flex items-center gap-1.5">
                  Create Account <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </motion.button>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
