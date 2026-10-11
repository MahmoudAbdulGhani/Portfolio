import { useId, useLayoutEffect, useReducer, useRef } from 'react';
import { gsap } from 'gsap';
import { caseStudies } from '../../../shared/case-study-runtime';
import { useMotionPreference } from '../../lib/use-motion-preference';
import { boundaryReducer, initialBoundary, proposedLocation, type BoundaryPhase } from './profile-boundary-state';
import { playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { CaseDisclosure } from './CaseDisclosure';
import './profile-boundary.css';

const messages: Record<BoundaryPhase, string> = {
  rest: 'Suggestions become saved information only after review.',
  propose: 'A proposed change is still separate from saved information.',
  review: 'Review the change before accepting it.',
  accept: 'Reviewed changes accepted.',
};

function BoundarySculpture({ phase, reduced, suspended }: { phase: BoundaryPhase; reduced: boolean; suspended: boolean }) {
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
    </svg>
    <span>{pending ? 'Proposal held apart' : phase === 'accept' ? 'Reviewed and aligned' : 'Accepted information'}</span>
  </div>;
}

export function ProfileBoundary({ suspended = false, headingLevel = 3 }: { suspended?: boolean; headingLevel?: 2 | 3 }) {
  const [state, dispatch] = useReducer(boundaryReducer, undefined, initialBoundary);
  const reduced = useMotionPreference();
  const text = useRef<HTMLParagraphElement>(null);
  const stale = state.phase === 'review' && state.reviewed?.revision !== state.revision;
  const study = caseStudies['jobpilot-ai'];
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  useLayoutEffect(() => {
    if (!text.current) return;
    if (reduced || suspended) { gsap.set(text.current, { opacity: 1 }); return; }
    const timeline = gsap.timeline({ paused: true });
    timeline.fromTo(text.current, { opacity: 0.35 }, { opacity: 1, duration: 0.18 });
    playFiniteMotion(timeline);
    return () => stopFiniteMotion(timeline);
  }, [state.phase, state.blocked, reduced, suspended]);
  return <section className="profile-boundary" aria-label="The profile save boundary" data-phase={state.phase} data-stale={stale} inert={suspended}>
    <div className="boundary-heading"><span>Engineering demonstration — sample data.</span><span>{state.phase}</span></div>
    <div className="boundary-body">
      <BoundarySculpture phase={state.phase} reduced={reduced} suspended={suspended} />
      <div className="boundary-content">
        <Heading>The profile save boundary</Heading>
        <p className="boundary-message" ref={text}>{state.blocked ? 'The old review cannot be applied; review again before accepting.' : messages[state.phase]}</p>
        {state.phase !== 'rest' && <>
          <p className="boundary-source">Fictional candidate · confirmed sample CV: “Location: Tripoli”.</p>
          <dl className="boundary-comparison">
            <div className="boundary-saved"><dt>{state.phase === 'accept' ? 'Saved · accepted' : 'Saved information'}</dt><dd>{state.saved}</dd><span>Location · revision {state.revision}</span></div>
            <div className="boundary-proposed"><dt>{state.phase === 'accept' ? 'Reviewed change' : 'Proposed change'}</dt><dd>{proposedLocation}</dd><span>{state.phase === 'accept' ? 'Accepted after review' : 'Location · not saved'}</span></div>
          </dl>
          {state.phase === 'review' && <p className="boundary-review-basis">Review compares {state.reviewed?.saved} → {proposedLocation}.{stale && ' Saved information changed; this review is out of date.'}</p>}
        </>}
        <div className="boundary-actions">
          <button className="boundary-primary" onClick={() => dispatch(state.phase === 'rest' ? 'propose' : state.phase === 'propose' || state.blocked ? 'review' : 'accept')} aria-disabled={state.phase === 'accept'}>
            {state.phase === 'rest' ? 'Propose a change' : state.phase === 'propose' ? 'Review the change' : state.blocked ? 'Review again' : state.phase === 'accept' ? 'Accepted' : 'Accept reviewed change'}
          </button>
          <button onClick={() => dispatch('reset')}>Reset</button>
        </div>
        {state.phase === 'review' && <button className="boundary-change" onClick={() => dispatch('change-saved')} aria-disabled={state.saved === 'Byblos'}>Change the saved profile during review.</button>}
      </div>
    </div>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{state.announcement}</p>
    <CaseDisclosure className="boundary-disclosure" title="How this maps to the implementation">
      <p>One ivory plate holds the proposal apart; alignment represents acceptance. Its small turn uses the original photograph, as an artistic metaphor. Fictional values live only in this page’s memory. It does not edit a real JobPilot profile.</p>
      <p>The documented service keeps current and proposed profiles separate during review. Apply checks the reviewed profile revision and confirmed CV freshness under row locks, then saves accepted values and their provenance together. A changed profile requires another review; changed CV text requires fresh suggestions. Repeating an identical accepted request returns its existing result without applying it twice.</p>
      <p>This sample models only the profile revision check. It does not simulate CV changes, row locks, provenance storage or network retries. Private source was inspected at revision {study.revision.slice(0,7)}; live saves and concurrency were not tested.</p>
      <a className="text-link" href={study.sources[0].url} target="_blank" rel="noopener noreferrer">Profile review and apply service (access required)</a>
    </CaseDisclosure>
  </section>;
}
