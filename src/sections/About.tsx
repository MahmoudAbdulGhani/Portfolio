import { FiMapPin } from "react-icons/fi";
import { useProfile } from "../lib/hooks";
import { API_BASE } from "../lib/api";
import { seedProfile } from "../data/portfolio";
import { Reveal } from "../components/Reveal";
import { CvDownloadButton } from "../components/CvDownloadButton";

const stats = [
  { value: "3", label: "Featured team products" },
  { value: "2", label: "Professional roles" },
  { value: "BSc", label: "Computer Science" },
];

const workflow = [
  {
    step: "01",
    title: "Discovery",
    desc: "Requirement mapping, data modeling, and API contracts agreed before a line of UI is written.",
  },
  {
    step: "02",
    title: "Build",
    desc: "Typed, tested full-stack code with secure auth, real-time features, and clean APIs.",
  },
  {
    step: "03",
    title: "Ship",
    desc: "Deployed to production and iterated on feedback from real users and teams.",
  },
];

const fallbackExperience = [
  {
    startDate: "2026-01",
    endDate: null,
    isCurrent: true,
    role: "Software Engineering Intern",
    company: "The Digital Hub",
    location: "Tripoli, Lebanon",
    description:
      "Built authentication, REST APIs, databases, and responsive interfaces for three production web applications shipped in teams.",
    milestone: null,
    facility: null,
    details: null,
  },
];

export function About() {
  const { data: profile } = useProfile();
  const experience = profile?.experience?.length ? profile.experience : fallbackExperience;
  const photoSrc = profile?.photo || seedProfile.photo;
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
          {photoSrc && (
            <Reveal className="flex justify-center">
              <img
                src={photoSrc}
                alt={`Portrait of ${profile?.name ?? "Mahmoud Abdul Ghani"}`}
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
                className="h-40 w-40 rounded-2xl border-2 border-line-strong object-cover shadow-card-lg"
              />
            </Reveal>
          )}

          <Reveal className="text-center">
            <span className="eyebrow justify-center">About</span>
            <h2 className="heading mt-4">
              Building practical web applications, end to end.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-muted">
              <p>
                Computer science graduate and full-stack software engineer from
                Tripoli, Lebanon, interested in junior full-stack and backend roles.
                I build responsive React and Next.js interfaces backed by secure
                Node.js, Express.js, NestJS, MongoDB, and SQL data services.
              </p>
              <blockquote className="pull-quote my-8">
                At Ishtari Group, I developed PHP MVC administration modules and
                SQL reporting workflows. Through The Digital Hub by UNRWA, I
                collaborated on GameZone Arena, Lobby, and UniHub.
              </blockquote>
              <p>
                My focus is maintainable API design, authentication, authorization,
                database validation, and clear team delivery through Git branches,
                pull requests, and code review. My current project work also uses
                Python backend frameworks, automated testing, CI/CD, and AI APIs.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-line pt-8 sm:grid-cols-3">
              {stats.map((stat) => (
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
              <h3 className="tech-label">How I work</h3>
              <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {workflow.map((item) => (
                  <li
                    key={item.step}
                    className="rounded-xl border border-line bg-surface p-4"
                  >
                    <span className="font-mono text-[11px] font-bold text-accent">
                      {item.step}
                    </span>
                    <h4 className="mt-1.5 font-display text-base font-bold text-ink">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {item.desc}
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
                {profile?.location ?? "Tripoli, Lebanon"}
              </div>
              <CvDownloadButton url={profile?.resumeUrl || `${API_BASE}/cv.pdf`} className="btn-primary group inline-flex" />
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-14">
              <h3 className="tech-label">Experience</h3>
              <ol className="relative mt-6 space-y-10 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line-strong">
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
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {item.description || item.details}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
