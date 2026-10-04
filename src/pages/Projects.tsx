import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useProjects, useSiteSection } from "../lib/hooks";
import { PageMeta } from "../components/PageMeta";
import { ProjectStudioCover } from "../components/ProjectStudioCover";
import "./projects-gallery.css";

type FilterId = "all" | "program" | "personal";
type ProjectFilter = { id: FilterId; label: string };

export function Projects() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const { data: section } = useSiteSection("projectsPage");
  const reduced = useReducedMotion();
  const filters = Array.isArray(section?.content.filters) ? section.content.filters as ProjectFilter[] : [];
  const [filter, setFilter] = useState<FilterId>("all");
  const filtered = useMemo(() => {
    const all = projects ?? [];
    return filter === "program" ? all.filter(p => p.program) : filter === "personal" ? all.filter(p => !p.program) : all;
  }, [projects, filter]);
  const subtitle = typeof section?.content.gallerySubtitle === "string" ? section.content.gallerySubtitle : "Built end to end.";
  return <>
    <PageMeta title={typeof section?.content.seoTitle === "string" ? section.content.seoTitle : section?.heading ?? ""} description={typeof section?.content.seoDescription === "string" ? section.content.seoDescription : section?.description ?? ""} />
    <main className="cinema projects-gallery">
      <header className="gallery-intro">
        <div className="gallery-heading">
          <p className="gallery-eyebrow">{section?.eyebrow ?? ""}</p>
          <h1>{section?.heading ?? ""}<em>{subtitle}</em></h1>
          <p className="gallery-description">{section?.description}</p>
        </div>
        <div className="gallery-tools">
          <div className="gallery-filters" role="group" aria-label="Filter projects">
            {filters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
          </div>
          <p className="gallery-count" aria-live="polite" aria-atomic="true">{isLoading ? "Loading projects…" : isError ? "Projects unavailable" : `${filtered.length} ${filtered.length === 1 ? "project" : "projects"}`}</p>
        </div>
      </header>
      <motion.div className="gallery-grid" layout={!reduced}>
        {isLoading && Array.from({ length: 4 }, (_, index) => <div className="gallery-skeleton" key={index} aria-hidden="true"><div /><span /></div>)}
        <AnimatePresence initial={false} mode="popLayout">
          {filtered.map((project, index) => <motion.article className="gallery-project" key={project.id} layout={!reduced} initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : Math.min(index * 0.04, 0.16), ease: [0.22, 1, 0.36, 1] }}>
            <Link to={`/projects/${project.slug}`} className="gallery-image-link" aria-label={`View ${project.name}`}>
              <ProjectStudioCover project={project} priority={index < 2} />
            </Link>
            <div className="gallery-caption">
              <h2><span aria-hidden="true">{String(index + 1).padStart(2, "0")} /</span><Link to={`/projects/${project.slug}`}>{project.name}</Link></h2>
              <Link className="gallery-case-link" to={`/projects/${project.slug}`} aria-label={`Read ${project.name} case study`}>Read case study<FiArrowRight aria-hidden="true" /></Link>
            </div>
            <p className="gallery-summary">{project.tagline || project.description}</p>
            <ul className="gallery-stack" aria-label={`${project.name} technologies`}>{project.stack.slice(0, 3).map(tech => <li key={tech}>{tech}</li>)}</ul>
          </motion.article>)}
        </AnimatePresence>
      </motion.div>
      {!isLoading && isError && <div className="gallery-state" role="alert"><h2>Projects are temporarily unavailable</h2><p>Please try again in a moment.</p><button onClick={() => void refetch()} type="button">Try again<FiArrowRight aria-hidden="true" /></button></div>}
      {!isLoading && !isError && filtered.length === 0 && <div className="gallery-state"><h2>No projects in this category yet</h2><p>Choose another category to explore more work.</p></div>}
    </main>
  </>;
}
