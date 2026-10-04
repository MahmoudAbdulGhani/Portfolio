import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { useSiteSection } from "../lib/hooks";
import { useLandingMotion } from "../lib/landing-motion";
import type { Project } from "../types";
import "./project-carousel.css";

export function ProjectCarousel({ featured }: { featured: Project[] }) {
  const { data: section } = useSiteSection("featuredProjects");
  const { enabled } = useLandingMotion();
  const track = useRef<HTMLDivElement>(null);
  const gesture = useRef({ startX: 0, moved: false });
  const controls = useAnimationControls();
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const current = Math.min(index, featured.length - 1);
  const transition = enabled ? { type: "spring" as const, stiffness: 150, damping: 26, mass: 0.9 } : { duration: 0 };

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setStep(entry.contentRect.width + parseFloat(getComputedStyle(element).columnGap || "0"));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    void controls.start({ x: -current * step, transition: enabled ? { type: "spring", stiffness: 150, damping: 26, mass: 0.9 } : { duration: 0 } });
  }, [controls, current, step, enabled]);

  const select = (next: number) => setIndex(Math.max(0, Math.min(featured.length - 1, next)));
  return <section id="projects" className="cinema-projects cinema-carousel" aria-label={section?.eyebrow || "Selected projects"} aria-roledescription="carousel">
    <div className="cinema-container cinema-section-head"><p className="cinema-label">03 / {section?.eyebrow}</p><Link to={section?.ctaUrl || "/projects"} className="cinema-link">{section?.ctaLabel}<FiArrowUpRight aria-hidden /></Link></div>
    <div className="cinema-carousel-window" tabIndex={0} aria-label="Project carousel. Use the left and right arrow keys to browse." onKeyDown={event => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); select(current + (event.key === "ArrowRight" ? 1 : -1)); }
      if (event.key === "Home" || event.key === "End") { event.preventDefault(); select(event.key === "Home" ? 0 : featured.length - 1); }
    }}>
      <motion.div ref={track} className="cinema-carousel-track" animate={controls} drag={enabled ? "x" : false} dragMomentum={false} dragElastic={0.08} dragConstraints={{ left: -(featured.length - 1) * step, right: 0 }} onPointerDownCapture={event => { gesture.current = { startX: event.clientX, moved: false }; }} onPointerMoveCapture={event => { if (event.buttons && Math.abs(event.clientX - gesture.current.startX) > 8) gesture.current.moved = true; }} onDragStart={() => { gesture.current.moved = true; }} onClickCapture={event => { if (gesture.current.moved && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }} onDragEnd={(_, info) => {
        const direction = info.offset.x < -45 || info.velocity.x < -250 ? 1 : info.offset.x > 45 || info.velocity.x > 250 ? -1 : 0;
        const next = Math.max(0, Math.min(featured.length - 1, current + direction));
        select(next);
        // Explicitly settle even when a short gesture stays on the same card.
        void controls.start({ x: -next * step, transition });
      }}>
        {featured.map((project, i) => <motion.article key={project.id} className="cinema-carousel-card" inert={current !== i} aria-label={`${i + 1} of ${featured.length}: ${project.name}`} aria-roledescription="slide" animate={{ scale: current === i ? 1 : 0.94, opacity: current === i ? 1 : 0.45 }} transition={transition}>
          <Link to={`/projects/${project.slug}`} className="cinema-project-image" aria-label={project.name} draggable={false}>{project.coverImage && <img src={project.coverImage} alt={project.imageAlt || project.name} loading={i === 0 ? "eager" : "lazy"} draggable={false} />}</Link>
          <div className="cinema-project-caption"><h2>{project.name}</h2><Link to={`/projects/${project.slug}`} aria-label={`Open ${project.name}`} draggable={false}><FiArrowUpRight aria-hidden /></Link></div>
        </motion.article>)}
      </motion.div>
    </div>
    <div className="cinema-container cinema-carousel-controls">
      <div className="cinema-carousel-pages" aria-label="Select a project">{featured.map((project, i) => <button key={project.id} type="button" aria-label={`Show ${project.name}`} aria-pressed={current === i} onClick={() => select(i)}>{String(i + 1).padStart(2, "0")}</button>)}</div>
      <div className="cinema-carousel-arrows"><button type="button" aria-label="Previous project" disabled={current === 0} onClick={() => select(current - 1)}><FiArrowLeft aria-hidden /></button><button type="button" aria-label="Next project" disabled={current === featured.length - 1} onClick={() => select(current + 1)}><FiArrowRight aria-hidden /></button></div>
    </div>
    <p className="sr-only" role="status" aria-live="polite">Project {current + 1} of {featured.length}: {featured[current]?.name}</p>
  </section>;
}
