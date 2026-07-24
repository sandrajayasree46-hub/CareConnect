import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data?.data ?? {};
      const list = data.notifications || [];
      const newUnread = data.unread_count || 0;

      // Toast notification if new unread notification arrived
      setUnreadCount(prevUnread => {
        if (newUnread > prevUnread && prevUnread !== 0) {
          const newest = list.find(n => !n.read);
          if (newest) {
            toast(newest.title, { icon: '🔔' });
          }
        }
        return newUnread;
      });

      setNotifications(list);
    } catch {
      // Silently ignore polling errors
    }
  }, []);

  // Poll notifications every 5 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Marked all as read');
    } catch (err) {
      toast.error(err.message || 'Failed to update notifications');
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-900">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 px-6 py-4 flex items-center justify-between gap-4 shrink-0 relative z-20">
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">
              {getGreeting()}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-sm text-surface-400 dark:text-surface-500 capitalize">{user?.role} Account ({user?.email})</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative p-2.5 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-100 dark:border-surface-700 py-3 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 pb-3 border-b border-surface-100 dark:border-surface-700">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-500" />
                      <h3 className="font-bold text-sm text-surface-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-700/50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-surface-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3.5 flex items-start gap-3 transition-colors ${
                            n.read
                              ? 'bg-transparent'
                              : 'bg-blue-50/50 dark:bg-blue-900/10'
                          }`}
                        >
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-surface-900 dark:text-white leading-tight">
                              {n.title}
                            </h4>
                            <p className="text-xs text-surface-600 dark:text-surface-400 mt-0.5 leading-snug">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-surface-400 dark:text-surface-500 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button
                            onClick={e => handleDeleteNotification(n.id, e)}
                            className="p-1 rounded-lg text-surface-300 hover:text-red-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="gradient-primary w-9 h-9 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page content with scroll */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
