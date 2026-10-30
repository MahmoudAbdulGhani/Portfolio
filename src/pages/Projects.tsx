import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiSearch } from "react-icons/fi";
import { useProjects, useSiteSection } from "../lib/hooks";
import { detailScreens } from "../lib/project-detail-screens";
import { PageMeta } from "../components/PageMeta";
import { PublicDataState } from "../components/PublicDataState";
import { ProjectPreview } from "../components/ProjectPreview";
import { galleryCovers } from "../generated/gallery-covers";
import { galleryTitle } from "../lib/gallery-presentation";
import { projectNumber } from '../lib/project-evidence';
import { useSupportingDesign, useSupportingCompact } from '../components/landscape/supporting-design-context';
import { caseStudyFor } from '../../shared/case-study-runtime';
import { ordinaryActivation } from '../components/landscape/jobpilot-journey';
import './supporting-pages.css';

export function Projects() {
  const review = useSupportingDesign();
  const compact = useSupportingCompact();
  const location = useLocation(), navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const projects = useProjects();
  const { data: section } = useSiteSection("projectsPage");
  const [query, setQuery] = useState(review ? params.get('q') ?? '' : ""),
    [mode, setMode] = useState(review && params.get('mode') === 'Index' ? 'Index' : "Gallery");
  const remember = (nextQuery: string, nextMode: string) => {
    setQuery(nextQuery); setMode(nextMode);
    if (!review) return;
    const search = new URLSearchParams();
    if (nextQuery) search.set('q', nextQuery);
    if (nextMode === 'Index') search.set('mode', nextMode);
    navigate({ pathname: review.indexPath, search: search.toString() }, { replace: true, state: { routeRestore: { x: scrollX, y: scrollY } } });
  };
  const visible =
    projects.data?.filter(
      (project) =>
        project.published &&
        project.showOnPortfolio !== false &&
        `${project.name} ${galleryTitle(project)} ${project.stack.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ) ?? [];
  return (
    <main id="main-content" tabIndex={-1} className="page-surface index-page supporting-page">
      <PageMeta
        title={section?.heading || "Projects"}
        description={section?.description ?? undefined}
        noIndex={Boolean(review)}
        canonicalPath="/projects"
      />
      <header className="page-heading">
        <div>
          <span className="eyebrow">PROJECTS / COLLECTION INDEX</span>
          <h1 className="view-heading">
            {section?.heading || "The work, collected."}
          </h1>
        </div>
        <p>{section?.description}</p>
      </header>
      <div className="index-tools">
        <label className="search-field">
          <FiSearch />
          <span className="sr-only">Search projects or technologies</span>
          <input
            type="search"
            aria-label="Search projects or technologies"
            value={query}
            onChange={(event) => remember(event.target.value, mode)}
            placeholder="Search projects or technologies"
          />
        </label>
        <div
          className="chapter-switch"
          role="group"
          aria-label="Project display"
        >
          {["Gallery", "Index"].map((value) => (
            <button
              key={value}
              aria-pressed={mode === value}
              onClick={() => remember(query, value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <PublicDataState
        loading={projects.isLoading}
        error={projects.isError}
        onRetry={() => void projects.refetch()}
        label="projects"
      />
      <p className="eyebrow project-count" aria-live="polite">
        {visible.length} projects
      </p>
      <div className={mode === "Index" ? "project-index" : "project-gallery"}>
        {visible.map((project) => {
          const screen = detailScreens(project)[0];
          const cover = galleryCovers[project.slug];
          const preview = cover?.src ?? screen?.src;
          const study = caseStudyFor(project);
          const card = compact && study ? review?.cards?.[project.slug] : undefined;
          const summary = study?.summary ?? project.tagline ?? project.description;
          return (
            <Link
              key={project.id}
              className="work-entry"
              data-project-slug={review ? project.slug : undefined}
              to={review?.readerPath(project.slug) ?? `/projects/${project.slug}`}
              onClick={event => {
                if (!review || !ordinaryActivation(event)) return;
                event.preventDefault();
                const main = event.currentTarget.closest('main');
                navigate(review.readerPath(project.slug), { state: { supportingIndex: { path: location.pathname + location.search, historyIndex: history.state?.idx, position: { x: scrollX, y: scrollY, main: { x: main?.scrollLeft ?? 0, y: main?.scrollTop ?? 0 }, focus: project.slug } } } });
              }}
              aria-label={`Open ${project.name} case study`}
            >
              {mode === "Gallery" && preview && (
                <ProjectPreview
                  key={preview}
                  src={preview}
                  alt={cover?.alt ?? `${project.name}: ${screen?.label}`}
                  sources={cover?.sources}
                  authoredCover={Boolean(cover)}
                />
              )}
              <div className="work-caption">
                <span className="eyebrow">
                  {review?.candidate ? <><span className="work-number">{projectNumber(project.slug)}</span><span className="work-category">{card?.category ?? project.type}</span></> : projectNumber(project.slug)}
                </span>
                <div>
                  <h2>{galleryTitle(project)}</h2>
                  {!review?.candidate && <p>{project.type}</p>}
                </div>
              </div>
              {review?.candidate && <p className="work-description">{card?.summary ?? summary?.split(/(?<=\.)\s/)[0]}</p>}
              <p className="work-stack">
                {project.stack.slice(0, 3).join(" · ")}
              </p>
              <span className="work-open">Open case study<FiArrowUpRight aria-hidden="true" /></span>
            </Link>
          );
        })}
      </div>
      {!projects.isLoading && !projects.isError && !visible.length && (
        <div className="empty-work">
          <h2>No matching projects.</h2>
          <button className="text-link" onClick={() => remember("", mode)}>
            Clear search
          </button>
        </div>
      )}
    </main>
  );
}
