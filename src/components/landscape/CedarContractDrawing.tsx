import { useId } from 'react';
import { cedarMoney, cedarSample, sampleFigures } from './cedar-boundary-state';
import './cedar-contract-drawing.css';

const dollars = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const contract = cedarSample.contract;
const position = (amount: number) => `translateX(${100 * amount / (2 * contract)}%)`;

export function CedarContractDrawing({ total, progress, explained, still }: {
  total: number; progress: number; explained: number | null; still: boolean;
}) {
  const id = useId();
  const past = explained === null ? null : sampleFigures(explained).total;
  const [integer, cents] = cedarMoney(total).slice(4).split('.');
  const invoiced = progress === 0;
  const difference = total - contract;

  return <figure className="cedar-contract" aria-labelledby={id} data-still={still || undefined} data-invoiced={invoiced || undefined}>
    <figcaption className="cedar-contract-caption">
      <span id={id}>{invoiced ? 'Invoiced cost to date' : 'Calculated total-cost estimate'}</span>
      <span className="sr-only">{cedarMoney(total)}</span>
      <strong className="cedar-total" aria-hidden="true"><small>USD </small><span>{integer}<small>.{cents}</small></span></strong>
    </figcaption>
    <div className="cedar-contract-stage">
      <div className="cedar-art" aria-hidden="true" data-renderer="photographic-svg">
        <svg viewBox="0 0 1254 1254" focusable="false">
          <image href="/landscape/archive-sculpture.webp" width="1254" height="1254" />
          <path d="M1158 995 H1205 V1168 H1254" /><circle cx="1158" cy="995" r="18" />
        </svg>
      </div>
      <div className="cedar-contract-difference">{invoiced ? <><strong>No forecast</strong>{' '}<span>at 0% progress</span></> :
        <><strong>{dollars(Math.abs(difference))}</strong>{' '}<span>{difference > 0 ? 'over' : 'below'} contract</span></>}</div>
    </div>
    <div className="cedar-contract-rail" aria-hidden="true">
      <span className="cedar-contract-register" data-marker="contract" />
      <span className="cedar-contract-span" style={{ transform: `scaleX(${difference / contract})` }} />
      <span className="cedar-contract-carrier" style={{ transform: position(total) }}><i data-marker="estimate" /></span>
      {past !== null && <span className="cedar-contract-carrier" style={{ transform: position(past) }}><i className="cedar-interpretation-guide" data-marker="explanation" /></span>}
    </div>
    <div className="cedar-contract-scale">
      <span>$0</span><strong>Contract<span>{dollars(contract)}</span></strong><span>$200k</span>
    </div>
    <div className="cedar-contract-key">
      <span className="cedar-contract-key-now">{invoiced ? 'Invoiced only' : 'Current estimate'}</span>
      <span className="cedar-contract-key-then" data-empty={past === null || undefined}>{past === null ? 'No explanation yet' : `Explanation: ${dollars(past)} at ${explained}%`}</span>
    </div>
  </figure>;
}
