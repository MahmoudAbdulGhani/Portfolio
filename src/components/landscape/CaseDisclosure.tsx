import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { FiPlus } from 'react-icons/fi';
import { gsap } from 'gsap';
import { finishFiniteMotion, playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { useMotionPreference } from '../../lib/use-motion-preference';
import './case-disclosure.css';

export function CaseDisclosure({ title, description, heading = false, className = '', children, summary, defaultOpen = false }: {
  title: string; description?: string; heading?: boolean; className?: string; children: ReactNode; summary?: ReactNode; defaultOpen?: boolean;
}) {
  const root = useRef<HTMLDetailsElement>(null), content = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const [expanded, setExpanded] = useState(defaultOpen);
  const reduced = useMotionPreference();
  useEffect(() => () => stopFiniteMotion(animation.current), []);
  useEffect(() => { if (reduced) finishFiniteMotion(animation.current); }, [reduced]);
  const toggle = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const details = root.current!, body = content.current!;
    const opening = details.dataset.expanded !== 'true';
    const before = details.open ? body.getBoundingClientRect().height : 0;
    stopFiniteMotion(animation.current);
    details.dataset.expanded = String(opening);
    setExpanded(opening);
    details.open = true;
    body.inert = !opening;
    const finish = () => {
      details.open = opening;
      body.style.height = opening ? 'auto' : '0px';
      body.style.opacity = opening ? '1' : '0';
      body.style.overflow = opening ? 'visible' : 'hidden';
    };
    if (reduced) { finish(); return; }
    const target = opening ? body.scrollHeight : 0;
    const timeline = gsap.timeline({ paused: true });
    animation.current = timeline;
    timeline.fromTo(body, { height: before, opacity: opening ? before ? 1 : 0 : 1, overflow: 'hidden' },
      { height: target, opacity: opening ? 1 : 0, duration: 0.22, ease: 'power2.inOut' });
    playFiniteMotion(timeline, { complete: finish });
  };
  const label = <><span>{title}{description && <span className="decision-constraint">{description}</span>}</span><FiPlus className="disclosure-indicator" aria-hidden="true" /></>;
  return <details ref={root} className={`case-disclosure ${className}`} open={defaultOpen} data-expanded={expanded}>
    <summary onClick={toggle} aria-expanded={expanded}>{summary ?? (heading ? <h3 className="disclosure-label">{label}</h3> : <span className="disclosure-label">{label}</span>)}</summary>
    <div ref={content} className="disclosure-content" onFocusCapture={() => finishFiniteMotion(animation.current)}><div className="disclosure-content-inner">{children}</div></div>
  </details>;
}
