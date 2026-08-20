import type { ReactNode } from "react";
import { FiAlertCircle, FiSearch } from "react-icons/fi";
import { cn } from "../../lib/format";

export function AdminSection({ title, description, actions, children, className }: { title: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={cn("admin-section", className)}>
    <div className="admin-section-header">
      <div><h2 className="admin-section-title">{title}</h2>{description && <p className="admin-section-description">{description}</p>}</div>
      {actions && <div className="admin-section-actions">{actions}</div>}
    </div>
    <div className="admin-section-body">{children}</div>
  </section>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return <span className={cn("status-badge", `status-badge-${tone}`)}>{children}</span>;
}

export function SearchField({ value, onChange, placeholder = "Search", label = "Search" }: { value: string; onChange: (value: string) => void; placeholder?: string; label?: string }) {
  return <label className="search-field">
    <span className="sr-only">{label}</span><FiSearch aria-hidden="true" />
    <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
  </label>;
}

export function ErrorState({ title = "Unable to load content", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return <div role="alert" className="admin-state admin-state-error"><FiAlertCircle aria-hidden="true" /><div><h2>{title}</h2>{message && <p>{message}</p>}{onRetry && <button type="button" className="btn-outline btn-sm mt-4" onClick={onRetry}>Try again</button>}</div></div>;
}

export function SaveIndicator({ state }: { state: "idle" | "dirty" | "saving" | "saved" | "error" }) {
  const labels = { idle: "No changes", dirty: "Unsaved changes", saving: "Saving changes…", saved: "Saved to database", error: "Changes not saved" };
  return <span className={cn("save-indicator", `save-indicator-${state}`)} role="status"><span aria-hidden="true" />{labels[state]}</span>;
}
