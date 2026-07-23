/**
 * RegisterPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * CareConnect – Authentication / Registration
 *
 * Features:
 *  • Multi-field form: name, email, password, confirm password, phone (optional)
 *  • Role selection via animated icon cards (Elder / Volunteer)
 *  • Role descriptions shown beneath the selected card
 *  • Client-side password-match validation
 *  • Show/hide password toggles on both password fields
 *  • Submit button with loading state
 *  • API call → auth context login → navigate to /dashboard
 *  • Animated step-feel via Framer Motion staggered children
 *  • Error / success feedback via react-hot-toast
 *  • Link back to /login
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Heart, User, Mail, Lock,
  Phone, HandHeart, UserCog, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Input }  from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Role Definitions ─────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'elder',
    label: 'Elder',
    icon: UserCog,
    tagline: 'Request assistance',
    description:
      'Get help with daily tasks, appointments, errands, and more — all from trusted volunteers in your community.',
    color: 'indigo',
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    icon: HandHeart,
    tagline: 'Help others',
    description:
      'Lend a hand to elders nearby. Whether it\'s groceries, a ride, or a friendly chat \u2014 every act of care counts.',
    color: 'emerald',
  },
];

// ─── Tailwind colour maps (avoid dynamic class purging) ───────────────────────
const colorMap = {
  indigo: {
    border:   'border-indigo-500',
    bg:       'bg-indigo-50',
    iconBg:   'bg-indigo-100',
    iconText: 'text-indigo-600',
    text:     'text-indigo-700',
    check:    'text-indigo-500',
    ring:     'ring-indigo-300',
  },
  emerald: {
    border:   'border-emerald-500',
    bg:       'bg-emerald-50',
    iconBg:   'bg-emerald-100',
    iconText: 'text-emerald-600',
    text:     'text-emerald-700',
    check:    'text-emerald-500',
    ring:     'ring-emerald-300',
  },
};

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Form State ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    phone:           '',
  });
  const [selectedRole, setSelectedRole]       = useState('elder');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPwd, setShowConfirmPwd]   = useState(false);
  const [isLoading, setIsLoading]             = useState(false);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const activeRole = ROLES.find((r) => r.id === selectedRole);
  const colours    = colorMap[activeRole.color];

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** Keep formData in sync */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Client-side validation before submitting */
  const validate = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name.'); return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email.'); return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.'); return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.'); return false;
    }
    return true;
  };

  /** Submit: validate → API → auth context → navigate */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        name:     formData.name.trim(),
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
        role:     selectedRole,
        ...(formData.phone.trim() && { phone: formData.phone.trim() }),
      };

      const { data } = await api.post('/register', payload);
      // Backend returns: { success, message, data: { token, user } }
      const { token, user } = data.data ?? data;

      // Persist auth state
      login(user, token);

      toast.success(`Welcome to CareConnect, ${user?.name ?? 'friend'}! 🎉`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ?? 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-lg"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Brand Header ── */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg mb-3">
            <Heart className="text-white" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">CareConnect</h1>
          <p className="text-sm text-gray-500 mt-1">Join our community of care</p>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Create an account</h2>
          <p className="text-sm text-gray-500 mb-8">
            Tell us a bit about yourself to get started.
          </p>

          <motion.form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* ── Step 1: Role Selection ── */}
            <motion.div variants={itemVariants}>
              <p className="text-sm font-medium text-gray-700 mb-3">I want to…</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => {
                  const Icon    = role.icon;
                  const c       = colorMap[role.color];
                  const active  = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={[
                        'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                        active
                          ? `${c.border} ${c.bg} ${c.ring}`
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                      ].join(' ')}
                    >
                      {/* Checkmark badge */}
                      {active && (
                        <CheckCircle2
                          size={16}
                          className={`absolute top-2 right-2 ${c.check}`}
                        />
                      )}
                      {/* Icon bubble */}
                      <div
                        className={[
                          'flex items-center justify-center w-10 h-10 rounded-full',
                          active ? c.iconBg : 'bg-gray-200',
                        ].join(' ')}
                      >
                        <Icon
                          size={20}
                          className={active ? c.iconText : 'text-gray-500'}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          active ? c.text : 'text-gray-600'
                        }`}
                      >
                        {role.label}
                      </span>
                      <span
                        className={`text-xs ${
                          active ? c.iconText : 'text-gray-400'
                        }`}
                      >
                        {role.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Role description callout — animates on role change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRole}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className={`mt-3 rounded-lg px-4 py-3 text-sm ${colours.bg} ${colours.text} border ${colours.border} border-opacity-30`}
                >
                  {activeRole.description}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* ── Full Name ── */}
            <motion.div variants={itemVariants}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-9"
                  disabled={isLoading}
                  required
                />
              </div>
            </motion.div>

            {/* ── Email ── */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
            </motion.div>

            {/* ── Password + Confirm Password (side by side on sm+) ── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 8 chars"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-9 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={[
                      'pl-9 pr-10',
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-400 focus:ring-red-400'
                        : '',
                    ].join(' ')}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPwd ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Inline mismatch hint */}
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords don't match.</p>
                  )}
              </div>
            </motion.div>

            {/* ── Phone (optional) ── */}
            <motion.div variants={itemVariants}>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone number{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* ── Submit ── */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Creating account…
                  </span>
                ) : (
                  'Create account'
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* ── Divider ── */}
          <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-200" />
            <span className="px-3 text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* ── Login Link ── */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By registering, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
