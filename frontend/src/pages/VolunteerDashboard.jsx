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
  CheckCircle2,
  PlayCircle,
  Mail,
  RefreshCw,
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
  { id: 'active',    label: 'My Assigned Requests' },
  { id: 'completed', label: 'Completed Requests'  },
];

// ─── Availability status config ──────────────────────────────────────────────
const AVAILABILITY_OPTIONS = [
  {
    value: 'available',
    label: 'Available',
    icon: Wifi,
    active: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30',
    idle: 'bg-white dark:bg-surface-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
  },
  {
    value: 'busy',
    label: 'Busy',
    icon: Zap,
    active: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30',
    idle: 'bg-white dark:bg-surface-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20',
  },
  {
    value: 'offline',
    label: 'Offline',
    icon: WifiOff,
    active: 'bg-surface-500 hover:bg-surface-600 text-white shadow-lg shadow-surface-200 dark:shadow-surface-900/30',
    idle: 'bg-white dark:bg-surface-800 text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700',
  },
];

const PRIORITY_COLORS = {
  low:       'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300',
  medium:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high:      'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

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

function EmptyState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-surface-400 dark:text-surface-500"
    >
      <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
      <p className="text-sm font-medium mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Refresh Requests
        </Button>
      )}
    </motion.div>
  );
}

