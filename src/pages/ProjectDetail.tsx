import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiExternalLink,
  FiGithub,
  FiUsers,
} from "react-icons/fi";
import { useProject } from "../lib/hooks";
import { PageMeta } from "../components/PageMeta";
import { ProjectVisual } from "../components/ProjectVisual";
import { Reveal } from "../components/Reveal";
import { formatDate } from "../lib/format";

function DetailSkeleton() {
  return (
    <main id="top" className="min-h-[60vh] pt-24 sm:pt-28">
      <div className="container-x">
        <div className="mb-8 h-4 w-32 animate-pulse rounded-full bg-surface-3" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="h-12 w-3/4 animate-pulse rounded-xl bg-surface-3" />
            <div className="mt-4 h-5 w-2/3 animate-pulse rounded-lg bg-surface-3" />
            <div className="mt-8 flex gap-3">
              <div className="h-11 w-36 animate-pulse rounded-lg bg-surface-3" />
              <div className="h-11 w-36 animate-pulse rounded-lg bg-surface-3" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="h-64 animate-pulse rounded-xl bg-surface-3" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, isError } = useProject(slug ?? "");

  if (isLoading) return <DetailSkeleton />;

  if (isError || !project) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 pt-24 text-center">
        <PageMeta title="Project not found" />
        <span className="font-mono text-5xl font-bold text-gradient">404</span>
        <h1 className="heading">Project not found</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          This project doesn't exist or may have been unpublished.
        </p>
        <Link to="/projects" className="btn-outline">
          <FiArrowLeft size={16} />
          Back to projects
        </Link>
      </main>
    );
  }

  return (
    <>
      <PageMeta
        title={project.name}
        description={project.description ?? undefined}
      />
      <main id="top" className="min-h-[60vh] pt-24 sm:pt-28">
        <div className="container-x">
          <Reveal>
            <Link
              to="/projects"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent"
            >
              <FiArrowLeft size={15} />
              All projects
            </Link>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="tag border-line bg-surface-2 text-muted">
                    {project.type}
                  </span>
                  {project.featured && (
                    <span className="tag border-gold/30 bg-gold/10 text-gold">
                      Featured
                    </span>
                  )}
                  {project.program && (
                    <span className="tag border-accent/25 bg-accent/10 text-accent">
                      {project.program}
                    </span>
                  )}
                </div>

                <h1 className="heading text-4xl sm:text-5xl">{project.name}</h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                  {project.tagline}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline group"
                    >
                      <FiGithub size={16} />
                      Source code
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary group"
                    >
                      <FiExternalLink size={16} />
                      Live demo
                    </a>
                  )}
                  {!project.demo && !project.github && (
                    <span className="chip">Source and demo pending</span>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <ProjectVisual
                  visual={project.visual}
                  name={project.name}
                  className="h-64 lg:h-full lg:min-h-72"
                />
              </div>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="space-y-10 lg:col-span-7">
              <Reveal>
                <h2 className="font-display text-xl font-bold text-ink">
                  Overview
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {project.overview}
                </p>
              </Reveal>

              <Reveal>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="card relative overflow-hidden p-6">
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-danger/60" aria-hidden />
                    <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-danger">
                      The problem
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {project.problem}
                    </p>
                  </div>
                  <div className="card relative overflow-hidden p-6">
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-ok/60" aria-hidden />
                    <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-ok">
                      The solution
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {project.solution}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal>
                <h2 className="font-display text-xl font-bold text-ink">
                  Key features
                </h2>
                <ul className="mt-4 space-y-3">
                  {project.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ok/15 text-ok">
                        <FiCheck size={12} />
                      </span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal>
                <div className="card space-y-6 p-6 lg:sticky lg:top-24">
                  <div>
                    <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-faint">
                      Tech stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((tech) => (
                        <span key={tech} className="chip">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {project.team && project.team.length > 0 && (
                    <div className="border-t border-line pt-5">
                      <h3 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-faint">
                        <FiUsers size={13} />
                        {project.team.length > 1 ? "Team" : "Built by"}
                      </h3>
                      <ul className="space-y-2">
                        {project.team.map((member) => (
                          <li
                            key={member}
                            className="flex items-center gap-3 text-sm text-muted"
                          >
                            <span className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface-2 font-mono text-[10px] font-bold text-accent">
                              {member
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            {member}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-faint">
                        Updated
                      </span>
                      <span className="font-semibold text-ink">
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-faint">
                        Status
                      </span>
                      <span className="font-semibold text-ok">
                        {project.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <a
                    href="#top"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                  >
                    Back to top
                    <FiArrowUpRight size={14} />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
