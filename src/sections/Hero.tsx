import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useProfile, useSiteSection } from "../lib/hooks";
import { API_BASE } from "../lib/api";
import { CvDownloadButton } from "../components/CvDownloadButton";
import { Magnetic } from "../components/Magnetic";

export function Hero() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: section } = useSiteSection("hero");
  const introduction = typeof section?.content.introduction === "string" ? section.content.introduction : "";
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `rotateX(${yPct * -14}deg) rotateY(${xPct * 14}deg)`;
  };

  const handleCardMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  if (isLoading) return <section id="hero" className="flex min-h-[88vh] items-center justify-center"><span className="text-sm text-muted">Loading profile…</span></section>;
  if (isError || !profile) return <section id="hero" className="flex min-h-[88vh] items-center justify-center"><button className="btn-outline" onClick={() => void refetch()}>Retry loading profile</button></section>;
  const cvHref = profile.resumeUrl || `${API_BASE}/cv.pdf`;
  const socials = profile.socials.filter((social) => social.showInHero !== false);
  const usesLocalPortrait = profile.photo === "/myphoto.jpeg";

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
        <div className="hero-enter lg:col-span-7">
          <span className="tech-label block">{profile.name.toUpperCase()}</span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            {section?.heading || profile.title}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            {section?.description || profile.tagline}
          </p>

          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            {introduction || profile.bio}
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5" aria-label="Focus areas">
            {profile.focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-xs text-faint"
              >
                {area}
              </span>
            ))}
          </div>

          {profile.photo && (
            <div className="mt-8 flex items-center gap-4 lg:hidden">
              <div className="relative shrink-0">
                <div className="absolute -inset-1.5 -z-10 rounded-2xl bg-accent/15 blur-lg" aria-hidden />
                <picture>
                  {usesLocalPortrait && <source type="image/avif" srcSet="/myphoto-240w.avif 240w, /myphoto-400w.avif 400w" sizes="112px" />}
                  {usesLocalPortrait && <source type="image/webp" srcSet="/myphoto-240w.webp 240w, /myphoto-400w.webp 400w" sizes="112px" />}
                  <img
                    src={profile.photo}
                    alt={`Portrait of ${profile.name}`}
                    width={112}
                    height={140}
                    loading="eager"
                    decoding="async"
                    className="h-[140px] w-28 rounded-xl border border-line-strong bg-surface-2 object-cover object-center shadow-card-lg"
                  />
                </picture>
              </div>
              <div className="min-w-0">
                <span className="block font-display text-base font-bold text-ink">{profile.name}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{profile.location}</span>
                <span className="mt-2 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  <span className="h-2 w-2 rounded-full bg-ok" aria-hidden />
                  {profile.availabilityText}
                </span>
              </div>
            </div>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.18}>
              <Link to="/projects" className="btn-primary btn-lg group">
                {section?.ctaLabel}
                <FiArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </Magnetic>
            <Magnetic strength={0.18}>
              <CvDownloadButton url={cvHref} className="btn-outline btn-lg" />
            </Magnetic>
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
        </div>

        <div className="hero-card-enter hidden lg:col-span-5 lg:block">
          <div className="relative mx-auto max-w-sm [perspective:1000px]">
            <div
              className="absolute -inset-3 -z-10 rounded-2xl bg-accent/8 blur-2xl"
              aria-hidden
            />
            <div
              ref={cardRef}
              style={{ transformStyle: "preserve-3d" }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="relative overflow-hidden rounded-xl border border-line-strong bg-surface-2 shadow-card-lg transition-shadow duration-300 hover:shadow-2xl"
            >
              {profile.photo && (
                <img
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
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
                  {profile.location}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {profile.availabilityText}
                </span>
              </div>
            </div>
            <div className="dimension-line mt-5" aria-hidden />
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              <span>{profile.heroLabel}</span>
              <span>{profile.profileReference}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
