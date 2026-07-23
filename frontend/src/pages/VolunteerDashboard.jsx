import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  Loader2,
  MapPin,
  Phone,
  Star,
  User,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import { StatCard } from '../components/dashboard/StatCard';
import { RequestCard } from '../components/dashboard/RequestCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

// ─── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: 'available', label: 'Available Requests' },
  { id: 'active',    label: 'My Active'           },
];

// ─── Availability status config ──────────────────────────────────────────────
const AVAILABILITY_OPTIONS = [
  {
    value: 'available',
    label: 'Available',
    icon: Wifi,
    /** Active button colours */
    active:
      'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30',
    /** Inactive (ghost) colours */
    idle:
      'bg-white dark:bg-surface-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
  },
  {
    value: 'busy',
    label: 'Busy',
    icon: Zap,
    active:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30',
    idle:
      'bg-white dark:bg-surface-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20',
  },
  {
    value: 'offline',
    label: 'Offline',
    icon: WifiOff,
    active:
      'bg-surface-500 hover:bg-surface-600 text-white shadow-lg shadow-surface-200 dark:shadow-surface-900/30',
    idle:
      'bg-white dark:bg-surface-800 text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700',
  },
];

// ─── Priority colour map used in the detail modal ────────────────────────────
const PRIORITY_COLORS = {
  low:       'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300',
  medium:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high:      'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

// ─── Tiny section divider used inside the modal ──────────────────────────────
function InfoRow({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-surface-100 dark:border-surface-700 last:border-0">
      {Icon && (
        <div className="mt-0.5 shrink-0 p-1.5 rounded-xl bg-surface-100 dark:bg-surface-700">
          <Icon className="w-4 h-4 text-surface-500 dark:text-surface-400" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm text-surface-800 dark:text-surface-200 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Empty-state placeholder ─────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-surface-400 dark:text-surface-500"
    >
      <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VolunteerDashboard
// ════════════════════════════════════════════════════════════════════════════
export default function VolunteerDashboard() {
  const { user, updateUser } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]           = useState('available');
  const [availability, setAvailability]     = useState(user?.availability ?? 'offline');
  const [availLoading, setAvailLoading]     = useState(false);

  /** Pending requests shown in the "Available Requests" tab */
  const [pendingRequests, setPendingRequests] = useState([]);
  /** Accepted/in-progress requests shown in the "My Active" tab */
  const [activeRequests, setActiveRequests]   = useState([]);
  /** Derived stats fetched once on mount */
  const [stats, setStats]                     = useState({
    availableCount: 0,
    activeCount:    0,
    completedCount: 0,
    rating:         null,
  });
  const [statsLoading, setStatsLoading]  = useState(true);
  const [tabLoading, setTabLoading]      = useState(false);

  /** Request detail modal */
  const [selectedRequest, setSelectedRequest] = useState(null);

  // ── Fetch stats on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchStats() {
      try {
        setStatsLoading(true);
        const [allRes, profileRes] = await Promise.all([
          api.get('/requests'),
          api.get('/profile'),
        ]);

        // Backend wraps: { success, data: { requests: [...], total, ... } }
        const allRequests = allRes.data?.data?.requests ?? allRes.data?.data ?? allRes.data ?? [];
        const profile     = profileRes.data?.data ?? profileRes.data ?? {};

        // Sync local availability with server value on first load
        setAvailability(profile.availability ?? 'offline');

        setStats({
          availableCount: allRequests.filter(r => r.status === 'pending').length,
          activeCount:    allRequests.filter(
            r => r.status === 'accepted' || r.status === 'in_progress'
          ).length,
          completedCount: allRequests.filter(r => r.status === 'completed').length,
          rating:         profile.rating ?? null,
        });
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard stats');
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // ── Fetch requests for the current tab ───────────────────────────────────
  const fetchTabRequests = useCallback(async (tab) => {
    setTabLoading(true);
    try {
      if (tab === 'available') {
        const res = await api.get('/requests?status=pending');
        // Unwrap paginated response: { data: { requests: [...] } }
        const list = res.data?.data?.requests ?? res.data?.data ?? res.data ?? [];
        setPendingRequests(Array.isArray(list) ? list : []);
      } else {
        // Fetch accepted and in_progress in parallel, then merge
        const [acceptedRes, inProgressRes] = await Promise.all([
          api.get('/requests?status=accepted'),
          api.get('/requests?status=in_progress'),
        ]);
        const accepted   = acceptedRes.data?.data?.requests   ?? acceptedRes.data?.data   ?? acceptedRes.data   ?? [];
        const inProgress = inProgressRes.data?.data?.requests ?? inProgressRes.data?.data ?? inProgressRes.data ?? [];
        setActiveRequests([
          ...(Array.isArray(accepted)   ? accepted   : []),
          ...(Array.isArray(inProgress) ? inProgress : []),
        ]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load requests');
    } finally {
      setTabLoading(false);
    }
  }, []);

  // Re-fetch whenever the active tab changes
  useEffect(() => {
    fetchTabRequests(activeTab);
  }, [activeTab, fetchTabRequests]);

  // ── Availability toggle ───────────────────────────────────────────────────
  const handleAvailability = async (newStatus) => {
    if (newStatus === availability || availLoading) return;
    const prev = availability;
    setAvailability(newStatus); // optimistic update
    setAvailLoading(true);
    try {
      await api.put('/profile', { availability: newStatus });
      updateUser({ availability: newStatus });
      toast.success(`Status set to "${newStatus}"`);
    } catch (err) {
      setAvailability(prev); // roll back on failure
      toast.error(err.message || 'Failed to update availability');
    } finally {
      setAvailLoading(false);
    }
  };

  // ── Accept a pending request ──────────────────────────────────────────────
  const handleAccept = async (request) => {
    const id = request._id ?? request.id;
    const toastId = toast.loading('Accepting request…');
    try {
      await api.put(`/requests/${id}`, { status: 'accepted' });
      toast.success('Request accepted! 🎉', { id: toastId });
      // Optimistically remove from pending list and update counters
      setPendingRequests(prev => prev.filter(r => (r._id ?? r.id) !== id));
      setStats(prev => ({
        ...prev,
        availableCount: Math.max(0, prev.availableCount - 1),
        activeCount:    prev.activeCount + 1,
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to accept request', { id: toastId });
    }
  };

  // ── Mark an active request as complete ───────────────────────────────────
  const handleComplete = async (request) => {
    const id = request._id ?? request.id;
    const toastId = toast.loading('Marking complete…');
    try {
      await api.put(`/requests/${id}`, { status: 'completed' });
      toast.success('Great work! Request marked complete ✅', { id: toastId });
      setActiveRequests(prev => prev.filter(r => (r._id ?? r.id) !== id));
      setStats(prev => ({
        ...prev,
        activeCount:    Math.max(0, prev.activeCount - 1),
        completedCount: prev.completedCount + 1,
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to complete request', { id: toastId });
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const displayRating = stats.rating != null
    ? Number(stats.rating).toFixed(1)
    : '—';

  const currentTabRequests = activeTab === 'available' ? pendingRequests : activeRequests;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 pb-12">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="px-4 pt-8 pb-6 sm:px-8"
      >
        <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
          Volunteer Dashboard
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Welcome back, {user?.name ?? 'Volunteer'} 👋
        </p>
      </motion.div>

      <div className="px-4 sm:px-8 space-y-8">

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        {statsLoading ? (
          /* Pulse skeleton placeholders */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-3xl bg-surface-100 dark:bg-surface-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={ClipboardList}
              value={stats.availableCount}
              label="Available Requests"
              color="blue"
              index={0}
            />
            <StatCard
              icon={Zap}
              value={stats.activeCount}
              label="My Active"
              color="amber"
              index={1}
            />
            <StatCard
              icon={Wifi}
              value={stats.completedCount}
              label="Completed Tasks"
              color="green"
              index={2}
            />
            <StatCard
              icon={Star}
              value={displayRating}
              label="My Rating"
              color="purple"
              index={3}
            />
          </div>
        )}

        {/* ── Availability toggle ─────────────────────────────────────────── */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="shrink-0">
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                My Availability
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                Let elders know when you're ready to help
              </p>
            </div>

            <div className="flex gap-2 sm:ml-auto flex-wrap">
              {AVAILABILITY_OPTIONS.map(opt => {
                const isActive = availability === opt.value;
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAvailability(opt.value)}
                    disabled={availLoading}
                    aria-pressed={isActive}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold
                      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                      disabled:opacity-60 disabled:cursor-not-allowed
                      ${isActive ? opt.active : opt.idle}
                    `}
                  >
                    {/* Show spinner on the active button while saving, otherwise show icon */}
                    {availLoading && isActive
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Icon className="w-4 h-4" />
                    }
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ── Tabbed request lists ────────────────────────────────────────── */}
        <div>
          {/* Tab strip */}
          <div className="flex gap-2 mb-5">
            {TABS.map(tab => {
              const count =
                tab.id === 'available' ? stats.availableCount :
                tab.id === 'active'    ? stats.activeCount     : 0;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-5 py-2.5 rounded-2xl text-sm font-semibold
                    transition-all duration-200 focus:outline-none focus:ring-2
                    focus:ring-blue-300 focus:ring-offset-2
                    ${isSelected
                      ? 'gradient-primary text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                      : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 card-shadow'
                    }
                  `}
                >
                  {tab.label}
                  {/* Live count badge – only on active (selected) tab */}
                  {isSelected && count > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/30 text-white text-xs font-bold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content with AnimatePresence slide transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'available' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'available' ? 20 : -20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {tabLoading ? (
                /* Skeleton cards while fetching */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-48 rounded-3xl bg-surface-100 dark:bg-surface-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : currentTabRequests.length === 0 ? (
                <EmptyState
                  message={
                    activeTab === 'available'
                      ? 'No pending requests right now. Check back soon!'
                      : "You haven't accepted any requests yet."
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentTabRequests.map((request, index) => (
                    <RequestCard
                      key={request._id ?? request.id}
                      request={request}
                      role="volunteer"
                      index={index}
                      onView={setSelectedRequest}
                      onAccept={activeTab === 'available' ? handleAccept : undefined}
                      onComplete={activeTab === 'active'  ? handleComplete : undefined}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Request Detail Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Request Details"
        maxWidth="max-w-lg"
      >
        {selectedRequest && (
          <div className="space-y-1">

            {/* Priority badge */}
            {selectedRequest.priority && (
              <div className="mb-4">
                <span
                  className={`
                    inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                    tracking-wide capitalize
                    ${PRIORITY_COLORS[selectedRequest.priority] ?? PRIORITY_COLORS.low}
                  `}
                >
                  {selectedRequest.priority === 'emergency' && '🚨 '}
                  {selectedRequest.priority.charAt(0).toUpperCase() +
                   selectedRequest.priority.slice(1)} Priority
                </span>
              </div>
            )}

            {/* Status badge */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wide">
                Status:
              </span>
              <Badge
                type={selectedRequest.status}
                label={selectedRequest.status.replace('_', ' ')}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-surface-100 dark:border-surface-700 mb-1" />

            {/* Detail rows */}
            <InfoRow icon={User}         label="Requester"  value={selectedRequest.requester?.name} />
            <InfoRow icon={Phone}        label="Phone"      value={selectedRequest.requester?.phone} />
            <InfoRow icon={MapPin}       label="Location"   value={selectedRequest.location} />
            <InfoRow icon={ClipboardList} label="Description" value={selectedRequest.description} />
            {selectedRequest.scheduled_time && (
              <InfoRow
                icon={Zap}
                label="Scheduled"
                value={new Date(selectedRequest.scheduled_time).toLocaleString()}
              />
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-5">
              {selectedRequest.status === 'pending' && (
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    handleAccept(selectedRequest);
                    setSelectedRequest(null);
                  }}
                >
                  Accept Request
                </Button>
              )}
              {(selectedRequest.status === 'accepted' ||
                selectedRequest.status === 'in_progress') && (
                <Button
                  variant="success"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    handleComplete(selectedRequest);
                    setSelectedRequest(null);
                  }}
                >
                  Mark Complete
                </Button>
              )}
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
