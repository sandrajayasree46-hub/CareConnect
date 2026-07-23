/**
 * LandingPage.jsx
 * CareConnect — Marketing landing page
 *
 * Sections:
 *  1. Sticky Navbar  — logo, nav links, dark-mode toggle, auth buttons
 *  2. Hero           — gradient background, animated heading, dual CTA
 *  3. Features Grid  — 6 glassmorphism service cards
 *  4. How It Works   — 3 numbered steps
 *  5. Stats Bar      — animated counters / key figures
 *  6. CTA Banner     — secondary call-to-action
 *  7. Footer         — minimal brand footer
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Card }   from '../components/ui/Card';
import { useTheme } from '../context/ThemeContext';

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

/** Fade-up entrance used on most section children */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay },
  }),
};

/** Stagger container — animates children one after another */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/** Card hover lift */
const cardHover = {
  rest:  { y: 0,  boxShadow: '0 4px 24px rgba(99,102,241,0.08)' },
  hover: { y: -8, boxShadow: '0 16px 48px rgba(99,102,241,0.22)' },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'Features',     href: '#features'    },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Stats',        href: '#stats'       },
];

const FEATURES = [
  {
    emoji: '🏥',
    title: 'Medical Help',
    description:
      'Connect instantly with certified healthcare professionals, schedule doctor visits, and manage prescriptions — all from home.',
  },
  {
    emoji: '🛒',
    title: 'Grocery Delivery',
    description:
      'Fresh groceries delivered to your doorstep within hours. Volunteers handle your shopping list with care and precision.',
  },
  {
    emoji: '🚗',
    title: 'Transportation',
    description:
      'Reliable, comfortable rides to appointments, social events, or errands. Safety-vetted drivers dedicated to elder comfort.',
  },
  {
    emoji: '🤝',
    title: 'Companionship',
    description:
      'Meaningful human connection through regular check-in calls, in-person visits, and social activities that brighten every day.',
  },
  {
    emoji: '🔧',
    title: 'Home Repair',
    description:
      'Skilled volunteers tackle household repairs, maintenance, and installations so your home stays safe and comfortable.',
  },
  {
    emoji: '🆘',
    title: 'Emergency SOS',
    description:
      'One-tap emergency alerts dispatch the nearest responder instantly. 24/7 monitoring ensures help is always seconds away.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create Your Profile',
    description:
      "Sign up in under two minutes. Tell us about yourself and the kind of support you're looking for.",
  },
  {
    number: '02',
    title: 'Get Matched',
    description:
      'Our smart matching connects you with nearby, verified volunteers best suited to your specific needs.',
  },
  {
    number: '03',
    title: 'Receive Care',
    description:
      'Schedule assistance, track arrival in real time, and rate your experience — building a community of trust.',
  },
];

const STATS = [
  { icon: Users,      value: '500+', label: 'Elders Helped'      },
  { icon: Heart,      value: '200+', label: 'Volunteers'         },
  { icon: Star,       value: '98%',  label: 'Satisfaction'       },
  { icon: TrendingUp, value: '24/7', label: 'Support Available'  },
];

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

/**
 * Sticky Navbar — becomes opaque + blurred after scrolling past the hero.
 */
