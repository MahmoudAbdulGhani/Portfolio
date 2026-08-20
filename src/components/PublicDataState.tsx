export function PublicDataState({ loading, error, onRetry, label }: { loading: boolean; error: boolean; onRetry: () => void; label: string }) {
  if (loading) return <section className="section" aria-busy="true"><div className="container-x"><div className="h-32 animate-pulse rounded-xl bg-surface-2" /><span className="sr-only">Loading {label}…</span></div></section>;
  if (error) return <section className="section"><div className="container-x"><div role="alert" className="rounded-xl border border-danger/25 bg-danger/5 p-8 text-center"><p className="text-sm font-semibold text-ink">Unable to load {label}</p><button type="button" className="btn-outline mt-4" onClick={onRetry}>Try again</button></div></div></section>;
  return null;
}
