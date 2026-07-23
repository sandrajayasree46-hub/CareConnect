/**
 * Card component – rounded white/dark surface with shadow.
 */
export function Card({ children, className = '', glass = false, ...props }) {
  const base =
    'rounded-3xl p-6 transition-all duration-200';
  const surface = glass
    ? 'glass card-shadow'
    : 'bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 card-shadow';

  return (
    <div className={`${base} ${surface} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-bold text-surface-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}
