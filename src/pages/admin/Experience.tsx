import { useState } from "react";
import { FiArrowDown, FiArrowUp, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import { PageMeta } from "../../components/PageMeta";
import { useAdminProfile, useUpdateProfile } from "../../lib/hooks";
import type { ExperienceItem } from "../../types";

const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const blank = (): ExperienceItem => ({ role: "", company: "", description: "", startDate: null, endDate: null, isCurrent: false, location: "", workArrangement: "", bullets: [], technologies: [], published: true, showOnCv: true, cvDescription: "", cvBullets: [] });

export function ExperienceAdmin() {
  const profile = useAdminProfile();
  const update = useUpdateProfile();
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  if (profile.data && !loaded) { setItems(profile.data.experience); setLoaded(true); }
  const patch = <K extends keyof ExperienceItem>(index: number, key: K, value: ExperienceItem[K]) => setItems((rows) => rows.map((row, i) => i === index ? { ...row, [key]: value } : row));
  const move = (index: number, delta: number) => setItems((rows) => { const next = [...rows]; const target = index + delta; if (target < 0 || target >= next.length) return rows; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const save = () => update.mutate({ experience: items }, { onSuccess: (saved) => setItems(saved.experience) });
  if (profile.isLoading) return <p className="text-sm text-muted">Loading experience…</p>;
  if (profile.isError) return <div role="alert" className="card p-6"><p className="text-danger">{profile.error.message}</p><button className="btn-outline mt-4" onClick={() => void profile.refetch()}>Retry</button></div>;

  return <div className="mx-auto max-w-4xl space-y-6">
    <PageMeta title="Manage Experience" noIndex />
    <div><h1 className="admin-heading">Experience</h1><p className="mt-1 text-sm text-muted">Manage public and CV-specific experience content.</p></div>
    {items.length === 0 && <div className="card border-dashed p-8 text-center text-sm text-muted">No experience yet. Add the first entry below.</div>}
    <div className="space-y-4">{items.map((item, index) => <section key={item.id ?? index} className="card p-5">
      <div className="mb-4 flex items-center justify-between"><span className="font-mono text-xs text-faint">Order {index + 1}</span><div className="flex gap-1"><button type="button" className="btn-icon border border-line" onClick={() => move(index, -1)} disabled={!index} aria-label="Move up"><FiArrowUp /></button><button type="button" className="btn-icon border border-line" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down"><FiArrowDown /></button><button type="button" className="btn-icon border border-line text-danger" onClick={() => setItems((rows) => rows.filter((_, i) => i !== index))} aria-label="Delete"><FiTrash2 /></button></div></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">Role<input className="input mt-1" value={item.role ?? ""} onChange={(e) => patch(index, "role", e.target.value)} /></label>
        <label className="field-label">Company<input className="input mt-1" value={item.company ?? ""} onChange={(e) => patch(index, "company", e.target.value)} /></label>
        <label className="field-label">Start date<input type="month" className="input mt-1" value={item.startDate ?? ""} onChange={(e) => patch(index, "startDate", e.target.value || null)} /></label>
        <label className="field-label">End date<input type="month" className="input mt-1" disabled={item.isCurrent} value={item.endDate ?? ""} onChange={(e) => patch(index, "endDate", e.target.value || null)} /></label>
        <label className="field-label">Location<input className="input mt-1" value={item.location ?? ""} onChange={(e) => patch(index, "location", e.target.value)} /></label>
        <label className="field-label">Work arrangement<input className="input mt-1" value={item.workArrangement ?? ""} onChange={(e) => patch(index, "workArrangement", e.target.value)} placeholder="Remote, hybrid, or on-site" /></label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink"><input type="checkbox" checked={item.isCurrent ?? false} onChange={(e) => { patch(index, "isCurrent", e.target.checked); if (e.target.checked) patch(index, "endDate", null); }} />Currently working / Present</label>
        <div className="flex flex-wrap gap-4"><label className="flex items-center gap-2 text-sm font-semibold text-ink"><input type="checkbox" checked={item.published !== false} onChange={(e) => patch(index, "published", e.target.checked)} />Published</label><label className="flex items-center gap-2 text-sm font-semibold text-ink"><input type="checkbox" checked={item.showOnCv !== false} onChange={(e) => patch(index, "showOnCv", e.target.checked)} />Show on CV</label></div>
        <label className="field-label sm:col-span-2">Public summary<textarea className="textarea mt-1 min-h-24" value={item.description ?? ""} onChange={(e) => patch(index, "description", e.target.value)} /></label>
        <label className="field-label sm:col-span-2">Public bullets — one per line<textarea className="textarea mt-1 min-h-24" value={(item.bullets ?? []).join("\n")} onChange={(e) => patch(index, "bullets", lines(e.target.value))} /></label>
        <label className="field-label sm:col-span-2">Technologies — one per line<textarea className="textarea mt-1 min-h-20" value={(item.technologies ?? []).join("\n")} onChange={(e) => patch(index, "technologies", lines(e.target.value))} /></label>
        <label className="field-label sm:col-span-2">CV-specific summary<textarea className="textarea mt-1 min-h-20" value={item.cvDescription ?? ""} onChange={(e) => patch(index, "cvDescription", e.target.value)} /></label>
        <label className="field-label sm:col-span-2">CV bullets — one per line<textarea className="textarea mt-1 min-h-24" value={(item.cvBullets ?? []).join("\n")} onChange={(e) => patch(index, "cvBullets", lines(e.target.value))} /></label>
      </div>
    </section>)}</div>
    <div className="flex flex-wrap gap-3"><button type="button" className="btn-outline" onClick={() => setItems((rows) => [...rows, blank()])}><FiPlus />Add experience</button><button type="button" className="btn-primary" onClick={save} disabled={update.isPending}><FiCheck />{update.isPending ? "Saving…" : "Save experience"}</button>{update.isSuccess && <span className="self-center text-sm font-semibold text-ok">Saved</span>}</div>
    {update.error && <p role="alert" className="text-sm text-danger">{update.error.message}</p>}
  </div>;
}
