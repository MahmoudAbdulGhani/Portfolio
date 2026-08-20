import { Link } from "react-router-dom";
import { useProfile } from "../lib/hooks";

interface LogoProps {
  to?: string;
  showLabel?: boolean;
}

export function Logo({ to = "/", showLabel = true }: LogoProps) {
  const { data: profile, isLoading } = useProfile();
  return (
    <Link to={to} className="group flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-2 font-display text-sm font-bold text-ink ring-1 ring-line transition-all duration-300 group-hover:ring-accent/50">
        <span className="text-gradient">MA</span>
      </span>
      {showLabel && (
        <span className="hidden flex-col sm:flex">
          <span className="font-display text-sm font-bold leading-tight text-ink">
            {isLoading ? "Loading…" : profile?.shortName || profile?.name}
          </span>
          <span className="font-mono text-[11px] text-muted">
            {isLoading ? "" : profile?.title}
          </span>
        </span>
      )}
    </Link>
  );
}
