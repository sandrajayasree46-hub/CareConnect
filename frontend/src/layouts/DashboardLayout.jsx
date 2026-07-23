import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard layout: collapsible sidebar + top bar + main content area.
 */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-900">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">
              {getGreeting()}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-sm text-surface-400 dark:text-surface-500 capitalize">{user?.role} Account</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
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
