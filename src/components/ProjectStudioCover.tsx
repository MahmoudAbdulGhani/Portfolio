import { useState } from "react";
import type { Project } from "../types";
import { ResponsiveProjectImage } from "./ResponsiveProjectImage";
import { projectScreens } from "../lib/project-presentation";
import { coverDirections } from "./cinematic/project-cover-directions";

// Keep complete product captures visible inside the shared gallery frame.
export function ProjectStudioCover({ project, priority = false }: { project: Project; priority?: boolean }) {
  // The arena's CMS cover is a landscape capture; its first dashboard is a
  // full-page portrait capture and belongs in the case-study image viewer.
  const primary = project.slug === "gamezone-arena"
    ? project.coverImage || projectScreens[project.slug]
    : project.screenshots?.[coverDirections[project.slug]?.screens[0]?.index ?? 0];
  const sources = [...new Set([primary, ...project.screenshots ?? [], projectScreens[project.slug], project.coverImage].filter((src): src is string => Boolean(src)))];
  const [failed, setFailed] = useState<string[]>([]);
  const source = sources.find(src => !failed.includes(src));
  const identity = project.slug === "medicare-hub" && source === projectScreens[project.slug];
  return <figure className={`gallery-product-cover ${identity ? "gallery-product-identity" : ""}`}>
    {source ? <ResponsiveProjectImage key={source} src={source} alt={identity ? `${project.name} project identity` : `${project.name} product interface`} priority={priority} sizes="(min-width: 1464px) 645px, (min-width: 1024px) calc((100vw - 174px) / 2), (min-width: 768px) calc((100vw - 94px) / 2), (min-width: 761px) calc(100vw - 80px), calc(100vw - 56px)" onError={() => setFailed(current => [...current, source])} /> : <span>Product preview unavailable</span>}
  </figure>;
}
