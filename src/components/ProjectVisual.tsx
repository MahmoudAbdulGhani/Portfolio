import { cn } from "../lib/format";
import { normalizeProjectAccent } from "../lib/project-accent";

interface ProjectVisualProps {
  visual: string;
  name: string;
  className?: string;
  image?: string | null;
  type?: string;
  stack?: string[];
  priority?: boolean;
  variant?: "card" | "hero";
}

export function ProjectVisual({
  visual,
  name,
  className,
  image,
  type,
  stack = [],
  priority = false,
  variant = "card",
}: ProjectVisualProps) {
  const accent = normalizeProjectAccent(visual);
  const initials = name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      aria-hidden
      style={{ backgroundColor: image ? "var(--surface-2)" : accent }}
      className={cn(
        "group relative overflow-hidden",
        !className && "h-44",
        image && variant !== "hero" && "project-image-frame",
        className,
      )}
    >
      {image && (
        <img
          src={image}
          alt=""
          width={1600}
          height={900}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className={variant === "hero" ? "project-foreground-hero" : "project-foreground"}
        />
      )}
      {!image && <div className="project-fallback-cover"><div className="project-fallback-orbit" aria-hidden /><div className="project-fallback-top"><span>{type || "Case study"}</span><span>Selected work</span></div><div className="project-fallback-main"><span className="project-fallback-monogram">{initials}</span><div><strong>{name}</strong><span>{stack.slice(0, 3).join(" · ") || "Project case study"}</span></div></div></div>}
    </div>
  );
}
