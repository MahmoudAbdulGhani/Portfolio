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
      <span className="portfolio-monogram grid h-10 w-10 place-items-center font-display text-xl font-bold text-accent">
        <span>MA<span className="text-ink">.</span></span>
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
