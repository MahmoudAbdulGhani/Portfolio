import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { useSiteSection } from "../lib/hooks";
import { useLandingMotion } from "../lib/landing-motion";
import type { Project } from "../types";
import "./project-carousel.css";

const cycleMs = 5500;
const spring = { type: "spring" as const, stiffness: 150, damping: 26, mass: 0.9 };

function ProjectArtwork({ project }: { project: Project }) {
  const [source, setSource] = useState(project.coverImage || project.screenshots?.[0]);
  const isCover = source === project.coverImage;
  const triedScreenshot = useRef(false);
  return source ? <img src={source} alt={isCover ? project.imageAlt || project.name : `${project.name} interface`} loading="eager" draggable={false} onLoad={event => {
    // Prefer an existing landscape interface over a portrait promotional cover.
    const img = event.currentTarget;
    if (!triedScreenshot.current && isCover && img.naturalWidth / img.naturalHeight < 1.2 && project.screenshots?.[0] && project.screenshots?.[0] !== source) { triedScreenshot.current = true; setSource(project.screenshots?.[0]); }
  }} onError={() => { if (project.coverImage && !isCover) setSource(project.coverImage); }} /> : null;
}

export function ProjectCarousel({ featured }: { featured: Project[] }) {
  const { data: section } = useSiteSection("featuredProjects");
  const { enabled } = useLandingMotion();
  const stage = useRef<HTMLDivElement>(null);
  const visible = useInView(stage, { amount: 0.35 });
  const [introComplete, setIntroComplete] = useState(false);
  const revealed = !enabled || introComplete;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [slot, setSlot] = useState(1);
  const [step, setStep] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const gesture = useRef({ startX: 0, moved: false });
  const controls = useAnimationControls();
  const count = featured.length;
  const current = (slot - 1 + count) % count;
  const slides = [featured[count - 1], ...featured, featured[0]];
  const autoplay = enabled && revealed && visible && pageVisible && !hovered && !focused && !dragging && count > 1;
  const transition = enabled ? spring : { duration: 0 };

  useEffect(() => {
    if (!visible || !enabled || introComplete) return;
    const timer = window.setTimeout(() => setIntroComplete(true), 1800);
    return () => window.clearTimeout(timer);
  }, [visible, enabled, introComplete]);

  useEffect(() => {
    const notify = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", notify);
    return () => document.removeEventListener("visibilitychange", notify);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => setSlot(value => Math.min(value + 1, count + 1)), cycleMs);
    return () => window.clearTimeout(timer);
  }, [autoplay, slot, count]);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const gap = parseFloat(getComputedStyle(element).columnGap);
      setStep(entry.contentRect.width + (Number.isFinite(gap) ? gap : 0));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    if (!revealed) { controls.set({ x: -slot * step }); return; }
    void controls.start({ x: -slot * step, transition: enabled ? spring : { duration: 0 } }).then(() => {
      if (cancelled) return;
      const normalized = slot === 0 ? count : slot === count + 1 ? 1 : slot;
      if (normalized !== slot) {
        controls.set({ x: -normalized * step });
        setSlot(normalized);
      }
    });
    return () => { cancelled = true; };
  }, [controls, slot, step, enabled, revealed, count]);

  const selectSlot = (next: number) => setSlot(Math.max(0, Math.min(count + 1, next)));
  const rememberPointer = (event: PointerEvent) => { gesture.current = { startX: event.clientX, moved: false }; };
  return <section id="projects" className="cinema-projects cinema-carousel" aria-label={section?.eyebrow || "Selected projects"} aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <div className="cinema-container cinema-section-head"><p className="cinema-label">03 / {section?.eyebrow}</p><Link to={section?.ctaUrl || "/projects"} className="cinema-link">{section?.ctaLabel}<FiArrowUpRight aria-hidden /></Link></div>
    <div ref={stage} className="cinema-carousel-stage" data-intro-complete={revealed}>
      <AnimatePresence>{!revealed && <motion.div className="cinema-project-intro" aria-hidden key="intro" exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.45 }}>{featured.slice(0, 5).map((project, i, items) => {
        const offset = i - (items.length - 1) / 2;
        return <motion.div className="cinema-intro-thumbnail" key={project.id} initial={{ opacity: 0, y: 60, scale: 0.8 }} animate={visible ? { opacity: 1, y: Math.abs(offset) * 10 - 20, scale: 1, rotate: offset * 6 } : { opacity: 0 }} transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}><img src={project.coverImage || project.screenshots?.[0]} alt="" draggable={false} /><span>{String(i + 1).padStart(2, "0")}</span></motion.div>;
      })}</motion.div>}</AnimatePresence>
      <motion.div className="cinema-carousel-content" inert={!revealed} initial={false} animate={{ opacity: revealed ? 1 : 0, clipPath: revealed ? "inset(0 0% 0 0%)" : "inset(0 50% 0 50%)" }} transition={{ duration: enabled ? 0.95 : 0, ease: [0.22, 1, 0.36, 1] }}>
        <div className="cinema-carousel-window" tabIndex={0} aria-label="Project carousel. Use the left and right arrow keys to browse." onKeyDown={event => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); selectSlot(slot + (event.key === "ArrowRight" ? 1 : -1)); }
          if (event.key === "Home" || event.key === "End") { event.preventDefault(); selectSlot(event.key === "Home" ? 1 : count); }
        }}>
          <motion.div ref={track} className="cinema-carousel-track" animate={controls} drag={enabled ? "x" : false} dragMomentum={false} dragElastic={0.08} dragConstraints={{ left: -(count + 1) * step, right: 0 }} onPointerDownCapture={rememberPointer} onPointerMoveCapture={event => { if (event.buttons && Math.abs(event.clientX - gesture.current.startX) > 8) gesture.current.moved = true; }} onDragStart={() => { gesture.current.moved = true; setDragging(true); }} onClickCapture={event => { if (gesture.current.moved && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }} onDragEnd={(_, info) => {
            setDragging(false);
            const direction = info.offset.x < -45 || info.velocity.x < -250 ? 1 : info.offset.x > 45 || info.velocity.x > 250 ? -1 : 0;
            const next = Math.max(0, Math.min(count + 1, slot + direction));
            selectSlot(next);
            if (next === slot) void controls.start({ x: -slot * step, transition });
          }}>
            {slides.map((project, i) => <motion.article key={`${project.id}-${i}`} className="cinema-carousel-card" inert={slot !== i} aria-label={`${(i - 1 + count) % count + 1} of ${count}: ${project.name}`} aria-roledescription="slide" animate={{ scale: (i - 1 + count) % count === current ? 1 : 0.94, opacity: (i - 1 + count) % count === current ? 1 : 0.45 }} transition={transition}>
              <Link to={`/projects/${project.slug}`} className="cinema-project-image" aria-label={project.name} draggable={false}><ProjectArtwork project={project} /></Link>
              <div className="cinema-project-caption"><h2>{project.name}</h2><Link to={`/projects/${project.slug}`} aria-label={`Open ${project.name}`} draggable={false}><FiArrowUpRight aria-hidden /></Link></div>
            </motion.article>)}
          </motion.div>
        </div>
        <div className="cinema-container cinema-carousel-controls">
          <div className="cinema-carousel-pages" aria-label="Select a project">{featured.map((project, i) => <button key={project.id} type="button" aria-label={`Show ${project.name}`} aria-pressed={current === i} onClick={() => selectSlot(i + 1)}>{String(i + 1).padStart(2, "0")}{current === i && <motion.span className="cinema-carousel-progress" key={`${slot}-${autoplay}`} initial={{ scaleX: 0 }} animate={{ scaleX: autoplay ? 1 : 0 }} transition={{ duration: autoplay ? cycleMs / 1000 : 0, ease: "linear" }} aria-hidden />}</button>)}</div>
          <div className="cinema-carousel-arrows"><button type="button" aria-label="Previous project" disabled={count < 2} onClick={() => selectSlot(slot - 1)}><FiArrowLeft aria-hidden /></button><button type="button" aria-label="Next project" disabled={count < 2} onClick={() => selectSlot(slot + 1)}><FiArrowRight aria-hidden /></button></div>
        </div>
      </motion.div>
    </div>
    <p className="sr-only" role="status" aria-live={focused ? "polite" : "off"}>Project {current + 1} of {count}: {featured[current]?.name}</p>
  </section>;
}
