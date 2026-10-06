import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────── */
/*  Shared slide animation variants                         */
/* ─────────────────────────────────────────────────────── */
const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.25, ease: 'easeIn' } },
};

/* ─────────────────────────────────────────────────────── */
/*  OTP digit-box component                                 */
/* ─────────────────────────────────────────────────────── */
const OtpInput = ({ otp, setOtp, hasError }) => {
  const inputRefs = useRef([]);
  const OTP_LENGTH = 6;

  const focusAt = (i) => inputRefs.current[i]?.focus();

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (i < OTP_LENGTH - 1) focusAt(i + 1);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace') {
      const next = [...otp];
      if (next[i]) {
        next[i] = '';
        setOtp(next);
      } else if (i > 0) {
        next[i - 1] = '';
        setOtp(next);
        focusAt(i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focusAt(i - 1);
    } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
      focusAt(i + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...otp];
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    focusAt(Math.min(text.length, OTP_LENGTH - 1));
  };

  return (
    <div className="flex justify-center gap-3 my-6">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          whileFocus={{ scale: 1.08 }}
          className={`
            w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none
            transition-all duration-200 caret-transparent
            ${hasError
              ? 'border-red-400 bg-red-50 text-red-700'
              : otp[i]
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-100'
                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
            }
            focus:border-blue-500 focus:bg-blue-50 focus:shadow-md focus:shadow-blue-100
          `}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  Resend-timer sub-component                             */
/* ─────────────────────────────────────────────────────── */
const ResendTimer = ({ email, onResend }) => {
  const [seconds, setSeconds] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const handleResend = async () => {
    setResending(true);
    await onResend();
    setSeconds(60);
    setResending(false);
  };

  if (seconds > 0) {
    return (
      <p className="text-sm text-center text-gray-500">
        Resend OTP in{' '}
        <span className="font-semibold text-blue-600 tabular-nums">{seconds}s</span>
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={resending}
      className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors disabled:opacity-50"
    >
      {resending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {resending ? 'Sending…' : 'Resend OTP'}
    </button>
  );
};

/* ─────────────────────────────────────────────────────── */
/*  Main Login component                                   */
/* ─────────────────────────────────────────────────────── */
const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect already-authenticated users away from login page
  if (isAuthenticated && user) {
    const dest = user.role === 'employer' ? '/employer-dashboard' : '/find-jobs';
    navigate(dest, { replace: true });
    return null;
  }

  // Step: 'credentials' | 'otp' | 'success'
  const [step, setStep] = useState('credentials');

  /* Credentials step state */
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
  });

  /* OTP step state */
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [otpState, setOtpState] = useState({ loading: false, error: '' });

  /* ── Credentials handlers ── */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formState.errors[name]) {
      setFormState((prev) => ({ ...prev, errors: { ...prev.errors, [name]: '' } }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;
    if (!formData.password) errors.password = 'Password is required';
    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormState((prev) => ({ ...prev, loading: true, errors: {} }));
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });
      setFormState((prev) => ({ ...prev, loading: false }));
      setStep('otp');
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: { submit: error.response?.data?.message || 'Login failed. Check your credentials.' },
      }));
    }
  };

  /* ── OTP handlers ── */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setOtpState({ loading: false, error: 'Please enter all 6 digits.' });
      return;
    }
    setOtpState({ loading: true, error: '' });
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.VERIFY_OTP, {
        email: formData.email,
        otp: otpCode,
      });
      login(response.data);
      setStep('success');
      const { role } = response.data;
      const dest = role === 'employer' ? '/employer-dashboard' : '/find-jobs';
      setTimeout(() => {
        navigate(dest, { replace: true });
      }, 1200);
    } catch (error) {
      setOtpState({
        loading: false,
        error: error.response?.data?.message || 'Invalid OTP. Please try again.',
      });
      setOtp(Array(6).fill(''));
    }
  };

  const handleResendOtp = async () => {
    try {
      await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });
      setOtp(Array(6).fill(''));
      setOtpState({ loading: false, error: '' });
    } catch {
      /* silently ignore — user can retry */
    }
  };

  /* ── Success screen ── */
  if (step === 'success') {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600 mb-4">You have been successfully logged in.</p>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            Redirecting to your dashboard…
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── Main card ── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100 overflow-hidden">

          {/* ── Step indicator ── */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['credentials', 'otp'].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step === s
                      ? 'bg-blue-600 text-white scale-110 shadow-md shadow-blue-200'
                      : i < ['credentials', 'otp'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i < ['credentials', 'otp'].indexOf(step) ? '✓' : i + 1}
                </div>
                {i < 1 && (
                  <div className={`h-0.5 w-8 rounded-full transition-all duration-500 ${
                    step === 'otp' ? 'bg-blue-400' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ═══════════ STEP 1 — Credentials ═══════════ */}
            {step === 'credentials' && (
              <motion.div key="credentials" {...slideIn}>
                <div className="text-center mb-7">
                  <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                  <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          formState.errors.email
                            ? 'border-red-500'
                            : 'border-gray-300 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                        } transition-colors duration-200`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {formState.errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {formState.errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="login-password"
                        type={formState.showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                          formState.errors.password ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() =>
                          setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                        }
                      >
                        {formState.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {formState.errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {formState.errors.password}
                      </p>
                    )}
                  </div>

                  {/* Submit error */}
                  {formState.errors.submit && (
                    <div className="rounded-md bg-red-50 p-3 flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{formState.errors.submit}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    id="login-submit"
                    type="submit"
                    disabled={formState.loading}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formState.loading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        <span>Sending OTP…</span>
                      </>
                    ) : (
                      <span>Continue →</span>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <a href="/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                        Sign Up
                      </a>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ═══════════ STEP 2 — OTP ═══════════ */}
            {step === 'otp' && (
              <motion.div key="otp" {...slideIn}>
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp(Array(6).fill('')); setOtpState({ loading: false, error: '' }); }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Verify Your Identity</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold text-gray-800">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <OtpInput otp={otp} setOtp={setOtp} hasError={!!otpState.error} />

                  {otpState.error && (
                    <div className="rounded-md bg-red-50 p-3 flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{otpState.error}</p>
                    </div>
                  )}

                  <button
                    id="otp-submit"
                    type="submit"
                    disabled={otpState.loading || otp.join('').length < 6}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {otpState.loading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <span>Verify & Sign In</span>
                    )}
                  </button>

                  <div className="pt-1">
                    <ResendTimer email={formData.email} onResend={handleResendOtp} />
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;