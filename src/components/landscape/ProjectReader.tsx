import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { useProject, useProjects } from "../../lib/hooks";
import { detailScreens } from "../../lib/project-detail-screens";
import { PageMeta } from "../PageMeta";
import { PublicDataState } from "../PublicDataState";
import { ResponsiveProjectImage } from "../ResponsiveProjectImage";
import { CaseGallery } from "../CaseGallery";
import { EngineeringCaseStudy } from "../EngineeringCaseStudy";
import { nonempty, projectDisplayName } from "../../../shared/content-integrity";

export function ProjectReader() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const record = useProject(slug),
    projects = useProjects();
  const [chapter, setChapter] = useState(0),
    [zoom, setZoom] = useState<number | null>(null);
  const [galleryTrigger, setGalleryTrigger] = useState<HTMLButtonElement | null>(null);
  const openGallery = (index: number, trigger: HTMLButtonElement) => {
    setGalleryTrigger(trigger);
    setZoom(index);
  };
  const project = record.data;
  if (record.isLoading || record.isError || !project)
    return (
      <main className="page-surface">
        <PublicDataState
          loading={record.isLoading}
          error={record.isError}
          onRetry={() => void record.refetch()}
          label="project"
        />
      </main>
    );
  const screens = detailScreens(project);
  const displayName = projectDisplayName(project);
  const role = project.myRole?.trim();
  const ownership = project.ownership?.trim();
  const contributions = nonempty(project.contributions);
  const team = nonempty(project.team);
  const hasContribution = Boolean(role || ownership || contributions.length);
  const teamSize = project.teamSize || (team.length > 1 ? team.length : null);
  const features = nonempty(project.features);
  const stack = nonempty(project.stack);
  const purpose = project.tagline?.trim() || project.description?.trim();
  const overview = project.overview?.trim() || project.description?.trim();
  const current = screens[chapter] ?? screens[0];
  const all =
    projects.data?.filter(
      (item) => item.published && item.showOnPortfolio !== false,
    ) ?? [];
  const next =
    all.length > 1
      ? all[(all.findIndex((item) => item.slug === slug) + 1) % all.length]
      : undefined;
  const from = location.state as { collection?: string } | null;
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-surface project-reader"
    >
      <PageMeta
        title={displayName}
        description={project.description ?? undefined}
        image={project.coverImage}
        canonicalPath={`/projects/${slug}`}
      />
      <article className="case-page">
        <Link
          className="case-back text-link"
          to={
            from?.collection?.startsWith("/?project=")
              ? from.collection
              : "/projects"
          }
        >
          <FiArrowLeft />
          {from?.collection ? "Collection" : "All projects"}
        </Link>
        <header className="case-heading">
          <div>
            <span className="eyebrow">CASE STUDY / {project.type}</span>
            <h1 className="view-heading">{displayName}</h1>
            {displayName !== project.name && <p className="case-functional-name">{project.name}</p>}
            {(role || teamSize) && <p className="case-role">
              {role && <span>{role}</span>}
              {Boolean(teamSize) && (
                <span className="case-team-size">
                  {teamSize === 1 ? "Independent project." : `${teamSize}-person team`}
                </span>
              )}
            </p>}
            {project.program?.trim() && <p>{project.program}</p>}
          </div>
          <div>
            {purpose && <p className="case-purpose">
              {purpose}
            </p>}
            {project.impactSummary?.trim() && <p>{project.impactSummary}</p>}
            {(project.demo || project.github) && <div className="case-actions">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="solid-action"
                >
                  Live project
                  <FiArrowUpRight />
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Source code
                  <FiArrowUpRight />
                </a>
              )}
            </div>}
          </div>
        </header>
        {current && (
          <>
            <div className="case-screen-tools">
              <div
                className="chapter-switch"
                role="group"
                aria-label="Case study screenshot"
              >
                {screens.map((screen, index) => (
                  <button
                    key={screen.src}
                    aria-pressed={chapter === index}
                    onClick={() => setChapter(index)}
                  >
                    {screen.label}
                  </button>
                ))}
              </div>
              <button
                className="text-link"
                onClick={(event) => openGallery(chapter, event.currentTarget)}
              >
                Enlarge
                <FiArrowUpRight />
              </button>
            </div>
            <button
              className="case-image"
              aria-label={`Enlarge ${displayName} screenshot`}
              onClick={(event) => openGallery(chapter, event.currentTarget)}
            >
              <ResponsiveProjectImage
                src={current.src}
                alt={`${displayName}: ${current.label}`}
                sizes="90vw"
                priority
              />
            </button>
            <p className="image-caption">{current.label}</p>
          </>
        )}
        <div className={`case-notes${hasContribution || team.length ? '' : ' case-notes-single'}`}>
          <section id="overview">
            <span className="eyebrow">01 / OVERVIEW</span>
            <h2>The project.</h2>
            {overview && <p>{overview}</p>}
            {stack.length > 0 && <div className="stack-tags">
              {stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>}
          </section>
          {hasContribution && <section id="contribution">
            <span className="eyebrow">02 / CONTRIBUTION</span>
            <h2>My part in the work.</h2>
            {role && <p>{role}</p>}
            {ownership && <p>{ownership}</p>}
            {contributions.length > 0 && <ul>
              {contributions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>}
            {team.length > 0 && (
              <>
                <h3>Team</h3>
                <ul>
                  {team.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </section>}
          {!hasContribution && team.length > 0 && <section id="team">
            <span className="eyebrow">TEAM DELIVERY</span>
            <h2>The team.</h2>
            <ul>{team.map(member => <li key={member}>{member}</li>)}</ul>
          </section>}
        </div>
        {(project.problem?.trim() || project.solution?.trim()) && (
          <div className="case-notes">
            {project.problem?.trim() && (
              <section>
                <span className="eyebrow">THE PROBLEM</span>
                <h2>What needed to change.</h2>
                <p>{project.problem}</p>
              </section>
            )}
            {project.solution?.trim() && (
              <section>
                <span className="eyebrow">THE SOLUTION</span>
                <h2>The approach.</h2>
                <p>{project.solution}</p>
              </section>
            )}
          </div>
        )}
        {features.length > 0 && (
          <section className="reader-features" id="workflow">
            <span className="eyebrow">03 / PRODUCT WORKFLOW</span>
            <h2>What it does.</h2>
            <ul>
              {features.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        {Boolean(
          project.architecture?.length ||
            project.codeDiffs?.length ||
            project.benchmarks?.length,
        ) && (
          <EngineeringCaseStudy
            architecture={project.architecture}
            codeDiffs={project.codeDiffs}
            benchmarks={project.benchmarks}
          />
        )}
        {screens.length > 1 && (
          <section className="reader-gallery" id="gallery">
            <span className="eyebrow">
              PRODUCT GALLERY / {screens.length} IMAGES
            </span>
            <div>
              {screens.map((screen, index) => (
                <button
                  key={screen.src}
                  onClick={(event) => openGallery(index, event.currentTarget)}
                  aria-label={`Enlarge ${screen.label}`}
                >
                  <ResponsiveProjectImage
                    src={screen.src}
                    alt={`${displayName}: ${screen.label}`}
                    sizes="(max-width:720px) 90vw, 40vw"
                  />
                  <span>
                    {screen.label}
                    <FiArrowUpRight />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        <div className="case-end">
          <Link className="text-link" to="/projects">
            <FiArrowLeft />
            All projects
          </Link>
          {next && (
            <Link className="next-project" to={`/projects/${next.slug}`}>
              <span className="eyebrow">NEXT PROJECT</span>
              <span>
                {projectDisplayName(next)}
                <FiArrowRight />
              </span>
            </Link>
          )}
        </div>
      </article>
      {zoom !== null && screens[zoom] && (
        <CaseGallery
          key={project.id}
          screens={screens}
          projectName={displayName}
          initialIndex={zoom}
          returnFocusTo={galleryTrigger}
          onClose={() => setZoom(null)}
        />
      )}
    </main>
  );
}
