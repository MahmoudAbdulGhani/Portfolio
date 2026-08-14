import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiLoader } from "react-icons/fi";
import { useAdminProject, useCreateProject, useUpdateProject } from "../../lib/hooks";
import type { Project } from "../../types";
import {
  DEFAULT_PROJECT_ACCENT,
  isProjectAccent,
  normalizeProjectAccent,
} from "../../lib/project-accent";

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FormState = {
  slug: string;
  name: string;
  type: string;
  tagline: string;
  description: string;
  overview: string;
  problem: string;
  solution: string;
  features: string[];
  stack: string[];
  team: string[];
  program: string;
  github: string;
  demo: string;
  featured: boolean;
  published: boolean;
  visual: string;
  coverImage: string;
  screenshots: string[];
  myRole: string;
  contributions: string[];
  ownership: string;
  teamSize: number | null;
  order: number;
};

const emptyForm: FormState = {
  slug: "",
  name: "",
  type: "",
  tagline: "",
  description: "",
  overview: "",
  problem: "",
  solution: "",
  features: [],
  stack: [],
  team: [],
  program: "",
  github: "",
  demo: "",
  featured: false,
  published: true,
  visual: DEFAULT_PROJECT_ACCENT,
  coverImage: "", screenshots: [], myRole: "", contributions: [], ownership: "", teamSize: null,
  order: 99,
};

function toFormState(p: Project): FormState {
  return {
    slug: p.slug,
    name: p.name,
    type: p.type,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    overview: p.overview ?? "",
    problem: p.problem ?? "",
    solution: p.solution ?? "",
    features: p.features,
    stack: p.stack,
    team: p.team ?? [],
    program: p.program ?? "",
    github: p.github ?? "",
    demo: p.demo ?? "",
    featured: p.featured,
    published: p.published,
    visual: normalizeProjectAccent(p.visual),
    coverImage: p.coverImage ?? "", screenshots: p.screenshots ?? [], myRole: p.myRole ?? "",
    contributions: p.contributions ?? [], ownership: p.ownership ?? "", teamSize: p.teamSize ?? null,
    order: p.order,
  };
}

function ProjectEditorSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-3" />
        <div className="h-8 w-56 animate-pulse rounded bg-surface-3" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-surface-3" />
      </div>
      <div className="sr-only" role="status">
        Loading project editor…
      </div>
      {[0, 1, 2, 3].map((section) => (
        <div key={section} className="card space-y-5 p-6">
          <div className="h-5 w-28 animate-pulse rounded bg-surface-3" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded-lg bg-surface-3" />
            <div className="h-10 animate-pulse rounded-lg bg-surface-3" />
          </div>
          <div className="h-24 animate-pulse rounded-lg bg-surface-3" />
        </div>
      ))}
    </div>
  );
}

