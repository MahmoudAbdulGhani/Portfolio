import { useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { useSiteSection } from "../lib/hooks";
import { useLandingMotion } from "../lib/landing-motion";
import type { Project } from "../types";
import "./project-chapters.css";

const ease = [0.22, 1, 0.36, 1] as const;
const artwork: Record<string, { main: string; detail: string; treatment: string }> = {
  "jobpilot-ai": { main: "/projects/cinematic/jobpilot-screen.webp", detail: "/projects/cinematic/jobpilot-resume.webp", treatment: "document" },
  lobby: { main: "/projects/lobby/cover.webp", detail: "/projects/lobby/audio-room.webp", treatment: "controls" },
  "gamezone-arena": { main: "/projects/gamezone-arena/cover.webp", detail: "/projects/gamezone-arena/Booking_date_and_time.webp", treatment: "booking" },
  "construction-project-management-accounting-system": { main: "/projects/cinematic/cedar-screen.webp", detail: "/projects/cinematic/cedar-detail.webp", treatment: "dashboard" },
  unihub: { main: "/projects/unihub/usercourses.webp", detail: "/projects/unihub/user.webp", treatment: "portal" },
};

// Artwork never changes the CMS project name, order, visibility or destination.
function ScreenImage({ sources, alt, detail = false }: { sources: (string | null | undefined)[]; alt: string; detail?: boolean }) {
  const options = [...new Set(sources.filter((source): source is string => Boolean(source)))];
  const [failed, setFailed] = useState<string[]>([]);
  const source = options.find(option => !failed.includes(option));
  if (!source) return null;
  return <img src={source} alt={alt} loading="lazy" decoding="async" draggable={false} className={detail ? "chapter-detail-image" : undefined} onError={() => setFailed(previous => [...previous, source])} />;
}

function ProjectChapter({ project, index, total }: { project: Project; index: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);
  const { enabled, cinematic } = useLandingMotion();
  const seen = useInView(ref, { once: true, amount: 0.08 });
  const show = seen || focused || !enabled;
  const art = artwork[project.slug];
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const mainY = useTransform(scrollYProgress, [0, 1], [12, -12]);
  const detailY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const recession = useTransform(scrollYProgress, [0, 0.5, 1], [0.985, 1, 0.985]);
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const rotateY = useSpring(pointerX, { stiffness: 65, damping: 24 });
  const rotateX = useSpring(pointerY, { stiffness: 65, damping: 24 });
  const duration = enabled ? 0.7 : 0;
  return <article ref={ref} className={`project-chapter chapter-${art?.treatment || "default"}`} aria-labelledby={`chapter-${project.id}`} onFocusCapture={() => setFocused(true)}>
    <motion.div className="chapter-reveal" initial={false} animate={{ y: show ? 0 : 28, opacity: show ? 1 : 0.25 }} transition={{ duration, ease }}>
      <Link to={`/projects/${project.slug}`} className="chapter-scene" aria-label={`View ${project.name}`} onPointerMove={event => {
        if (!cinematic || event.pointerType !== "mouse") return;
        const box = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 2);
        pointerY.set(-((event.clientY - box.top) / box.height - 0.5) * 2);
      }} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
        <img className="chapter-studio" src="/projects/cinematic/studio.webp" alt="" loading="lazy" />
        <motion.div className="chapter-composition" style={{ rotateX: cinematic ? rotateX : 0, rotateY: cinematic ? rotateY : 0 }}>
          <motion.div className="chapter-device-depth" style={{ y: cinematic ? mainY : 0, scale: cinematic ? recession : 1 }}>
            <motion.div className="chapter-device" initial={false} animate={{ y: show ? 0 : 16, rotate: cinematic ? -1 : 0 }} transition={{ duration, ease }}>
              <div className="chapter-screen"><ScreenImage sources={[art?.main, project.coverImage, ...project.screenshots || []]} alt={`${project.name} interface`} /></div>
              <img className="chapter-laptop" src="/projects/cinematic/laptop-studio.webp" alt="" loading="lazy" />
            </motion.div>
          </motion.div>
          {art && <motion.div className="chapter-detail-depth" aria-hidden style={{ y: cinematic ? detailY : 0 }}>
            <motion.div className="chapter-detail" initial={false} animate={{ x: show ? 0 : 16, y: show ? 0 : 12, opacity: show ? 1 : 0 }} transition={{ duration: enabled ? 0.75 : 0, delay: enabled ? 0.12 : 0, ease }}><ScreenImage sources={[art.detail, project.screenshots?.[1], project.coverImage]} alt="" detail /></motion.div>
          </motion.div>}
        </motion.div>
      </Link>
    </motion.div>
    <motion.div className="chapter-caption" initial={false} animate={{ y: show ? 0 : 12, opacity: show ? 1 : 0 }} transition={{ duration: enabled ? 0.6 : 0, delay: enabled ? 0.12 : 0, ease }}>
      <span className="chapter-number" aria-label={`Project ${index + 1} of ${total}`}>{String(index + 1).padStart(2, "0")}</span>
      <div className="chapter-copy"><h3 id={`chapter-${project.id}`}><Link to={`/projects/${project.slug}`}>{project.name}</Link></h3>{project.tagline && <p>{project.tagline}</p>}</div>
      <Link to={`/projects/${project.slug}`} className="chapter-open" aria-label={`Explore ${project.name}`}><span>Explore project</span><span className="chapter-arrow"><FiArrowUpRight aria-hidden /></span></Link>
    </motion.div>
  </article>;
}

export function ProjectChapters({ featured }: { featured: Project[] }) {
  const { data: section } = useSiteSection("featuredProjects");
  const heading = (section?.eyebrow || "Selected work").split(" ");
  const accent = heading.pop();
  return <section id="projects" className="cinema-projects cinema-chapters" aria-label={section?.eyebrow || "Selected projects"} style={{ "--chapter-screen-left": "7.2048%", "--chapter-screen-top": "6.3172%", "--chapter-screen-width": "85.5237%", "--chapter-screen-height": "83.7366%" } as CSSProperties}>
    <div className="cinema-container chapter-heading"><div><p className="cinema-label">03 / Projects</p><h2>{heading.join(" ")} <em>{accent}</em></h2></div><p className="chapter-intro">{section?.heading}</p></div>
    <div className="cinema-container chapter-list">{featured.map((project, index) => <ProjectChapter key={project.id} project={project} index={index} total={featured.length} />)}</div>
    <div className="cinema-container chapter-all"><span className="cinema-label">{String(featured.length).padStart(2, "0")} selected projects</span><Link to={section?.ctaUrl || "/projects"} className="cinema-link">{section?.ctaLabel || "View all projects"}<FiArrowUpRight aria-hidden /></Link></div>
  </section>;
}
