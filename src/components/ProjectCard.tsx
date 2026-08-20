import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import type { Project } from "../types";
import { ProjectVisual } from "./ProjectVisual";

const impactNotes: Record<string, string> = {
  "gamezone-arena": "Live availability · time-slot conflict detection · Stripe payments",
  lobby: "Persistent identities · temporary guest rooms · real-time voice",
  unihub: "Role-based portals for students, professors and administrators",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group grid grid-cols-1 items-start gap-8 border-t border-line py-12 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <span className="tech-label">{project.type}</span>
        <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-ink transition-colors duration-200 group-hover:text-accent">
          <Link to={`/projects/${project.slug}`}>{project.name}</Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {project.tagline || project.description}
        </p>
        {impactNotes[project.slug] && (
          <p className="mt-2 font-mono text-[11px] text-faint">
            {impactNotes[project.slug]}
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
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-strong"
        >
          Read case study
          <FiArrowRight size={14} aria-hidden />
        </Link>
      </div>

      <div className="lg:col-span-8">
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <Link
            to={`/projects/${project.slug}`}
            aria-label={project.name}
            className="block"
          >
            <ProjectVisual
              visual={project.visual}
              name={project.name}
              image={project.coverImage}
              type={project.type}
              stack={project.stack}
              className="aspect-video h-auto"
            />
          </Link>
          <div className="flex items-center gap-2.5 border-t border-line px-3.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
            <span className="shrink-0 text-accent">Project</span>
            <span className="shrink-0 text-line-strong" aria-hidden>|</span>
            <span className="min-w-0 truncate text-muted">{project.name}</span>
          </div>
        </div>
      </div>
    </article>
  );
}