export function ProjectEdit({ mode = "edit" }: { mode?: "create" | "edit" }) {
  const { slug } = useParams<{ slug: string }>();
  const isNew = mode === "create";
  const projectKey = isNew ? "new" : (slug ?? "");
  const {
    data: existing,
    isLoading: isLoadingExisting,
    error: loadError,
    refetch,
  } = useAdminProject(isNew ? "" : (slug ?? ""), { enabled: !isNew && Boolean(slug) });
  const update = useUpdateProject();
  const create = useCreateProject();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!isNew && existing && hydratedFor !== projectKey) {
    setHydratedFor(projectKey);
    setForm(toFormState(existing));
  }

  if (!isNew && isLoadingExisting && !existing) {
    return <ProjectEditorSkeleton />;
  }

  if (!isNew && loadError && !existing) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          to="/admin/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent"
        >
          <FiArrowLeft size={15} />
          Back to projects
        </Link>
        <div role="alert" className="card border-danger/30 p-6">
          <h1 className="admin-heading">Unable to load project</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {loadError.message}
          </p>
          <button type="button" onClick={() => void refetch()} className="btn-outline mt-5">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.type.trim()) {
      setError("Name and type are required.");
      return;
    }

    if (!isProjectAccent(form.visual)) {
      setError("Accent color must be a six-digit hex value, such as #5966A0.");
      return;
    }

    const validAssetPath = (value: string) => /^https?:\/\//i.test(value) || /^\/(?!\/)[^\s]+$/.test(value);
    if (form.coverImage && !validAssetPath(form.coverImage)) {
      setError("Cover image must be a full URL or a public path such as /projects/lobby/cover.webp.");
      return;
    }
    if (form.screenshots.some((value) => !validAssetPath(value))) {
      setError("Put one screenshot path on each line. Each path must start with / or http(s)://.");
      return;
    }

    const payload: FormState = {
      ...form,
      slug: form.slug.trim() || slugify(form.name),
      visual: normalizeProjectAccent(form.visual),
      features: splitLines(form.features.join("\n")),
      stack: splitLines(form.stack.join("\n")),
      team: splitLines(form.team?.join("\n") ?? ""),
    };

    if (isNew) {
      create.mutate(payload, {
        onSuccess: () => navigate("/admin/projects"),
        onError: (err) => setError(err.message),
      });
    } else {
      update.mutate(
        { id: existing!.id, patch: payload },
        {
          onSuccess: () => navigate("/admin/projects"),
          onError: (err) => setError(err.message),
        },
      );
    }
  };

  const saving = create.isPending || update.isPending;
  const accentPreview = normalizeProjectAccent(form.visual);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/admin/projects"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent"
        >
          <FiArrowLeft size={15} />
          Back to projects
        </Link>
        <h1 className="admin-heading">
          {isNew ? "New project" : `Edit — ${form.name || "untitled"}`}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Changes are saved to the database and appear on the live site once
          the project is published.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-5 p-6">
          <h2 className="font-display text-base font-bold text-ink">
            Basics
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-name" className="field-label">
                Name *
              </label>
              <input
                id="p-name"
                className="input"
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!form.slug || form.slug === slugify(form.name)) {
                    set("slug", slugify(e.target.value));
                  }
                }}
                placeholder="Project name"
                required
              />
            </div>
            <div>
              <label htmlFor="p-type" className="field-label">
                Type *
              </label>
              <input
                id="p-type"
                className="input"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                placeholder="e.g. Web app, API, Design system"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-slug" className="field-label">
                Slug
              </label>
              <input
                id="p-slug"
                className="input font-mono"
                value={form.slug}
                onChange={(e) => set("slug", slugify(e.target.value))}
                placeholder="project-url-slug"
              />
            </div>
            <div>
              <label htmlFor="p-order" className="field-label">
                Display order
              </label>
              <input
                id="p-order"
                type="number"
                className="input"
                value={form.order}
                onChange={(e) => set("order", Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-tagline" className="field-label">
              Tagline
            </label>
            <input
              id="p-tagline"
              className="input"
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="One-line summary shown under the title"
            />
          </div>

          <div>
            <label htmlFor="p-desc" className="field-label">
              Short description
            </label>
            <textarea
              id="p-desc"
              className="textarea min-h-24 resize-y"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Shown on project cards"
            />
          </div>
        </div>

        <div className="card space-y-5 p-6">
          <h2 className="font-display text-base font-bold text-ink">
            Case study
          </h2>

          <div>
            <label htmlFor="p-overview" className="field-label">
              Overview
            </label>
            <textarea
              id="p-overview"
              className="textarea min-h-24 resize-y"
              value={form.overview}
              onChange={(e) => set("overview", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-problem" className="field-label">
                The problem
              </label>
              <textarea
                id="p-problem"
                className="textarea min-h-28 resize-y"
                value={form.problem}
                onChange={(e) => set("problem", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="p-solution" className="field-label">
                The solution
              </label>
              <textarea
                id="p-solution"
                className="textarea min-h-28 resize-y"
                value={form.solution}
                onChange={(e) => set("solution", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-features" className="field-label">
              Key features
            </label>
            <textarea
              id="p-features"
              className="textarea min-h-28 resize-y font-mono text-xs"
              value={form.features.join("\n")}
              onChange={(e) => set("features", splitLines(e.target.value))}
              placeholder={"One feature per line:\nReal-time sync\nRole-based access"}
            />
          </div>
        </div>

        <div className="card space-y-5 p-6">
          <h2 className="font-display text-base font-bold text-ink">
            Stack & team
          </h2>

          <div>
            <label htmlFor="p-stack" className="field-label">
              Technologies
            </label>
            <textarea
              id="p-stack"
              className="textarea min-h-20 resize-y font-mono text-xs"
              value={form.stack.join("\n")}
              onChange={(e) => set("stack", splitLines(e.target.value))}
              placeholder={"One tech per line:\nReact\nNode.js"}
            />
          </div>

          <div>
            <label htmlFor="p-team" className="field-label">
              Team members
            </label>
            <textarea
              id="p-team"
              className="textarea min-h-20 resize-y font-mono text-xs"
              value={form.team?.join("\n") ?? ""}
              onChange={(e) => set("team", splitLines(e.target.value))}
              placeholder={"One member per line:\nJane Doe\nJohn Smith"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-program" className="field-label">
                Program
              </label>
              <input
                id="p-program"
                className="input"
                value={form.program ?? ""}
                onChange={(e) => set("program", e.target.value)}
                placeholder="e.g. The Digital Hub by UNRWA"
              />
            </div>
            <div>
              <label htmlFor="p-visual" className="field-label">
                Accent color
              </label>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <input
                  id="p-accent-picker"
                  type="color"
                  value={accentPreview}
                  onChange={(e) => set("visual", e.target.value.toUpperCase())}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label="Choose accent color"
                />
                <input
                  id="p-visual"
                  className="input h-10 w-32 font-mono uppercase"
                  value={form.visual}
                  onChange={(e) => set("visual", e.target.value.toUpperCase())}
                  inputMode="text"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={7}
                  pattern="#[0-9A-Fa-f]{6}"
                  placeholder="#5966A0"
                  aria-describedby="p-visual-help"
                />
                <span
                  className="h-8 w-8 rounded-md border border-black/10 shadow-sm"
                  style={{ backgroundColor: accentPreview }}
                  aria-label={`Accent preview: ${accentPreview}`}
                  role="img"
                />
              </div>
              <p id="p-visual-help" className="mt-2 text-xs text-muted">
                Choose a color or enter a six-digit hex value.
              </p>
            </div>
          </div>
        </div>

        <div className="card space-y-5 p-6">
          <h2 className="font-display text-base font-bold text-ink">Media &amp; personal contribution</h2>
          <div><label htmlFor="p-cover" className="field-label">Project cover image URL or public path</label><input id="p-cover" type="text" className="input font-mono text-xs" value={form.coverImage} onChange={(e) => set("coverImage", e.target.value.trim())} placeholder="/projects/lobby/cover.webp" /></div>
          <div><label htmlFor="p-screenshots" className="field-label">Screenshot URLs or public paths — one per line</label><textarea id="p-screenshots" className="textarea min-h-24 font-mono text-xs" value={form.screenshots.join("\n")} onChange={(e) => set("screenshots", splitLines(e.target.value))} placeholder={"/projects/lobby/friends.webp\n/projects/lobby/audio-room.webp\n/projects/lobby/community-chat.webp"} /><p className="mt-1 text-xs text-faint">Files inside public/projects are entered as /projects/… paths.</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="p-role" className="field-label">My role</label><input id="p-role" className="input" value={form.myRole} onChange={(e) => set("myRole", e.target.value)} placeholder="e.g. Full-Stack Developer" /></div><div><label htmlFor="p-team-size" className="field-label">Team size</label><input id="p-team-size" type="number" min="1" className="input" value={form.teamSize ?? ""} onChange={(e) => set("teamSize", e.target.value ? Number(e.target.value) : null)} /></div></div>
          <div><label htmlFor="p-ownership" className="field-label">What I personally owned</label><textarea id="p-ownership" className="textarea min-h-20" value={form.ownership} onChange={(e) => set("ownership", e.target.value)} /></div>
          <div><label htmlFor="p-contributions" className="field-label">My contributions — one per line</label><textarea id="p-contributions" className="textarea min-h-28" value={form.contributions.join("\n")} onChange={(e) => set("contributions", splitLines(e.target.value))} /></div>
        </div>

        <div className="card space-y-5 p-6">
          <h2 className="font-display text-base font-bold text-ink">
            Links & publishing
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-github" className="field-label">
                GitHub URL
              </label>
              <input
                id="p-github"
                type="url"
                className="input font-mono text-xs"
                value={form.github ?? ""}
                onChange={(e) => set("github", e.target.value)}
                placeholder="https://github.com/…"
              />
            </div>
            <div>
              <label htmlFor="p-demo" className="field-label">
                Live demo URL
              </label>
              <input
                id="p-demo"
                type="url"
                className="input font-mono text-xs"
                value={form.demo ?? ""}
                onChange={(e) => set("demo", e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Featured project
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Published
            </label>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pb-10">
          <button type="submit" disabled={saving} className="btn-primary px-7">
            {saving ? (
              <FiLoader size={16} className="animate-spin" />
            ) : (
              <FiCheck size={16} />
            )}
            {saving ? "Saving…" : isNew ? "Create project" : "Save changes"}
          </button>
          <Link to="/admin/projects" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
