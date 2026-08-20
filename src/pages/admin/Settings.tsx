import { useState } from "react";
import type { FormEvent } from "react";
import { FiCheck, FiKey, FiLoader, FiPlus, FiTrash2 } from "react-icons/fi";
import { useAdminProfile, useChangePassword, useUpdateProfile } from "../../lib/hooks";
import type { Profile, SocialLink } from "../../types";

function toFormState(p: Profile) {
  return {
    name: p.name,
    title: p.title,
    tagline: p.tagline,
    bio: p.bio,
    location: p.location,
    email: p.email,
    phone: p.phone,
    photo: p.photo ?? "",
    languages: p.languages ?? "",
    portfolioUrl: p.portfolioUrl ?? "",
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    socials: p.socials.map((s) => ({ ...s })),
  };
}

const emptyForm = {
  name: "",
  title: "",
  tagline: "",
  bio: "",
  location: "",
  email: "",
  phone: "",
  photo: "",
  languages: "",
  portfolioUrl: "",
  seoTitle: "",
  seoDescription: "",
  socials: [] as SocialLink[],
};

export function Settings() {
  const { data: profile, isLoading, error: loadError, refetch } = useAdminProfile();
  const update = useUpdateProfile();
  const changePassword = useChangePassword();

  const [form, setForm] = useState(emptyForm);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");

  if (profile && hydratedFor !== profile.id) {
    setHydratedFor(profile.id);
    setForm(toFormState(profile));
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setSocial = (i: number, key: keyof SocialLink, value: string) =>
    set(
      "socials",
      form.socials.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)),
    );

  const addSocial = () => set("socials", [...form.socials, { label: "", url: "" }]);

  const removeSocial = (i: number) =>
    set("socials", form.socials.filter((_, idx) => idx !== i));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaveError("");
    update.mutate(
      {
        name: form.name,
        title: form.title,
        tagline: form.tagline,
        bio: form.bio,
        location: form.location,
        email: form.email,
        phone: form.phone,
        photo: form.photo || null,
        languages: form.languages,
        portfolioUrl: form.portfolioUrl || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        socials: form.socials.filter((x) => x.label),
      },
      {
        onSuccess: (saved) => {
          setForm(toFormState(saved));
          setHydratedFor(saved.id);
        },
        onError: (err) => setSaveError(err.message),
      },
    );
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwNew.length < 10) {
      setPwError("New password must be at least 10 characters.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("New passwords do not match.");
      return;
    }
    changePassword.mutate(
      { currentPassword: pwCurrent, newPassword: pwNew },
      {
        onSuccess: () => {
          setPwCurrent("");
          setPwNew("");
          setPwConfirm("");
        },
        onError: (err) => setPwError(err.message),
      },
    );
  };

  if (isLoading && !profile) {
    return <div className="mx-auto max-w-4xl space-y-4" aria-busy="true"><div className="h-8 w-32 animate-pulse rounded bg-surface-3" /><div className="card h-72 animate-pulse bg-surface-2" /></div>;
  }

  if (loadError && !profile) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div role="alert" className="card border-danger/30 p-6">
          <h1 className="admin-heading">Unable to load settings</h1>
          <p className="mt-2 text-sm text-muted">{loadError.message}</p>
          <button type="button" onClick={() => void refetch()} className="btn-outline mt-5">Try again</button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="admin-heading">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Update your public profile and social links.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-5 p-6">
          <h2 className="font-display text-base font-bold text-ink">Profile</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="s-name" className="field-label">Full name</label>
              <input
                id="s-name"
                className="input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="s-title" className="field-label">Title</label>
              <input
                id="s-title"
                className="input"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="s-tagline" className="field-label">Tagline</label>
              <input
                id="s-tagline"
                className="input"
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="s-location" className="field-label">Location</label>
              <input
                id="s-location"
                className="input"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="s-email" className="field-label">Email</label>
              <input
                id="s-email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="s-phone" className="field-label">Phone</label>
              <input
                id="s-phone"
                className="input"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="s-languages" className="field-label">Languages</label>
              <input
                id="s-languages"
                className="input"
                value={form.languages}
                onChange={(e) => set("languages", e.target.value)}
                placeholder="Arabic (Native), English (Fluent)"
              />
            </div>
            <div>
              <label htmlFor="s-portfolio" className="field-label">Production portfolio URL</label>
              <input id="s-portfolio" type="url" className="input" value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} placeholder="https://your-production-domain.example" />
            </div>
          </div>

          <div>
            <label htmlFor="s-photo" className="field-label">Photo URL</label>
            <input
              id="s-photo"
              className="input font-mono text-xs"
              value={form.photo}
              onChange={(e) => set("photo", e.target.value)}
              placeholder="/myphoto.jpeg"
            />
          </div>

          <div>
            <label htmlFor="s-bio" className="field-label">Bio</label>
            <textarea
              id="s-bio"
              className="textarea min-h-32 resize-y"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="s-seo-title" className="field-label">SEO title</label>
              <input id="s-seo-title" className="input" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
            </div>
            <div>
              <label htmlFor="s-seo-description" className="field-label">SEO description</label>
              <textarea id="s-seo-description" className="textarea min-h-24" value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">
              Social links
            </h2>
            <button type="button" onClick={addSocial} className="btn-outline btn-sm">
              <FiPlus size={13} />
              Add
            </button>
          </div>

          {form.socials.map((s, i) => (
            <div key={i} className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <input
                className="input w-full sm:w-40"
                value={s.label}
                onChange={(e) => setSocial(i, "label", e.target.value)}
                placeholder="GitHub"
              />
              <input
                className="input w-full font-mono text-xs"
                value={s.url}
                onChange={(e) => setSocial(i, "url", e.target.value)}
                placeholder="https://…"
              />
              <button
                type="button"
                onClick={() => removeSocial(i)}
                className="btn-icon self-end border border-line text-muted hover:border-danger/50 hover:text-danger sm:self-auto"
                aria-label="Remove"
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pb-10">
          <button type="submit" disabled={update.isPending} className="btn-primary px-7">
            {update.isPending ? (
              <FiLoader size={16} className="animate-spin" />
            ) : (
              <FiCheck size={16} />
            )}
            {update.isPending ? "Saving…" : "Save settings"}
          </button>
          {update.isSuccess && (
            <span className="flex items-center gap-2 text-sm font-semibold text-ok">
              <FiCheck size={15} />
              Saved
            </span>
          )}
        </div>
        {saveError && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
            {saveError}
          </p>
        )}
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
            <FiKey size={16} className="text-accent" />
            Change password
          </h2>
          <p className="mt-1 text-sm text-muted">
            Update the password used to sign in to this admin console.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label htmlFor="pw-current" className="field-label">
              Current password
            </label>
            <input
              id="pw-current"
              type="password"
              className="input"
              value={pwCurrent}
              onChange={(e) => setPwCurrent(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label htmlFor="pw-new" className="field-label">
              New password
            </label>
            <input
              id="pw-new"
              type="password"
              className="input"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              autoComplete="new-password"
              minLength={10}
              required
            />
          </div>
          <div>
            <label htmlFor="pw-confirm" className="field-label">
              Confirm new password
            </label>
            <input
              id="pw-confirm"
              type="password"
              className="input"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {pwError && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
            {pwError}
          </p>
        )}

        {changePassword.isSuccess && !pwError && (
          <p className="flex items-center gap-2 text-sm font-semibold text-ok">
            <FiCheck size={15} />
            Password updated.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="btn-outline px-7"
          >
            {changePassword.isPending && (
              <FiLoader size={16} className="animate-spin" />
            )}
            Update password
          </button>
        </div>
      </form>
    </div>
  );
}
