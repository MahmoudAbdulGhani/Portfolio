import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiExternalLink,
  FiGithub,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiUsers,
  FiX,
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
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const galleryImages = project
    ? [project.coverImage, ...(project.screenshots ?? [])].filter((src): src is string => Boolean(src))
    : [];

  useEffect(() => {
    if (activeImage === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowLeft") setActiveImage((current) => current === null ? null : (current - 1 + galleryImages.length) % galleryImages.length);
      if (event.key === "ArrowRight") setActiveImage((current) => current === null ? null : (current + 1) % galleryImages.length);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImage, galleryImages.length]);

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
        image={project.coverImage || "/myphoto.jpeg"}
        canonicalPath={`/projects/${project.slug}`}
      />
      <main id="top" className="min-h-[60vh] pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="container-x min-w-0">
          <Reveal>
            <Link
              to="/projects"
              className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent sm:mb-6"
            >
              <FiArrowLeft size={15} />
              All projects
            </Link>

            <div className="grid min-w-0 grid-cols-1 gap-7 sm:gap-10 lg:grid-cols-12 lg:items-center">
              <div className="min-w-0 lg:col-span-7">
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

                <h1 className="break-words font-display text-[clamp(2.25rem,10vw,4rem)] font-bold leading-[1.06] tracking-tight text-ink">{project.name}</h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-lg">
                  {project.tagline}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
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

              <div className="min-w-0 lg:col-span-5">
                {project.coverImage ? <button type="button" onClick={() => setActiveImage(0)} className="project-detail-cover block w-full overflow-hidden rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:rounded-2xl" aria-label={`View ${project.name} cover image full screen`}><ProjectVisual visual={project.visual} name={project.name} image={project.coverImage} type={project.type} stack={project.stack} className="aspect-video h-auto" /></button> : <ProjectVisual visual={project.visual} name={project.name} type={project.type} stack={project.stack} className="aspect-video h-auto rounded-xl sm:rounded-2xl" />}
              </div>
            </div>
          </Reveal>

          <div className="mt-12 grid min-w-0 grid-cols-1 gap-8 sm:mt-16 sm:gap-10 lg:grid-cols-12">
            <div className="min-w-0 space-y-8 sm:space-y-10 lg:col-span-7">
              {(project.myRole || project.ownership || (project.contributions?.length ?? 0) > 0) && <Reveal><section className="card overflow-hidden border-accent/25 p-5 sm:p-6"><span className="eyebrow">My contribution</span><div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{project.myRole && <div className="rounded-xl border border-line bg-surface-2 p-4"><span className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">My role</span><h2 className="mt-1.5 break-words font-display text-lg font-bold text-ink">{project.myRole}</h2></div>}{project.teamSize && <div className="rounded-xl border border-line bg-surface-2 p-4"><span className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">Team size</span><p className="mt-1.5 font-display text-lg font-bold text-ink">{project.teamSize} people</p></div>}</div>{project.ownership && <div className="mt-5"><h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">What I personally owned</h3><p className="mt-2 break-words text-sm leading-relaxed text-muted">{project.ownership}</p></div>}{project.contributions && project.contributions.length > 0 && <div className="mt-5"><h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">My contributions</h3><ul className="mt-3 space-y-2.5">{project.contributions.map((item) => <li key={item} className="flex min-w-0 gap-2.5 text-sm leading-relaxed text-muted"><FiCheck className="mt-0.5 shrink-0 text-ok" /><span className="min-w-0 break-words">{item}</span></li>)}</ul></div>}</section></Reveal>}
              <Reveal>
                <h2 className="font-display text-xl font-bold text-ink">
                  Overview
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {project.overview}
                </p>
              </Reveal>

              <Reveal>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  <div className="card relative overflow-hidden p-5 sm:p-6">
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-danger/60" aria-hidden />
                    <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-danger">
                      The problem
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {project.problem}
                    </p>
                  </div>
                  <div className="card relative overflow-hidden p-5 sm:p-6">
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
            </div>

            <div className="min-w-0 lg:col-span-5">
              <Reveal>
                <div className="card min-w-0 space-y-6 p-5 sm:p-6 lg:sticky lg:top-24">
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
            </div>
          </div>
          {project.screenshots && project.screenshots.length > 0 && <section className="mt-12 sm:mt-16"><div className="flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Project screenshots</h2><p className="mt-1 text-sm text-muted">Select an image to view the full gallery.</p></div><span className="shrink-0 rounded-full border border-line bg-surface-2 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-faint">{project.screenshots.length} images</span></div><div className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-2">{(galleryExpanded ? project.screenshots : project.screenshots.slice(0, 6)).map((src, index) => <button type="button" key={`${src}-${index}`} onClick={() => setActiveImage((project.coverImage ? 1 : 0) + index)} className="project-gallery-frame group min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><span className="project-gallery-image-wrap"><img src={src} alt={`${project.name} screenshot ${index + 1}`} loading="lazy" /><span className="project-gallery-expand" aria-hidden><FiMaximize2 size={16} /></span></span><span className="project-gallery-caption"><span>Screenshot {String(index + 1).padStart(2, "0")}</span><span>View full size</span></span></button>)}</div>{project.screenshots.length > 6 && <div className="mt-7 flex justify-center sm:mt-8"><button type="button" className="btn-outline group min-h-11 w-full justify-center sm:w-auto" aria-expanded={galleryExpanded} onClick={() => setGalleryExpanded((expanded) => !expanded)}>{galleryExpanded ? <><FiChevronUp size={17} />Show fewer screenshots</> : <><FiChevronDown size={17} />Show {project.screenshots.length - 6} more screenshots</>}</button></div>}</section>}
        </div>
      </main>
      {activeImage !== null && galleryImages[activeImage] && <div role="dialog" aria-modal="true" aria-label={`${project.name} image gallery`} className="fixed inset-0 z-[100] flex h-[100dvh] min-w-0 items-center justify-center overflow-hidden bg-black/95 px-2 pb-20 pt-16 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveImage(null); }}><button type="button" onClick={() => setActiveImage(null)} className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:right-6 sm:top-6" aria-label="Close gallery"><FiX size={22} /></button>{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage - 1 + galleryImages.length) % galleryImages.length)} className="absolute left-5 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:grid" aria-label="Previous image"><FiChevronLeft size={28} /></button>}<img src={galleryImages[activeImage]} alt={`${project.name} full-size image ${activeImage + 1}`} className="block max-h-[calc(100dvh-9rem)] max-w-[96vw] object-contain sm:max-h-[85vh] sm:max-w-[88vw]" />{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage + 1) % galleryImages.length)} className="absolute right-5 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:grid" aria-label="Next image"><FiChevronRight size={28} /></button>}<div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-center gap-3 sm:bottom-5">{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage - 1 + galleryImages.length) % galleryImages.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/70 text-white sm:hidden" aria-label="Previous image"><FiChevronLeft size={24} /></button>}<span className="rounded-full border border-white/10 bg-black/70 px-3 py-2 font-mono text-xs text-white">{activeImage + 1} / {galleryImages.length}</span>{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage + 1) % galleryImages.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/70 text-white sm:hidden" aria-label="Next image"><FiChevronRight size={24} /></button>}</div></div>}
    </>
  );
}
