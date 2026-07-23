/**
 * LoginPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * CareConnect – Authentication / Login
 *
 * Features:
 *  • Email + Password inputs (with show/hide password toggle)
 *  • "Remember me" checkbox
 *  • "Forgot password" link
 *  • Submit button with loading state
 *  • API call → auth context login → navigate to /dashboard
 *  • Error feedback via react-hot-toast
 *  • Framer Motion fade + slide-up animation on the card
 *  • Link to /register for new users
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Animation Variants ───────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'backOut' },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Form State ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** Keep formData in sync with controlled inputs */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Submit: call API → update auth context → navigate */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side guard
    if (!formData.email.trim() || !formData.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/login', {
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
        remember: rememberMe,
      });

      // Backend returns: { success, message, data: { token, user } }
      const { token, user } = data.data ?? data;

      // Persist token / user in auth context
      login(user, token);

      toast.success(`Welcome back, ${user?.name ?? 'friend'}! 👋`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Surface server message or fallback
      const message =
        err?.response?.data?.message ?? 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      {/* ── Animated Card ── */}
      <motion.div
        className="w-full max-w-md"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Logo / Brand ── */}
        <motion.div
          className="flex flex-col items-center mb-8"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg mb-3">
            <Heart className="text-white" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            CareConnect
          </h1>
          <p className="text-sm text-gray-500 mt-1">Connecting care, one step at a time</p>
        </motion.div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-7">
            Welcome back — let's get you connected.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* ── Email ── */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                {/* Forgot password link */}
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9 pr-10"
                  disabled={isLoading}
                  required
                />
                {/* Show / Hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* ── Remember Me ── */}
            <div className="flex items-center gap-2.5">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-600 cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* ── Submit ── */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  {/* Spinner */}
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-200" />
            <span className="px-3 text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* ── Register Link ── */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-gray-600">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
