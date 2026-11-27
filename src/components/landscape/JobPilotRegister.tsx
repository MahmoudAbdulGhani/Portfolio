import { BoundarySculpture } from './BoundarySculpture';
import { proposedLocation } from './profile-boundary-state';
import type { RegisterProps } from './jobpilot-design-context';
import './jobpilot-register.css';

const cues = {
  rest: 'Start with a suggestion.',
  propose: 'Ready for review.',
  review: 'Reviewed. Still not saved.',
  outdated: 'Another edit changed the saved location.',
  blocked: 'Review the new revision before accepting.',
  accept: 'Change accepted.',
};

// Decorative marks follow the real revision check. They never dispatch actions
// or hold up input. The visible text and live region work without SVG or motion.
export function JobPilotRegister({ state, reduced, suspended, controls }: RegisterProps) {
  const outdated = state.phase === 'review' && state.reviewed?.revision !== state.revision;
  const mark = state.blocked ? 'blocked' : outdated ? 'outdated' : state.phase;
  const proposedNote = state.phase === 'rest' ? 'No proposal' : state.phase === 'propose' ? 'Not reviewed'
    : state.phase === 'accept' ? 'Applied' : state.reviewed ? `Reviewed at revision ${state.reviewed.revision}` : 'Needs review';
  return <div className="jp-register" data-jobpilot-register={mark} data-static={reduced || suspended || undefined}>
    <div className="jp-register-sheet">
      <div className="jp-register-object">
        <BoundarySculpture phase={state.phase} reduced={reduced} suspended={suspended} guide={<>
          {/* Both leads originate at the lower support, the fixed pivot of the ivory plate.
              Wide exits at 92.5% height; narrow exits at 17.5% width. CSS meets those ports. */}
          <path className="jp-register-lead jp-register-wide" d="M570 1035 L520 1160 H1254" />
          <path className="jp-register-lead jp-register-narrow" d="M570 1035 L520 1160 H219.45 V1254" />
          <circle className="jp-register-pin" cx="570" cy="1035" r="10"/>
        </>} />
      </div>
      <p className="jp-register-cue">{cues[mark]}</p>
      <dl className="jp-register-values">
        <div className="jp-register-proposal">
          <dt>{state.phase === 'accept' ? 'Reviewed location' : 'Proposed location'}</dt>
          <dd><strong>{state.phase === 'rest' ? '—' : proposedLocation}</strong><small>{proposedNote}</small>
          <span className="jp-register-lane" aria-hidden="true"><i className="jp-register-tip"/></span></dd>
        </div>
        <div className="jp-register-saved">
          <dt>Saved location</dt>
          <dd><strong>{state.saved}</strong><small>Revision {state.revision}</small>
          <span className="jp-register-stop" aria-hidden="true"/></dd>
        </div>
      </dl>
    </div>
    <div className="jp-register-actions">{controls}</div>
  </div>;
}
