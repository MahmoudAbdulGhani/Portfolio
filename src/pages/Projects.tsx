import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiSearch } from "react-icons/fi";
import { useProjects, useSiteSection } from "../lib/hooks";
import { detailScreens } from "../lib/project-detail-screens";
import { PageMeta } from "../components/PageMeta";
import { PublicDataState } from "../components/PublicDataState";
import { ProjectPreview } from "../components/ProjectPreview";
import { galleryCovers } from "../generated/gallery-covers";
import { galleryTitle } from "../lib/gallery-presentation";

export function Projects() {
  const projects = useProjects();
  const { data: section } = useSiteSection("projectsPage");
  const [query, setQuery] = useState(""),
    [mode, setMode] = useState("Gallery");
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
    <main id="main-content" tabIndex={-1} className="page-surface index-page">
      <PageMeta
        title={section?.heading || "Projects"}
        description={section?.description ?? undefined}
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
            onChange={(event) => setQuery(event.target.value)}
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
              onClick={() => setMode(value)}
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
        {visible.map((project, index) => {
          const screen = detailScreens(project)[0];
          const cover = galleryCovers[project.slug];
          const preview = cover?.src ?? screen?.src;
          return (
            <Link
              key={project.id}
              className="work-entry"
              to={`/projects/${project.slug}`}
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
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2>{galleryTitle(project)}</h2>
                  <p>{project.type}</p>
                </div>
                <FiArrowUpRight />
              </div>
              <p className="work-stack">
                {project.stack.slice(0, 3).join(" · ")}
              </p>
            </Link>
          );
        })}
      </div>
      {!projects.isLoading && !projects.isError && !visible.length && (
        <div className="empty-work">
          <h2>No matching projects.</h2>
          <button className="text-link" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      )}
    </main>
  );
}
