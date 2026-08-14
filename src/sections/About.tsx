import { FiBriefcase, FiDownload, FiMapPin } from "react-icons/fi";
import { useProfile } from "../lib/hooks";
import { API_BASE } from "../lib/api";
import { Reveal } from "../components/Reveal";

const stats = [
  { value: "6+", label: "Projects engineered" },
  { value: "3", label: "Full-stack ecosystems" },
  { value: "4", label: "Credentials & training" },
];

export function About() {
  const { data: profile, isLoading, isError } = useProfile();
  const experience = profile?.experience ?? [];
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
    <section id="about" className="section relative bg-bg-soft">
      <div className="container-x grid grid-cols-1 gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <span className="eyebrow">About Mahmoud</span>
            <h2 className="heading mt-4">
              Computer science graduate building practical web applications.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
              <p>
                Computer science graduate and junior full-stack developer from
                Tripoli, Lebanon — building with React, Next.js and Angular on
                the frontend and Node.js, Express and NestJS on the backend.
              </p>
              <p>
                At The Digital Hub by UNRWA, I worked in teams on authentication,
                REST APIs, databases, and responsive interfaces for three web
                applications.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <span className="font-display text-2xl font-bold text-ink">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <FiMapPin size={15} className="text-accent" />
                {profile?.location ?? "Tripoli, Lebanon"}
              </div>
              <a
                href={`${API_BASE}/cv.pdf`}
                download
                className="btn-primary group inline-flex"
                aria-label="Download Mahmoud's CV as a PDF"
              >
                <FiDownload size={15} className="transition-transform duration-200 group-hover:translate-y-0.5" />
                Download CV
              </a>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal className="mb-8 flex items-center gap-3 font-mono text-xs text-faint">
            <FiBriefcase size={13} className="text-accent" />
            Experience timeline
            <span className="h-px flex-1 bg-line" />
          </Reveal>

          <ol className="relative space-y-10 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line-strong">
            {isLoading && <li className="pl-8 text-sm text-muted">Loading experience…</li>}
            {isError && <li className="pl-8 text-sm text-muted">Experience is temporarily unavailable.</li>}
            {experience.map((item, i) => (
              <li key={i} className="relative pl-8">
                <span
                  className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg"
                  aria-hidden
                />
                <Reveal delay={Math.min(i * 0.06, 0.24)}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                      {dateRange(item) && <span className="chip">{dateRange(item)}</span>}
                      <h3 className="mt-2.5 font-display text-base font-bold text-ink">
                        {item.role || item.milestone}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-accent">
                        {item.company || item.facility}
                      </p>
                      {item.location && <p className="mt-1 text-xs font-medium text-faint">{item.location}</p>}
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {item.description || item.details}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
