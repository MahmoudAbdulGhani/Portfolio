import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  eyebrow,
  actions,
  meta,
}: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div className="min-w-0">
        {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
        <h1 className="admin-heading">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </header>
  );
}
