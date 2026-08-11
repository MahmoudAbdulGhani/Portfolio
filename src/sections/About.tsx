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
  const { data: profile } = useProfile();
  const experience = profile?.experience ?? [];

  return (
    <section id="about" className="section relative bg-bg-soft">
      <div className="container-x grid grid-cols-1 gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <span className="eyebrow">About Mahmoud</span>
            <h2 className="heading mt-4">
              A computer science foundation applied to modern full-stack
              engineering.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
              <p>
                Computer science graduate and junior full-stack engineer from
                Tripoli, Lebanon — building with React, Next.js and Angular on
                the frontend and Node.js, Express and NestJS on the backend.
              </p>
              <p>
                Recent work at The Digital Hub by UNRWA shipped in teams across
                monorepos, authentication, REST APIs and databases — products
                designed to stay understandable long after launch.
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
            {experience.map((item, i) => (
              <li key={i} className="relative pl-8">
                <span
                  className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg"
                  aria-hidden
                />
                <Reveal delay={Math.min(i * 0.06, 0.24)}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                      <span className="chip">{item.meta}</span>
                      <h3 className="mt-2.5 font-display text-base font-bold text-ink">
                        {item.milestone}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-accent">
                        {item.facility}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {item.details}
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
