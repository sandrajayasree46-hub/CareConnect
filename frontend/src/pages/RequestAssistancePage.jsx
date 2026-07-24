import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Stethoscope,
  ShoppingCart,
  Car,
  Users,
  Wrench,
  MoreHorizontal,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  AlertTriangle,
  Flame,
  Minus,
  ArrowUpCircle,
} from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Available assistance categories with display metadata. */
const ASSISTANCE_TYPES = [
  { value: 'medical',       label: 'Medical',       icon: Stethoscope,    color: 'text-red-500',     bg: 'bg-red-50    dark:bg-red-900/20',    border: 'border-red-200    dark:border-red-700/50'    },
  { value: 'grocery',       label: 'Grocery',       icon: ShoppingCart,   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-700/50' },
  { value: 'transport',     label: 'Transport',     icon: Car,            color: 'text-blue-500',    bg: 'bg-blue-50   dark:bg-blue-900/20',   border: 'border-blue-200   dark:border-blue-700/50'   },
  { value: 'companionship', label: 'Companionship', icon: Users,          color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700/50'  },
  { value: 'home_repair',   label: 'Home Repair',   icon: Wrench,         color: 'text-amber-500',   bg: 'bg-amber-50  dark:bg-amber-900/20',  border: 'border-amber-200  dark:border-amber-700/50'   },
  { value: 'other',         label: 'Other',         icon: MoreHorizontal, color: 'text-surface-500', bg: 'bg-surface-50 dark:bg-surface-800',  border: 'border-surface-200 dark:border-surface-700'  },
];

/** Priority options with descriptive copy and colour theming. */
const PRIORITIES = [
  {
    value: 'low',
    label: 'Low',
    description: 'Not urgent — anytime in the next few days.',
    icon: Minus,
    color: 'text-surface-500',
    selected: 'border-surface-400 bg-surface-50 dark:bg-surface-800',
    ring: 'ring-surface-300',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Needed within the next 24 hours.',
    icon: ArrowUpCircle,
    color: 'text-blue-500',
    selected: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
    ring: 'ring-blue-300',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Urgent — needed as soon as possible.',
    icon: AlertTriangle,
    color: 'text-orange-500',
    selected: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
    ring: 'ring-orange-300',
  },
  {
    value: 'emergency',
    label: 'Emergency',
    description: 'Critical — requires immediate help!',
    icon: Flame,
    color: 'text-red-500',
    selected: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    ring: 'ring-red-300',
  },
];

const STEP_LABELS = ['Choose Type', 'Details', 'Review'];

// ─── Slide animation variants ─────────────────────────────────────────────────
const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center:           { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
};

const slideTransition = { type: 'spring', stiffness: 260, damping: 28 };

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Step progress indicator displayed at the top of the form.
 */
function StepProgress({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 select-none">
      {STEP_LABELS.map((label, idx) => {
        const stepNum  = idx + 1;
        const isActive = stepNum === current;
        const isDone   = stepNum < current;

        return (
          <div key={label} className="flex items-center">
            {/* Step circle with animated colour */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isDone
                    ? '#22c55e'   /* green-500  */
                    : isActive
                    ? '#3b82f6'   /* blue-500   */
                    : '#e2e8f0',  /* surface-200 */
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className={isActive ? 'text-white' : 'text-surface-400'}>
                    {stepNum}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : isDone
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-surface-400'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Animated connector line between steps */}
            {idx < STEP_LABELS.length - 1 && (
              <div className="w-12 sm:w-20 h-0.5 mx-1 mb-5 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-700">
                <motion.div
                  className="h-full bg-green-400"
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Assistance Type ──────────────────────────────────────────────────
function StepOne({ selected, onSelect }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-white">
          What kind of help do you need?
        </h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
          Tap a category to get started.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ASSISTANCE_TYPES.map(({ value, label, icon: Icon, color, bg, border }) => {
          const isSelected = selected === value;
          return (
            <motion.button
              key={value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(value)}
              className={`
                flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200
                focus:outline-none
                ${bg} ${border}
                ${isSelected
                  ? 'ring-4 ring-blue-400 border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-100 dark:shadow-blue-900/30'
                  : 'hover:shadow-md'}
              `}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-white dark:bg-surface-900'
                } shadow-sm`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : color}`} />
              </div>
              <span
                className={`text-sm font-bold text-center leading-tight ${
                  isSelected
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-surface-700 dark:text-surface-200'
                }`}
              >
                {label}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Details ──────────────────────────────────────────────────────────
function StepTwo({ form, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-white">
          Tell us more
        </h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
          Describe what you need and select how urgent it is.
        </p>
      </div>

      {/* Free-text description */}
      <Input
        id="description"
        label="Description"
        textarea
        rows={4}
        placeholder="Describe your request in detail…"
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
      />

      {/* Priority selection as clickable radio cards */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-surface-700 dark:text-surface-200">Priority</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRIORITIES.map(({ value, label, description, icon: Icon, color, selected, ring }) => {
            const isSelected = form.priority === value;
            return (
              <motion.button
                key={value}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => onChange('priority', value)}
                className={`
                  flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200
                  focus:outline-none
                  ${isSelected
                    ? `${selected} ring-4 ${ring} shadow-md`
                    : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-surface-300 dark:hover:border-surface-600'}
                `}
              >
                {/* Custom radio dot */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-current bg-current' : 'border-surface-300 dark:border-surface-600'
                  } ${color}`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <span className={`font-bold text-sm ${isSelected ? color : 'text-surface-800 dark:text-surface-100'}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-snug">
                    {description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Optional location field */}
      <Input
        id="location"
        label="Location (optional)"
        icon={MapPin}
        placeholder="e.g. 14 Elm Street, Apt 2B"
        value={form.location}
        onChange={(e) => onChange('location', e.target.value)}
      />
    </div>
  );
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────
function StepThree({ form }) {
  const typeMeta     = ASSISTANCE_TYPES.find((t) => t.value === form.assistanceType);
  const priorityMeta = PRIORITIES.find((p) => p.value === form.priority);
  const TypeIcon     = typeMeta?.icon     || ClipboardList;
  const PriorityIcon = priorityMeta?.icon || Minus;

  const rows = [
    { label: 'Assistance Type', value: typeMeta?.label || form.assistanceType,         Icon: TypeIcon,     iconColor: typeMeta?.color     || 'text-surface-400' },
    { label: 'Description',     value: form.description || '—',                         Icon: ClipboardList, iconColor: 'text-surface-400', multiline: true },
    { label: 'Priority',        value: priorityMeta?.label || form.priority,             Icon: PriorityIcon, iconColor: priorityMeta?.color || 'text-surface-400' },
    { label: 'Location',        value: form.location || 'Not specified',                 Icon: MapPin,        iconColor: 'text-surface-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-white">
          Review your request
        </h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
          Please double-check the details before submitting.
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="divide-y divide-surface-100 dark:divide-surface-700">
          {rows.map(({ label, value, Icon, iconColor, multiline }) => (
            <div key={label} className="flex items-start gap-4 px-5 py-4">
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-0.5">
                  {label}
                </p>
                <p className={`text-sm font-medium text-surface-800 dark:text-surface-100 ${multiline ? 'whitespace-pre-wrap leading-relaxed' : ''}`}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency callout banner */}
      {form.priority === 'emergency' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-2xl"
        >
          <Flame className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            Emergency request — our team will prioritise this immediately.
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

/**
 * RequestAssistancePage — a 3-step guided form for elders to request assistance.
 *
 * Step 1: Choose an assistance type from a visual grid of icon cards.
 * Step 2: Provide description, select priority, and enter location.
 * Step 3: Review the full request before submitting.
 *
 * Slides between steps with framer-motion. On submit, POSTs to /requests
 * and redirects to /dashboard with a success toast.
 */
export default function RequestAssistancePage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  // Current wizard step (1-indexed)
  const [step, setStep]           = useState(1);
  // Slide direction: +1 = forward, -1 = backward
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Shared form state across all steps
  const [form, setForm] = useState({
    assistanceType: '',
    description:    '',
    priority:       'medium',
    location:       '',
  });

  /** Update a single form field. */
  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** Advance to the next step with a forward slide animation. */
  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  /** Return to the previous step with a backward slide animation. */
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  /** Determine whether the user may advance from the current step. */
  const canAdvance = () => {
    if (step === 1) return !!form.assistanceType;
    if (step === 2) return form.description.trim().length >= 10;
    return true;
  };

  /** POST the completed request to the API, then redirect on success. */
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post('/requests', {
        assistance_type: form.assistanceType,
        description:     form.description.trim(),
        priority:        form.priority,
        location:        form.location.trim() || undefined,
      });
      toast.success('Your request has been submitted! A volunteer will be in touch soon. 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto"
    >
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">
          Request Assistance
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
          Help is just a few taps away, {user?.name?.split(' ')[0] || 'friend'}.
        </p>
      </div>

      {/* Animated step progress bar */}
      <StepProgress current={step} />

      {/* Animated step content */}
      <Card className="overflow-hidden relative min-h-[380px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            {step === 1 && (
              <StepOne
                selected={form.assistanceType}
                onSelect={(v) => updateField('assistanceType', v)}
              />
            )}
            {step === 2 && (
              <StepTwo form={form} onChange={updateField} />
            )}
            {step === 3 && (
              <StepThree form={form} />
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Inline validation hint for description */}
      {step === 2 && form.description.trim().length > 0 && form.description.trim().length < 10 && (
        <p className="text-xs text-red-500 font-medium mt-2 ml-1">
          Please enter at least 10 characters in the description.
        </p>
      )}

      {/* Navigation: Back + Next / Submit */}
      <div className="flex items-center justify-between mt-5 gap-3">
        {step > 1 ? (
          <Button variant="secondary" icon={ChevronLeft} onClick={goBack} size="md">
            Back
          </Button>
        ) : (
          <div /> /* spacer keeps Next/Submit right-aligned on step 1 */
        )}

        {step < 3 ? (
          <Button
            variant="primary"
            size="md"
            onClick={goNext}
            disabled={!canAdvance()}
            className="ml-auto"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant={form.priority === 'emergency' ? 'danger' : 'primary'}
            size="md"
            loading={submitting}
            onClick={handleSubmit}
            className="ml-auto"
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
            {!submitting && <CheckCircle2 className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
