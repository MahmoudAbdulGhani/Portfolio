import { useState } from "react";
import type { Project } from "../types";

// Art direction uses captured product pixels; names, order and visibility stay CMS-owned.
const screens: Record<string, string> = {
  "jobpilot-ai": "/projects/cinematic/jobpilot-screen.webp",
  lobby: "/projects/lobby/cover.webp",
  "gamezone-arena": "/projects/gamezone-arena/cover.webp",
  "construction-project-management-accounting-system": "/projects/cinematic/cedar-screen.webp",
  unihub: "/projects/unihub/usercourses.webp",
  "full-stack-user-management-system": "/projects/user-management/dashboard.webp",
  "home-services": "/projects/cinematic/home-services.webp",
  "medicare-hub": "/projects/cinematic/medicare-logo.webp",
};

export function ProjectStudioCover({ project, priority = false }: { project: Project; priority?: boolean }) {
  const sources = [...new Set([screens[project.slug], project.coverImage, ...project.screenshots ?? []].filter((source): source is string => Boolean(source)))];
  const [failed, setFailed] = useState<string[]>([]);
  const source = sources.find(src => !failed.includes(src));
  const logo = project.slug === "medicare-hub" && source === screens[project.slug];
  const loading = priority ? "eager" : "lazy";
  if (!source) return <div className="gallery-cover gallery-cover-unavailable"><span>Preview unavailable</span></div>;
  const screen = <img className="gallery-screen-image" src={source} alt={project.imageAlt || `${project.name} ${logo ? "logo" : "interface"}`} loading={loading} fetchPriority={priority ? "high" : "auto"} decoding="async" draggable={false} onError={() => setFailed(previous => [...previous, source])} />;
  return <div className={`gallery-cover ${logo ? "gallery-cover-logo" : "gallery-cover-device"}`}>
    {!logo && <img className="gallery-studio" src="/projects/cinematic/studio.webp" alt="" loading={loading} decoding="async" />}
    {logo ? screen : <div className="gallery-laptop">
      <div className="gallery-screen">{screen}</div>
      <img className="gallery-device-image" src="/projects/cinematic/laptop-studio.webp" alt="" width="1499" height="744" loading={loading} decoding="async" />
    </div>}
  </div>;
}
