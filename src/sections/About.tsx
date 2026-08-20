import { FiMapPin } from "react-icons/fi";
import { useProfile, useSiteSection } from "../lib/hooks";
import { API_BASE } from "../lib/api";
import { Reveal } from "../components/Reveal";
import { CvDownloadButton } from "../components/CvDownloadButton";

type AboutStat = { value: string; label: string; visible?: boolean };
type WorkMethod = { title: string; description: string; icon?: string; visible?: boolean };

export function About() {
  const { data: profile } = useProfile();
  const { data: section } = useSiteSection("about");
  if (!profile || !section) return null;
  const experience = profile.experience;
  const stats = Array.isArray(section.content.statistics) ? section.content.statistics as AboutStat[] : [];
  const workflow = Array.isArray(section.content.workMethods) ? section.content.workMethods as WorkMethod[] : [];
  const contentText = (key: string) => typeof section.content[key] === "string" ? section.content[key] as string : "";
  const datePart = (value?: string | null) => {
    const match = value?.match(/^(\d{4})-(\d{2})$/);
    return match ? `${match[2]}/${match[1]}` : "";
  };
  const dateRange = (item: (typeof experience)[number]) => {
    const start = datePart(item.startDate);
    const end = item.isCurrent ? "Present" : datePart(item.endDate);
    return [start, end].filter(Boolean).join(" – ");
  };

  return (
    <section id="about" className="section relative overflow-hidden bg-bg-soft">
      <div className="bg-aurora pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="bg-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <div className="mx-auto max-w-[65ch]">
          {profile.photo && (
            <Reveal className="flex justify-center">
              <img
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
                className="h-40 w-40 rounded-2xl border-2 border-line-strong object-cover shadow-card-lg"
              />
            </Reveal>
          )}

          <Reveal className="text-center">
            <span className="eyebrow justify-center">{section.eyebrow}</span>
            <h2 className="heading mt-4">
              {section.heading}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-muted">
              <p>{contentText("introduction") || profile.bio}</p>
              <blockquote className="pull-quote my-8">
                {contentText("experienceParagraph")}
              </blockquote>
              <p>{contentText("technicalParagraph")}</p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-line pt-8 sm:grid-cols-3">
              {stats.filter((stat) => stat.visible !== false).map((stat) => (
                <div key={stat.label}>
                  <span className="font-display text-3xl font-bold text-ink">
                    {stat.value}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-faint">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-12">
              <h3 className="tech-label">{contentText("workflowHeading")}</h3>
              <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {workflow.filter((item) => item.visible !== false).map((item, index) => (
                  <li
                    key={`${item.title}-${index}`}
                    className="rounded-xl border border-line bg-surface p-4"
                  >
                    <span className="font-mono text-[11px] font-bold text-accent">
                      {item.icon || String(index + 1).padStart(2, "0")}
                    </span>
                    <h4 className="mt-1.5 font-display text-base font-bold text-ink">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <FiMapPin size={15} className="text-accent" aria-hidden />
                {profile.location}
              </div>
              <CvDownloadButton url={profile?.resumeUrl || `${API_BASE}/cv.pdf`} className="btn-primary group inline-flex" />
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-14">
              <h3 className="tech-label">Experience</h3>
              {experience.length === 0 ? <p className="mt-4 text-sm text-muted">No experience entries are published.</p> : <ol className="relative mt-6 space-y-10 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line-strong">
                {experience.map((item, i) => (
                  <li key={i} className="relative pl-8">
                    <span
                      className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg"
                      aria-hidden
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="min-w-0">
                        {dateRange(item) && <span className="chip">{dateRange(item)}</span>}
                        <h4 className="mt-2.5 font-display text-base font-bold text-ink">
                          {item.role || item.milestone}
                        </h4>
                        <p className="mt-0.5 text-sm font-medium text-accent">
                          {item.company || item.facility}
                        </p>
                        {item.location && (
                          <p className="mt-1 text-xs font-medium text-faint">{item.location}</p>
                        )}
                        {item.workArrangement && <p className="mt-1 text-xs font-medium text-faint">{item.workArrangement}</p>}
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {item.description || item.details}
                        </p>
                        {(item.bullets ?? []).length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{item.bullets?.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                        {(item.technologies ?? []).length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{item.technologies?.map((technology) => <span key={technology} className="chip">{technology}</span>)}</div>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
