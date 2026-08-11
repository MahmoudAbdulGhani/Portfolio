import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiExternalLink,
  FiGithub,
  FiPrinter,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { API_BASE } from "../lib/api";
import { PageMeta } from "../components/PageMeta";
import {
  seedCertifications,
  seedEducation,
  seedProfile,
  seedProjects,
  seedSkills,
} from "../data/portfolio";
import {
  useCertifications,
  useEducation,
  useProfile,
  useProjects,
  useSkills,
} from "../lib/hooks";
import "./cv.css";

const cleanUrl = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/+$/, "");
const skillOrder = ["Frontend", "Backend", "Data", "Tools"];

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="cv-section-title">{children}</h2>;
}

function Toolbar() {
  return (
    <div className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
        >
          <FiArrowLeft size={16} />
          Back to portfolio
        </Link>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <a
            href={`${API_BASE}/cv.pdf`}
            download
            className="cv-toolbar-action cv-toolbar-outline flex-1 sm:flex-none"
          >
            <FiDownload size={14} />
            Download PDF
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="cv-toolbar-action cv-toolbar-primary flex-1 sm:flex-none"
          >
            <FiPrinter size={14} />
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export function Cv() {
  const { data } = useProfile();
  const { data: projectList } = useProjects();
  const { data: skillList } = useSkills();
  const { data: educationList } = useEducation();
  const { data: certificationList } = useCertifications();

  const profile = data ?? seedProfile;
  const projects = projectList ?? seedProjects;
  const skills = skillList ?? seedSkills;
  const education = educationList ?? seedEducation;
  const certifications = certificationList ?? seedCertifications;

  const socials = profile.socials ?? [];
  const github = socials.find((s) => /github/i.test(s.label))?.url;
  const linkedin = socials.find((s) => /linkedin/i.test(s.label))?.url;

  const contact: { label: string; href?: string; icon?: IconType }[] = [];
  if (profile.email)
    contact.push({ label: profile.email, href: `mailto:${profile.email}` });
  if (profile.phone)
    contact.push({
      label: profile.phone,
      href: `tel:${profile.phone.replace(/[^+\d]/g, "")}`,
    });
  if (profile.location) contact.push({ label: profile.location });
  if (github) contact.push({ label: cleanUrl(github), href: github });
  if (linkedin) contact.push({ label: cleanUrl(linkedin), href: linkedin });
  if (typeof window !== "undefined")
    contact.push({
      label: cleanUrl(window.location.origin),
      href: window.location.origin,
    });

  const groupedSkills = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const skill of skills) {
      const list = map.get(skill.category) ?? [];
      list.push(skill.name);
      map.set(skill.category, list);
    }
    const rank = (c: string) =>
      skillOrder.indexOf(c) < 0 ? 99 : skillOrder.indexOf(c);
    return [...map.entries()].sort(([a], [b]) => rank(a) - rank(b));
  }, [skills]);

  return (
    <>
      <PageMeta
        title="Resume"
        description={`${profile.name} — Full-Stack Developer / Software Engineer based in ${profile.location}.`}
      />
      <Toolbar />

      <div className="cv-screen min-h-screen bg-slate-100 px-4 py-10 sm:px-8">
        <article className="cv-page mx-auto max-w-[850px] rounded-xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
          {/* ------------------------------------------------------------------ */}
          {/*  Header — name, title, contacts; circular headshot, top-right.     */}
          {/* ------------------------------------------------------------------ */}
          <header className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">
                {profile.name}
              </h1>
              <p className="mt-1.5 text-[15px] font-semibold text-blue-700">
                {profile.title}
              </p>
            </div>
            {profile.photo && (
              <img
                src={profile.photo}
                alt=""
                aria-hidden
                className="h-24 w-24 flex-none rounded-full border border-slate-200 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </header>

          <address className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] font-medium text-slate-600 not-italic">
            {contact.map((item, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden />
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("/") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-blue-700 hover:decoration-blue-300"
                  >
                    {item.label}
                  </a>
                ) : (
                  item.label
                )}
              </span>
            ))}
          </address>

          <hr className="my-6 border-slate-200" />

          {/* ------------------------------------------------------------------ */}
          {/*  Body                                                              */}
          {/* ------------------------------------------------------------------ */}
          <div className="cv-grid">
            {/* -------- Main column ------------------------------------------ */}
            <div className="min-w-0">
              <section>
                <SectionTitle>Summary</SectionTitle>
                <p className="text-[12.5px] leading-relaxed text-slate-700">
                  {profile.bio}
                </p>
              </section>

              <section className="mt-7">
                <SectionTitle>Experience</SectionTitle>
                {(profile.experience ?? []).map((job) => (
                  <article key={job.milestone + job.facility} className="cv-entry">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-[13.5px] font-bold text-slate-900">
                          {job.milestone}
                        </h3>
                        <p className="mt-0.5 text-[12px] font-semibold text-slate-600">
                          {job.facility}
                        </p>
                      </div>
                      <span className="cv-meta flex-none">{job.meta}</span>
                    </div>
                    {job.details && (
                      <ul className="mt-1.5 space-y-1">
                        <li className="flex gap-2 text-[12px] leading-relaxed text-slate-700">
                          <span className="cv-keyline mt-[3px]" aria-hidden />
                          <span>{job.details}</span>
                        </li>
                      </ul>
                    )}
                  </article>
                ))}
              </section>

              <section className="mt-7">
                <SectionTitle>Projects</SectionTitle>
                {projects.map((p) => (
                  <article key={p.id} className="cv-entry">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-[13.5px] font-bold text-slate-900">
                        <Link
                          to={`/projects/${p.slug}`}
                          className="text-slate-900 hover:text-blue-700"
                        >
                          {p.name}
                        </Link>
                      </h3>
                      <span className="cv-meta flex-none">{p.type}</span>
                    </div>
                    {p.features.length > 0 && (
                      <ul className="mt-1.5 ml-0 space-y-1">
                        {p.features.slice(0, 2).map((f, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-[12px] leading-relaxed text-slate-700"
                          >
                            <span className="cv-keyline mt-[3px]" aria-hidden />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {p.stack.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.stack.map((t) => (
                          <span key={t} className="cv-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {(p.demo || p.github) && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {p.demo && (
                          <a
                            href={p.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cv-link"
                          >
                            <FiExternalLink size={12} />
                            Live Demo
                          </a>
                        )}
                        {p.github && (
                          <a
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cv-link"
                          >
                            <FiGithub size={12} />
                            Source Code
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </section>
            </div>

            {/* -------- Sidebar ---------------------------------------------- */}
            <aside className="min-w-0">
              <div className="cv-panel rounded-xl">
                <section>
                  <SectionTitle>Skills</SectionTitle>
                  {groupedSkills.map(([category, names]) => (
                    <div key={category} className="cv-group-label">
                      {category}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {names.map((n) => (
                          <span key={n} className="cv-pill">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>

                <section className="mt-6">
                  <SectionTitle>Education</SectionTitle>
                  {education.map((edu) => (
                    <div key={edu.id} className="cv-entry">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[12.5px] font-bold text-slate-900">
                          {edu.degree}
                        </h3>
                        {edu.period && <span className="cv-meta flex-none">{edu.period}</span>}
                      </div>
                      <p className="mt-0.5 text-[12px] font-semibold text-slate-600">
                        {edu.school}
                      </p>
                      {edu.details && (
                        <p className="mt-1 text-[11.5px] text-slate-500">
                          {edu.details}
                        </p>
                      )}
                    </div>
                  ))}
                </section>

                <section className="mt-6">
                  <SectionTitle>Certifications</SectionTitle>
                  <div className="space-y-3">
                    {certifications.map((cert) => (
                      <div key={cert.id}>
                        <h3 className="text-[12px] font-bold leading-snug text-slate-900">
                          {cert.title}
                        </h3>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                          {[cert.issuer, cert.year].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {profile.languages && (
                  <section className="mt-6">
                    <SectionTitle>Languages</SectionTitle>
                    <p className="text-[12px] leading-relaxed text-slate-700">
                      {profile.languages}
                    </p>
                  </section>
                )}
              </div>
            </aside>
          </div>
        </article>
      </div>
    </>
  );
}
