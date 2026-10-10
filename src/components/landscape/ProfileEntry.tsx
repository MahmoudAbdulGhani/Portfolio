import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { finishFiniteMotion, playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { motionQuery } from '../../lib/use-motion-preference';

// One major group per mount. Preference changes can finish this entry, but
// never replay it; navigation back to Profile creates a fresh entry scope.
export function ProfileEntry({ className, children }: { className: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const media = matchMedia(motionQuery), element = root.current!;
    let timeline: gsap.core.Timeline | undefined;
    if (!media.matches) {
      timeline = gsap.timeline({ paused: true });
      timeline.fromTo(element, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' });
      playFiniteMotion(timeline, { complete: () => gsap.set(element, { clearProps: 'opacity,transform' }) });
    }
    const change = () => { if (media.matches) finishFiniteMotion(timeline); };
    media.addEventListener('change', change);
    return () => { media.removeEventListener('change', change); stopFiniteMotion(timeline); };
  }, []);
  return <div ref={root} className={className}>{children}</div>;
}
