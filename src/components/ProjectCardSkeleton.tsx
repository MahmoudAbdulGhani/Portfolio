export function ProjectCardSkeleton() {
  return (
    <div className="card h-full overflow-hidden" aria-hidden="true">
      <div className="aspect-[16/7] animate-pulse bg-surface-3" />
      <div className="space-y-4 p-6">
        <div className="h-5 w-24 animate-pulse rounded-full bg-surface-3" />
        <div className="h-6 w-3/5 animate-pulse rounded bg-surface-3" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-surface-3" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-surface-3" />
        </div>
        <div className="flex gap-2 pt-3">
          <div className="h-7 w-16 animate-pulse rounded-full bg-surface-3" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-surface-3" />
        </div>
      </div>
    </div>
  );
}
