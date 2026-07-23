import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserCheck, Heart, ClipboardList, Clock, CheckCircle2,
  Trash2, ToggleLeft, ToggleRight, Search, Filter, RefreshCw,
  ShieldAlert, BarChart3, TrendingUp, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth }    from '../context/AuthContext';
import api             from '../services/api';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button }      from '../components/ui/Button';
import { Badge }       from '../components/ui/Badge';
import { Modal }       from '../components/ui/Modal';
import { StatCard }    from '../components/dashboard/StatCard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Tab definitions */
const TABS = ['Users', 'Requests'];

/** Role colour mapping for quick-filter pill labels */
const ROLE_COLORS = {
  admin:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  elder:     'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
  volunteer: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
};

/** Framer Motion variants for staggered table rows */
const rowVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * FilterBar – a compact toolbar with a text search input and a <select> dropdown.
 */
function FilterBar({ searchValue, onSearch, selectValue, onSelect, selectOptions, placeholder = 'Search…' }) {
  return (
    <div className="flex flex-wrap gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600
                     bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-100
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      {/* Dropdown filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
        <select
          value={selectValue}
          onChange={(e) => onSelect(e.target.value)}
          className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600
                     bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-100
                     text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition cursor-pointer"
        >
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
      </div>
    </div>
  );
}

/**
 * EmptyRow – rendered when a table has no matching rows.
 */
function EmptyRow({ cols, message = 'No records found.' }) {
  return (
    <tr>
      <td colSpan={cols} className="py-14 text-center text-surface-400 dark:text-surface-500 text-sm">
        {message}
      </td>
    </tr>
  );
}

/**
 * Th – a styled table header cell.
 */
function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider
                    text-surface-500 dark:text-surface-400 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

/**
 * Td – a styled table body cell.
 */
function Td({ children, className = '' }) {
  return (
    <td className={`px-5 py-4 text-sm text-surface-700 dark:text-surface-200 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * AdminDashboard
 *
 * Provides system-wide oversight for CareConnect admins:
 *  - Six summary stat cards loaded from /admin/stats
 *  - Users management table with toggle-active and delete
 *  - Requests overview table with delete
 *  - Analytics summary card with user/request breakdown
 */
export default function AdminDashboard() {
  const { user } = useAuth();

  // ── Data state ─────────────────────────────────────────────────────────────
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [requests, setRequests] = useState([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState('Users');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReqs,  setLoadingReqs]  = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // holds ID being acted on

  // ── Filter state – Users tab ───────────────────────────────────────────────
  const [userSearch,     setUserSearch]     = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // ── Filter state – Requests tab ────────────────────────────────────────────
  const [reqSearch,       setReqSearch]       = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('all');

  // ── Confirm-delete dialog state ────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, id: null, label: '' });

  // ── Data fetchers ──────────────────────────────────────────────────────────

  /** Load platform-wide statistics */
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data ?? res.data);
    } catch (err) {
      toast.error(`Stats: ${err.message}`);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /** Load all users */
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users');
      const list = res.data?.data?.users ?? res.data?.data ?? res.data ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(`Users: ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  /** Load all requests */
  const fetchRequests = useCallback(async () => {
    setLoadingReqs(true);
    try {
      const res = await api.get('/admin/requests');
      const list = res.data?.data?.requests ?? res.data?.data ?? res.data ?? [];
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(`Requests: ${err.message}`);
    } finally {
      setLoadingReqs(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchRequests();
  }, [fetchStats, fetchUsers, fetchRequests]);

  // ── User actions ───────────────────────────────────────────────────────────

  /** Toggle a user's active / inactive status */
  const handleToggleActive = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-active`);
      const updated = res.data?.data ?? res.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: updated.is_active } : u))
      );
      toast.success(`User ${updated.is_active ? 'activated' : 'deactivated'} successfully.`);
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /** Delete a user (called after modal confirmation) */
  const handleDeleteUser = async (userId) => {
    setDeleteModal({ open: false, type: null, id: null, label: '' });
    setActionLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted.');
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /** Delete a request (called after modal confirmation) */
  const handleDeleteRequest = async (reqId) => {
    setDeleteModal({ open: false, type: null, id: null, label: '' });
    setActionLoading(reqId);
    try {
      await api.delete(`/requests/${reqId}`);
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
      toast.success('Request deleted.');
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /** Open the confirmation modal */
  const confirmDelete = (type, id, label) =>
    setDeleteModal({ open: true, type, id, label });

  /** Dispatch deletion based on modal type */
  const handleConfirmDelete = () => {
    if (deleteModal.type === 'user')    handleDeleteUser(deleteModal.id);
    if (deleteModal.type === 'request') handleDeleteRequest(deleteModal.id);
  };

  // ── Filtered data ──────────────────────────────────────────────────────────

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole   = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredRequests = requests.filter((r) => {
    const elder = r.requester?.name ?? '';
    const q = reqSearch.toLowerCase();
    const matchSearch = r.assistance_type?.toLowerCase().includes(q) || elder.toLowerCase().includes(q);
    const matchStatus = reqStatusFilter === 'all' || r.status === reqStatusFilter;
    return matchSearch && matchStatus;
  });

  // ── In-memory analytics ────────────────────────────────────────────────────

  const analytics = (() => {
    const totalUsers    = users.length;
    const elders        = users.filter((u) => u.role === 'elder').length;
    const volunteers    = users.filter((u) => u.role === 'volunteer').length;
    const admins        = users.filter((u) => u.role === 'admin').length;
    const activeUsers   = users.filter((u) => u.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;

    const pending    = requests.filter((r) => r.status === 'pending').length;
    const completed  = requests.filter((r) => r.status === 'completed').length;
    const inProgress = requests.filter((r) => r.status === 'in_progress').length;
    const cancelled  = requests.filter((r) => r.status === 'cancelled').length;
    const emergency  = requests.filter((r) => r.priority === 'emergency').length;
    const completionRate = requests.length
      ? Math.round((completed / requests.length) * 100) : 0;

    return { elders, volunteers, admins, activeUsers, inactiveUsers, pending, completed, inProgress, cancelled, emergency, completionRate };
  })();

  // ── StatCard definitions ───────────────────────────────────────────────────

  const statCards = [
    { icon: Users,         label: 'Total Users',         value: stats?.total_users          ?? '—', color: 'blue'   },
    { icon: Heart,         label: 'Elders',               value: stats?.total_elders         ?? '—', color: 'amber'  },
    { icon: UserCheck,     label: 'Volunteers',           value: stats?.total_volunteers     ?? '—', color: 'green'  },
    { icon: ClipboardList, label: 'Total Requests',       value: stats?.total_requests       ?? '—', color: 'purple' },
    { icon: Clock,         label: 'Pending Requests',     value: stats?.pending_requests     ?? '—', color: 'red'    },
    { icon: CheckCircle2,  label: 'Completed Requests',   value: stats?.completed_requests   ?? '—', color: 'green'  },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 p-4 sm:p-6 lg:p-8">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
            <ShieldAlert className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
              Welcome back, {user?.name ?? 'Admin'} — full platform overview
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={() => { fetchStats(); fetchUsers(); fetchRequests(); }}
        >
          Refresh
        </Button>
      </motion.div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={loadingStats ? '…' : card.value}
            color={card.color}
            index={i}
          />
        ))}
      </div>

      {/* ── Analytics Summary Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mb-8"
      >
        <Card>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Analytics Summary</CardTitle>
          </div>

          {/* User breakdown tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Elders',     value: analytics.elders,        color: 'text-amber-600  dark:text-amber-400'    },
              { label: 'Volunteers', value: analytics.volunteers,     color: 'text-blue-600   dark:text-blue-400'     },
              { label: 'Admins',     value: analytics.admins,         color: 'text-purple-600 dark:text-purple-400'   },
              { label: 'Active',     value: analytics.activeUsers,    color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Inactive',   value: analytics.inactiveUsers,  color: 'text-surface-400 dark:text-surface-500' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 p-3 rounded-2xl bg-surface-50 dark:bg-surface-700/50"
              >
                <span className={`text-2xl font-extrabold ${item.color}`}>{item.value}</span>
                <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Request status strip */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label: 'Pending',     value: analytics.pending,    bg: 'bg-amber-50   dark:bg-amber-900/20',    text: 'text-amber-700  dark:text-amber-300'    },
              { label: 'In Progress', value: analytics.inProgress, bg: 'bg-purple-50  dark:bg-purple-900/20',   text: 'text-purple-700 dark:text-purple-300'   },
              { label: 'Completed',   value: analytics.completed,  bg: 'bg-emerald-50 dark:bg-emerald-900/20',  text: 'text-emerald-700 dark:text-emerald-300' },
              { label: 'Cancelled',   value: analytics.cancelled,  bg: 'bg-surface-100 dark:bg-surface-700',    text: 'text-surface-500 dark:text-surface-400' },
              { label: 'Emergency',   value: analytics.emergency,  bg: 'bg-red-50     dark:bg-red-900/20',      text: 'text-red-700    dark:text-red-400'      },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-2 px-4 py-2 rounded-full ${item.bg}`}>
                <span className={`text-base font-bold ${item.text}`}>{item.value}</span>
                <span className={`text-xs font-medium ${item.text} opacity-80`}>{item.label}</span>
              </div>
            ))}

            {/* Completion rate */}
            <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {analytics.completionRate}% completion rate
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Animated Tab Switcher ── */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl w-fit mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none
              ${activeTab === tab
                ? 'text-white'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
              }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="tabBg"
                className="absolute inset-0 rounded-xl gradient-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Panels ── */}
      <AnimatePresence mode="wait">

        {/* ════════ USERS TAB ════════ */}
        {activeTab === 'Users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="p-0 overflow-hidden">
              <CardHeader className="px-6 pt-6 pb-0">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <CardTitle>All Users</CardTitle>
                  <span className="text-xs text-surface-400 font-medium">
                    {filteredUsers.length} of {users.length} users
                  </span>
                </div>

                <FilterBar
                  searchValue={userSearch}
                  onSearch={setUserSearch}
                  selectValue={userRoleFilter}
                  onSelect={setUserRoleFilter}
                  placeholder="Search by name or email…"
                  selectOptions={[
                    { value: 'all',       label: 'All Roles'  },
                    { value: 'elder',     label: 'Elders'     },
                    { value: 'volunteer', label: 'Volunteers' },
                    { value: 'admin',     label: 'Admins'     },
                  ]}
                />
              </CardHeader>

              {/* Horizontally scrollable table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead className="bg-surface-50 dark:bg-surface-700/40 border-y border-surface-100 dark:border-surface-700">
                    <tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Status</Th>
                      <Th>Joined</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                    {loadingUsers ? (
                      /* Skeleton loading rows */
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 6 }).map((__, j) => (
                            <Td key={j}>
                              <div className="h-4 bg-surface-200 dark:bg-surface-600 rounded-lg w-24" />
                            </Td>
                          ))}
                        </tr>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <EmptyRow cols={6} message="No users match your filters." />
                    ) : (
                    filteredUsers.map((u, i) => (
                        <motion.tr
                          key={u.id}
                          custom={i}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors"
                        >
                          {/* Name + avatar initial */}
                          <Td>
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center
                                            text-xs font-bold text-white shrink-0
                                            ${u.role === 'admin' ? 'bg-purple-500' : u.role === 'elder' ? 'bg-amber-500' : 'bg-blue-500'}`}
                              >
                                {u.name?.charAt(0).toUpperCase() ?? '?'}
                              </div>
                              <span className="font-medium text-surface-900 dark:text-white">{u.name}</span>
                            </div>
                          </Td>

                          {/* Email */}
                          <Td className="text-surface-500 dark:text-surface-400">{u.email}</Td>

                          {/* Role badge */}
                          <Td>
                            <Badge
                              type={u.role}
                              label={u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            />
                          </Td>

                          {/* Active status pill */}
                          <Td>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                ${u.is_active
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                  : 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
                                }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-surface-400'}`} />
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </Td>

                          {/* Joined date */}
                          <Td className="text-surface-400">
                            {u.created_at
                              ? new Date(u.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                })
                              : '—'}
                          </Td>

                          {/* Actions */}
                          <Td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle active/inactive */}
                              <button
                                onClick={() => handleToggleActive(u.id)}
                                disabled={actionLoading === u.id}
                                title={u.is_active ? 'Deactivate user' : 'Activate user'}
                                className={`p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400
                                  disabled:opacity-40 disabled:cursor-not-allowed
                                  ${u.is_active
                                    ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                    : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
                                  }`}
                              >
                                {actionLoading === u.id
                                  ? <RefreshCw className="w-5 h-5 animate-spin" />
                                  : u.is_active
                                    ? <ToggleRight className="w-5 h-5" />
                                    : <ToggleLeft  className="w-5 h-5" />
                                }
                              </button>

                              {/* Delete – disabled for self */}
                              <button
                                onClick={() => confirmDelete('user', u.id, u.name ?? u.email)}
                                disabled={actionLoading === u.id || u.id === user?.id}
                                title={u.id === user?.id ? 'Cannot delete yourself' : 'Delete user'}
                                className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                                           hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400
                                           disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </Td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ════════ REQUESTS TAB ════════ */}
        {activeTab === 'Requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="p-0 overflow-hidden">
              <CardHeader className="px-6 pt-6 pb-0">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <CardTitle>All Requests</CardTitle>
                  <span className="text-xs text-surface-400 font-medium">
                    {filteredRequests.length} of {requests.length} requests
                  </span>
                </div>

                <FilterBar
                  searchValue={reqSearch}
                  onSearch={setReqSearch}
                  selectValue={reqStatusFilter}
                  onSelect={setReqStatusFilter}
                  placeholder="Search by type or elder name…"
                  selectOptions={[
                    { value: 'all',         label: 'All Statuses' },
                    { value: 'pending',     label: 'Pending'      },
                    { value: 'accepted',    label: 'Accepted'     },
                    { value: 'in_progress', label: 'In Progress'  },
                    { value: 'completed',   label: 'Completed'    },
                    { value: 'cancelled',   label: 'Cancelled'    },
                  ]}
                />
              </CardHeader>

              {/* Horizontally scrollable table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-surface-50 dark:bg-surface-700/40 border-y border-surface-100 dark:border-surface-700">
                    <tr>
                      <Th>Type</Th>
                      <Th>Elder</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                      <Th className="text-right">Action</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                    {loadingReqs ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 6 }).map((__, j) => (
                            <Td key={j}>
                              <div className="h-4 bg-surface-200 dark:bg-surface-600 rounded-lg w-20" />
                            </Td>
                          ))}
                        </tr>
                      ))
                    ) : filteredRequests.length === 0 ? (
                      <EmptyRow cols={6} message="No requests match your filters." />
                    ) : (
                      filteredRequests.map((r, i) => {
                        const elderName = r.requester?.name ?? '—';
                        const typeLabel = r.assistance_type
                          ? r.assistance_type.charAt(0).toUpperCase() + r.assistance_type.slice(1).replace(/_/g, ' ')
                          : '—';

                        return (
                          <motion.tr
                            key={r.id}
                            custom={i}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors"
                          >
                            {/* Request type */}
                            <Td>
                              <span className="font-medium text-surface-900 dark:text-white">{typeLabel}</span>
                            </Td>

                            {/* Elder name */}
                            <Td className="text-surface-500 dark:text-surface-400">{elderName}</Td>

                            {/* Priority badge */}
                            <Td>
                              <Badge type={r.priority ?? 'low'} label={r.priority ?? 'Low'} />
                            </Td>

                            {/* Status badge */}
                            <Td>
                              <Badge
                                type={r.status}
                                label={r.status?.replace(/_/g, ' ')}
                              />
                            </Td>

                            {/* Created date */}
                            <Td className="text-surface-400">
                              {r.created_at
                                ? new Date(r.created_at).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                  })
                                : '—'}
                            </Td>

                            {/* Delete action */}
                            <Td className="text-right">
                              <button
                                onClick={() => confirmDelete('request', r.id, typeLabel)}
                                disabled={actionLoading === r.id}
                                title="Delete request"
                                className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                                           hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400
                                           disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                {actionLoading === r.id
                                  ? <RefreshCw className="w-5 h-5 animate-spin" />
                                  : <Trash2 className="w-5 h-5" />
                                }
                              </button>
                            </Td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm Delete Modal ── */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, id: null, label: '' })}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-surface-700 dark:text-surface-200 text-sm leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-surface-900 dark:text-white">
              &ldquo;{deleteModal.label}&rdquo;
            </span>?
            <br />
            <span className="text-red-500 font-medium">This action cannot be undone.</span>
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteModal({ open: false, type: null, id: null, label: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
