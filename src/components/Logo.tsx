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
      <img className="portfolio-monogram h-10 w-10 object-contain" src="/brand/ma-monogram.webp" alt="MA" width="40" height="40" />
      {showLabel && (
        <span className="hidden flex-col sm:flex">
          <span className="portfolio-logo-name font-display text-sm font-bold leading-tight text-ink">
            {isLoading ? "Loading…" : profile?.shortName || profile?.name}
          </span>
          <span className="portfolio-logo-title font-mono text-[11px] text-muted">
            {isLoading ? "" : profile?.title}
          </span>
        </span>
      )}
    </Link>
  );
}