function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBase     = 'fixed top-0 inset-x-0 z-50 transition-all duration-300';
  const navScrolled = scrolled
    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md'
    : 'bg-transparent';

  return (
    <nav className={`${navBase} ${navScrolled}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="p-1.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
            <Heart size={20} className="text-white fill-white" />
          </span>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CareConnect
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 dark:text-slate-300
                           hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark-mode toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800
                       hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark
              ? <Sun  size={18} className="text-amber-400" />
              : <Moon size={18} className="text-slate-500"  />}
          </button>

          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-slate-900
                       border-t border-slate-100 dark:border-slate-800"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link to="/login" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
              >
                {isDark
                  ? <Sun  size={16} className="text-amber-400" />
                  : <Moon size={16} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------

function HeroSection() {
  return (
    <section
      className="gradient-hero relative min-h-screen flex items-center justify-center
                 overflow-hidden px-6 pt-24 pb-16"
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full
                   bg-blue-300/30 dark:bg-blue-900/30 blur-3xl animate-pulse"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full
                   bg-indigo-400/20 dark:bg-indigo-800/20 blur-3xl animate-pulse delay-1000"
      />

      <div className="relative max-w-4xl mx-auto text-center">

        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full
                     bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
        >
          <Heart size={14} className="text-blue-500 fill-blue-500" />
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 tracking-wide uppercase">
            Trusted Elder Care Platform
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
        >
          <span className="text-slate-800 dark:text-white">Assistance at</span>
          <br />
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500
                           bg-clip-text text-transparent">
            Your Fingertips
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400
                     leading-relaxed mb-10"
        >
          CareConnect bridges the gap between elders who need support and compassionate
          volunteers ready to help — making independent living safer, easier, and more joyful.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register">
            <Button
              variant="primary"
              size="lg"
              className="group flex items-center gap-2 px-8 shadow-xl shadow-blue-500/30
                         hover:shadow-blue-500/50 transition-shadow"
            >
              Get Started — It&apos;s Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link to="/login">
            <Button
              variant="outline"
              size="lg"
              className="px-8 backdrop-blur-sm bg-white/60 dark:bg-slate-800/60
                         border-slate-300 dark:border-slate-600"
            >
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm
                     text-slate-500 dark:text-slate-400"
        >
          {['No credit card required', 'Free for elders', '100% volunteer-driven'].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-green-500" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Features Section
// ---------------------------------------------------------------------------

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-sm font-semibold tracking-widest text-blue-500 uppercase mb-3">
            Everything You Need
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
            Services Built{' '}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Around You
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-lg">
            From daily essentials to emergency response, we have every aspect of elder
            care covered by a community that truly cares.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <motion.div variants={cardHover} className="h-full rounded-2xl">
                <Card
                  className="h-full p-6 rounded-2xl border border-slate-200/60
                             dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/60
                             backdrop-blur-sm transition-colors cursor-default"
                >
                  {/* Emoji icon */}
                  <div
                    className="w-14 h-14 flex items-center justify-center rounded-2xl
                               bg-gradient-to-br from-blue-50 to-indigo-100
                               dark:from-blue-900/40 dark:to-indigo-900/40
                               text-3xl mb-5 shadow-inner"
                  >
                    {feature.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// How It Works Section
// ---------------------------------------------------------------------------

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-sm font-semibold tracking-widest text-indigo-500 uppercase mb-3">
            Simple Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
            Up &amp; Running in{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              3 Easy Steps
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-slate-500 dark:text-slate-400 text-lg">
            Getting the help you need has never been this straightforward.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10 relative"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Connecting gradient line (desktop only) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)]
                       h-0.5 bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300
                       dark:from-blue-700 dark:via-indigo-700 dark:to-violet-700"
          />

          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              custom={idx * 0.1}
              className="relative flex flex-col items-center text-center"
            >
              {/* Number bubble */}
              <div
                className="w-20 h-20 flex items-center justify-center rounded-full mb-6 z-10
                           bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30"
              >
                <span className="text-2xl font-extrabold text-white">{step.number}</span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Stats Section
// ---------------------------------------------------------------------------

function StatsSection() {
  return (
    <section
      id="stats"
      className="py-20 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600
                 dark:from-blue-800 dark:via-indigo-800 dark:to-violet-800"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {STATS.map(({ icon: Icon, value, label }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 text-white/80">
                <Icon size={28} />
              </div>
              <span className="text-4xl md:text-5xl font-extrabold text-white mb-1 tabular-nums">
                {value}
              </span>
              <span className="text-blue-100 dark:text-blue-200 font-medium text-sm">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CTA Banner Section
// ---------------------------------------------------------------------------

function CTABannerSection() {
  return (
    <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {/* Glassmorphism card */}
        <div
          className="relative rounded-3xl p-12 overflow-hidden
                     bg-gradient-to-br from-blue-500/10 to-indigo-500/10
                     dark:from-blue-900/30 dark:to-indigo-900/30
                     border border-blue-200/60 dark:border-blue-700/40
                     backdrop-blur-sm shadow-2xl shadow-blue-500/10"
        >
          {/* Decorative blobs */}
          <div aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <div aria-hidden className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10">
            <span className="text-4xl mb-4 block">💙</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Ready to Make a{' '}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Difference?
              </span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              Join thousands of families who trust CareConnect to keep their loved ones
              safe, happy, and supported every single day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="group flex items-center gap-2 px-10 shadow-xl shadow-blue-500/30"
                >
                  Start for Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-10 bg-white/60 dark:bg-slate-800/60
                             border-slate-300 dark:border-slate-600 backdrop-blur-sm"
                >
                  Already have an account?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-slate-200 dark:border-slate-800
                       bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center
                      justify-between gap-6 text-sm text-slate-500 dark:text-slate-400">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <Heart size={14} className="text-white fill-white" />
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">CareConnect</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        {/* Links */}
        <nav className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((item) => (
            <a key={item} href="#" className="hover:text-blue-500 transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <p className="flex items-center gap-1">
          Made with <Heart size={12} className="text-rose-400 fill-rose-400 mx-0.5" /> for every elder.
        </p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page Root
// ---------------------------------------------------------------------------

/**
 * LandingPage
 * Top-level marketing page composed of all landing sections.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white
                    transition-colors duration-300 font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <CTABannerSection />
      </main>
      <Footer />
    </div>
  );
}
