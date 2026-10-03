import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import { useCertifications, useEducation, useProfile, useProjects, useSiteSection, useSkills } from "../lib/hooks";
import { useLandingMotion } from "../lib/landing-motion";
import { ScrollWords, MotionTimeline } from "../components/LandingMotion";
import { CvDownloadButton } from "../components/CvDownloadButton";
import { PublicDataState } from "../components/PublicDataState";
import { API_BASE } from "../lib/api";
import type { Profile, Project } from "../types";
import "./cinematic-landing.css";

function Enter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { enabled } = useLandingMotion();
  return <motion.div className={className} initial={enabled ? { opacity: 0, y: 36 } : false}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function CinematicLanding() {
  const profile = useProfile();
  if (!profile.data) return <PublicDataState loading={profile.isLoading} error={profile.isError} onRetry={() => void profile.refetch()} label="profile" />;
  return <div className="cinema">
    <PortraitHero profile={profile.data} />
    <PersonalStory profile={profile.data} />
    <SkillSequence />
    <WorkflowSequence />
    <WorkSequence />
    <CareerSequence profile={profile.data} />
    <LearningSequence />
  </div>;
}

function PortraitHero({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const { enabled, cinematic } = useLandingMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const left = useTransform(p, [0, 0.65], ["56%", "0%"]);
  const width = useTransform(p, [0, 0.65], ["37%", "100%"]);
  const top = useTransform(p, [0, 0.65], ["12%", "0%"]);
  const height = useTransform(p, [0, 0.65], ["78%", "100%"]);
  const imagePosition = useTransform(p, [0, 0.65], ["50% 50%", "50% 20%"]);
  const [heroPhase, setHeroPhase] = useState(0);
  useMotionValueEvent(p, "change", v => setHeroPhase(v < 0.3 ? 0 : v < 0.7 ? 1 : 2));
  const y = useTransform(p, [0, 0.3], [0, -65]);
  const closingY = useTransform(p, [0.62, 0.82], [42, 0]);
  const { data: section } = useSiteSection("hero");
  const moving = cinematic && enabled;
  const title = section?.heading || profile.title;
  return <section ref={ref} id="hero" className={`cinema-hero ${cinematic ? "has-scroll-scene" : ""}`}>
    <div className="cinema-hero-sticky">
      <motion.div className={`cinema-hero-copy ${moving && heroPhase > 0 ? "is-cleared" : ""}`} inert={moving && heroPhase > 0} style={{ y: moving ? y : 0 }}>
        <motion.p className="cinema-label" initial={enabled ? { y: 24, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>{profile.shortName}</motion.p>
        <h1>{title.split(/\s+/).map((word, i) => <span className="cinema-word-mask" key={`${word}-${i}`}><motion.span initial={enabled ? { y: "105%" } : false} animate={{ y: 0 }} transition={{ delay: 0.1 + i * 0.12, duration: 1, ease: [0.22, 1, 0.36, 1] }}>{word}</motion.span></span>)}</h1>
        <p className="cinema-hero-tagline">{profile.tagline}</p>
        <div className="cinema-actions"><a className="cinema-link" href="#about">Meet Mahmoud <FiArrowDown /></a><CvDownloadButton url={profile.resumeUrl || `${API_BASE}/cv.pdf`} className="cinema-cv" /></div>
      </motion.div>
      {profile.photo && <motion.div className="cinema-portrait" style={moving ? { left, width, top, height } : undefined}>
        <motion.img src={profile.photo} alt={profile.name} fetchPriority="high" style={{ objectPosition: moving ? imagePosition : "50% 50%" }} />
      </motion.div>}
      {cinematic && enabled && <motion.div className={`cinema-hero-closing ${heroPhase === 2 ? "is-visible" : ""}`} inert={heroPhase !== 2} style={{ y: closingY }}><span>{profile.location}</span><p>{profile.shortName}</p><a href="#about">The person behind the work <FiArrowDown /></a></motion.div>}
      <div className="cinema-hero-foot"><span>{profile.location}</span><span>Scroll to explore <FiArrowDown /></span></div>
    </div>
  </section>;
}

function PersonalStory({ profile }: { profile: Profile }) {
  const { data: section } = useSiteSection("about");
  const introduction = typeof section?.content.introduction === "string" ? section.content.introduction : profile.bio;
  return <section id="about" className="cinema-section cinema-light cinema-about"><div className="cinema-container">
    <Enter><p className="cinema-label">01 / The person</p></Enter>
    <div className="cinema-two-col"><h2><ScrollWords text={section?.heading || "About"} /></h2><Enter><p className="cinema-lead">{introduction}</p>
      <div className="cinema-about-meta"><span>{profile.location}</span><span>{profile.languages}</span></div>
      <details className="cinema-detail"><summary>More about my background</summary><p>{profile.bio}</p></details>
      <div className="cinema-socials">{profile.socials.filter(s => s.showInHero !== false).slice(0, 3).map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label}<FiArrowUpRight /></a>)}</div>
    </Enter></div>
  </div></section>;
}

function SkillSequence() {
  const query = useSkills();
  const ref = useRef<HTMLElement>(null);
  const { enabled } = useLandingMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(p, [0, 1], ["-16%", "12%"]);
  const reverseX = useTransform(p, [0, 1], ["6%", "-20%"]);
  const { data: section } = useSiteSection("skills");
  const groups = (query.data ?? []).reduce<Record<string, string[]>>((acc, s) => { (acc[s.category] ??= []).push(s.name); return acc; }, {});
  const frontend = groups.Frontend ?? [];
  const backend = [...(groups["Backend & APIs"] ?? []), ...(groups.Backend ?? [])];
  const principalGroups = ["Frontend", "Backend & APIs", "Databases & ORM"];
  return <section ref={ref} id="skills" className="cinema-section cinema-skills">
    <div className="cinema-container"><Enter><p className="cinema-label">02 / Capabilities</p><h2>{section?.heading}</h2></Enter></div>
    {query.isError ? <PublicDataState loading={false} error onRetry={() => void query.refetch()} label="skills" /> : <>
      <div className="cinema-rails" aria-hidden><motion.div style={{ x: enabled ? x : 0 }}>{[...frontend, ...frontend].slice(0, 12).join(" / ")}</motion.div><motion.div className="cinema-rail-outline" style={{ x: enabled ? reverseX : 0 }}>{[...backend, ...backend].slice(0, 12).join(" / ")}</motion.div></div>
      <div className="cinema-container cinema-skill-groups">{Object.entries(groups).filter(([category]) => principalGroups.includes(category)).map(([category, names]) => <Enter key={category}><h3>{category}</h3><p>{names.join(" · ")}</p></Enter>)}</div>
      <div className="cinema-container"><details className="cinema-detail cinema-more-skills"><summary>Testing, security, AI & tools</summary><div className="cinema-skill-groups">{Object.entries(groups).filter(([category]) => !principalGroups.includes(category)).map(([category, names]) => <div key={category}><h3>{category}</h3><p>{names.join(" · ")}</p></div>)}</div></details></div>
    </>}
  </section>;
}

function WorkflowSequence() {
  const ref = useRef<HTMLElement>(null);
  const { enabled, cinematic } = useLandingMotion();
  const { data: section } = useSiteSection("about");
  const { data: projects } = useProjects();
  const methods = Array.isArray(section?.content.workMethods) ? section.content.workMethods.filter((x): x is { title: string; description: string } => typeof x === "object" && x !== null && "title" in x && "description" in x) : [];
  const project = projects?.find(p => p.slug === "gamezone-arena");
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stage, setStage] = useState(0);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  useMotionValueEvent(p, "change", v => { if (enabled && methods.length) { setWorkflowProgress(v); setStage(Math.min(methods.length - 1, Math.floor(v * methods.length))); } });
  const active = cinematic && enabled;
  const jump = (index: number) => { setStage(index); if (cinematic && ref.current) window.scrollTo({ top: window.scrollY + ref.current.getBoundingClientRect().top + (ref.current.offsetHeight - window.innerHeight) * (index + 0.2) / methods.length, behavior: enabled ? "smooth" : "instant" }); };
  if (!methods.length) return null;
  return <section ref={ref} id="workflow" className={`cinema-workflow ${cinematic ? "has-scroll-scene" : ""}`}><div className="cinema-scene-sticky cinema-container">
    <p className="cinema-label">03 / How I work</p><div className="cinema-workflow-grid"><div><h2>From idea<br />to shipped.</h2><div className="cinema-workflow-steps">{methods.map((m, i) => <button type="button" key={m.title} onClick={() => jump(i)} aria-pressed={stage === i}><span>0{i + 1}</span>{m.title}</button>)}</div>
    <p className="cinema-workflow-description" aria-live="polite">{methods[stage]?.description}</p></div>
    <div className="cinema-workflow-picture">{project?.coverImage && <><img className="cinema-workflow-base" src={project.coverImage} alt="" /><img src={project.coverImage} alt={`${project.name} interface moving from structure to finished application`} style={active ? { clipPath: `inset(0% ${70 * (1 - Math.min(workflowProgress / 0.65, 1))}% 0% 0%)`, filter: `grayscale(${1 - Math.min(workflowProgress / 0.38, 1)})`, transform: `scale(${0.88 + 0.12 * Math.min(workflowProgress / 0.7, 1)})` } : undefined} /></>}</div>
    </div><div className="cinema-scene-line"><motion.div style={{ scaleX: active ? p : 1 }} /></div>
  </div></section>;
}

