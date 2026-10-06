import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheck, FiExternalLink, FiGithub, FiUser, FiLayers } from "react-icons/fi";
import { useProject, useProjects } from "../lib/hooks";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/Reveal";
import { EngineeringCaseStudy } from "../components/EngineeringCaseStudy";
import { ResponsiveProjectImage } from "../components/ResponsiveProjectImage";
import { ProjectWorkflow } from "../components/ProjectWorkflow";
import { CaseProductShowcase } from "../components/CaseProductShowcase";
import { CaseWalkthrough } from "../components/CaseWalkthrough";
import { CaseGallery } from "../components/CaseGallery";
import { detailScreens } from "../lib/project-detail-screens";
import { featureGroups } from "../lib/project-presentation";
import { formatDate } from "../lib/format";
import "./project-detail.css";

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, isError, refetch } = useProject(slug ?? "");
  const { data: projects } = useProjects();
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const screens = useMemo(() => project ? detailScreens(project) : [], [project]);

  if (isLoading) return <main className="public-page case-page" aria-busy="true"><div className="public-container case-loading"><p>Loading project…</p></div></main>;
  if (isError || !project) return <main className="public-page public-state"><PageMeta title="Project unavailable" /><h1>Project unavailable</h1><p>This project may have been unpublished, or the connection may be temporarily unavailable.</p><button className="btn-outline" onClick={() => void refetch()}>Try again</button><Link to="/projects" className="btn-outline">Back to projects</Link></main>;
  const published = (projects ?? []).filter(p => p.published && p.showOnPortfolio !== false);
  const index = published.findIndex(p => p.slug === project.slug);
  const next = index >= 0 && published.length > 1 ? published[(index + 1) % published.length] : undefined;
  const nextScreen = next ? detailScreens(next)[0] : undefined;
  const groups = featureGroups[project.slug] ?? [];
  const groupedIndices = new Set(groups.flatMap(g => g.indices));
  const rest = project.features.filter((_, i) => !groupedIndices.has(i));

  const engineering = Boolean(project.architecture?.length || project.codeDiffs?.length || project.benchmarks?.length);
  const openImage = (src: string) => { const position = screens.findIndex(screen => screen.src === src); if (position >= 0) setActiveImage(position); };
  return <>
    <PageMeta title={project.name} description={project.description ?? undefined} image={project.coverImage} canonicalPath={`/projects/${project.slug}`} />
    <main id="top" className={`public-page case-page case-editorial case-${project.slug}`}>
      <div className="public-container">
        <Link to="/projects" className="case-breadcrumb"><FiArrowLeft />All projects</Link>
        <section className="case-hero" aria-labelledby="case-title">
          <div className="case-intro">
            <Reveal variant="clip" y={14} className="case-title-group">
              <p className="public-eyebrow">Case study <span>· {project.type}</span></p>
              <h1 id="case-title">{project.name}</h1>
              <div className="case-meta">
                {project.myRole && <p><FiUser aria-hidden />{project.myRole}</p>}
                {project.program && <p><FiLayers aria-hidden />{project.program}</p>}
                <p>{new Date(project.createdAt).getUTCFullYear()}{project.teamSize ? ` · ${project.teamSize}-person team` : ""}</p>
              </div>
            </Reveal>
            <Reveal y={14} delay={0.1} className="case-summary">
              {(project.tagline || project.description) && <p className="case-tagline">{project.tagline || project.description}</p>}
              <div className="case-actions">
                {project.demo && <a className="btn-primary" href={project.demo} target="_blank" rel="noopener noreferrer"><FiExternalLink />Live demo</a>}
                {project.github && <a className="btn-outline" href={project.github} target="_blank" rel="noopener noreferrer"><FiGithub />Source code</a>}
              </div>
            </Reveal>
          </div>
          <Reveal variant="scale" y={14} delay={0.15} className="case-visual">
            <CaseProductShowcase key={project.id} screens={screens} projectName={project.name} onOpen={openImage} />
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
          <aside className="case-chapter-nav"><nav aria-label="Case-study chapters"><a href="#overview">Overview</a><a href="#workflow">Workflow</a>{(project.myRole || project.ownership || project.contributions?.length || project.team?.length) ? <a href="#contribution">Contribution</a> : null}{engineering && <a href="#engineering">Engineering</a>}{screens.length > 0 && <a href="#gallery">Gallery</a>}</nav><p>Updated {formatDate(project.updatedAt)}</p><p>{project.views.toLocaleString()} aggregate views</p></aside>
        </div>
        {screens.length > 0 && <section id="gallery" className="case-chapter case-gallery"><p className="public-eyebrow">Product screens · {screens.length} {screens.length === 1 ? 'image' : 'images'}</p><h2>Inside the product</h2><CaseWalkthrough key={project.id} screens={screens} projectName={project.name} onOpen={openImage} /></section>}
        <section className="case-contact"><p className="public-eyebrow">Work together</p><h2>Have a role or project in mind?</h2><Link to="/contact" className="btn-primary">Let’s talk<FiArrowRight /></Link></section>
        <nav className="case-next" aria-label="Project navigation"><Link to="/projects"><FiArrowLeft />All projects</Link>{next && <Link to={`/projects/${next.slug}`}>{nextScreen && <ResponsiveProjectImage src={nextScreen.src} alt="" sizes="(min-width: 761px) 280px, 92vw" />}<span>Next project<strong>{next.name}</strong></span><FiArrowRight /></Link>}</nav>
      </div>
    </main>
      {activeImage !== null && screens[activeImage] && <CaseGallery key={project.id} screens={screens} projectName={project.name} initialIndex={activeImage} onClose={() => setActiveImage(null)} />}
  </>;
}
