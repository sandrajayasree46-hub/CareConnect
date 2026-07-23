import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Home, PlusCircle, User, Settings, LogOut, Moon, Sun,
  Heart, Users, LayoutDashboard, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navItems = {
  elder: [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/request', icon: PlusCircle, label: 'Request Help' },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  volunteer: [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
};

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const items = navItems[user?.role] || navItems.elder;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen sticky top-0 bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 flex flex-col z-30 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-800 min-h-[72px]">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="gradient-primary p-1.5 rounded-xl">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-surface-900 dark:text-white whitespace-nowrap">
                CareConnect
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User pill */}
      <div className="px-3 py-4 border-b border-surface-100 dark:border-surface-800">
        <div className={`flex items-center gap-3 p-2 rounded-2xl bg-surface-50 dark:bg-surface-800 ${collapsed ? 'justify-center' : ''}`}>
          <div className="gradient-primary w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 font-medium text-sm
               ${isActive
                 ? 'gradient-primary text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                 : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white'}
               ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-surface-100 dark:border-surface-800 space-y-1">
        <button
          onClick={toggle}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
        >
          {dark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {dark ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
