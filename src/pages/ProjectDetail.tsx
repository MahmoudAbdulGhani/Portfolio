import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiExternalLink,
  FiGithub,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
import { useProject, useProjects } from "../lib/hooks";
import { PageMeta } from "../components/PageMeta";
import { ProjectVisual } from "../components/ProjectVisual";
import { Reveal } from "../components/Reveal";
import { ScrollProgress } from "../components/ScrollProgress";
import { EngineeringCaseStudy } from "../components/EngineeringCaseStudy";
import { ResponsiveProjectImage } from "../components/ResponsiveProjectImage";
import { cn, formatDate } from "../lib/format";
import type { Project } from "../types";

function DetailSkeleton() {
  return (
    <main id="top" className="min-h-[60vh] pt-16 sm:pt-20">
      <div className="container-x">
        <div className="mb-8 h-4 w-32 animate-pulse rounded-full bg-surface-3" />
        <div className="mx-auto aspect-[16/10] w-full max-w-5xl animate-pulse rounded-xl bg-surface-3" />
        <div className="mx-auto mt-12 max-w-4xl text-center">
          <div className="mx-auto h-12 w-3/4 animate-pulse rounded-xl bg-surface-3" />
          <div className="mx-auto mt-4 h-5 w-2/3 animate-pulse rounded-lg bg-surface-3" />
          <div className="mt-8 flex justify-center gap-3">
            <div className="h-11 w-36 animate-pulse rounded-lg bg-surface-3" />
            <div className="h-11 w-36 animate-pulse rounded-lg bg-surface-3" />
          </div>
        </div>
      </div>
    </main>
  );
}

