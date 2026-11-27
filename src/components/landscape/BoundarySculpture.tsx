import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { playFiniteMotion, stopFiniteMotion } from './finite-motion';
import type { BoundaryPhase } from './profile-boundary-state';

export function BoundarySculpture({ phase, reduced, suspended, guide }: { phase: BoundaryPhase; reduced: boolean; suspended: boolean; guide?: ReactNode }) {
  const plate = useRef<SVGGElement>(null);
  const id = useId().replaceAll(':', '');
  const pending = phase === 'propose' || phase === 'review';
  useLayoutEffect(() => {
    if (!plate.current) return;
    const element = plate.current;
    // A small in-plane turn around the photographed lower support. The exact
    // original pixels and silhouette return on approval/reset; no 3D is implied.
    const angle = pending ? -3.5 : 0;
    const pose = { angle: Number(element.dataset.angle ?? 0) };
    const render = () => {
      element.setAttribute('transform', `rotate(${pose.angle} 570 1035)`);
      element.dataset.angle = String(pose.angle);
    };
    if (reduced || suspended || phase === 'rest') { pose.angle = angle; render(); return; }
    const timeline = gsap.timeline({ paused: true, onUpdate: render });
    timeline.to(pose, { angle, duration: 0.38, ease: 'power2.inOut' });
    playFiniteMotion(timeline);
    return () => stopFiniteMotion(timeline);
  }, [pending, reduced, suspended, phase]);
  // Trace only the existing foreground ivory plate. The complementary mask
  // removes its stationary copy, so movement never doubles the element.
  const outline = 'M76 823 C142 816 257 827 346 841 C399 849 411 923 475 985 C521 1030 558 1065 600 1072 C619 1079 591 1086 552 1080 C436 1071 295 1055 225 1031 C159 1008 108 944 78 847 Q67 827 76 823 Z';
  return <div className="boundary-art" data-renderer="photographic-svg" data-pose={pending ? 'pending' : 'aligned'} aria-hidden="true">
    <svg viewBox="0 0 1254 1254" focusable="false">
      <defs>
        <clipPath id={`${id}-plate`}><path d={outline} /></clipPath>
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><rect width="1254" height="1254" fill="white" /><path d={outline} fill="black" /></mask>
      </defs>
      <image href="/landscape/jobpilot-sculpture.webp" width="1254" height="1254" mask={`url(#${id}-body)`} />
      <g ref={plate} data-angle="0" className="boundary-plate"><image href="/landscape/jobpilot-sculpture.webp" width="1254" height="1254" clipPath={`url(#${id}-plate)`} /></g>
      {guide ?? <><path className="boundary-plate-guide" d="M285 966 L220 1175 H1180" fill="none" />
      <circle className="boundary-plate-point" cx="285" cy="966" r="12" /></>}
    </svg>
    {!guide && <div className="boundary-plate-label"><span>Ivory plate · proposed change</span><span>{pending ? 'Held apart until approval' : phase === 'accept' ? 'Aligned after acceptance' : 'Aligned · no proposal yet'}</span></div>}
  </div>;
}
