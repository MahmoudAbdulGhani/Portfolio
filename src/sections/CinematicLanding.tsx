import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowRight, FiArrowUpRight, FiGithub, FiInstagram, FiLinkedin, FiMail, FiMapPin, FiMessageCircle, FiMessageSquare, FiZap } from "react-icons/fi";
import { useCertifications, useEducation, useProfile, useProjects, useSiteSection, useSkills } from "../lib/hooks";
import { useLandingMotion } from "../lib/landing-motion";
import { ScrollWords, MotionTimeline } from "../components/LandingMotion";
import { PiMonitor, PiCube, PiDatabase } from "react-icons/pi";
import { presentationContent, contentText } from "../lib/presentation-content";
import { formatMonth } from "../lib/format";
import { PublicDataState } from "../components/PublicDataState";
import { CinematicProjects } from "../components/cinematic/CinematicProjects";
import { SkillExplorer } from "../components/SkillExplorer";
import { CourseDisclosure, MaskedReveal } from "../components/SectionMotion";
import type { ExperienceItem, Profile } from "../types";
import "./cinematic-landing.css";

const ease = [0.22, 1, 0.36, 1] as const;
function Enter({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { enabled, profile } = useLandingMotion();
  return <motion.div className={className} initial={enabled ? { opacity: 0, y: profile === "touch" ? 14 : 24 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: profile === "touch" ? 0.5 : 0.7, delay, ease }}>{children}</motion.div>;
}
// Synchronize scene progress when reduced-motion preferences change.
function useSceneProgress(progress: MotionValue<number>) {
  const { enabled } = useLandingMotion();
  const frozen = useMotionValue(progress.get());
  useEffect(() => { if (enabled) frozen.set(progress.get()); }, [enabled, frozen, progress]);
  useMotionValueEvent(progress, "change", value => { if (enabled) frozen.set(value); });
  return frozen;
}
export function CinematicLanding() {
  const query = useProfile();
  if (!query.data) return <PublicDataState loading={query.isLoading} error={query.isError} onRetry={() => void query.refetch()} label="profile" />;
  return <div className="cinema"><PortraitHero profile={query.data} /><Capabilities /><WorkSequence /><PersonalStory profile={query.data} /><SkillSequence /><CareerSequence profile={query.data} /><LearningSequence /><EditorialContact profile={query.data} /></div>;
}
function PortraitHero({ profile }: { profile: Profile }) {
  const { enabled } = useLandingMotion();
  const { data: section } = useSiteSection("hero");
  const title = section?.heading || profile.title;
  const split = title.indexOf(" ");
  const content = presentationContent("hero", section?.content);
  const leftTitle = split > 0 ? title.slice(0, split) : title;
  const rightTitle = split > 0 ? title.slice(split + 1) : '';
  return <section id="hero" className="cinema-hero cinema-hero-split"><div className={`cinema-hero-sticky ${profile.photo ? "" : "cinema-hero-without-photo"}`}>
    <h1 className="sr-only">{title}</h1>
    <Enter className="cinema-hero-copy">
      <p className="cinema-hero-name">{profile.shortName || profile.name}</p>
      <p className="cinema-hero-left-title" aria-hidden>{leftTitle}</p><p className="cinema-hero-mobile-title" aria-hidden>{rightTitle}</p>
      <p className="cinema-hero-introduction">{contentText(content, "offerDescription") || section?.description || profile.tagline}</p>
      <div className="cinema-hero-meta"><span><FiMapPin aria-hidden />{profile.location}</span>{profile.openToOpportunities && profile.availabilityText && <span className="cinema-availability"><span aria-hidden />{profile.availabilityText}</span>}</div>
      <div className="cinema-hero-actions"><Link className="cinema-link cinema-primary" to="/contact?intent=project">{contentText(content, "projectCtaLabel")}<FiArrowRight aria-hidden /></Link><a className="cinema-link" href="#projects">{contentText(content, "workCtaLabel")}<FiArrowDown aria-hidden /></a></div>
    </Enter>
    {profile.photo && <div className="cinema-portrait-perspective"><motion.figure className="cinema-portrait" initial={enabled ? { opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)" } : false} animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }} transition={{ duration: .85, ease }}><img src={profile.photo} alt={`Portrait of ${profile.name}`} fetchPriority="high" decoding="async" /></motion.figure></div>}
    <Enter className="cinema-hero-right" delay={.2}>
      <p className="cinema-hero-right-title" aria-hidden>{rightTitle}</p>
      {!!profile.focusAreas.length && <ul className="cinema-hero-focus" aria-label="Focus areas">{profile.focusAreas.slice(0, 3).map(area => <li key={area}>{area}</li>)}</ul>}
    </Enter>
  </div></section>;

}
function Capabilities() {
  const { data: section } = useSiteSection("hero");
  const content = presentationContent("hero", section?.content);
  const items = Array.isArray(content.capabilities) ? content.capabilities.filter((item): item is { title: string; shortTitle?: string; description?: string } => Boolean(item && typeof item === "object" && "title" in item && typeof item.title === "string")) : [];
  const icons = [PiMonitor, PiCube, PiDatabase];
  return <section className="cinema-capabilities cinema-container" aria-label="What I can build">{items.map((item, i) => { const Icon = icons[i % icons.length]; return <Enter key={item.title} delay={i * .08}><Icon aria-hidden /><h2><span className="capability-desktop-title">{item.title}</span><span className="capability-mobile-title">{item.shortTitle || item.title}</span></h2><p>{item.description}</p></Enter>; })}</section>;
}
function PersonalStory({ profile }: { profile: Profile }) {
  const { data: section } = useSiteSection("about");
  if (section?.visible === false) return null;
  return <section id="about" className="cinema-section cinema-about"><div className="cinema-container"><Enter><p className="cinema-label">02 / {section?.eyebrow}</p></Enter><div className="cinema-about-grid"><h2><ScrollWords text={section?.heading || ""} /></h2><Enter className="cinema-about-details"><p className="cinema-profile-name">{profile.shortName}</p>{profile.languages && <p className="cinema-muted">{profile.languages}</p>}<p className="cinema-bio">{typeof section?.content.introduction === "string" ? section.content.introduction : profile.bio}</p>{profile.bio && <details className="cinema-detail"><summary>More about me<FiArrowDown aria-hidden /></summary><p>{profile.bio}</p></details>}</Enter></div></div></section>;
}
function SkillRail({ names, reverse = false }: { names: string[]; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.05 });
  const { enabled } = useLandingMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSceneProgress(scrollYProgress);
  const x = useTransform(p, [0, 1], reverse ? [45, -45] : [-45, 45]);
  return <div ref={ref} className={`cinema-rail ${reverse ? "rail-reverse" : ""} ${visible && enabled ? "rail-active" : ""}`} aria-hidden><motion.div style={{ x }}><div className="cinema-rail-track">{[0, 1].map(copy => <div className="cinema-rail-copy" key={copy}>{names.map((name, i) => <span key={`${copy}-${i}`}>{name}</span>)}</div>)}</div></motion.div></div>;
}
function SkillSequence() {
  const query = useSkills();
  const { data: section } = useSiteSection("skills"), { data: technologies } = useSiteSection("technologies");
  const seen = new Set<string>();
  const groups = (query.data ?? []).reduce<Record<string, string[]>>((acc, s) => { const key = s.name.toLowerCase().replace(/\s*\(es6\+\)/, ""); if (!seen.has(key)) { (acc[s.category] ??= []).push(s.name); seen.add(key); } return acc; }, {});
  if (section?.visible === false) return null;
  return <section id="skills" className="cinema-section cinema-skills"><div className="cinema-container cinema-section-head"><Enter><p className="cinema-label">03 / {section?.eyebrow}</p></Enter><span className="cinema-muted">{technologies?.eyebrow || "Stack in use"}</span></div>{query.isLoading || query.isError ? <PublicDataState loading={query.isLoading} error={query.isError} onRetry={() => void query.refetch()} label="skills" /> : <><div className="cinema-rails"><SkillRail names={(groups.Frontend ?? []).slice(0, 6)} /><SkillRail names={[...(groups["Backend & APIs"] ?? []), ...(groups.Backend ?? [])].slice(0, 6)} reverse /></div><div className="cinema-container"><details className="cinema-stack-detail"><summary>Explore the full technical stack<FiArrowDown aria-hidden /></summary><SkillExplorer groups={groups} heading={section?.heading || ""} /></details></div></>}</section>;
}
function WorkSequence() {
  const query = useProjects();
  const { data: section } = useSiteSection("featuredProjects");
  const featured = (query.data ?? []).filter(p => p.featured && p.published && p.showOnPortfolio !== false);
  if (section?.visible === false) return null;
  if (query.isLoading || query.isError) return <PublicDataState loading={query.isLoading} error={query.isError} onRetry={() => void query.refetch()} label="projects" />;
  if (!featured.length) return null;
  const content = presentationContent("featuredProjects", section?.content);
  const selection = Array.isArray(content.featuredSlugs) ? content.featuredSlugs.filter((slug): slug is string => typeof slug === "string") : [];
  const selected = selection.length ? selection.flatMap(slug => featured.filter(project => project.slug === slug)) : featured;
  return <CinematicProjects
    projects={(selected.length ? selected : featured).slice(0, 3)}
    eyebrow={`01 / ${typeof content.cinematicEyebrow === "string" ? content.cinematicEyebrow.replace(/^\d+\s*\/\s*/, "") : "PROJECTS"}`}
    heading={typeof content.cinematicHeading === "string" && content.cinematicHeading.trim() ? content.cinematicHeading : "Selected work"}
    description={typeof content.cinematicDescription === "string" ? content.cinematicDescription : undefined}
    ctaLabel={section?.ctaLabel || "View all projects"}
    allProjectsHref={section?.ctaUrl || "/projects"}
    ambientSrc="/brand/navy-atmosphere.webp"
  />;
}
function CareerItem({ item, index }: { item: ExperienceItem; index: number }) {
  const { enabled } = useLandingMotion();
  return <motion.li className="cinema-career-item" initial={enabled ? { y: 18, opacity: .7 } : false} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .5, ease }}><span className="cinema-career-number">0{index + 1}</span><div><h3>{item.role || item.milestone}</h3><p>{item.company || item.facility}</p>{(item.cvBullets?.[0] || item.bullets?.[0] || item.details || item.description) && <p className="cinema-career-summary">{(item.cvBullets?.[0] || item.bullets?.[0] || item.details || item.description)?.split(/(?<=[.!?])\s+(?=[A-Z])/)[0]}</p>}<details className="cinema-detail"><summary><FiArrowDown aria-hidden /><span className="sr-only">Details for {item.role || item.milestone}</span></summary><p>{item.description || item.details}</p></details></div><span className="cinema-label cinema-period">{item.startDate ? [formatMonth(item.startDate), item.isCurrent ? "Present" : formatMonth(item.endDate)].filter(Boolean).join(" — ") : item.meta}</span></motion.li>;
}
function CareerSequence({ profile }: { profile: Profile }) {
  return <section id="experience" className="cinema-section cinema-experience"><div className="cinema-container"><Enter><p className="cinema-label">04 / Selected experience</p><h2>Experience<span className="cinema-heading-dot">.</span></h2></Enter><MotionTimeline className="cinema-career"><ol>{profile.experience.filter(item => item.published !== false).map((item, i) => <CareerItem key={item.id || i} item={item} index={i} />)}</ol></MotionTimeline></div></section>;
}
function LearningSequence() {
  const education = useEducation(), certifications = useCertifications();
  const { data: section } = useSiteSection("education"), { data: coursesSection } = useSiteSection("certifications");
  const { enabled } = useLandingMotion();
  return <div className="cinema-credentials" aria-label="Education and training">{section?.visible !== false && <section id="education" className="cinema-section cinema-education"><div className="cinema-container cinema-education-grid"><Enter><p className="cinema-label">05 / {section?.eyebrow}</p><h2>{section?.heading}<span className="cinema-heading-dot">.</span></h2></Enter><div>{education.data?.filter(item => item.published !== false).map(item => <div key={item.id} className="cinema-degree"><p className="cinema-label">{item.period}</p><h3><MaskedReveal>{item.degree}</MaskedReveal></h3><p>{item.school}</p>{item.details && <details className="cinema-detail"><summary><FiArrowDown /><span className="sr-only">Education details</span></summary><p>{item.details}</p></details>}</div>)}</div></div>{education.isError && <PublicDataState loading={false} error onRetry={() => void education.refetch()} label="education" />}</section>}{coursesSection?.visible !== false && <section id="training" className="cinema-section cinema-training"><div className="cinema-container"><Enter><p className="cinema-label">{coursesSection?.eyebrow}</p><h2>{coursesSection?.heading}</h2></Enter><div className="cinema-courses">{certifications.data?.filter(item => item.published !== false).map((item, i) => <div key={item.id} className="cinema-course-row"><motion.span className="cinema-course-divider" aria-hidden initial={enabled ? { scaleX: 0 } : false} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1, ease }} /><span className="cinema-course-number">0{i + 1}</span><CourseDisclosure title={item.title}><p>{item.issuer}{item.year ? ` / ${item.year}` : ""}</p>{item.description && <p>{item.description}</p>}{item.url && <a className="cinema-link" href={item.url} target="_blank" rel="noreferrer">{item.issuer}<FiArrowUpRight aria-hidden /></a>}</CourseDisclosure><span className="cinema-label">{item.expectedDate ? `Expected ${item.expectedDate}` : item.duration || item.year}</span></div>)}</div>{certifications.isError && <PublicDataState loading={false} error onRetry={() => void certifications.refetch()} label="courses" />}</div></section>}</div>;
}
function EditorialContact({ profile }: { profile: Profile }) {
  const { data: section } = useSiteSection("contact"), { data: assistant } = useSiteSection("assistant"), { data: jobMatch } = useSiteSection("jobMatch");
  const source = (key: string) => typeof section?.content[key] === "string" ? section.content[key] as string : "";
  const socialIcons = { github: FiGithub, linkedin: FiLinkedin, instagram: FiInstagram, whatsapp: FiMessageCircle };
  if (section?.visible === false) return null;
  const contactContent = presentationContent("contact", section?.content);
  const words = contentText(contactContent, "projectHeading").split(" ");
  return <section id="contact" className="cinema-section cinema-contact"><div className="cinema-container"><Enter><p className="cinema-label">06 / {section?.eyebrow}</p></Enter><div className="cinema-contact-grid"><h2><MaskedReveal><span>{words.slice(0, -1).join(" ")}</span>{" "}<em>{words.at(-1)}</em></MaskedReveal></h2><div className="cinema-contact-links"><a className="cinema-email" href={`mailto:${profile.email}`}><FiMail aria-hidden />{profile.email}</a><div className="cinema-socials">{profile.socials.filter(s => s.published !== false && s.showInContact !== false).map(s => { const Icon = socialIcons[s.platform as keyof typeof socialIcons] || FiArrowUpRight; return <a key={s.url} href={s.url} target="_blank" rel="noreferrer"><Icon aria-hidden />{s.label}</a>; })}</div><Link to="/contact?intent=project" className="cinema-link cinema-primary cinema-contact-cta">{contentText(contactContent, "projectCtaLabel")}<FiArrowUpRight aria-hidden /></Link></div></div><div className="cinema-ai-tools">{jobMatch?.visible !== false && section?.content.jobMatchVisible !== false && <div className="cinema-ai-entry"><FiZap aria-hidden /><div><h3>{jobMatch?.heading}</h3><Link to="/job-match" className="cinema-link">{source("jobMatchCta")}<FiArrowUpRight aria-hidden /></Link></div></div>}{assistant?.visible !== false && <div className="cinema-ai-entry"><FiMessageSquare aria-hidden /><div><h3>{assistant?.heading}</h3><button type="button" className="cinema-link" onClick={() => window.dispatchEvent(new Event("open-portfolio-assistant"))}>{typeof assistant?.content.buttonLabel === "string" ? assistant.content.buttonLabel : assistant?.heading}<FiArrowUpRight aria-hidden /></button></div></div>}</div></div></section>;
}
