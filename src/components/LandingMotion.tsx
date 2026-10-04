import { useCallback, useRef, useSyncExternalStore, type ReactNode } from "react";
import { motion, MotionConfig, useScroll, useTransform } from "framer-motion";
import { MotionContext, useLandingMotion } from "../lib/landing-motion";

function useMedia(query: string) {
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", notify);
    return () => media.removeEventListener("change", notify);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}



export function LandingMotion({ children }: { children: ReactNode }) {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const desktop = useMedia("(min-width: 1024px) and (min-height: 700px) and (pointer: fine)");
  const enabled = !reduced;
  return <MotionContext.Provider value={{ enabled, cinematic: !reduced && desktop }}>
    <MotionConfig reducedMotion={enabled ? "user" : "always"}>
      <div className={`landing-motion ${enabled ? "" : "motion-paused"}`}>{children}</div>
    </MotionConfig>
  </MotionContext.Provider>;
}

export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { enabled } = useLandingMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(/\s+/).filter(Boolean);
  return <span ref={ref} className={`scroll-words ${className}`} aria-label={text}>
    {words.map((word, index) => <ScrollWord key={`${word}-${index}`} word={word} progress={scrollYProgress} start={index / Math.max(words.length, 1)} end={(index + 1) / Math.max(words.length, 1)} enabled={enabled} />)}
  </span>;
}

function ScrollWord({ word, progress, start, end, enabled }: { word: string; progress: ReturnType<typeof useScroll>["scrollYProgress"]; start: number; end: number; enabled: boolean }) {
  const opacity = useTransform(progress, [start, end], [0.38, 1]);
  return <motion.span aria-hidden="true" style={{ opacity: enabled ? opacity : 1 }}>{word}{" "}</motion.span>;
}

export function MotionTimeline({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { enabled } = useLandingMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 65%"] });
  return <div ref={ref} className={`motion-timeline ${className}`}>
    <motion.div className="timeline-progress" style={{ scaleY: enabled ? scrollYProgress : 1 }} aria-hidden />
    {children}
  </div>;
}
