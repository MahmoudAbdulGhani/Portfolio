import { Link } from "react-router-dom";
import { FiArrowLeft, FiFileText } from "react-icons/fi";
import { PageMeta } from "../components/PageMeta";

export function NotFound() {
  return (
    <>
      <PageMeta title="Page not found" />
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="font-mono text-6xl font-bold text-gradient">404</span>
        <h1 className="heading">This page wandered off.</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          The link may be broken, or the page may have moved. Head back home to
          see the full portfolio.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary group">
            <FiArrowLeft size={16} />
            Back home
          </Link>
          <Link to="/projects" className="btn-outline group">
            <FiFileText size={16} />
            View projects
          </Link>
        </div>
      </main>
    </>
  );
}
