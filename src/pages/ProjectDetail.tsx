import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheck, FiExternalLink, FiGithub, FiMaximize2, FiChevronLeft, FiChevronRight, FiX, FiUser, FiLayers } from "react-icons/fi";
import { useProject, useProjects } from "../lib/hooks";
import { ProjectStudioCover } from "../components/ProjectStudioCover";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/Reveal";
import { EngineeringCaseStudy } from "../components/EngineeringCaseStudy";
import { ResponsiveProjectImage } from "../components/ResponsiveProjectImage";
import { ProjectWorkflow } from "../components/ProjectWorkflow";
import { featureGroups, projectScreens } from "../lib/project-presentation";
import { formatDate } from "../lib/format";

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, isError, refetch } = useProject(slug ?? "");
  const { data: projects } = useProjects();
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const galleryTriggerRef = useRef<HTMLElement | null>(null);
  const heroImage = project ? projectScreens[project.slug] || project.coverImage || project.screenshots?.[0] : undefined;
  const galleryImages = useMemo(() => project ? [...new Set([heroImage, project.coverImage, ...project.screenshots ?? []].filter((src): src is string => Boolean(src)))] : [], [project, heroImage]);
  const galleryOpen = activeImage !== null;
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

  if (isLoading) return <main className="public-page case-page" aria-busy="true"><div className="public-container case-loading"><p>Loading project…</p></div></main>;
  if (isError || !project) return <main className="public-page public-state"><PageMeta title="Project unavailable" /><h1>Project unavailable</h1><p>This project may have been unpublished, or the connection may be temporarily unavailable.</p><button className="btn-outline" onClick={() => void refetch()}>Try again</button><Link to="/projects" className="btn-outline">Back to projects</Link></main>;
  const published = (projects ?? []).filter(p => p.published && p.showOnPortfolio !== false);
  const index = published.findIndex(p => p.slug === project.slug);
  const next = index >= 0 && published.length > 1 ? published[(index + 1) % published.length] : undefined;
  const groups = featureGroups[project.slug] ?? [];
  const groupedIndices = new Set(groups.flatMap(g => g.indices));
  const rest = project.features.filter((_, i) => !groupedIndices.has(i));
  const screenshots = [...new Set(project.screenshots ?? [])];
  const engineering = Boolean(project.architecture?.length || project.codeDiffs?.length || project.benchmarks?.length);
  const openImage = (src: string) => { const position = galleryImages.indexOf(src); if (position >= 0) setActiveImage(position); };
  return <>
    <PageMeta title={project.name} description={project.description ?? undefined} image={project.coverImage} canonicalPath={`/projects/${project.slug}`} />
    <main id="top" className={`public-page case-page case-${project.slug}`}>
      <div className="public-container">
        <Link to="/projects" className="case-breadcrumb"><FiArrowLeft />All projects</Link>
        <section className="case-hero" aria-labelledby="case-title">
          <Reveal y={14} className="case-intro">
            <p className="public-eyebrow">Case study</p>
            <h1 id="case-title">{project.name}</h1>
            <p className="case-type"><em>{project.type}</em></p>
            {project.tagline && <p className="case-tagline">{project.tagline}</p>}
            <div className="case-meta">
              {project.myRole && <p><FiUser aria-hidden />{project.myRole}</p>}
              {project.program && <p><FiLayers aria-hidden />{project.program}</p>}
              <p>{new Date(project.createdAt).getUTCFullYear()}{project.teamSize ? ` · ${project.teamSize}-person team` : ""}</p>
            </div>
            <div className="case-actions">
              {project.demo && <a className="btn-primary" href={project.demo} target="_blank" rel="noopener noreferrer"><FiExternalLink />Live demo</a>}
              {project.github && <a className="btn-outline" href={project.github} target="_blank" rel="noopener noreferrer"><FiGithub />Source code</a>}
            </div>
          </Reveal>
          <Reveal y={14} delay={0.08} className="case-visual">
            {heroImage ? <button type="button" className="case-hero-image" onClick={() => openImage(heroImage)} aria-label={`View ${project.name} product image full screen`}><ProjectStudioCover project={project} priority /><span className="case-image-action"><FiMaximize2 />View full size</span></button> : <div className="case-no-image"><p>Product screenshots are not available yet.</p></div>}
          </Reveal>
        </section>
        <div className="case-reading-grid">
          <div className="case-reading">
            <Reveal y={12}><section id="overview" className="case-chapter"><p className="public-eyebrow">Overview</p><h2>The project</h2><p>{project.overview || project.description}</p>{project.impactSummary && <p className="case-impact">{project.impactSummary}</p>}</section></Reveal>
            {(project.problem || project.solution) && <Reveal y={12}><section className="case-problem-solution">{project.problem && <div><h3>The problem</h3><p>{project.problem}</p></div>}{project.solution && <div><h3>The solution</h3><p>{project.solution}</p></div>}</section></Reveal>}
            <Reveal y={12}><section id="workflow" className="case-chapter"><p className="public-eyebrow">Product workflow</p><h2>What it does</h2><ProjectWorkflow key={project.id} project={project} onOpenImage={openImage} />
              {groups.map(group => <div className="case-feature-group" key={group.label}><h3>{group.label}</h3><ul className="case-features">{group.indices.filter(i => project.features[i]).map(i => <li key={i}><FiCheck aria-hidden /><span>{project.features[i]}</span></li>)}</ul></div>)}
              {rest.length > 0 && <ul className="case-features">{rest.map((feature, i) => <li key={i}><FiCheck aria-hidden /><span>{feature}</span></li>)}</ul>}
            </section></Reveal>
            <Reveal y={12}><section className="case-chapter"><p className="public-eyebrow">Technologies</p><h2>Built with</h2><ul className="case-stack">{project.stack.map(tech => <li key={tech}>{tech}</li>)}</ul></section></Reveal>
            {(project.myRole || project.ownership || project.contributions?.length || project.team?.length) && <Reveal y={12}><section id="contribution" className="case-chapter"><p className="public-eyebrow">Contribution</p><h2>My role</h2>{project.myRole && <h3>{project.myRole}</h3>}{project.ownership && <p>{project.ownership}</p>}{Boolean(project.contributions?.length) && <ul className="case-features">{project.contributions?.map(item => <li key={item}><FiCheck aria-hidden /><span>{item}</span></li>)}</ul>}{Boolean(project.team?.length) && <div className="case-team"><h3>{(project.team?.length ?? 0) > 1 ? "Team" : "Built by"}</h3><ul>{project.team?.map(member => <li key={member}>{member}</li>)}</ul></div>}</section></Reveal>}
            {engineering && <div id="engineering" className="case-chapter"><EngineeringCaseStudy key={project.id} architecture={project.architecture} codeDiffs={project.codeDiffs} benchmarks={project.benchmarks} views={project.views} /></div>}
          </div>
          <aside className="case-chapter-nav"><nav aria-label="Case-study chapters"><a href="#overview">Overview</a><a href="#workflow">Workflow</a>{(project.myRole || project.ownership || project.contributions?.length || project.team?.length) ? <a href="#contribution">Contribution</a> : null}{engineering && <a href="#engineering">Engineering</a>}{screenshots.length > 0 && <a href="#gallery">Gallery</a>}</nav><p>Updated {formatDate(project.updatedAt)}</p><p>{project.views.toLocaleString()} aggregate views</p></aside>
        </div>
        {screenshots.length > 0 && <section id="gallery" className="case-chapter case-gallery"><p className="public-eyebrow">Screenshots · {screenshots.length} images</p><h2>Inside the product</h2><div className="case-gallery-grid">{screenshots.map((src, i) => <button type="button" key={src} onClick={() => openImage(src)} aria-label={`View ${project.name} screenshot ${i + 1} full screen`}><ResponsiveProjectImage src={src} alt={`${project.name} screenshot ${i + 1}`} sizes="(min-width: 1024px) 650px, 92vw" className="case-gallery-image" /><span>Screenshot {String(i + 1).padStart(2, "0")}<FiMaximize2 aria-hidden /></span></button>)}</div></section>}
        {project.coverImage && project.coverImage !== heroImage && <button type="button" className="case-original-cover" onClick={() => openImage(project.coverImage!)}>View original project cover<FiMaximize2 /></button>}
        <section className="case-contact"><p className="public-eyebrow">Work together</p><h2>Have a role or project in mind?</h2><Link to="/contact" className="btn-primary">Let’s talk<FiArrowRight /></Link></section>
        <nav className="case-next" aria-label="Project navigation"><Link to="/projects"><FiArrowLeft />All projects</Link>{next && <Link to={`/projects/${next.slug}`}><span>Next project<strong>{next.name}</strong></span><FiArrowRight /></Link>}</nav>
      </div>
    </main>
      {activeImage !== null && galleryImages[activeImage] && <div role="dialog" aria-modal="true" aria-label={`${project.name} image gallery`} className="fixed inset-0 z-[100] flex h-[100dvh] min-w-0 items-center justify-center overflow-hidden bg-black/95 px-2 pb-20 pt-16 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveImage(null); }}><button type="button" onClick={() => setActiveImage(null)} className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:right-6 sm:top-6" aria-label="Close gallery"><FiX size={22} /></button>{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage - 1 + galleryImages.length) % galleryImages.length)} className="absolute left-5 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:grid" aria-label="Previous image"><FiChevronLeft size={28} /></button>}<ResponsiveProjectImage src={galleryImages[activeImage]} alt={`${project.name} full-size image ${activeImage + 1}`} sizes="96vw" priority className="block max-h-[calc(100dvh-9rem)] max-w-[96vw] object-contain sm:max-h-[85vh] sm:max-w-[88vw]" />{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage + 1) % galleryImages.length)} className="absolute right-5 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 sm:grid" aria-label="Next image"><FiChevronRight size={28} /></button>}<div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-center gap-3 sm:bottom-5">{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage - 1 + galleryImages.length) % galleryImages.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/70 text-white sm:hidden" aria-label="Previous image"><FiChevronLeft size={24} /></button>}<span className="rounded-full border border-white/10 bg-black/70 px-3 py-2 font-mono text-xs text-white">{activeImage + 1} / {galleryImages.length}</span>{galleryImages.length > 1 && <button type="button" onClick={() => setActiveImage((activeImage + 1) % galleryImages.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/70 text-white sm:hidden" aria-label="Next image"><FiChevronRight size={24} /></button>}</div></div>}
  </>;
}
