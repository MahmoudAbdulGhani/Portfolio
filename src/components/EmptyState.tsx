import { useId } from "react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

function InboxIllustration() {
  const gradientId = useId();
  return (
    <svg
      width="96"
      height="72"
      viewBox="0 0 96 72"
      fill="none"
      aria-hidden
      focusable="false"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <ellipse
        cx="48"
        cy="36"
        rx="34"
        ry="22"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      <circle cx="76" cy="16" r="2.5" fill="var(--accent)" />
      <circle cx="18" cy="52" r="2" fill="var(--accent-2)" />
      <rect
        x="26"
        y="22"
        width="44"
        height="30"
        rx="6"
        fill="var(--surface-2)"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
      />
      <path
        d="M26 27 L48 41 L70 27"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M70 52 V31 L48 46 L26 31 V52"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
    </svg>
  );
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="card relative flex flex-col items-center gap-5 overflow-hidden px-6 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(30rem 18rem at 50% 0%, color-mix(in oklab, var(--accent) 7%, transparent), transparent 70%)",
        }}
        aria-hidden
      />
      <InboxIllustration />
      <div className="relative">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">{description}</p>
      </div>
      {children && <div className="relative">{children}</div>}
    </div>
  );
}