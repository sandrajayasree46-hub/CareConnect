/**
 * Accessible input with label, icon support, and error display.
 * Large sizing for elderly usability.
 */
export function Input({
  label,
  id,
  error,
  icon: Icon,
  className = '',
  textarea = false,
  ...props
}) {
  const inputClass = `
    w-full px-4 py-3.5 text-base rounded-2xl border transition-all duration-200
    bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white
    placeholder:text-surface-400 dark:placeholder:text-surface-500
    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error
      ? 'border-red-400 focus:ring-red-400'
      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'}
    ${Icon ? 'pl-12' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-surface-700 dark:text-surface-200">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-surface-500 pointer-events-none" />
        )}
        {textarea ? (
          <textarea id={id} className={inputClass} rows={4} {...props} />
        ) : (
          <input id={id} className={inputClass} {...props} />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

export function Select({ label, id, error, options = [], className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-surface-700 dark:text-surface-200">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full px-4 py-3.5 text-base rounded-2xl border transition-all duration-200
          bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
          ${error ? 'border-red-400' : 'border-surface-200 dark:border-surface-700'}
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}
