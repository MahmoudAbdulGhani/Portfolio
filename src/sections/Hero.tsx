import { Link } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FiArrowRight,
  FiDownload,
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { seedProfile } from "../data/portfolio";
import { useProfile } from "../lib/hooks";
import { API_BASE } from "../lib/api";

const focusAreas = [
  "React · Next.js",
  "Angular",
  "Node.js · NestJS",
  "REST APIs",
  "Real-time systems",
];

const socialIcons: Record<string, IconType> = {
  github: FiGithub,
  linkedin: FiLinkedin,
  instagram: FiInstagram,
  whatsapp: FiMessageCircle,
};

export function Hero() {
  const { data: profile } = useProfile();
  // The portrait is part of the first viewport. Use the canonical local asset
  // immediately, then let the profile query replace it only when necessary.
  const heroProfile = profile ?? seedProfile;
  const portraitSrc = profile?.photo || seedProfile.photo;
  const socials = profile?.socials ?? seedProfile.socials;
  const heroRef = useRef<HTMLElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(
    () => typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || !motionAllowed) return;

    let cancelled = false;
    let context: { revert: () => void } | undefined;
    let parallax: { kill: () => void } | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.default;
        gsap.registerPlugin(scrollTriggerModule.ScrollTrigger);
        context = gsap.context(() => {
          const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
          timeline
            .to("[data-hero-copy]", { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.055 })
            .eventCallback("onComplete", () => {
              if (!window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) return;
              parallax = gsap.to("[data-hero-portrait]", {
                y: -18,
                ease: "none",
                scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
              });
            });
        }, hero);
      },
      () => setMotionAllowed(false),
    );

    return () => {
      cancelled = true;
      parallax?.kill();
      context?.revert();
    };
  }, [motionAllowed]);

  return (
    <section
      id="hero"
      ref={heroRef}
      data-gsap-hero={motionAllowed ? "true" : undefined}
      className="relative flex items-center overflow-hidden pt-24 sm:min-h-screen sm:pt-28"
    >
      <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" aria-hidden />

      <div className="container-x relative z-10 grid grid-cols-1 items-center gap-10 py-12 sm:gap-16 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div>
            <div
              data-hero-copy
              className="mb-7 flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <span className="font-display text-sm font-semibold tracking-tight text-ink sm:text-[15px]">
                {heroProfile.name}
              </span>
              <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted sm:text-sm">
                <FiMapPin size={14} className="shrink-0 text-accent" aria-hidden />
                {heroProfile.location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
                Open
              </span>
            </div>

            <div data-hero-copy>
              <span className="eyebrow">{heroProfile.title}</span>
              <h1 className="mt-4 text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]">
                I build{" "}
                <span className="text-gradient">full-stack products</span>{" "}
                for real workflows
                <span className="animate-blink text-accent" aria-hidden>
                  _
                </span>
              </h1>
            </div>

            <p
              data-hero-copy
              className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            >
              Full-stack software engineer from Tripoli, Lebanon. I ship
              responsive React and Angular interfaces backed by Node.js and
              NestJS APIs, MongoDB and Supabase data layers, and real-time
              systems — built collaboratively at The Digital Hub by UNRWA.
            </p>

            <div
              data-hero-copy
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm text-muted"
              aria-label="Focus areas"
            >
              {focusAreas.map((area, i) => (
                <span key={area} className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden />
                  )}
                  {area}
                </span>
              ))}
            </div>

            <div
              data-hero-copy
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link to="/projects" className="btn-primary btn-lg group">
                View Projects
                <FiArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link to="/contact" className="btn-outline btn-lg">
                Contact Mahmoud
              </Link>
              <a
                href={`${API_BASE}/cv.pdf`}
                download
                className="btn-ghost btn-lg"
                aria-label="Download Mahmoud's CV as a PDF"
              >
                <FiDownload size={17} />
                Download CV
              </a>
            </div>

            {socials.length > 0 && (
              <div
                className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                  Find me on
                </span>
                <span className="hidden h-px w-8 bg-line sm:block" aria-hidden />
                <div className="flex items-center gap-2">
                  {socials.map((s) => {
                    const Icon = socialIcons[s.label.toLowerCase()] ?? FiGithub;
                    return (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="btn-icon border border-line bg-surface text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent"
                      >
                        <Icon size={16} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          data-hero-portrait
          className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-md"
        >
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[1.5rem] bg-accent/8 blur-2xl"
              aria-hidden
            />
            <div className="relative rounded-2xl bg-gradient-to-br from-accent/35 via-accent-2/20 to-transparent p-px shadow-card-lg">
              <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-surface-2">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  {portraitSrc && (
                    <img
                      src={portraitSrc}
                      alt={`Portrait of ${heroProfile.name}`}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      width={960}
                      height={1280}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