function WorkSequence() {
  const query = useProjects();
  const featured = (query.data ?? []).filter(p => p.featured && p.published && p.showOnPortfolio !== false).slice(0, 3);
  const ref = useRef<HTMLElement>(null);
  const { enabled, cinematic } = useLandingMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [index, setIndex] = useState(0);
  useMotionValueEvent(p, "change", v => { if (cinematic && enabled && featured.length) setIndex(Math.min(featured.length - 1, Math.round(v * Math.max(0, featured.length - 1)))); });
  const x = useTransform(p, [0, 1], ["0%", `-${featured.length > 0 ? (featured.length - 1) * 100 / featured.length : 0}%`]);
  const jump = (i: number) => { setIndex(i); if (ref.current && cinematic) window.scrollTo({ top: window.scrollY + ref.current.getBoundingClientRect().top + (ref.current.offsetHeight - window.innerHeight) * i / Math.max(featured.length - 1, 1), behavior: enabled ? "smooth" : "instant" }); };
  if (query.isError) return <PublicDataState loading={false} error onRetry={() => void query.refetch()} label="projects" />;
  return <section ref={ref} id="projects" className={`cinema-projects ${cinematic ? "has-scroll-scene" : ""}`}>
    <div className="cinema-scene-sticky"><div className="cinema-container cinema-work-head"><p className="cinema-label">04 / Selected work</p><Link to="/projects" className="cinema-link">All projects <FiArrowUpRight /></Link></div>
      <div className="cinema-work-window"><motion.div className={`cinema-work-track ${cinematic ? "is-horizontal" : ""}`} style={cinematic ? { width: `${featured.length * 100}%`, x: enabled ? x : `-${index * 100 / Math.max(featured.length, 1)}%` } : undefined}>
        {featured.map((project, i) => <WorkPanel key={project.id} project={project} hidden={cinematic && index !== i} />)}
      </motion.div></div>
      {cinematic && <div className="cinema-container cinema-work-nav" aria-label="Select a project">{featured.map((project, i) => <button key={project.id} type="button" aria-pressed={index === i} onClick={() => jump(i)}><span>0{i + 1}</span>{project.name}</button>)}</div>}
    </div>
  </section>;
}

