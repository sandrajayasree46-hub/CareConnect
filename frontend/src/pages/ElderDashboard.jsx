import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Zap,
  Phone,
  UserPlus,
  Siren,
  HeartPulse,
  Sun,
  Contact,
  Trash2,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import { StatCard } from '../components/dashboard/StatCard';
import { RequestCard } from '../components/dashboard/RequestCard';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton, RequestCardSkeleton, StatCardSkeleton } from '../components/ui/Skeleton';

// ---------------------------------------------------------------------------
// Greeting helper – changes based on time of day
// ---------------------------------------------------------------------------
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Motivational messages pool – one is picked at random on mount
const MOTIVATIONAL_MESSAGES = [
  'You are never alone. We are here whenever you need us. 💛',
  'Every day is a fresh start. Stay well and take care! 🌼',
  'Your wellbeing matters. Reach out any time you need help. 🤝',
  'Small steps, big victories. Have a wonderful day! ☀️',
  'You are cherished and supported. Have a beautiful day! 🌺',
];

// ---------------------------------------------------------------------------
// Empty-state component for requests list
// ---------------------------------------------------------------------------
function EmptyRequests() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 py-12 text-center"
    >
      <ClipboardList className="w-12 h-12 text-surface-300 dark:text-surface-600" />
      <p className="text-surface-500 dark:text-surface-400 font-medium">No requests yet.</p>
      <p className="text-sm text-surface-400 dark:text-surface-500">
        Tap <span className="font-semibold text-primary-500">Request Help Now</span> whenever you need assistance.
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ContactRow – single emergency contact list item
// ---------------------------------------------------------------------------
function ContactRow({ contact, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50 dark:bg-surface-700/50 border border-surface-100 dark:border-surface-700"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg select-none">
        {contact.name?.charAt(0)?.toUpperCase() ?? '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-surface-900 dark:text-white truncate">{contact.name}</p>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {contact.relationship && (
            <span className="capitalize">{contact.relationship} · </span>
          )}
          <a
            href={`tel:${contact.phone}`}
            className="text-primary-500 hover:underline font-medium"
          >
            {contact.phone}
          </a>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={`tel:${contact.phone}`}
          className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          title={`Call ${contact.name}`}
        >
          <Phone className="w-4 h-4" />
        </a>
        {onDelete && (
          <button
            onClick={() => onDelete(contact)}
            className="p-2 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Remove contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ===========================================================================
// ElderDashboard – main export
// ===========================================================================
export default function ElderDashboard() {
  const { user } = useAuth();

  // ── Data state ────────────────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // ── Modal visibility ──────────────────────────────────────────────────────
  const [sosOpen, setSosOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);

  // ── Add contact form ──────────────────────────────────────────────────────
  const [contactForm, setContactForm] = useState({ name: '', relationship: '', phone: '' });
  const [contactFormErrors, setContactFormErrors] = useState({});
  const [savingContact, setSavingContact] = useState(false);

  // ── Motivational message (stable per session) ─────────────────────────────
  const [motivationalMsg] = useState(
    () => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  // ── Fetch requests ────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const { data } = await api.get('/requests');
      // Backend: { success, message, data: { requests: [...], total, page, pages } }
      const list = data?.data?.requests ?? data?.data ?? data ?? [];
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(`Could not load requests: ${err.message}`);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // ── Fetch emergency contacts ──────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const { data } = await api.get('/emergency-contacts');
      // Backend: { success, message, data: { contacts: [...] } }
      const list = data?.data?.contacts ?? data?.data ?? data ?? [];
      setContacts(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(`Could not load emergency contacts: ${err.message}`);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchContacts();
  }, [fetchRequests, fetchContacts]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = {
    total:     requests.length,
    pending:   requests.filter(r => r.status === 'pending').length,
    completed: requests.filter(r => r.status === 'completed').length,
    active:    requests.filter(r => ['accepted', 'in_progress'].includes(r.status)).length,
  };

  // ── Cancel request ────────────────────────────────────────────────────────
  const handleCancel = async (request) => {
    const toastId = toast.loading('Cancelling request…');
    try {
      await api.put(`/requests/${request.id}`, { status: 'cancelled' });
      toast.success('Request cancelled.', { id: toastId });
      // Optimistically update local state
      setRequests(prev =>
        prev.map(r => r.id === request.id ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  // ── Add contact form handlers ─────────────────────────────────────────────
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (contactFormErrors[name]) {
      setContactFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateContactForm = () => {
    const errors = {};
    if (!contactForm.name.trim())  errors.name  = 'Name is required.';
    if (!contactForm.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(contactForm.phone.trim())) {
      errors.phone = 'Enter a valid phone number.';
    }
    return errors;
  };

  // ── Delete contact ────────────────────────────────────────────────────────
  const handleDeleteContact = async (contact) => {
    const toastId = toast.loading('Removing contact…');
    try {
      await api.delete(`/emergency-contacts/${contact.id}`);
      setContacts(prev => prev.filter(c => c.id !== contact.id));
      toast.success(`${contact.name} removed.`, { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    const errors = validateContactForm();
    if (Object.keys(errors).length) {
      setContactFormErrors(errors);
      return;
    }

    setSavingContact(true);
    const toastId = toast.loading('Saving contact…');
    try {
      const { data } = await api.post('/emergency-contacts', {
        name:         contactForm.name.trim(),
        relationship: contactForm.relationship.trim(),
        phone:        contactForm.phone.trim(),
      });
      const newContact = data.data ?? data;
      setContacts(prev => [newContact, ...prev]);
      toast.success(`${contactForm.name} added as an emergency contact!`, { id: toastId });
      setContactForm({ name: '', relationship: '', phone: '' });
      setContactFormErrors({});
      setAddContactOpen(false);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setSavingContact(false);
    }
  };

  const handleCloseAddContact = () => {
    setAddContactOpen(false);
    setContactForm({ name: '', relationship: '', phone: '' });
    setContactFormErrors({});
  };

  // Recent requests: show at most 5, newest first
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // ===========================================================================
  // Render
  // ===========================================================================
  return (
    <div className="space-y-8">

      {/* ── 1. Welcome Card ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="relative overflow-hidden rounded-3xl p-7 bg-gradient-to-br from-primary-500 via-primary-600 to-blue-700 text-white card-shadow-lg"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Left – greeting */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium text-white/80">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
              {user?.name ?? 'Welcome back'} 👋
            </h1>
            <p className="text-white/80 text-base leading-relaxed max-w-md">
              {motivationalMsg}
            </p>
          </div>

          {/* Right – actions */}
          <div className="flex flex-col gap-3 sm:items-end">
            {/* Request Help Now */}
            <Link to="/request">
              <Button
                variant="secondary"
                size="lg"
                icon={HeartPulse}
                className="w-full sm:w-auto !text-primary-600 dark:!text-primary-400"
              >
                Request Help Now
              </Button>
            </Link>

            {/* SOS Emergency */}
            <Button
              variant="sos"
              size="lg"
              icon={Siren}
              className="w-full sm:w-auto"
              onClick={() => setSosOpen(true)}
              aria-label="SOS Emergency – tap to alert contacts"
            >
              🆘 SOS Emergency
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Stat Cards ───────────────────────────────────────────────────── */}
      <section aria-label="Request statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingRequests ? (
            // Show skeleton placeholders while loading
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                icon={ClipboardList}
                value={stats.total}
                label="Total Requests"
                color="blue"
                index={0}
              />
              <StatCard
                icon={Clock}
                value={stats.pending}
                label="Pending"
                color="amber"
                index={1}
              />
              <StatCard
                icon={CheckCircle2}
                value={stats.completed}
                label="Completed"
                color="green"
                index={2}
              />
              <StatCard
                icon={Zap}
                value={stats.active}
                label="Active"
                color="purple"
                index={3}
              />
            </>
          )}
        </div>
      </section>

      {/* ── 3. Recent Requests ──────────────────────────────────────────────── */}
      <section aria-label="Recent requests">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Requests</CardTitle>
            <Link to="/requests">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>

          {loadingRequests ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <RequestCardSkeleton key={i} />
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <EmptyRequests />
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request, i) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  role="elder"
                  index={i}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* ── 4. Emergency Contacts ───────────────────────────────────────────── */}
      <section aria-label="Emergency contacts">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Contact className="w-5 h-5 text-primary-500" />
              <CardTitle>Emergency Contacts</CardTitle>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => setAddContactOpen(true)}
            >
              Add Contact
            </Button>
          </CardHeader>

          {loadingContacts ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50 dark:bg-surface-700/50 animate-pulse"
                >
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-10 text-center"
            >
              <Phone className="w-10 h-10 text-surface-300 dark:text-surface-600" />
              <p className="text-surface-500 dark:text-surface-400 font-medium">
                No emergency contacts added yet.
              </p>
              <p className="text-sm text-surface-400">
                Add a trusted person so we can reach them in an emergency.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {contacts.map(contact => (
                  <ContactRow key={contact.id} contact={contact} onDelete={handleDeleteContact} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SOS Modal
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        title="🆘 Emergency Alert"
        maxWidth="max-w-md"
      >
        {/* Big alert text */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex flex-col items-center gap-3 mb-6 py-4"
        >
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Siren className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-red-600 dark:text-red-400 text-center">
            Emergency Alert Sent!
          </h2>
          <p className="text-surface-500 dark:text-surface-400 text-sm text-center max-w-xs">
            Your emergency contacts have been notified. Help is on the way.
            Stay calm and stay on the line.
          </p>
        </motion.div>

        {/* Emergency contacts list */}
        <div>
          <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-widest mb-3">
            Contacts Notified
          </h3>

          {contacts.length === 0 ? (
            <div className="rounded-2xl bg-surface-50 dark:bg-surface-700/50 p-5 text-center text-sm text-surface-500">
              No emergency contacts saved.{' '}
              <button
                className="text-primary-500 hover:underline font-medium"
                onClick={() => {
                  setSosOpen(false);
                  setAddContactOpen(true);
                }}
              >
                Add one now →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40"
                >
                  <div className="w-9 h-9 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center text-red-700 dark:text-red-200 font-bold text-sm select-none">
                    {contact.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">
                      {contact.name}
                    </p>
                    {contact.relationship && (
                      <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">
                        {contact.relationship}
                      </p>
                    )}
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss */}
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={() => setSosOpen(false)}>
            I'm Safe / Dismiss
          </Button>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          Add Emergency Contact Modal
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={addContactOpen}
        onClose={handleCloseAddContact}
        title="Add Emergency Contact"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddContact} noValidate className="space-y-5">
          {/* Name */}
          <Input
            id="contact-name"
            name="name"
            label="Full Name"
            placeholder="e.g. Maria Fernandez"
            value={contactForm.name}
            onChange={handleContactChange}
            error={contactFormErrors.name}
            autoFocus
          />

          {/* Relationship */}
          <Input
            id="contact-relationship"
            name="relationship"
            label="Relationship (optional)"
            placeholder="e.g. Daughter, Neighbour, Doctor"
            value={contactForm.relationship}
            onChange={handleContactChange}
          />

          {/* Phone */}
          <Input
            id="contact-phone"
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={contactForm.phone}
            onChange={handleContactChange}
            error={contactFormErrors.phone}
            icon={Phone}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleCloseAddContact}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={savingContact}
              icon={UserPlus}
            >
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
