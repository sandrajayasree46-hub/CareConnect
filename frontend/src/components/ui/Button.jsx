import { clsx } from 'clsx';

/**
 * Reusable button component with variants and sizes.
 * Designed for accessibility – large tap targets suitable for elderly users.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon: Icon,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 select-none';

  const variants = {
    primary:
      'gradient-primary text-white focus:ring-blue-300 hover:opacity-90 shadow-lg shadow-blue-200 dark:shadow-blue-900/30',
    secondary:
      'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 focus:ring-surface-300 card-shadow',
    danger:
      'gradient-danger text-white focus:ring-red-300 hover:opacity-90 shadow-lg shadow-red-200 dark:shadow-red-900/30',
    success:
      'gradient-success text-white focus:ring-emerald-300 hover:opacity-90 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30',
    ghost:
      'bg-transparent text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 focus:ring-surface-200',
    sos:
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400 shadow-xl shadow-red-300 dark:shadow-red-900/40 text-xl font-bold tracking-wide animate-pulse hover:animate-none',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
    xl: 'px-10 py-5 text-xl min-h-[64px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-5 h-5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