function NextProjectBar({ next, visible }: { next: Project; visible: boolean }) {
  return (
    <nav
      aria-label="Next project"
      aria-hidden={!visible}
      className={cn("next-project-bar", visible && "next-project-bar--visible")}
    >
      <Link
        to={`/projects/${next.slug}`}
        tabIndex={visible ? undefined : -1}
        className="group flex items-center gap-3 rounded-xl border border-line bg-surface/90 p-3 pr-4 shadow-card-lg backdrop-blur transition-colors hover:border-accent/40"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
            Next project
          </span>
          <span className="mt-0.5 block truncate font-display text-sm font-bold text-ink">
            {next.name}
          </span>
        </span>
        <FiArrowRight
          size={17}
          className="shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>
    </nav>
  );
}

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, isError } = useProject(slug ?? "");
  const { data: projects } = useProjects();
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const galleryTriggerRef = useRef<HTMLElement | null>(null);
  const galleryImages = project
    ? [project.coverImage, ...(project.screenshots ?? [])].filter((src): src is string => Boolean(src))
    : [];

  const galleryOpen = activeImage !== null;

  const published = (projects ?? []).filter((p) => p.published);
  const projectIndex = published.findIndex((p) => p.slug === slug);
  const nextProject = projectIndex >= 0 ? published[(projectIndex + 1) % published.length] : undefined;
  const showNextBar = Boolean(nextProject && project && nextProject.slug !== project.slug);

  useEffect(() => {
    const trigger = topRef.current;
    if (!trigger || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [project?.id]);

  useEffect(() => {
    if (!galleryOpen) return;
    galleryTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label$="image gallery"]');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowLeft") setActiveImage((current) => current === null ? null : (current - 1 + galleryImages.length) % galleryImages.length);
      if (event.key === "ArrowRight") setActiveImage((current) => current === null ? null : (current + 1) % galleryImages.length);
      if (event.key === "Tab") {
        const focusable = [...(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? [])].filter((element) => element.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => dialog?.querySelector<HTMLElement>("button")?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      galleryTriggerRef.current?.focus();
    };
  }, [galleryOpen, galleryImages.length]);

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

  const team = project.team ?? [];
  const contributions = project.contributions ?? [];
  const publishYear = new Date(project.createdAt).getUTCFullYear();
  const heroUrl = (() => {
    try {
      return new URL(project.demo ?? "").hostname.replace(/^www\./, "");
    } catch {
      return `/projects/${project.slug}`;
    }
  })();

  return (
    <>
      <ScrollProgress />
      <PageMeta
        title={project.name}
        description={project.description ?? undefined}
        image={project.coverImage}
        canonicalPath={`/projects/${project.slug}`}
      />
      <main id="top" className="min-h-[60vh] pb-16 pt-16 sm:pb-24 sm:pt-20">
        <div className="container-x min-w-0">
          <div ref={topRef}>
            <Reveal>
              <Link
                to="/projects"
                className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent"
              >
                <FiArrowLeft size={15} />
                All projects
              </Link>
            </Reveal>

            <Reveal>
              <figure className="relative mx-auto max-w-5xl">
                <div className="project-hero-glow" aria-hidden />
                <div className="project-hero-window aspect-[16/10]">
                  <div className="project-hero-chrome" aria-hidden>
                    <span className="project-hero-url">{heroUrl}</span>
                  </div>
                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    <span className="project-hero-shine" aria-hidden />
                    <span
                      className="project-hero-corner project-hero-corner--tl"
                      aria-hidden
                      style={{ animationDelay: "0.6s" }}
                    />
                    <span
                      className="project-hero-corner project-hero-corner--tr"
                      aria-hidden
                      style={{ animationDelay: "0.7s" }}
                    />
                    <span
                      className="project-hero-corner project-hero-corner--bl"
                      aria-hidden
                      style={{ animationDelay: "0.8s" }}
                    />
                    <span
                      className="project-hero-corner project-hero-corner--br"
                      aria-hidden
                      style={{ animationDelay: "0.9s" }}
                    />
                    {project.coverImage ? (
                      <button
                        type="button"
                        onClick={() => setActiveImage(0)}
                        className="block h-full w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        aria-label={`View ${project.name} cover image full screen`}
                      >
                        <ProjectVisual
                          visual={project.visual}
                          name={project.name}
                          image={project.coverImage}
                          imageAlt={project.imageAlt}
                          type={project.type}
                          stack={project.stack}
                          priority
                          variant="hero"
                          className="h-full w-full"
                        />
                      </button>
                    ) : (
                      <ProjectVisual
                        visual={project.visual}
                        name={project.name}
                        type={project.type}
                        stack={project.stack}
                        variant="hero"
                        className="h-full w-full"
                      />
                    )}
                  </div>
                </div>
                <div className="project-hero-floor" aria-hidden />
                <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="text-accent">Fig. 01</span>
                    <span className="text-line-strong" aria-hidden>/</span>
                    <span className="min-w-0 truncate text-muted">{project.name}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2 text-faint">
                    <span>{project.type}</span>
                    <span className="text-line-strong" aria-hidden>·</span>
                    <span>{publishYear}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>

            <Reveal>
              <div className="mx-auto max-w-4xl pt-12 text-center sm:pt-16">
                <span className="tech-label">{project.type}</span>
                <h1 className="mt-4 break-words font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
                  {project.name}
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-lg">
                  {project.tagline}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs text-faint">
                  <span>{project.type}</span>
                  <span className="text-line-strong" aria-hidden>·</span>
                  <span>{publishYear}</span>
                  {project.teamSize && (
                    <>
                      <span className="text-line-strong" aria-hidden>·</span>
                      <span>{project.teamSize}-person team</span>
                    </>
                  )}
                  {project.program && (
                    <>
                      <span className="text-line-strong" aria-hidden>·</span>
                      <span>{project.program}</span>
                    </>
                  )}
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline group min-h-11 w-full justify-center sm:w-auto"
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
                      className="btn-primary group min-h-11 w-full justify-center sm:w-auto"
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
            </Reveal>
          </div>

          <div className="mx-auto mt-14 max-w-4xl sm:mt-16">
            <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="min-w-0 space-y-10 lg:col-span-8">
                <Reveal>
                  <h2 className="tech-label">Overview</h2>
                  <p className="mt-4 text-[17px] leading-relaxed text-muted">
                    {project.overview}
                  </p>
                </Reveal>

                <Reveal>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                    <div className="card p-5 sm:p-6">
                      <span className="tech-label text-danger">The problem</span>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {project.problem}
                      </p>
                    </div>
                    <div className="card p-5 sm:p-6">
                      <span className="tech-label text-ok">The solution</span>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {project.solution}
                      </p>
                    </div>
                  </div>
                </Reveal>

                <Reveal>
                  <h2 className="tech-label">Key features</h2>
                  <ul className="mt-4 space-y-3">
                    {project.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex min-w-0 items-start gap-3 rounded-lg border border-line bg-surface px-3.5 py-3 text-sm text-muted sm:px-4"
                      >
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ok/15 text-ok">
                          <FiCheck size={12} />
                        </span>
                        <span className="min-w-0 break-words leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal>
                  <h2 className="tech-label">Tech stack</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span key={tech} className="chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                </Reveal>
              </div>

              <aside className="min-w-0 lg:col-span-4">
                <Reveal>
                  <div className="card min-w-0 space-y-6 p-5 sm:p-6">
                    {(project.myRole || project.ownership || contributions.length > 0) && (
                      <div>
                        <h3 className="tech-label">My role</h3>
                        {project.myRole && (
                          <p className="mt-2 break-words font-display text-lg font-bold text-ink">
                            {project.myRole}
                          </p>
                        )}
                        {project.teamSize && (
                          <p className="mt-1 font-mono text-xs text-faint">
                            {project.teamSize} people
                          </p>
                        )}
                        {project.ownership && (
                          <p className="mt-4 text-sm leading-relaxed text-muted">
                            <span className="block font-mono text-[10px] uppercase tracking-wider text-faint">
                              What I owned
                            </span>
                            {project.ownership}
                          </p>
                        )}
                        {contributions.length > 0 && (
                          <ul className="mt-4 space-y-2.5">
                            {contributions.map((item) => (
                              <li
                                key={item}
                                className="flex min-w-0 gap-2.5 text-sm leading-relaxed text-muted"
                              >
                                <FiCheck className="mt-0.5 shrink-0 text-ok" />
                                <span className="min-w-0 break-words">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {team.length > 0 && (
                      <div className="border-t border-line pt-5">
                        <h3 className="tech-label">{team.length > 1 ? "Team" : "Built by"}</h3>
                        <ul className="mt-3 space-y-2">
                          {team.map((member) => (
                            <li
                              key={member}
                              className="flex min-w-0 items-center gap-3 text-sm text-muted"
                            >
                              <span className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface-2 font-mono text-[10px] font-bold text-accent">
                                {member
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </span>
                              <span className="min-w-0 break-words">{member}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 border-t border-line pt-5 text-sm min-[360px]:grid-cols-2">
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
              </aside>
            </div>

            {project.screenshots && project.screenshots.length > 0 && (
              <section className="mt-14 sm:mt-16">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="tech-label">Screenshots</h2>
                    <p className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">
                      Gallery
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-line bg-surface-2 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-faint">
                    {project.screenshots.length} images
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-2">
                  {(galleryExpanded ? project.screenshots : project.screenshots.slice(0, 6)).map((src, index) => (
                    <button
                      type="button"
                      key={`${src}-${index}`}
                      onClick={() => setActiveImage((project.coverImage ? 1 : 0) + index)}
                      className="project-gallery-frame group min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span className="project-gallery-image-wrap">
                        <ResponsiveProjectImage
                          src={src}
                          alt={`${project.name} screenshot ${index + 1}`}
                          sizes="(min-width: 1024px) 416px, 100vw"
                          className="project-gallery-img"
                        />
                        <span className="project-gallery-expand" aria-hidden>
                          <FiMaximize2 size={16} />
                        </span>
                      </span>
                      <span className="project-gallery-caption">
                        <span>Screenshot {String(index + 1).padStart(2, "0")}</span>
                        <span>View full size</span>
                      </span>
                    </button>
                  ))}
                </div>
                {project.screenshots.length > 6 && (
                  <div className="mt-7 flex justify-center sm:mt-8">
                    <button
                      type="button"
                      className="btn-outline group min-h-11 w-full justify-center sm:w-auto"
                      aria-expanded={galleryExpanded}
                      onClick={() => setGalleryExpanded((expanded) => !expanded)}
                    >
                      {galleryExpanded ? (
                        <>
                          <FiChevronUp size={17} />
                          Show fewer screenshots
                        </>
                      ) : (
                        <>
                          <FiChevronDown size={17} />
                          Show {project.screenshots.length - 6} more screenshots
                        </>
                      )}
                    </button>
                  </div>
                )}
              </section>
            )}
            <EngineeringCaseStudy architecture={project.architecture} codeDiffs={project.codeDiffs} benchmarks={project.benchmarks} views={project.views} />
          </div>
        </div>
      </main>
      {showNextBar && nextProject && (
        <NextProjectBar next={nextProject} visible={barVisible} />
      )}
      {activeImage !== null && galleryImages[activeImage] && <div role="dialog" aria-modal="true" aria-label={`${project.name} image gallery`} className="fixed inset-0 z-[100] flex h-[100dvh] min-w-0 items-center justify-center overflow-hidden bg-black/95 px-2 pb-20 pt-16 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveImage(null); }}><button type="button" onClick={() => setActiveImage(null)} className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:right-6 sm:top-6" aria-label="Close gallery"><FiX size={22} /></button>{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage - 1 + galleryImages.length) % galleryImages.length)} className="absolute left-5 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:grid" aria-label="Previous image"><FiChevronLeft size={28} /></button>}<ResponsiveProjectImage src={galleryImages[activeImage]} alt={`${project.name} full-size image ${activeImage + 1}`} sizes="96vw" priority className="block max-h-[calc(100dvh-9rem)] max-w-[96vw] object-contain sm:max-h-[85vh] sm:max-w-[88vw]" />{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage + 1) % galleryImages.length)} className="absolute right-5 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:grid" aria-label="Next image"><FiChevronRight size={28} /></button>}<div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-center gap-3 sm:bottom-5">{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage - 1 + galleryImages.length) % galleryImages.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/70 text-white sm:hidden" aria-label="Previous image"><FiChevronLeft size={24} /></button>}<span className="rounded-full border border-white/10 bg-black/70 px-3 py-2 font-mono text-xs text-white">{activeImage + 1} / {galleryImages.length}</span>{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage + 1) % galleryImages.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/70 text-white sm:hidden" aria-label="Next image"><FiChevronRight size={24} /></button>}</div></div>}
    </>
  );
}
