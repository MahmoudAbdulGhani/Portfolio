import { useEffect, useState } from "react";
import { FiArrowDown, FiArrowUp, FiCheck, FiChevronDown, FiPlus, FiTrash2 } from "react-icons/fi";
import { PageMeta } from "../../components/PageMeta";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { ErrorState, SaveIndicator, StatusBadge } from "../../components/admin/AdminUI";
import { useAdminSiteContent, useUpdateSiteContent } from "../../lib/hooks";
import { formatDate } from "../../lib/format";
import type { SiteSection } from "../../types";

const humanize = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

function StructuredFields({ value, onChange, path = "content" }: { value: Record<string, unknown>; onChange: (value: Record<string, unknown>) => void; path?: string }) {
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  return <div className="space-y-4">{Object.entries(value).map(([key, entry]) => {
    const id = `${path}-${key}`;
    if (typeof entry === "boolean") return <label key={key} className="flex min-h-10 items-center gap-3 text-sm font-semibold text-ink"><input type="checkbox" checked={entry} onChange={(event) => set(key, event.target.checked)} />{humanize(key)}</label>;
    if (typeof entry === "string") return <label key={key} htmlFor={id} className="field-label">{humanize(key)}<textarea id={id} className="textarea mt-1 min-h-20 normal-case tracking-normal" value={entry} onChange={(event) => set(key, event.target.value)} /></label>;
    if (Array.isArray(entry)) {
      const rows = entry as unknown[];
      const newRow = rows[0] && typeof rows[0] === "object" ? Object.fromEntries(Object.entries(rows[0] as Record<string, unknown>).map(([field, sample]) => [field, typeof sample === "boolean" ? true : ""])) : "";
      return <fieldset key={key} className="rounded-xl border border-line bg-surface-2/40 p-4"><legend className="px-2 text-sm font-bold text-ink">{humanize(key)}</legend><div className="space-y-3">{rows.map((row, index) => <div key={index} className="rounded-lg border border-line bg-surface p-3"><div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10px] font-bold uppercase text-faint">Item {index + 1}</span><div className="flex gap-1"><button type="button" className="btn-icon-sm admin-row-action" disabled={!index} aria-label={`Move item ${index + 1} up`} onClick={() => { const next = [...rows]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; set(key, next); }}><FiArrowUp /></button><button type="button" className="btn-icon-sm admin-row-action" disabled={index === rows.length - 1} aria-label={`Move item ${index + 1} down`} onClick={() => { const next = [...rows]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; set(key, next); }}><FiArrowDown /></button><button type="button" className="btn-icon-sm admin-row-action-danger" aria-label={`Delete item ${index + 1}`} onClick={() => set(key, rows.filter((_, i) => i !== index))}><FiTrash2 /></button></div></div>{typeof row === "string" ? <input className="input" value={row} onChange={(event) => set(key, rows.map((item, i) => i === index ? event.target.value : item))} /> : row && typeof row === "object" ? <StructuredFields value={row as Record<string, unknown>} path={`${id}-${index}`} onChange={(next) => set(key, rows.map((item, i) => i === index ? next : item))} /> : null}</div>)}<button type="button" className="btn-outline btn-sm" onClick={() => set(key, [...rows, newRow])}><FiPlus />Add item</button></div></fieldset>;
    }
    if (entry && typeof entry === "object") return <fieldset key={key} className="rounded-xl border border-line p-4"><legend className="px-2 text-sm font-bold text-ink">{humanize(key)}</legend><StructuredFields value={entry as Record<string, unknown>} path={id} onChange={(next) => set(key, next)} /></fieldset>;
    return null;
  })}</div>;
}

export function SiteContentAdmin() {
  const query = useAdminSiteContent();
  const update = useUpdateSiteContent();
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [dirty, setDirty] = useState(false);
  if (query.data && sections.length === 0 && !dirty) setSections(query.data);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  const patch = (index: number, value: Partial<SiteSection>) => { setSections((rows) => rows.map((row, i) => i === index ? { ...row, ...value } : row)); setDirty(true); };
  if (query.isLoading) return <div className="space-y-4" aria-busy="true"><div className="h-9 w-48 animate-pulse rounded bg-surface-3" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-2" />)}</div>;
  if (query.isError) return <ErrorState title="Unable to load site content" message={query.error.message} onRetry={() => void query.refetch()} />;
  const saveState = update.isPending ? "saving" : update.isError ? "error" : dirty ? "dirty" : update.isSuccess ? "saved" : "idle";
  return <div className="mx-auto max-w-5xl space-y-6"><PageMeta title="Site Content" noIndex />
    <AdminPageHeader title="About & Section Content" description="Edit public headings, calls to action, structured cards, footer copy, and SEO content." meta={<SaveIndicator state={saveState} />} />
    <div className="space-y-3">{sections.map((section, index) => <details key={section.key} className="group card overflow-hidden" open={index === 0}>
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:px-6"><FiChevronDown className="shrink-0 text-muted transition-transform group-open:rotate-180" /><div className="min-w-0 flex-1"><h2 className="font-display font-bold text-ink">{humanize(section.key)}</h2><p className="mt-0.5 truncate text-xs text-muted">{section.heading || "No public heading yet"}</p></div><StatusBadge tone={section.visible ? "success" : "neutral"}>{section.visible ? "Visible" : "Hidden"}</StatusBadge>{section.updatedAt && <span className="hidden font-mono text-[10px] text-faint sm:block">Updated {formatDate(section.updatedAt)}</span>}</summary>
      <div className="space-y-5 border-t border-line p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><label className="flex min-h-10 items-center gap-3 text-sm font-semibold text-ink"><input type="checkbox" checked={section.visible} onChange={(event) => patch(index, { visible: event.target.checked })} />Show this section on the portfolio</label><label className="flex items-center gap-2 text-xs font-semibold text-muted">Display order<input type="number" className="input w-20" value={section.order} onChange={(event) => patch(index, { order: Number(event.target.value) })} /></label></div>
        <div className="grid gap-4 sm:grid-cols-2">{(["eyebrow", "heading", "ctaLabel", "ctaUrl"] as const).map((key) => <label key={key} className="field-label">{humanize(key)}<input type={key === "ctaUrl" ? "url" : "text"} className="input mt-1 normal-case tracking-normal" value={section[key] ?? ""} onChange={(event) => patch(index, { [key]: event.target.value || null })} /></label>)}</div><label className="field-label">Description<textarea className="textarea mt-1 min-h-24 normal-case tracking-normal" value={section.description ?? ""} onChange={(event) => patch(index, { description: event.target.value || null })} /></label><StructuredFields value={section.content} onChange={(content) => patch(index, { content })} /></div>
    </details>)}</div>
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 p-3 shadow-card-lg backdrop-blur"><SaveIndicator state={saveState} /><button className="btn-primary" disabled={!dirty || update.isPending} onClick={() => update.mutate(sections, { onSuccess: (saved) => { setSections(saved); setDirty(false); } })}><FiCheck />{update.isPending ? "Saving…" : "Save section content"}</button></div>{update.error && <p role="alert" className="text-sm font-semibold text-danger">{update.error.message}</p>}
  </div>;
}
