import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiEdit2,
  FiExternalLink,
  FiLoader,
  FiPlus,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import { useAdminProjects, useDeleteProject } from "../../lib/hooks";
import { cn, formatDate } from "../../lib/format";
import { ProjectVisual } from "../../components/ProjectVisual";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { Project } from "../../types";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { SearchField, StatusBadge } from "../../components/admin/AdminUI";

function ProjectTableSkeleton() {
  return (
    <div className="overflow-x-auto" tabIndex={0} aria-label="Loading projects table">
      <table className="w-full min-w-[720px] text-left text-sm" aria-hidden="true">
        <thead>
          <tr className="border-b border-line bg-surface-2 font-mono text-[11px] uppercase tracking-wider text-muted">
            <th className="px-5 py-3.5 font-semibold">Project</th>
            <th className="px-5 py-3.5 font-semibold">Type</th>
            <th className="px-5 py-3.5 font-semibold">Stack</th>
            <th className="px-5 py-3.5 font-semibold">Status</th>
            <th className="px-5 py-3.5 font-semibold">Updated</th>
            <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, index) => (
            <tr key={index} className="border-b border-line last:border-0">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 shrink-0 animate-pulse rounded-lg bg-surface-3" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className={`h-4 animate-pulse rounded-md bg-surface-3 ${index % 2 === 0 ? "w-40" : "w-32"}`} />
                    <div className="h-3 w-28 animate-pulse rounded-md bg-surface-3" />
                  </div>
                </div>
              </td>
              <td className="px-5 py-4"><div className="h-4 w-20 animate-pulse rounded-md bg-surface-3" /></td>
              <td className="px-5 py-4"><div className="h-4 w-28 animate-pulse rounded-md bg-surface-3" /></td>
              <td className="px-5 py-4"><div className="h-6 w-20 animate-pulse rounded-full bg-surface-3" /></td>
              <td className="px-5 py-4"><div className="h-4 w-24 animate-pulse rounded-md bg-surface-3" /></td>
              <td className="px-5 py-4"><div className="ml-auto h-8 w-16 animate-pulse rounded-lg bg-surface-3" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminProjects() {
  const { data: projects, isLoading, error, refetch } = useAdminProjects();
  const del = useDeleteProject();
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");

  const sorted = [...(projects ?? [])].sort((a, b) => a.order - b.order);
  const filtered = sorted.filter((project) => {
    const matchesSearch = `${project.name} ${project.type} ${project.stack.join(" ")}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = status === "all" || (status === "published" ? project.published : !project.published);
    return matchesSearch && matchesStatus;
  });
  const showLoadingSkeleton = isLoading && projects === undefined;
  const showInitialLoadError = Boolean(error && projects === undefined);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Projects" description="Create, edit, publish or remove portfolio projects." actions={
        <Link to="/admin/projects/new" className="btn-primary btn-sm">
          <FiPlus size={15} />
          New project
        </Link>
      } />

      {error && projects && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-muted">
          <span>Could not refresh projects. {error.message}</span>
          <button type="button" onClick={() => void refetch()} className="btn-outline btn-sm">
            Retry
          </button>
        </div>
      )}

      {projects && <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField value={search} onChange={setSearch} placeholder="Search projects, type, or technology…" label="Search projects" />
        <label className="flex items-center gap-2 text-xs font-semibold text-muted"><span>Status</span><select className="select w-full sm:w-40" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All projects</option><option value="published">Published</option><option value="draft">Drafts</option></select></label>
      </div>}

      {showInitialLoadError ? (
        <div role="alert" className="card border-danger/30 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Unable to load projects</h2>
          <p className="mt-2 text-sm text-muted">{error?.message}</p>
          <button type="button" onClick={() => void refetch()} className="btn-outline mt-5">
            Try again
          </button>
        </div>
      ) : (
      <div className="card overflow-hidden">
        {showLoadingSkeleton ? (
          <>
            <div className="sr-only" role="status">
            Loading projects…
            </div>
            <ProjectTableSkeleton />
          </>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block" tabIndex={0} aria-label="Scrollable projects table">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2 font-mono text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5 font-semibold">Project</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 font-semibold">Stack</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Updated</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => {
                  const deleting = del.isPending && del.variables === project.id;
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-line last:border-0 hover:bg-surface-2/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                            <ProjectVisual
                              visual={project.visual}
                              name={project.name}
                              className="h-10 w-14 rounded-lg"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 font-semibold text-ink">
                              <span className="truncate">{project.name}</span>
                              {project.featured && (
                                <FiStar size={13} className="shrink-0 text-gold" aria-label="Featured" />
                              )}
                            </p>
                            <p className="truncate font-mono text-[11px] text-faint">
                              /projects/{project.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{project.type}</td>
                      <td className="px-5 py-4">
                        <span className="text-muted">
                          {project.stack.slice(0, 3).join(", ")}
                          {project.stack.length > 3 && "…"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase",
                            project.published
                              ? "border-ok/25 bg-ok/10 text-ok"
                              : "border-line bg-surface-3 text-faint",
                          )}
                        >
                          {project.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted">
                        {formatDate(project.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/projects/${project.slug}`}
                            className="btn-icon-sm admin-row-action"
                            aria-label="View"
                          >
                            <FiExternalLink size={14} />
                          </Link>
                          <Link
                            to={`/admin/projects/${project.slug}/edit`}
                            className="btn-icon-sm admin-row-action"
                            aria-label="Edit"
                          >
                            <FiEdit2 size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(project)}
                            disabled={deleting}
                            className="btn-icon-sm admin-row-action-danger disabled:opacity-50"
                            aria-label="Delete"
                          >
                            {deleting ? (
                              <FiLoader size={14} className="animate-spin" />
                            ) : (
                              <FiTrash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <p className="text-sm font-semibold text-ink">{sorted.length ? "No matching projects" : "No projects yet"}</p>
                      <p className="mt-1 text-sm text-muted">
                        Create your first project to publish it to the portfolio.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-line md:hidden">
            {filtered.map((project) => <article key={project.id} className="space-y-4 p-4">
              <div className="flex gap-3"><ProjectVisual visual={project.visual} name={project.name} className="h-14 w-20 shrink-0 rounded-lg" /><div className="min-w-0 flex-1"><h2 className="truncate font-semibold text-ink">{project.name}</h2><p className="mt-0.5 text-xs text-muted">{project.type} · Order {project.order}</p><div className="mt-2 flex flex-wrap gap-1.5"><StatusBadge tone={project.published ? "success" : "neutral"}>{project.published ? "Published" : "Draft"}</StatusBadge>{project.featured && <StatusBadge tone="warning">Featured</StatusBadge>}{project.showOnCv && <StatusBadge tone="info">CV</StatusBadge>}</div></div></div>
              <div className="flex gap-2"><Link to={`/admin/projects/${project.slug}/edit`} className="btn-outline btn-sm flex-1"><FiEdit2 />Edit</Link><Link to={`/projects/${project.slug}`} className="btn-ghost btn-sm" aria-label={`View ${project.name}`}><FiExternalLink />View</Link><button type="button" className="btn-ghost-danger btn-sm" onClick={() => setPendingDelete(project)} aria-label={`Delete ${project.name}`}><FiTrash2 /></button></div>
            </article>)}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted">{sorted.length ? "No projects match these filters." : "Create your first project to publish it to the portfolio."}</div>}
          </div>
          </>
        )}
      </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="This removes the project from the public portfolio. This cannot be undone."
        confirmLabel="Delete project"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            del.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) });
          }
        }}
      />
    </div>
  );
}
