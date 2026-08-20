import { useMemo, useState } from "react";
import { useProjects } from "../lib/hooks";
import { PageMeta } from "../components/PageMeta";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectCardSkeleton } from "../components/ProjectCardSkeleton";
import { SectionHeading } from "../components/SectionHeading";
import { cn } from "../lib/format";
import { AnimatePresence, motion } from "framer-motion";

const filters = [
  { id: "all", label: "All Projects" },
  { id: "unrwa", label: "Digital Hub" },
  { id: "personal", label: "Personal" },
] as const;

type FilterId = (typeof filters)[number]["id"];

export function Projects() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered = useMemo(() => {
    const all = projects ?? [];
    if (filter === "unrwa") return all.filter((p) => p.program);
    if (filter === "personal") return all.filter((p) => !p.program);
    return all;
  }, [projects, filter]);

  return (
    <>
      <PageMeta
        title="Projects"
        description="Full-stack projects by Mahmoud Abdul Ghani — reservations with payments, real-time communication, university management, clinic systems and more."
      />
      <main className="min-h-[60vh] pb-20 pt-24 sm:pb-28 sm:pt-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Portfolio"
              title="Projects"
              description="A selection of collaborative and personal full-stack work — from reservation platforms with payments to real-time communication systems."
              className="mb-0"
            />

            <div
              role="group"
              aria-label="Filter projects"
              className="seg self-start"
            >
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn("seg-btn", filter === f.id && "active")}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-faint" aria-live="polite">
            {isLoading ? "Loading projects…" : <>
            showing {filtered.length} {filtered.length === 1 ? "project" : "projects"}
            {filter === "unrwa" ? " — The Digital Hub" : filter === "personal" ? " — personal work" : ""}
            </>}
          </p>

          <motion.div layout className="mt-4 space-y-2">
            {isLoading && Array.from({ length: 6 }, (_, index) => <ProjectCardSkeleton key={index} />)}
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((project, i) => (
                <motion.div
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.28, delay: Math.min(i * 0.035, 0.18), ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2/40 p-14 text-center">
              <p className="text-sm font-semibold text-ink">No projects in this category yet</p>
              <p className="mt-1 text-sm text-muted">
                Try another filter to see more work.
              </p>
            </div>
          )}
          {!isLoading && isError && <div role="alert" className="mt-4 rounded-xl border border-danger/25 bg-danger/5 p-10 text-center"><p className="text-sm font-semibold text-ink">Projects are temporarily unavailable</p><p className="mt-1 text-sm text-muted">Please try again in a moment.</p><button type="button" onClick={() => void refetch()} className="btn-outline mt-5">Try again</button></div>}
        </div>
      </main>
    </>
  );
}
