import { Link } from "react-router-dom";
import { useRef } from "react";
import { FiArrowRight, FiExternalLink, FiGithub, FiUsers } from "react-icons/fi";
import type { Project } from "../types";
import { ProjectVisual } from "./ProjectVisual";

export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement>(null);

  const updateTilt = (event: React.PointerEvent<HTMLElement>) => {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    cardRef.current?.style.setProperty("--card-tilt-x", `${(-y * 2.2).toFixed(2)}deg`);
    cardRef.current?.style.setProperty("--card-tilt-y", `${(x * 2.2).toFixed(2)}deg`);
  };

  const resetTilt = () => {
    cardRef.current?.style.setProperty("--card-tilt-x", "0deg");
    cardRef.current?.style.setProperty("--card-tilt-y", "0deg");
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
      className="card project-card-tilt group flex h-full min-h-full flex-col overflow-hidden"
    >
      <Link to={`/projects/${project.slug}`} aria-label={project.name} tabIndex={-1}>
        <div className="project-card-media transition-transform duration-500 ease-out group-hover:scale-[1.02]">
          <ProjectVisual visual={project.visual} name={project.name} image={project.coverImage} type={project.type} stack={project.stack} className="aspect-video h-auto" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <span className="tag border-line bg-surface-2 text-muted">
            {project.type}
          </span>
          {project.featured && (
            <span className="tag border-gold/30 bg-gold/10 text-gold">
              Featured
            </span>
          )}
          {project.team && project.team.length > 1 && (
            <span className="tag border-ok/25 bg-ok/10 text-ok">
              <FiUsers size={12} />
              {project.team.length}
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-bold leading-snug text-ink transition-colors duration-200 group-hover:text-accent">
          <Link to={`/projects/${project.slug}`}>{project.name}</Link>
        </h3>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">
          {project.description}
        </p>

        {project.program && (
          <p className="mt-3.5 font-mono text-xs text-faint">
            <span className="font-semibold text-accent">{project.program}</span>
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap gap-2">
            {project.stack.slice(0, 4).map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
            {project.stack.length > 4 && (
              <span className="chip">+{project.stack.length - 4}</span>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-sm flex-1"
              >
                <FiGithub size={14} />
                Code
              </a>
            )}
            {project.demo ? (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-sm group/btn flex-1"
              >
                <FiExternalLink size={14} />
                Live Demo
              </a>
            ) : (
              <Link
                to={`/projects/${project.slug}`}
                className="btn-primary btn-sm group/btn flex-1"
              >
                Case Study
                <FiArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
