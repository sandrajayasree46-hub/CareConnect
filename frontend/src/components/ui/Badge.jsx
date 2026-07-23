/**
 * Badge component for status/priority indicators.
 */
const colorMap = {
  // statuses
  pending:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  accepted:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  completed:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled:   'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400',
  // priorities
  low:         'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300',
  medium:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high:        'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  emergency:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  // volunteer availability
  available:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  busy:        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  offline:     'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400',
};

export function Badge({ label, type, className = '' }) {
  const colors = colorMap[type] || 'bg-surface-100 text-surface-600';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${colors} ${className}`}>
      {label || type}
    </span>
  );
}
