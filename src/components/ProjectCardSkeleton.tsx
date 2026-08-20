export function ProjectCardSkeleton() {
  return (
    <div
      className="grid animate-pulse grid-cols-1 gap-8 border-t border-line py-12 lg:grid-cols-12"
      aria-hidden="true"
    >
      <div className="lg:col-span-4">
        <div className="h-3 w-24 rounded bg-surface-3" />
        <div className="mt-4 h-6 w-3/5 rounded bg-surface-3" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-surface-3" />
          <div className="h-3 w-4/5 rounded bg-surface-3" />
        </div>
        <div className="mt-5 flex gap-2">
          <div className="h-6 w-16 rounded-full bg-surface-3" />
          <div className="h-6 w-20 rounded-full bg-surface-3" />
        </div>
      </div>
      <div className="lg:col-span-8">
        <div className="aspect-video rounded-lg bg-surface-3" />
      </div>
    </div>
  );
}