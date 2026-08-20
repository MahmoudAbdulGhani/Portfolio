import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { seedProfile } from "../data/portfolio";
import { useProfile } from "../lib/hooks";
import { API_BASE } from "../lib/api";
import { CvDownloadButton } from "../components/CvDownloadButton";

const focusAreas = [
  "React · Next.js · TypeScript",
  "Node.js · Express.js",
  "REST APIs",
  "Authentication · RBAC",
  "SQL · MongoDB",
];

export function Hero() {
  const { data: profile } = useProfile();
  const heroProfile = profile ?? seedProfile;
  const portraitSrc = profile?.photo || seedProfile.photo;
  const socials = profile?.socials ?? seedProfile.socials;
  const reduceMotion = useReducedMotion();
  const cvHref = heroProfile.resumeUrl || `${API_BASE}/cv.pdf`;

  return (
    <section
      id="hero"
      className="relative flex min-h-[88vh] items-center overflow-hidden pt-24 sm:pt-28"
    >
      <div className="bg-blueprint bg-blueprint-fade absolute inset-0" aria-hidden />
      <div className="bg-aurora pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="bg-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" aria-hidden />

      <div className="container-x relative z-10 grid grid-cols-1 items-center gap-12 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-7"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="tech-label block">{heroProfile.name.toUpperCase()}</span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Full-Stack Software
            <br />
            <span className="text-gradient">Engineer</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Building secure, scalable, and user-focused web applications.
          </p>

          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            I build production-ready applications using React, Next.js, TypeScript,
            Node.js, Express.js, and modern database technologies—from REST APIs
            and authentication to real-time communication and role-based systems.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5" aria-label="Focus areas">
            {focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-xs text-faint"
              >
                {area}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/projects" className="btn-primary btn-lg group">
              View Projects
              <FiArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
            <CvDownloadButton url={cvHref} className="btn-outline btn-lg" />
          </div>

          {socials.length > 0 && (
            <div className="mt-9 flex flex-wrap items-center gap-1 font-mono text-[11px] text-faint">
              {socials.map((s, i) => (
                <span key={s.id} className="flex items-center">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                  >
                    {s.label}
                  </a>
                  {i < socials.length - 1 && (
                    <span className="mx-2 text-line-strong" aria-hidden>
                      /
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="hidden lg:col-span-5 lg:block"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <div className="relative mx-auto max-w-sm">
            <div
              className="absolute -inset-3 -z-10 rounded-2xl bg-accent/8 blur-2xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-xl border border-line-strong bg-surface-2 shadow-card-lg">
              {portraitSrc && (
                <img
                  src={portraitSrc}
                  alt={`Portrait of ${heroProfile.name}`}
                  width={720}
                  height={900}
                  loading="eager"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent px-4 pb-3 pt-20"
                aria-hidden
              >
                <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
                  {heroProfile.location}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Open to opportunities
                </span>
              </div>
            </div>
            <div className="dimension-line mt-5" aria-hidden />
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              <span>Full-stack systems</span>
              <span>Profile · 001</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
