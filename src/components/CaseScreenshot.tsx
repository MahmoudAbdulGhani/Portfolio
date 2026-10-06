import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { FiMaximize2, FiPause, FiPlay } from 'react-icons/fi';
import { ResponsiveProjectImage } from './ResponsiveProjectImage';
import type { DetailScreen } from '../lib/project-detail-screens';

export function CaseScreenshot({ screen, projectName, priority = false, preview = false, onOpen }: {
  screen: DetailScreen; projectName: string; priority?: boolean; preview?: boolean; onOpen: (src: string) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible');
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const running = preview && !reduced && inView && visible && !paused && !hovered && !focused;
  const runningRef = useRef(false);

  useEffect(() => {
    runningRef.current = running;
    timeline.current?.paused(!running);
  }, [running]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .25 });
    observer.observe(element);
    const visibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    const element = viewport.current;
    const image = element?.querySelector('img');
    if (!element || !image || !loaded || failed) return;
    const measure = () => {
      timeline.current?.kill();
      gsap.set(image, { y: 0 });
      const distance = Math.max(0, image.clientHeight - element.clientHeight);
      setOverflow(distance > 24);
      if (!preview || reduced || distance <= 24) return;
      timeline.current = gsap.timeline({ paused: !runningRef.current })
        .to(image, { y: -distance, duration: Math.min(12, Math.max(7, distance / 80)), ease: 'power1.inOut' }, 3)
        .to(image, { y: 0, duration: 2.4, ease: 'power2.inOut' }, '+=3');
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { observer.disconnect(); timeline.current?.kill(); timeline.current = null; gsap.set(image, { clearProps: 'transform' }); };
  }, [loaded, failed, preview, reduced]);

  const inspectManually = () => {
    setPaused(true);
    timeline.current?.pause();
    const element = viewport.current;
    const image = element?.querySelector('img');
    if (!element || !image) return;
    const offset = -(Number(gsap.getProperty(image, 'y')) || 0);
    gsap.set(image, { y: 0 });
    element.scrollTop += offset;
  };

  return <figure className="case-shot" data-viewport={screen.viewport} data-preview-running={running && overflow}>
    <div className="case-shot-toolbar"><span>{screen.label}</span><div>
      {preview && overflow && !reduced && <button type="button" aria-pressed={paused} onClick={() => {
        if (paused) { const image = viewport.current?.querySelector('img'); if (image && viewport.current) { viewport.current.scrollTop = 0; timeline.current?.restart(); } }
        setPaused(!paused);
      }}>{paused ? <FiPlay /> : <FiPause />}<span>{paused ? 'Play preview' : 'Pause preview'}</span></button>}
      <button type="button" onClick={() => onOpen(screen.src)} disabled={failed} aria-label={`Expand ${projectName}: ${screen.label}`}><FiMaximize2 /><span>Expand screenshot</span></button>
    </div></div>
    <div ref={viewport} className="case-shot-viewport" role="region" tabIndex={0} aria-label={`${screen.label} screenshot. Scroll to inspect.`}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      onWheel={inspectManually} onTouchStart={inspectManually} onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) inspectManually(); }}>
      {failed ? <p className="case-shot-error">This screenshot is unavailable. Select another screen.</p> : <ResponsiveProjectImage src={screen.src} alt={`${projectName}: ${screen.label}`} sizes="(min-width: 1024px) 1240px, 92vw" priority={priority} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
    </div>
  </figure>;
}