export default function VolunteerDashboard() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('available');
  const [availability, setAvailability] = useState(user?.availability ?? 'available');
  const [availLoading, setAvailLoading] = useState(false);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);

  const [stats, setStats] = useState({
    availableCount: 0,
    assignedCount: 0,
    completedCount: 0,
    rating: 5.0,
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch all data
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setTabLoading(true);
    try {
      setFetchError(null);
      const [requestsRes, profileRes] = await Promise.all([
        api.get('/requests'),
        api.get('/profile').catch(() => null),
      ]);

      const all = requestsRes.data?.data?.requests ?? requestsRes.data?.data ?? requestsRes.data ?? [];
      const requestsList = Array.isArray(all) ? all : [];

      if (profileRes?.data?.data) {
        const prof = profileRes.data.data;
        if (prof.availability) setAvailability(prof.availability);
      }

      // Filter lists based on scoping
      const pending = requestsList.filter(r => r.status === 'pending');
      const assigned = requestsList.filter(r =>
        (r.status === 'accepted' || r.status === 'in_progress') &&
        (r.volunteer_id === user?.id || r.volunteer?.id === user?.id)
      );
      const completed = requestsList.filter(r =>
        r.status === 'completed' &&
        (r.volunteer_id === user?.id || r.volunteer?.id === user?.id)
      );

      setPendingRequests(pending);
      setAssignedRequests(assigned);
      setCompletedRequests(completed);

      setStats({
        availableCount: pending.length,
        assignedCount: assigned.length,
        completedCount: completed.length || user?.completed_tasks || 0,
        rating: user?.rating ?? 5.0,
      });
    } catch (err) {
      setFetchError(err.message || 'Failed to load dashboard requests');
      if (!isSilent) toast.error(err.message || 'Failed to load requests');
    } finally {
      if (!isSilent) {
        setTabLoading(false);
        setInitialLoading(false);
      }
    }
  }, [user?.id, user?.completed_tasks, user?.rating]);

  // Polling every 5 seconds for real-time updates
  useEffect(() => {
    loadDashboardData(false);
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Handle Availability Change
  const handleAvailability = async (newStatus) => {
    if (newStatus === availability || availLoading) return;
    const prev = availability;
    setAvailability(newStatus);
    setAvailLoading(true);
    try {
      await api.put('/profile', { availability: newStatus });
      updateUser({ availability: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      setAvailability(prev);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setAvailLoading(false);
    }
  };

  // Accept request
  const handleAccept = async (request) => {
    const id = request.id;
    const toastId = toast.loading('Accepting request…');
    try {
      await api.put(`/requests/${id}`, { status: 'accepted' });
      toast.success('Request accepted! 🎉', { id: toastId });
      loadDashboardData(false);
    } catch (err) {
      toast.error(err.message || 'Failed to accept request', { id: toastId });
    }
  };

  // Start in-progress
  const handleStartProgress = async (request) => {
    const id = request.id;
    const toastId = toast.loading('Starting task…');
    try {
      await api.put(`/requests/${id}`, { status: 'in_progress' });
      toast.success('Task marked as In Progress ⚡', { id: toastId });
      loadDashboardData(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update request', { id: toastId });
    }
  };

  // Mark complete
  const handleComplete = async (request) => {
    const id = request.id;
    const toastId = toast.loading('Completing request…');
    try {
      await api.put(`/requests/${id}`, { status: 'completed' });
      toast.success('Great job! Request marked completed ✅', { id: toastId });
      loadDashboardData(false);
    } catch (err) {
      toast.error(err.message || 'Failed to complete request', { id: toastId });
    }
  };

  // Tab requests resolver
  const currentRequests =
    activeTab === 'available' ? pendingRequests :
    activeTab === 'active'    ? assignedRequests : completedRequests;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 pb-12">

      {/* ── Page & Volunteer Info Header ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-6 sm:px-8 bg-white dark:bg-surface-800 rounded-3xl mb-8 border border-surface-100 dark:border-surface-700 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Volunteer Account
              </span>
              <span className="text-xs text-surface-400">Live Auto-Sync (5s)</span>
            </div>
            <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              {user?.name || 'Volunteer Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-surface-400" />
              <span>{user?.email || 'No email provided'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadDashboardData(false)}
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-8 space-y-8">

        {/* ── Dynamic Stat cards ─────────────────────────────────────────── */}
        {initialLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 rounded-3xl bg-surface-100 dark:bg-surface-800 animate-pulse" />
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
              value={stats.assignedCount}
              label="Assigned Requests"
              color="amber"
              index={1}
            />
            <StatCard
              icon={CheckCircle2}
              value={stats.completedCount}
              label="Completed Requests"
              color="green"
              index={2}
            />
            <StatCard
              icon={Star}
              value={Number(stats.rating).toFixed(1)}
              label="Volunteer Rating"
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
                My Availability Status
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                Set status to let elders know when you are ready to assist
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
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold
                      transition-all duration-200 focus:outline-none
                      disabled:opacity-60 disabled:cursor-not-allowed
                      ${isActive ? opt.active : opt.idle}
                    `}
                  >
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
          <div className="flex gap-2 mb-5 flex-wrap">
            {TABS.map(tab => {
              const count =
                tab.id === 'available' ? stats.availableCount :
                tab.id === 'active'    ? stats.assignedCount  : stats.completedCount;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-5 py-2.5 rounded-2xl text-sm font-semibold
                    transition-all duration-200 focus:outline-none
                    ${isSelected
                      ? 'gradient-primary text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                      : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                    }
                  `}
                >
                  {tab.label}
                  <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    isSelected ? 'bg-white/30 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Request Cards Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tabLoading && currentRequests.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-3xl bg-surface-100 dark:bg-surface-800 animate-pulse" />
                  ))}
                </div>
              ) : fetchError ? (
                <EmptyState message={fetchError} onRetry={() => loadDashboardData(false)} />
              ) : currentRequests.length === 0 ? (
                <EmptyState
                  message={
                    activeTab === 'available'
                      ? 'No pending requests right now. New requests will appear automatically.'
                      : activeTab === 'active'
                      ? "You don't have any assigned active requests."
                      : "You haven't completed any requests yet."
                  }
                  onRetry={() => loadDashboardData(false)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentRequests.map((request, index) => (
                    <div key={request.id} className="relative group">
                      <RequestCard
                        request={request}
                        role="volunteer"
                        index={index}
                        onView={setSelectedRequest}
                      />
                      <div className="mt-2 flex gap-2">
                        {activeTab === 'available' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => handleAccept(request)}
                          >
                            Accept Request
                          </Button>
                        )}
                        {activeTab === 'active' && request.status === 'accepted' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={PlayCircle}
                            className="w-full text-xs"
                            onClick={() => handleStartProgress(request)}
                          >
                            Start In Progress
                          </Button>
                        )}
                        {activeTab === 'active' && (request.status === 'in_progress' || request.status === 'accepted') && (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle2}
                            className="w-full text-xs"
                            onClick={() => handleComplete(request)}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </div>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${PRIORITY_COLORS[selectedRequest.priority] || PRIORITY_COLORS.low}`}>
                {selectedRequest.priority} priority
              </span>
              <Badge type={selectedRequest.status} label={selectedRequest.status.replace('_', ' ')} />
            </div>

            <InfoRow icon={User} label="Requester Name" value={selectedRequest.requester?.name} />
            <InfoRow icon={Phone} label="Requester Phone" value={selectedRequest.requester?.phone || 'Not provided'} />
            <InfoRow icon={MapPin} label="Location" value={selectedRequest.location || 'Not specified'} />
            <InfoRow icon={ClipboardList} label="Description" value={selectedRequest.description} />

            <div className="flex gap-3 pt-4">
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
              {selectedRequest.status === 'accepted' && (
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    handleStartProgress(selectedRequest);
                    setSelectedRequest(null);
                  }}
                >
                  Start Task
                </Button>
              )}
              {(selectedRequest.status === 'accepted' || selectedRequest.status === 'in_progress') && (
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
              <Button variant="secondary" size="md" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
