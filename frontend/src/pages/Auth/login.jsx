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
  ArrowRight,
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
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } },
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
    <div className="flex justify-center gap-2.5 sm:gap-3 my-6">
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
          whileFocus={{ scale: 1.05 }}
          className={`
            w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border outline-none
            transition-all caret-transparent
            ${hasError
              ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
              : otp[i]
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500/20'
                : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-600'
            }
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
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
      <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
        Resend code in{' '}
        <span className="font-semibold font-mono text-blue-600 dark:text-blue-400 tabular-nums">{seconds}s</span>
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={resending}
      className="w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50 cursor-pointer"
    >
      {resending ? (
        <Loader className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <RefreshCw className="w-3.5 h-3.5" />
      )}
      {resending ? 'Sending code…' : 'Resend OTP'}
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
      await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
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
      toast.success('New OTP sent to your email');
    } catch {
      toast.error('Failed to resend code');
    }
  };

  /* ── Success screen ── */
  if (step === 'success') {
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
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">You have been successfully authenticated.</p>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Redirecting to your dashboard…</span>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main card ── */
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      
      {/* Background Dot Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#1e2638_1px,transparent_1px)] [background-size:24px_24px] opacity-70 dark:opacity-40" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm p-6 sm:p-8 backdrop-blur-xs transition-colors"
        >

          {/* ── Step indicator ── */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['credentials', 'otp'].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step === s
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : i < ['credentials', 'otp'].indexOf(step)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {i < ['credentials', 'otp'].indexOf(step) ? '✓' : i + 1}
                </div>
                {i < 1 && (
                  <div className={`h-0.5 w-8 rounded-full transition-all duration-300 ${
                    step === 'otp' ? 'bg-blue-500 dark:bg-blue-400' : 'bg-zinc-200 dark:bg-zinc-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ═══════════ STEP 1 — Credentials ═══════════ */}
            {step === 'credentials' && (
              <motion.div key="credentials" {...slideIn}>
                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                    Welcome back
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    Sign in to your account to continue
                  </p>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          formState.errors.email
                            ? 'border-rose-500 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100'
                            : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'
                        } focus:outline-none`}
                        placeholder="you@company.com"
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
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <input
                        id="login-password"
                        type={formState.showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          formState.errors.password
                            ? 'border-rose-500 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100'
                            : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'
                        } focus:outline-none`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
                        onClick={() =>
                          setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                        }
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

                  {/* Submit error */}
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
                    id="login-submit"
                    type="submit"
                    disabled={formState.loading}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shadow-blue-500/25 mt-2"
                  >
                    {formState.loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        <span>Sending code…</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Continue <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </motion.button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Don't have an account?{' '}
                      <Link to="/signin" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Create one now
                      </Link>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ═══════════ STEP 2 — OTP ═══════════ */}
            {step === 'otp' && (
              <motion.div key="otp" {...slideIn}>
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp(Array(6).fill('')); setOtpState({ loading: false, error: '' }); }}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to email
                </button>

                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                    Security Code
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Enter the 6-digit verification code sent to{' '}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <OtpInput otp={otp} setOtp={setOtp} hasError={!!otpState.error} />

                  {otpState.error && (
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 flex gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{otpState.error}</p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    id="otp-submit"
                    type="submit"
                    disabled={otpState.loading || otp.join('').length < 6}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shadow-blue-500/25"
                  >
                    {otpState.loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        <span>Verifying code…</span>
                      </>
                    ) : (
                      <span>Verify & Sign In</span>
                    )}
                  </motion.button>

                  <div className="pt-2">
                    <ResendTimer email={formData.email} onResend={handleResendOtp} />
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;