import { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import { gsap } from 'gsap';
import { caseStudies } from '../../../shared/case-study-runtime';
import { useMotionPreference } from '../../lib/use-motion-preference';
import { boundaryReducer, initialBoundary, proposedLocation, type BoundaryPhase, type BoundaryState } from './profile-boundary-state';
import { playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { BoundarySculpture } from './BoundarySculpture';
import { CaseDisclosure } from './CaseDisclosure';
import './profile-boundary.css';
import { useJobPilotDesign } from './jobpilot-design-context';

const messages: Record<BoundaryPhase, string> = {
  rest: 'Suggestions become saved information only after review.',
  propose: 'A proposed change is still separate from saved information.',
  review: 'Review the change before accepting it.',
  accept: 'Reviewed changes accepted.',
};

export function ProfileBoundary({ suspended = false, headingLevel = 3, headingId, initialState, onStateChange, disclosureOpen = false, concise = false }: { suspended?: boolean; headingLevel?: 2 | 3; headingId?: string; initialState?: BoundaryState; onStateChange?: (state: BoundaryState) => void; disclosureOpen?: boolean; concise?: boolean }) {
  const [state, dispatch] = useReducer(boundaryReducer, initialState, saved => saved ? { ...saved, announcement: '' } : initialBoundary());
  useEffect(() => { onStateChange?.(state); }, [state, onStateChange]);
  const reduced = useMotionPreference();
  const design = useJobPilotDesign();
  const motionStudy = design?.motionStudy;
  const Register = design?.Register;
  const text = useRef<HTMLParagraphElement>(null);
  const stale = state.phase === 'review' && state.reviewed?.revision !== state.revision;
  const study = caseStudies['jobpilot-ai'];
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const currentStep = state.phase === 'review' ? 1 : state.phase === 'accept' ? 2 : 0;
  const pending = state.phase === 'propose' || state.phase === 'review';
  useLayoutEffect(() => {
    if (!text.current) return;
    if (reduced || suspended) { gsap.set(text.current, { opacity: 1 }); return; }
    const timeline = gsap.timeline({ paused: true });
    timeline.fromTo(text.current, { opacity: 0.35 }, { opacity: 1, duration: 0.18 });
    const scope = text.current.closest('.profile-boundary');
    if (motionStudy && scope) {
      // Emphasize the record that actually changes, never animate an implied
      // save during proposal/review. Stale data stays visibly distinct.
      const record = scope.querySelector(state.phase === 'accept' || stale ? '.boundary-saved' : '.boundary-proposed');
      if (record) timeline.fromTo(record.querySelectorAll('.boundary-value, .boundary-value-note'),
        {y:6,opacity:0.6},{y:0,opacity:1,duration:0.3,stagger:0.045,ease:'power3.out',clearProps:'transform,opacity'},0);
    }
    playFiniteMotion(timeline);
    return () => { stopFiniteMotion(timeline); if (scope && motionStudy) gsap.set(scope.querySelectorAll('.boundary-value, .boundary-value-note'), {clearProps:'transform,opacity'}); };
  }, [state.phase, state.blocked, state.revision, reduced, suspended, motionStudy, stale]);
  const controls = <>
    <div className="boundary-actions">
      <button className="boundary-primary" onClick={() => dispatch(state.phase === 'rest' ? 'propose' : state.phase === 'propose' || state.blocked ? 'review' : 'accept')} aria-disabled={state.phase === 'accept'}>
        {state.phase === 'rest' ? 'Propose a change' : state.phase === 'propose' ? 'Review the change' : state.blocked ? 'Review again' : state.phase === 'accept' ? 'Accepted' : 'Accept reviewed change'}
      </button>
      <button onClick={() => dispatch('reset')}>Reset</button>
    </div>
    <div className="boundary-option">{state.phase === 'review' && <button className="boundary-change" onClick={() => dispatch('change-saved')} aria-disabled={state.saved === 'Byblos'}>{Register ? 'Simulate another edit' : 'Change the saved profile during review.'}</button>}</div>
  </>;
  return <section className="profile-boundary" aria-label="The profile save boundary" data-phase={state.phase} data-stale={stale} data-presentation={concise?'concise':undefined} inert={suspended}>
    <header className="boundary-heading">
      <Heading className="boundary-title" id={headingId} tabIndex={headingId ? -1 : undefined}>The profile save boundary</Heading>
      <p className="boundary-label">{concise?'Sample data · local demo':'Engineering demonstration — sample data.'}</p>
      {!Register && <ol className="boundary-progress" role="list" aria-label="Review progress">
        {['Propose', 'Review', 'Accepted'].map((label, index) => <li key={label} aria-current={currentStep === index ? 'step' : undefined} data-complete={index < currentStep}>
          <span className="boundary-step-number" aria-hidden="true">{index + 1}</span><span>{label}</span>{index < 2 && <span className="boundary-step-arrow" aria-hidden="true">→</span>}
        </li>)}
      </ol>}
    </header>
    {Register ? <Register state={state} reduced={reduced} suspended={suspended} controls={controls} /> : <div className="boundary-body">
      <BoundarySculpture phase={state.phase} reduced={reduced} suspended={suspended} />
      <div className="boundary-content">
        <p className="boundary-message" ref={text}>{state.blocked ? 'The old review cannot be applied; review again before accepting.' : stale ? 'Saved information changed; this review is out of date.' : messages[state.phase]}</p>
        {!concise&&<p className="boundary-source">Fictional candidate · confirmed sample CV: “Location: Tripoli”.</p>}
        <dl className="boundary-comparison">
          <div className="boundary-proposed" data-pending={pending}>
            <dt>{state.phase === 'accept' ? 'Reviewed change' : 'Proposed change'}</dt>
            <dd><strong className="boundary-value">{state.phase === 'rest' ? 'None yet' : proposedLocation}</strong><span className="boundary-value-note">{state.phase === 'rest' ? 'Start with a proposal' : state.phase === 'accept' ? 'Accepted after review' : state.phase === 'review' ? 'Not saved · awaiting approval' : 'Not saved · awaiting review'}</span></dd>
          </div>
          <div className="boundary-saved" data-changed={stale}>
            <dt>{state.phase === 'accept' ? 'Saved · accepted' : 'Saved information'}</dt>
            <dd><strong className="boundary-value">{state.saved}</strong><span className="boundary-value-note">Location · revision {state.revision}</span>{stale && <span className="boundary-changed-label">Changed during review</span>}</dd>
          </div>
        </dl>
        <p className="boundary-review-basis" data-outdated={stale}>
          {state.phase === 'review' ? <>{stale && <strong>Outdated review. </strong>}Review compares {state.reviewed?.saved} → {proposedLocation}.{stale && ' Another review is required.'}</> : state.phase === 'accept' ? 'Saved information now matches the reviewed proposal.' : 'The ivory plate represents the proposed value, separate from saved information.'}
        </p>
        {controls}
      </div>
    </div>}
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{state.announcement}</p>
    <CaseDisclosure className="boundary-disclosure" title="How this maps to the implementation" defaultOpen={disclosureOpen}>
      {concise&&<><p>{study.engineeringHeading}</p><p>Fictional candidate · confirmed sample CV: “Location: Tripoli”.</p></>}
      <p>One ivory plate holds the proposal apart; alignment represents acceptance. Its small turn uses the original photograph, as an artistic metaphor. Fictional values live only in this page’s memory. It does not edit a real JobPilot profile.</p>
      <p>The documented service keeps current and proposed profiles separate during review. Apply checks the reviewed profile revision and confirmed CV freshness under row locks, then saves accepted values and their provenance together. A changed profile requires another review; changed CV text requires fresh suggestions. Repeating an identical accepted request returns its existing result without applying it twice.</p>
      <p>This interactive example illustrates the profile revision check with sample data. It runs locally without saving a profile or contacting a backend.</p>
      <a className="text-link" href={study.sources[0].url} target="_blank" rel="noopener noreferrer">Profile review and apply service (access required)</a>
    </CaseDisclosure>
  </section>;
}
