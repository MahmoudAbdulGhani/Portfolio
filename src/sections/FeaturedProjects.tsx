import { useProjects, useSiteSection } from "../lib/hooks";
import { PublicDataState } from "../components/PublicDataState";
import { CinematicProjects } from "../components/cinematic/CinematicProjects";

export function FeaturedProjects() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const { data: section } = useSiteSection("featuredProjects");
  // The legacy section heading/description describe the former three-card grid.
  // Keep the approved gallery defaults and offer editable CMS overrides without
  // carrying that stale copy into the new five-project composition.
  const content = section?.content ?? {};
  if (section?.visible === false) return null;
  if (isLoading || isError) return <PublicDataState loading={isLoading} error={isError} onRetry={() => void refetch()} label="featured projects" />;
  return <CinematicProjects
    projects={projects ?? []}
    eyebrow={typeof content.cinematicEyebrow === "string" ? content.cinematicEyebrow : "03 / PROJECTS"}
    heading={typeof content.cinematicHeading === "string" && content.cinematicHeading.trim() ? content.cinematicHeading : "Selected work"}
    description={typeof content.cinematicDescription === "string" ? content.cinematicDescription : undefined}
    ctaLabel={section?.ctaLabel || "View all projects"}
    allProjectsHref={section?.ctaUrl || "/projects"}
  />;
}
