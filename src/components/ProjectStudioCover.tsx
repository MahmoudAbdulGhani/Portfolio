import { useState } from "react";
import type { Project } from "../types";
import { ResponsiveProjectImage } from "./ResponsiveProjectImage";
import { projectScreens } from "../lib/project-presentation";
import { coverDirections } from "./cinematic/project-cover-directions";

// Match editorial case studies with real product captures, without studio artwork.
export function ProjectStudioCover({ project, priority = false }: { project: Project; priority?: boolean }) {
  const primary = project.screenshots?.[coverDirections[project.slug]?.screens[0]?.index ?? 0];
  const sources = [...new Set([primary, ...project.screenshots ?? [], projectScreens[project.slug], project.coverImage].filter((src): src is string => Boolean(src)))];
  const [failed, setFailed] = useState<string[]>([]);
  const source = sources.find(src => !failed.includes(src));
  const identity = project.slug === "medicare-hub" && source === projectScreens[project.slug];
  return <figure className={`gallery-product-cover ${identity ? "gallery-product-identity" : ""}`}>
    {source ? <ResponsiveProjectImage src={source} alt={identity ? `${project.name} project identity` : `${project.name} product interface`} priority={priority} sizes="(min-width: 768px) 640px, 92vw" onError={() => setFailed(current => [...current, source])} /> : <span>Product preview unavailable</span>}
  </figure>;
}
