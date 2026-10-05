import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import { useLandingMotion } from "../lib/landing-motion";
import type { Project } from "../types";
import "./laptop-scroll-scene.css";

export function LaptopScrollScene({ project, screen }: { project: Project; screen: string }) {
  const root = useRef<HTMLElement>(null), host = useRef<HTMLDivElement>(null), display = useRef<HTMLDivElement>(null);
  const { enabled, profile } = useLandingMotion();
  const [near, setNear] = useState(false);
  const [mode, setMode] = useState<"poster" | "webgl" | "fallback">("poster");
  useEffect(() => {
    if (!enabled || !root.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); observer.disconnect(); } }, { rootMargin: "700px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [enabled]);
  useEffect(() => {
    if (!enabled || !near || !root.current || !host.current || !display.current) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import("../lib/laptop-scene").then(({ createLaptopScene }) => {
      if (cancelled) return;
      try {
        dispose = createLaptopScene(root.current!, host.current!, display.current!, profile === "touch", () => setMode("fallback"));
        setMode("webgl");
      } catch { setMode("fallback"); }
    }).catch(() => { if (!cancelled) setMode("fallback"); });
    return () => { cancelled = true; dispose?.(); };
  }, [enabled, near, profile]);
  const animated = enabled && mode !== "fallback";
  return <article ref={root} className={`laptop-scroll ${animated ? "has-laptop-scroll" : ""} mode-${enabled ? mode : "fallback"}`} aria-label={`${project.name} project reveal`}>
    <div className="laptop-scroll-stage">
      <img className="laptop-scroll-studio" src="/projects/cinematic/studio.webp" alt="" loading="lazy" />
      <div className="laptop-scroll-poster" aria-hidden><img src="/projects/cinematic/laptop-studio.webp" alt="" loading="lazy" /><img className="laptop-scroll-poster-screen" src={screen} alt="" loading="lazy" /></div>
      <div ref={host} className="laptop-scroll-renderers" aria-hidden="true" />
      <div className="laptop-screen-source">
        <div ref={display} className="laptop-live-preview" inert={animated}>
          <div className="laptop-preview-top"><span>Selected work / 01</span><span>{project.stack.slice(0, 2).join(" · ")}</span></div>
          <div className="laptop-preview-body"><div className="laptop-preview-copy"><p className="cinema-label">Inside the project</p><h3>{project.name}</h3><p>{project.tagline || project.description}</p><Link to={`/projects/${project.slug}`} className="laptop-preview-link">Explore case study<FiArrowUpRight aria-hidden /></Link></div><img className="laptop-preview-image" src={screen} alt={`${project.name} interface`} loading="lazy" /></div>
        </div>
      </div>
      <div className="laptop-scroll-cue"><span>{project.name}</span><span><FiArrowDown aria-hidden />Scroll to open</span></div>
      {animated && <a className="laptop-scroll-skip" href="#featured-project-caption">Skip animation<FiArrowDown aria-hidden /></a>}
    </div>
  </article>;
}
