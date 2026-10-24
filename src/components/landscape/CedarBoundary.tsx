import { useId, useLayoutEffect, useReducer, useRef } from 'react';
import { gsap } from 'gsap';
import { CaseDisclosure } from './CaseDisclosure';
import { playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { useMotionPreference } from '../../lib/use-motion-preference';
import { cedarEvidence, cedarSample, cedarMoney, cedarReducer, initialCedar, sampleFigures, progressChoices } from './cedar-boundary-state';
import './cedar-boundary.css';

export function CedarBoundary({ suspended = false, headingLevel = 3, headingId }: { suspended?: boolean; headingLevel?: 2 | 3; headingId?: string }) {
  const [state, dispatch] = useReducer(cedarReducer, undefined, initialCedar);
  const reduced = useMotionPreference(), id = useId();
  const interpretation = useRef<HTMLDivElement>(null), guide = useRef<SVGPathElement>(null);
  const figures = sampleFigures(state.progress);
  const outdated = Boolean(state.interpretation && state.interpretation.progress !== state.progress);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const Subheading = headingLevel === 2 ? 'h3' : 'h4';
  const step = state.phase === 'inspect' ? 0 : state.phase === 'interpret' ? 1 : 2;
  useLayoutEffect(() => {
    if (!interpretation.current || !guide.current) return;
    const opacity = state.interpretation && !outdated ? 1 : 0.45;
    if (reduced || suspended || state.phase === 'inspect') { gsap.set(interpretation.current, { opacity: 1 }); gsap.set(guide.current, { opacity }); return; }
    const timeline = gsap.timeline({ paused: true });
    timeline.fromTo(interpretation.current, { opacity: 0.4 }, { opacity: 1, duration: 0.18 });
    timeline.to(guide.current, { opacity, duration: 0.38, ease: 'power2.inOut' }, 0);
    playFiniteMotion(timeline);
    return () => stopFiniteMotion(timeline);
  }, [state.phase, state.progress, state.interpretation, outdated, reduced, suspended]);
  const source = (file: string) => `${cedarEvidence.repository}/blob/${cedarEvidence.revision}/${file}`;
  return <section className="cedar-boundary" aria-label="Cedar calculation and interpretation" data-phase={state.phase} data-outdated={outdated} inert={suspended}>
    <header className="cedar-heading">
      <Heading className="cedar-title" id={headingId} tabIndex={headingId ? -1 : undefined}>Calculated facts support the interpretation.</Heading>
      <p className="cedar-label">Engineering demonstration — fictional data.</p>
      <ol className="cedar-progress" role="list" aria-label="Cedar demonstration progress">
        {['Inspect', 'Interpret', 'Recalculate'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}><span className="cedar-step-number" aria-hidden="true">{index + 1}</span>{label}{index < 2 && <span aria-hidden="true">→</span>}</li>)}
      </ol>
    </header>
    <div className="cedar-body">
      <div className="cedar-content">
        <p className="cedar-intro">Fictional project · amounts in USD. Inspect the calculation, then reveal its explanation.</p>
        <dl className="cedar-inputs"><div><dt>Contract value</dt><dd>{cedarMoney(cedarSample.contract)}</dd></div><div><dt>Invoiced actual cost</dt><dd>{cedarMoney(cedarSample.supplier + cedarSample.contractor)}</dd></div></dl>
        <p className="cedar-cost-basis">USD 25,000 supplier invoices + USD 15,000 contractor invoices = USD 40,000 actual cost.</p>
        <div className="cedar-input-control"><label htmlFor={`${id}-progress`}>Average phase progress</label><select id={`${id}-progress`} value={state.progress} onChange={event => dispatch({ type: 'change', progress: Number(event.target.value) })}>
          {progressChoices.map(progress => <option key={progress} value={progress}>{progress}%{progress === 0 ? ' · no progress reported' : ''}</option>)}
        </select><span className="cedar-unit">Percent complete · 0–100%</span></div>
        <div className="cedar-calculation" data-changed={state.phase === 'changed'}>
          <div className="cedar-result-heading"><span>Calculated total-cost estimate</span>{state.phase === 'changed' && <strong>Recalculated</strong>}</div>
          <strong className="cedar-total">{cedarMoney(figures.total)}</strong>
          <p className="cedar-formula">{state.progress > 0 ? `USD 40,000 ÷ ${(state.progress / 100).toFixed(2)} progress = ${cedarMoney(figures.total)}` : '0% progress: keep the current invoiced cost; no extrapolation.'}</p>
          <p className="cedar-margin">Estimated margin: <strong>{figures.margin.toFixed(2)}%</strong> · (contract − estimate) ÷ contract.</p>
          <p className="cedar-estimate-note">Trend-based estimate, not a prediction.</p>
        </div>
        <div className="cedar-interpretation" ref={interpretation} data-outdated={outdated}>
          <Subheading className="cedar-interpretation-title">Sample interpretation</Subheading>
          <p className="cedar-interpretation-basis">{state.interpretation ? `${outdated ? 'Outdated sample' : 'Based on these figures'} · ${state.interpretation.progress}% progress` : 'Prewritten sample · reveal with Interpret'}</p>
          <p className="cedar-explanation">{state.interpretation?.text ?? 'The explanation reads the calculated figures. It cannot change them.'}</p>
          {outdated && <p className="cedar-outdated-note">Figures changed; refresh the explanation. The outdated label is a teaching aid in this demonstration.</p>}
        </div>
        <div className="cedar-actions"><button className="cedar-primary" onClick={() => dispatch({ type: 'interpret' })}>{outdated ? 'Refresh sample interpretation' : 'Interpret the figures'}</button><button onClick={() => dispatch({ type: 'reset' })}>Reset</button></div>
      </div>
      <div className="cedar-art" aria-hidden="true" data-renderer="photographic-svg" data-emphasis={outdated ? 'outdated' : state.interpretation ? 'explained' : 'figures'}>
        <svg viewBox="0 0 1254 1254" focusable="false">
          <image href="/landscape/archive-sculpture.webp" width="1254" height="1254" />
          <g className="cedar-foundation-guide"><path d="M430 758 L180 1190 H530" /><circle cx="430" cy="758" r="50" /><text x="430" y="782">1</text></g>
          <g className="cedar-interpretation-marker"><path ref={guide} className="cedar-interpretation-guide" d="M708 578 L1120 1190 H720" /><circle cx="708" cy="578" r="50" /><text x="708" y="602">2</text></g>
        </svg>
        <div className="cedar-art-labels"><div><strong>1 Cross-beam</strong><span>Calculated facts</span></div><div><strong>2 Diagonal</strong><span>{outdated ? 'Outdated explanation' : state.interpretation ? 'Interpretation revealed' : 'Awaiting interpretation'}</span></div></div>
        <p>Connected beams: a foundation of facts supports the explanation.</p>
      </div>
    </div>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{state.announcement}</p>
    <CaseDisclosure className="cedar-disclosure" title="Source basis and demonstration limits">
      <p>These decisions describe the team’s implementation. Mahmoud’s documented contributions and collaborators remain in the case study. The cross-beam and diagonal are artistic associations, not a literal architecture diagram; the original joined photograph stays fixed.</p>
      <p>The financial summary totals billed supplier and contractor invoices, excluding draft/cancelled records. The advisor uses this invoiced cost and clamps average phase progress to 0–100%. With a positive contract and progress, its total-cost estimate is actual cost ÷ progress ratio, never below actual cost. Otherwise it keeps actual cost. Margin is (contract − estimate) ÷ contract, or 0% for a zero contract.</p>
      <p>Groq receives project code/name, a calculated risk label, contract, actual cost, estimated total cost, margin, cost ratio and thresholds. It returns text; the GET path does not write financial records. Missing credentials/SDK, provider exceptions and empty/non-text content fall back to deterministic text. Nonempty provider text is used without checking its numerical accuracy. This is a boundary between calculation and explanation, not a guarantee that generated text is correct.</p>
      <p>This local example uses fictional USD amounts and prewritten explanations. Refreshing the explanation illustrates how it can become outdated when inputs change. It makes no AI request or financial submission; it does not simulate schedule changes or live accounting.</p>
      <p>Explore the calculation and explanation code below.</p>
      <ul>{[['Calculation and narration', 'apps/projects/advisor.py'], ['Financial roll-up', 'apps/projects/financial.py'], ['Read-only advisor route', 'apps/projects/views.py'], ['Browser explanation rendering', 'static/js/project_detail.js']].map(([label, file]) => <li key={file}><a href={source(file)} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul>
    </CaseDisclosure>
  </section>;
}
