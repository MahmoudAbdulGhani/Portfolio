import { useEffect, useId, useRef } from 'react';
import { FiArrowUpRight, FiCheck, FiChevronDown } from 'react-icons/fi';
import type { DetailScreen } from '../../lib/project-detail-screens';
import './case-media.css';

export function CaseMediaNav({ screens, index, select, enlarge }: {
  screens: DetailScreen[]; index: number; select: (index: number) => void; enlarge: (trigger: HTMLButtonElement) => void;
}) {
  const chooser = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const titleId = useId();
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (chooser.current?.open && event.target instanceof Node && !chooser.current.contains(event.target)) chooser.current.open = false;
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  return <div className="case-screen-tools case-media-nav">
    <p className="case-media-title" id={titleId} aria-live="polite" aria-atomic="true"><strong>{screens[index].label}</strong><span>{index + 1} / {screens.length}</span></p>
    {screens.length > 1 && <details className="case-media-chooser" ref={chooser}
      onToggle={event => {
        const node = event.currentTarget;
        if (!node.open) return;
        const bounds = node.getBoundingClientRect();
        const surface = node.closest('main')?.getBoundingClientRect();
        const below = (surface?.bottom ?? innerHeight) - bounds.bottom;
        const above = bounds.top - (surface?.top ?? 0);
        const upwards = below < Math.min(420, innerHeight * 0.55) && above > below;
        node.dataset.placement = upwards ? 'above' : 'below';
        node.style.setProperty('--chooser-height', `${Math.max(88, Math.min(420, innerHeight * 0.55, (upwards ? above : below) - 16))}px`);
      }}
      onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}
      onKeyDown={event => { if (event.key === 'Escape' && event.currentTarget.open) { event.preventDefault(); event.stopPropagation(); event.currentTarget.open = false; trigger.current?.focus({ preventScroll: true }); } }}>
      <summary ref={trigger} aria-describedby={titleId}>Choose image<FiChevronDown aria-hidden="true" /></summary>
      <ol className="chapter-switch" aria-label="Case study screenshot">
        {screens.map((screen, position) => <li key={screen.src}><button type="button" aria-pressed={position === index} onClick={() => {
          select(position); if (chooser.current) chooser.current.open = false; trigger.current?.focus({ preventScroll: true });
        }}><span className="media-choice-number">{String(position + 1).padStart(2, '0')}</span><span>{screen.label}</span>{position === index && <FiCheck aria-hidden="true" />}</button></li>)}
      </ol>
    </details>}
    <button type="button" className="text-link media-enlarge" aria-describedby={titleId} onClick={event => enlarge(event.currentTarget)}>Enlarge<FiArrowUpRight aria-hidden="true" /></button>
  </div>;
}
