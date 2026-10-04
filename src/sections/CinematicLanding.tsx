import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowUpRight, FiGithub, FiInstagram, FiLinkedin, FiMail, FiMapPin, FiMessageCircle, FiMessageSquare, FiZap } from "react-icons/fi";
import { useCertifications, useEducation, useProfile, useProjects, useSiteSection, useSkills } from "../lib/hooks";
import { useLandingMotion } from "../lib/landing-motion";
import { ScrollWords, MotionTimeline } from "../components/LandingMotion";
import { CvDownloadButton } from "../components/CvDownloadButton";
import { PublicDataState } from "../components/PublicDataState";
import { API_BASE } from "../lib/api";
import { ProjectChapters } from "../components/ProjectChapters";
import { SkillExplorer } from "../components/SkillExplorer";
import { CourseDisclosure, MaskedReveal } from "../components/SectionMotion";
import type { ExperienceItem, Profile } from "../types";
import "./cinematic-landing.css";

const ease = [0.22, 1, 0.36, 1] as const;
function Enter({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { enabled } = useLandingMotion();
  return <motion.div className={className} initial={enabled ? { opacity: 0, y: 34 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.85, delay, ease }}>{children}</motion.div>;
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
  return <div className="cinema"><PortraitHero profile={query.data} /><PersonalStory profile={query.data} /><SkillSequence /><WorkSequence /><CareerSequence profile={query.data} /><LearningSequence /><EditorialContact profile={query.data} /></div>;
}
function PortraitHero({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const { enabled, cinematic } = useLandingMotion();
  const { data: section } = useSiteSection("hero");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSceneProgress(scrollYProgress);
  // Clear the copy before the portrait grows across its column.
  const left = useTransform(p, [0, 0.4, 0.9], ["35%", "35%", "0%"]);
  const width = useTransform(p, [0, 0.4, 0.9], ["30%", "30%", "100%"]);
  const top = useTransform(p, [0, 0.4, 0.9], ["10%", "10%", "0%"]);
  const height = useTransform(p, [0, 0.4, 0.9], ["80%", "80%", "100%"]);
  const objectPosition = useTransform(p, [0, 0.9], ["50% 35%", "50% 22%"]);
  const photoScale = useTransform(p, [0, 0.9], [1.035, 1.015]);
  const opacity = useTransform(p, [0, 0.24, 0.38], [1, 1, 0]);
  const copyX = useTransform(p, [0, 0.24, 0.38], [0, 0, -44]);
  const roleX = useTransform(p, [0, 0.24, 0.38], [0, 0, 44]);
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 70, damping: 28 }), y = useSpring(pointerY, { stiffness: 70, damping: 28 });
  const [cleared, setCleared] = useState(false);
  useMotionValueEvent(p, "change", v => setCleared(v >= 0.38));
  const title = section?.heading || profile.title;
  const words = title.trim().split(/\s+/);
  const parts = words.length >= 3 ? [words[0], words.slice(1, -1).join(" "), words.at(-1)] : [title];
  return <section ref={ref} id="hero" className={`cinema-hero ${cinematic ? "has-scroll-scene" : ""}`}><div className="cinema-hero-sticky" onPointerMove={event => {
    if (!enabled || !cinematic) return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 6);
    pointerY.set(((event.clientY - box.top) / box.height - 0.5) * 6);
  }} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
    <motion.div className="cinema-hero-copy" inert={cinematic && cleared} style={cinematic ? { opacity, x: copyX } : undefined}>
      <p className="cinema-hero-name">{profile.shortName || profile.name}</p>
      <h1 className="sr-only">{title}</h1>
      <div className={`cinema-title ${parts.length === 1 ? "single-title" : ""}`} aria-hidden><span className="cinema-title-part part-0"><motion.span initial={enabled ? { x: "-105%" } : false} animate={{ x: 0 }} transition={{ duration: 0.95, delay: 0.1, ease }}>{parts[0]}</motion.span></span></div>
      <div className="cinema-hero-meta"><span><FiMapPin aria-hidden />{profile.location}</span>{profile.openToOpportunities && profile.availabilityText && <span className="cinema-availability"><span aria-hidden />{profile.availabilityText}</span>}</div>
      <div className="cinema-hero-actions"><a className="cinema-link cinema-primary" href="#projects"><FiArrowDown aria-hidden />{section?.ctaLabel}</a><CvDownloadButton url={profile.resumeUrl || `${API_BASE}/cv.pdf`} className="cinema-cv" /></div>
    </motion.div>
    {parts.length > 1 && <motion.div className="cinema-hero-role cinema-title" aria-hidden style={cinematic ? { opacity, x: roleX } : undefined}>{parts.slice(1).map((word, i) => <span className={`cinema-title-part part-${i + 1}`} key={`${word}-${i}`}><motion.span initial={enabled ? { x: "105%" } : false} animate={{ x: 0 }} transition={{ duration: 0.95, delay: 0.18 + i * 0.12, ease }}>{word}</motion.span></span>)}</motion.div>}
    {profile.photo && <motion.div className="cinema-portrait" style={cinematic ? { left, top, width, height } : undefined} initial={enabled ? { opacity: 0, clipPath: "inset(50% 0 50% 0)" } : false} animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }} transition={{ duration: 1.1, delay: 0.15, ease }}><motion.img src={profile.photo} alt={profile.name} fetchPriority="high" style={{ objectPosition: cinematic ? objectPosition : "50% 35%", scale: cinematic ? photoScale : 1.035, x: enabled && cinematic ? x : 0, y: enabled && cinematic ? y : 0 }} /></motion.div>}
  </div></section>;
}
function PersonalStory({ profile }: { profile: Profile }) {
  const { data: section } = useSiteSection("about");
  if (section?.visible === false) return null;
  return <section id="about" className="cinema-section cinema-about"><div className="cinema-container"><Enter><p className="cinema-label">01 / {section?.eyebrow}</p></Enter><div className="cinema-about-grid"><h2><ScrollWords text={section?.heading || ""} /></h2><Enter className="cinema-about-details"><p className="cinema-profile-name">{profile.shortName}</p>{profile.languages && <p className="cinema-muted">{profile.languages}</p>}<details className="cinema-detail"><summary>{section?.eyebrow}<FiArrowDown aria-hidden /></summary><p>{profile.bio}</p></details></Enter></div></div></section>;
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
  const groups = (query.data ?? []).reduce<Record<string, string[]>>((acc, s) => { (acc[s.category] ??= []).push(s.name); return acc; }, {});
  if (section?.visible === false) return null;
  return <section id="skills" className="cinema-section cinema-skills"><div className="cinema-container cinema-section-head"><Enter><p className="cinema-label">02 / {section?.eyebrow}</p></Enter><a href="#all-skills" className="cinema-link">{technologies?.heading}<FiArrowUpRight aria-hidden /></a></div>{query.isLoading || query.isError ? <PublicDataState loading={query.isLoading} error={query.isError} onRetry={() => void query.refetch()} label="skills" /> : <><div className="cinema-rails"><SkillRail names={groups.Frontend ?? []} /><SkillRail names={[...(groups["Backend & APIs"] ?? []), ...(groups.Backend ?? [])]} reverse /></div><div className="cinema-container"><SkillExplorer groups={groups} heading={section?.heading || ""} /></div></>}</section>;
}
function WorkSequence() {
  const query = useProjects();
  const { data: section } = useSiteSection("featuredProjects");
  const featured = (query.data ?? []).filter(p => p.featured && p.published && p.showOnPortfolio !== false);
  if (section?.visible === false) return null;
  if (query.isLoading || query.isError) return <PublicDataState loading={query.isLoading} error={query.isError} onRetry={() => void query.refetch()} label="projects" />;
  if (!featured.length) return null;
  return <ProjectChapters featured={featured} />;
}
function CareerItem({ item, index }: { item: ExperienceItem; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const { enabled } = useLandingMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "start 38%"] });
  const p = useSceneProgress(scrollYProgress);
  const opacity = useTransform(p, [0, 0.65], [0.35, 1]), y = useTransform(p, [0, 1], [36, 0]);
  return <motion.li ref={ref} className="cinema-career-item" style={enabled ? { opacity, y } : undefined}><span className="cinema-career-number">0{index + 1}</span><div><h3>{item.role || item.milestone}</h3><p>{item.company || item.facility}</p><details className="cinema-detail"><summary><FiArrowDown aria-hidden /><span className="sr-only">Details for {item.role || item.milestone}</span></summary><p>{item.description || item.details}</p></details></div><span className="cinema-label cinema-period">{item.meta || [item.startDate, item.isCurrent ? "Present" : item.endDate].filter(Boolean).join(" — ")}</span></motion.li>;
}
function CareerSequence({ profile }: { profile: Profile }) {
  return <section id="experience" className="cinema-section cinema-experience"><div className="cinema-container"><Enter><p className="cinema-label">04 / Experience</p><h2>Experience<span className="cinema-heading-dot">.</span></h2></Enter><MotionTimeline className="cinema-career"><ol>{profile.experience.filter(item => item.published !== false).map((item, i) => <CareerItem key={item.id || i} item={item} index={i} />)}</ol></MotionTimeline></div></section>;
}
function LearningSequence() {
  const education = useEducation(), certifications = useCertifications();
  const { data: section } = useSiteSection("education"), { data: coursesSection } = useSiteSection("certifications");
  const { enabled } = useLandingMotion();
  return <>{section?.visible !== false && <section id="education" className="cinema-section cinema-education"><div className="cinema-container cinema-education-grid"><Enter><p className="cinema-label">05 / {section?.eyebrow}</p><h2>{section?.heading}<span className="cinema-heading-dot">.</span></h2></Enter><div>{education.data?.filter(item => item.published !== false).map(item => <div key={item.id} className="cinema-degree"><p className="cinema-label">{item.period}</p><h3><MaskedReveal>{item.degree}</MaskedReveal></h3><p>{item.school}</p>{item.details && <details className="cinema-detail"><summary><FiArrowDown /><span className="sr-only">Education details</span></summary><p>{item.details}</p></details>}</div>)}</div></div>{education.isError && <PublicDataState loading={false} error onRetry={() => void education.refetch()} label="education" />}</section>}{coursesSection?.visible !== false && <section id="training" className="cinema-section cinema-training"><div className="cinema-container"><Enter><p className="cinema-label">06 / {coursesSection?.eyebrow}</p><h2>{coursesSection?.heading}</h2></Enter><div className="cinema-courses">{certifications.data?.filter(item => item.published !== false).map((item, i) => <div key={item.id} className="cinema-course-row"><motion.span className="cinema-course-divider" aria-hidden initial={enabled ? { scaleX: 0 } : false} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1, ease }} /><span className="cinema-course-number">0{i + 1}</span><CourseDisclosure title={item.title}><p>{item.issuer}{item.year ? ` / ${item.year}` : ""}</p>{item.description && <p>{item.description}</p>}{item.url && <a className="cinema-link" href={item.url} target="_blank" rel="noreferrer">{item.issuer}<FiArrowUpRight aria-hidden /></a>}</CourseDisclosure><span className="cinema-label">{item.expectedDate ? `Expected ${item.expectedDate}` : item.duration || item.year}</span></div>)}</div>{certifications.isError && <PublicDataState loading={false} error onRetry={() => void certifications.refetch()} label="courses" />}</div></section>}</>;
}
function EditorialContact({ profile }: { profile: Profile }) {
  const { data: section } = useSiteSection("contact"), { data: assistant } = useSiteSection("assistant"), { data: jobMatch } = useSiteSection("jobMatch");
  const source = (key: string) => typeof section?.content[key] === "string" ? section.content[key] as string : "";
  const socialIcons = { github: FiGithub, linkedin: FiLinkedin, instagram: FiInstagram, whatsapp: FiMessageCircle };
  if (section?.visible === false) return null;
  const words = (section?.heading || "").split(" ");
  return <section id="contact" className="cinema-section cinema-contact"><div className="cinema-container"><Enter><p className="cinema-label">07 / {section?.eyebrow}</p></Enter><div className="cinema-contact-grid"><h2><MaskedReveal><span>{words.slice(0, -1).join(" ")}</span><em>{words.at(-1)}</em></MaskedReveal></h2><div className="cinema-contact-links"><a className="cinema-email" href={`mailto:${profile.email}`}><FiMail aria-hidden />{profile.email}</a><div className="cinema-socials">{profile.socials.filter(s => s.published !== false && s.showInContact !== false).map(s => { const Icon = socialIcons[s.platform as keyof typeof socialIcons] || FiArrowUpRight; return <a key={s.url} href={s.url} target="_blank" rel="noreferrer"><Icon aria-hidden />{s.label}</a>; })}</div><Link to="/contact" className="cinema-link">{source("formHeading")}<FiArrowUpRight aria-hidden /></Link></div></div><div className="cinema-ai-tools">{jobMatch?.visible !== false && section?.content.jobMatchVisible !== false && <div className="cinema-ai-entry"><FiZap aria-hidden /><div><h3>{jobMatch?.heading}</h3><Link to="/job-match" className="cinema-link">{source("jobMatchCta")}<FiArrowUpRight aria-hidden /></Link></div></div>}{assistant?.visible !== false && <div className="cinema-ai-entry"><FiMessageSquare aria-hidden /><div><h3>{assistant?.heading}</h3><button type="button" className="cinema-link" onClick={() => window.dispatchEvent(new Event("open-portfolio-assistant"))}>{typeof assistant?.content.buttonLabel === "string" ? assistant.content.buttonLabel : assistant?.heading}<FiArrowUpRight aria-hidden /></button></div></div>}</div></div></section>;
}