function WorkPanel({ project, hidden }: { project: Project; hidden: boolean }) {
  return <article className="cinema-work-panel" inert={hidden}><div className="cinema-container cinema-work-panel-grid"><div className="cinema-project-image">{project.coverImage && <img src={project.coverImage} alt={project.imageAlt || project.name} loading="lazy" />}</div><div><span className="cinema-label">{project.type}</span><h2>{project.name}</h2><p>{project.tagline || project.description}</p><div className="cinema-project-stack">{project.stack.slice(0, 4).join(" / ")}</div><div className="cinema-actions"><Link className="cinema-link" to={`/projects/${project.slug}`}>Case study <FiArrowUpRight /></Link>{project.demo && <a className="cinema-link" href={project.demo} target="_blank" rel="noreferrer">Live project <FiArrowUpRight /></a>}</div></div></div></article>;
}

function CareerSequence({ profile }: { profile: Profile }) {
  const { enabled } = useLandingMotion();
  return <section id="experience" className="cinema-section cinema-light"><div className="cinema-container"><Enter><p className="cinema-label">05 / Experience</p></Enter><div className="cinema-two-col"><h2><ScrollWords text="A path built through practice." /></h2><MotionTimeline className="cinema-career"><ol>{profile.experience.map((item, i) => <motion.li key={item.id || i} initial={enabled ? { opacity: 0, y: 35 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}><span className="cinema-label">{[item.startDate, item.isCurrent ? "Present" : item.endDate].filter(Boolean).join(" — ")}</span><h3>{item.role || item.milestone}</h3><p>{item.company || item.facility}</p><details className="cinema-detail"><summary>My contribution</summary><p>{item.description || item.details}</p>{item.bullets && <ul>{item.bullets.map(b => <li key={b}>{b}</li>)}</ul>}</details></motion.li>)}</ol></MotionTimeline></div></div></section>;
}

function LearningSequence() {
  const education = useEducation();
  const certifications = useCertifications();
  return <section id="education" className="cinema-section cinema-light cinema-learning"><div className="cinema-container"><Enter><p className="cinema-label">06 / Education & learning</p><h2>The foundation.<br /><span>The learning continues.</span></h2></Enter>
    <div className="cinema-learning-grid"><div>{education.data?.map(item => <Enter key={item.id} className="cinema-degree"><span className="cinema-label">{item.period}</span><h3>{item.degree}</h3><p>{item.school}</p>{item.details && <p>{item.details}</p>}</Enter>)}</div><div>{certifications.data?.map(item => <Enter key={item.id}><details className="cinema-course"><summary><span>{item.title}</span><FiArrowDown /></summary><p>{item.issuer}{item.year ? ` / ${item.year}` : ""}</p>{item.description && <p>{item.description}</p>}{item.url && <a className="cinema-link" href={item.url} target="_blank" rel="noreferrer">View credential <FiArrowUpRight /></a>}</details></Enter>)}</div></div>
    {(education.isError || certifications.isError) && <PublicDataState loading={false} error onRetry={() => { void education.refetch(); void certifications.refetch(); }} label="education and courses" />}
  </div></section>;
}
