import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import type { Project } from "../types";
import { ProjectVisual } from "./ProjectVisual";
import { normalizeProjectAccent } from "../lib/project-accent";

export function ProjectCard({ project }: { project: Project }) {
  const accent = normalizeProjectAccent(project.visual);

  return (
    <article className="group grid grid-cols-1 items-start gap-8 border-t border-line py-12 transition-colors duration-300 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <span className="tech-label">{project.type}</span>
        <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-ink transition-colors duration-200 group-hover:text-accent">
          <Link to={`/projects/${project.slug}`} viewTransition>{project.name}</Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {project.tagline || project.description}
        </p>
        {project.impactSummary && (
          <p className="mt-2 font-mono text-[11px] text-faint">
            {project.impactSummary}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.slice(0, 4).map((tech) => (
            <span key={tech} className="chip">
              {tech}
            </span>
          ))}
          {project.stack.length > 4 && (
            <span className="chip">+{project.stack.length - 4}</span>
          )}
        </div>
        <Link
          to={`/projects/${project.slug}`}
          viewTransition
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-strong"
        >
          Read case study
          <FiArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>

      <div className="lg:col-span-8">
        <div
          className="relative overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-xl"
          style={
            {
              "--card-accent": accent,
              viewTransitionName: `project-${project.slug}`,
            } as React.CSSProperties
          }
        >
          <div
            className="pointer-events-none absolute -inset-1 rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <Link
            to={`/projects/${project.slug}`}
            viewTransition
            aria-label={project.name}
            className="relative block overflow-hidden"
          >
            <ProjectVisual
              visual={project.visual}
              name={project.name}
              image={project.coverImage}
              imageAlt={project.imageAlt}
              type={project.type}
              stack={project.stack}
              className="aspect-video h-auto transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </Link>
          <div className="relative flex items-center gap-2.5 border-t border-line bg-surface px-3.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
            <span className="shrink-0 text-accent">Project</span>
            <span className="shrink-0 text-line-strong" aria-hidden>|</span>
            <span className="min-w-0 truncate text-muted">{project.name}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
