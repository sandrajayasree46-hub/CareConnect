import { Outlet } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

/**
 * Minimal layout for Login/Register pages.
 */
export default function AuthLayout() {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="gradient-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-surface-900 dark:text-white">CareConnect</span>
        </a>
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl text-surface-500 hover:bg-white/50 dark:hover:bg-surface-800 transition-colors"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-surface-400 dark:text-surface-500">
        © {new Date().getFullYear()} CareConnect. Connecting care, one request at a time.
      </footer>
    </div>
  );
}
