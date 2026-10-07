import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import { useLandingMotion } from "../lib/landing-motion";
import type { Project } from "../types";
import "./laptop-scroll-scene.css";
const shortQuery = "(max-height: 600px)";
const subscribeShort = (notify: () => void) => { const q = window.matchMedia(shortQuery); q.addEventListener("change", notify); return () => q.removeEventListener("change", notify); };
export function LaptopScrollScene({ project, screen, index = 0, detail }: {
    project: Project;
    screen: string;
    index?: number;
    detail?: string;
}) {
    const root = useRef<HTMLElement>(null), host = useRef<HTMLDivElement>(null), display = useRef<HTMLDivElement>(null);
    const { enabled, profile } = useLandingMotion();
    const short = useSyncExternalStore(subscribeShort, () => window.matchMedia(shortQuery).matches, () => false);
    const animate = enabled && !short, flagship = index === 0;
    const [near, setNear] = useState(false), [mode, setMode] = useState<"poster" | "active" | "fallback">("poster");
    useEffect(() => { if (!animate || !root.current)
        return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) {
        setNear(true);
        observer.disconnect();
    } }, { rootMargin: "700px" }); observer.observe(root.current); return () => observer.disconnect(); }, [animate]);
    useEffect(() => {
        if (!animate || !near || !root.current || !host.current || !display.current)
            return;
        let cancelled = false, dispose: (() => void) | undefined;
        import("../lib/laptop-scene").then(({ createLaptopScene }) => { if (cancelled)
            return; try {
            dispose = createLaptopScene(root.current!, host.current!, display.current!, profile === "touch", flagship, () => setMode("fallback"));
            setMode("active");
        }
        catch {
            setMode("fallback");
        } }).catch(() => { if (!cancelled)
            setMode("fallback"); });
        return () => { cancelled = true; dispose?.(); };
    }, [animate, near, profile, flagship]);
    const active = animate && mode !== "fallback";
    return <article ref={root} className={`laptop-scroll ${flagship ? "laptop-flagship" : "laptop-supporting"} ${active ? "has-laptop-scroll" : ""} mode-${animate ? mode : "fallback"}`} aria-labelledby={`laptop-title-${project.id}`}>
    <div className="laptop-runway"><div className="laptop-scroll-stage">
      <img className="laptop-scroll-studio" src="/projects/cinematic/studio.webp" alt="" loading="lazy"/>
      <header className="laptop-stage-header"><div><p className="cinema-label">Selected work / {String(index + 1).padStart(2, "0")}<span>{project.stack.slice(0, 2).join(" · ")}</span></p><h3 id={`laptop-title-${project.id}`}><Link to={`/projects/${project.slug}`}>{project.name}</Link></h3></div><Link to={`/projects/${project.slug}`} className="laptop-case-link" aria-label={`Explore ${project.name}`}><span>Explore case study</span><FiArrowUpRight aria-hidden/></Link></header>
      <div className="laptop-stage-body">
        <div className="laptop-scroll-poster"><img src={`/projects/cinematic/laptop/poster-${project.slug}.webp`} alt={`${project.name} interface on a graphite laptop`} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = screen; event.currentTarget.alt = `${project.name} interface`; }}/></div>
        <div ref={host} className="laptop-scroll-renderers" aria-hidden="true"/>
        <div className="laptop-screen-source" aria-hidden="true"><div ref={display} className="laptop-physical-screen"><img src={screen} alt="" loading="lazy" decoding="async"/></div></div>
        <div className="laptop-content-panel" aria-hidden={active}><img src={screen} alt={`${project.name} interface`} loading="lazy" decoding="async"/></div>
      </div>
      <footer className="laptop-stage-footer"><p>{project.tagline || project.description}</p>{active && flagship ? <a className="laptop-scroll-skip" href="#featured-project-caption">Skip animation<FiArrowDown aria-hidden/></a> : <span className="laptop-open-label">{active ? "Scroll to reveal" : "Project preview"}</span>}</footer>
    </div></div>
    {flagship && <span id="featured-project-caption" className="laptop-end-anchor"/>}
    {detail && <figure className="laptop-support"><img src={detail} alt={`${project.name} supporting interface`} loading="lazy" decoding="async"/><figcaption>Inside the project / {String(index + 1).padStart(2, "0")}</figcaption></figure>}
  </article>;
}
