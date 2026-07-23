import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Dashboard stat card with icon, value, label, and optional trend indicator.
 */
export function StatCard({ icon: Icon, value, label, color = 'blue', trend, index = 0 }) {
  const colorMap = {
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-600 dark:text-blue-400',   num: 'text-blue-600 dark:text-blue-400' },
    green:   { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', num: 'text-emerald-600 dark:text-emerald-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', num: 'text-amber-600 dark:text-amber-400' },
    red:     { bg: 'bg-red-50 dark:bg-red-900/20',     icon: 'text-red-600 dark:text-red-400',     num: 'text-red-600 dark:text-red-400' },
    purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', num: 'text-purple-600 dark:text-purple-400' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
      className="bg-white dark:bg-surface-800 rounded-3xl p-6 card-shadow border border-surface-100 dark:border-surface-700 hover:card-shadow-lg transition-all duration-300 group cursor-default"
    >
      <div className={`inline-flex p-3 rounded-2xl ${c.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-7 h-7 ${c.icon}`} />
      </div>
      <div className={`text-3xl font-extrabold ${c.num} mb-1`}>{value}</div>
      <div className="text-sm font-medium text-surface-500 dark:text-surface-400">{label}</div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-surface-400'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {trend > 0 ? '+' : ''}{trend}% this week
        </div>
      )}
    </motion.div>
  );
}
