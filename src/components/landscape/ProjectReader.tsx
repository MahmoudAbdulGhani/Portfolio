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

export function ProjectReader() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const record = useProject(slug),
    projects = useProjects();
  const [chapter, setChapter] = useState(0),
    [zoom, setZoom] = useState<number | null>(null);
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
        title={project.name}
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
            <h1 className="view-heading">{project.name}</h1>
            <p className="case-role">
              <span>{project.myRole}</span>
              {Boolean(project.teamSize) && (
                <span className="case-team-size">
                  {project.teamSize}-person team
                </span>
              )}
            </p>
            {project.program && <p>{project.program}</p>}
          </div>
          <div>
            <p className="case-purpose">
              {project.tagline || project.description}
            </p>
            {project.impactSummary && <p>{project.impactSummary}</p>}
            <div className="case-actions">
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
            </div>
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
              <button className="text-link" onClick={() => setZoom(chapter)}>
                Enlarge
                <FiArrowUpRight />
              </button>
            </div>
            <button
              className="case-image"
              aria-label={`Enlarge ${project.name} screenshot`}
              onClick={() => setZoom(chapter)}
            >
              <ResponsiveProjectImage
                src={current.src}
                alt={`${project.name}: ${current.label}`}
                sizes="90vw"
                priority
              />
            </button>
            <p className="image-caption">{current.label}</p>
          </>
        )}
        <div className="case-notes">
          <section id="overview">
            <span className="eyebrow">01 / OVERVIEW</span>
            <h2>The project.</h2>
            <p>{project.overview || project.description}</p>
            <div className="stack-tags">
              {project.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </section>
          <section id="contribution">
            <span className="eyebrow">02 / CONTRIBUTION</span>
            <h2>My part in the work.</h2>
            <p>{project.myRole}</p>
            {project.ownership && <p>{project.ownership}</p>}
            <ul>
              {project.contributions?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            {Boolean(project.team?.length) && (
              <>
                <h3>Team</h3>
                <ul>
                  {project.team?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
        {(project.problem || project.solution) && (
          <div className="case-notes">
            {project.problem && (
              <section>
                <span className="eyebrow">THE PROBLEM</span>
                <h2>What needed to change.</h2>
                <p>{project.problem}</p>
              </section>
            )}
            {project.solution && (
              <section>
                <span className="eyebrow">THE SOLUTION</span>
                <h2>The approach.</h2>
                <p>{project.solution}</p>
              </section>
            )}
          </div>
        )}
        {project.features.length > 0 && (
          <section className="reader-features" id="workflow">
            <span className="eyebrow">03 / PRODUCT WORKFLOW</span>
            <h2>What it does.</h2>
            <ul>
              {project.features.map((item, index) => (
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
                  onClick={() => setZoom(index)}
                  aria-label={`Enlarge ${screen.label}`}
                >
                  <ResponsiveProjectImage
                    src={screen.src}
                    alt={`${project.name}: ${screen.label}`}
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
                {next.name}
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
          projectName={project.name}
          initialIndex={zoom}
          onClose={() => setZoom(null)}
        />
      )}
    </main>
  );
}
