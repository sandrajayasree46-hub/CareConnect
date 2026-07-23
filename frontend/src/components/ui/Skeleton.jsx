/**
 * Loading skeleton components for async content placeholders.
 */
export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-surface-200 dark:bg-surface-700 ${className}`} />
  );
}

export function RequestCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-3xl p-6 card-shadow border border-surface-100 dark:border-surface-700 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-3xl p-6 card-shadow border border-surface-100 dark:border-surface-700 space-y-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
