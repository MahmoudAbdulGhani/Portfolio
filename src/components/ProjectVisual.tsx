import { cn } from "../lib/format";
import { normalizeProjectAccent } from "../lib/project-accent";

interface ProjectVisualProps {
  visual: string;
  name: string;
  className?: string;
  showLabel?: boolean;
}

export function ProjectVisual({
  visual,
  name,
  className,
  showLabel = true,
}: ProjectVisualProps) {
  const accent = normalizeProjectAccent(visual);

  return (
    <div
      aria-hidden
      style={{ backgroundColor: accent }}
      className={cn(
        "group relative h-44 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-25 bg-grid" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {showLabel && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
          <span className="rounded-md bg-black/20 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
            {name}
          </span>
          <span className="h-px flex-1 bg-white/25" />
        </div>
      )}
    </div>
  );
}
