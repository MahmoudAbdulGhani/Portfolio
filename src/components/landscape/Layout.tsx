import { lazy, Suspense } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useProfile, useProjects } from "../../lib/hooks";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "../../landscape.css";
import "../../landscape-integration.css";
import './composition.css';
import './motion-language.css';

const PortfolioAssistant = lazy(() =>
  import("../PortfolioAssistant").then((module) => ({
    default: module.PortfolioAssistant,
  })),
);
const links = [
  ["/", "Collection"],
  ["/projects", "Projects"],
  ["/profile", "Profile"],
  ["/contact", "Contact"],
  ["/job-match", "AI Job Match"],
] as const;

export function LandscapeLayout() {
  const { data: profile } = useProfile();
  const { data: projects } = useProjects();
  const location = useLocation();
  const collectionState = location.pathname.startsWith("/projects/")
    ? { returnProject: location.pathname.slice("/projects/".length) }
    : undefined;
  const selected =
    location.pathname === "/" &&
    new URLSearchParams(location.search).has("project");
  return (
    <div className="landscape">
      <div
        className={`portfolio ${location.pathname === "/" ? (selected ? "is-selected" : "is-collection") : "is-reading"}${location.pathname === "/contact" ? " is-contact" : ""}`}
      >
        <a
          className="skip-link"
          href="#main-content"
          onClick={(event) => {
            event.preventDefault();
            document
              .querySelector<HTMLElement>(".landscape-route main")
              ?.focus();
          }}
        >
          Skip to content
        </a>
        <header className="site-header">
          <Link
            to="/"
            state={collectionState}
            className="identity"
            aria-label={`${profile?.name ?? "Portfolio"}, project collection`}
          >
            <span className="wordmark">
              MA
              <span className="wordmark-dot" />
            </span>
            <span className="identity-text">
              {profile?.name}
              <span>{profile?.title}</span>
            </span>
          </Link>
          <nav aria-label="Main navigation">
            {links.map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                state={path === "/" ? collectionState : undefined}
                end={path === "/"}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <div className="landscape-route">
          <Outlet />
        </div>
        <footer className="stage-footer">
          <div className="footer-location">
            {location.pathname === "/" && !selected ? (
              <Link to="/projects">
                Explore all {projects?.length ?? ""} projects
                <FiArrowRight />
              </Link>
            ) : (
              <Link to="/" state={collectionState}>
                Collection
                <FiArrowRight />
              </Link>
            )}
          </div>
          <Suspense fallback={null}>
            <PortfolioAssistant />
          </Suspense>
        </footer>
      </div>
    </div>
  );
}
