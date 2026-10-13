import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { useMotionPreference } from '../../lib/use-motion-preference';
import { playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { journeyTextBox, type JobPilotJourney, type JourneyBox } from './jobpilot-journey';

// Animate the reader's real elements: no cloned headings, overlay, image load
// gate, history owner or input blocker. Natural ratios remain in document flow.
export function useJobPilotHandoff(root: RefObject<HTMLElement | null>, journey: JobPilotJourney | undefined, key: string, ready: boolean, forward: boolean, selection: string) {
  const reduced = useMotionPreference(), consumed = useRef<{ key: string; selection: string; complete: boolean } | null>(null);
  useLayoutEffect(() => {
    if (!ready || !journey) return;
    if (consumed.current?.key === key && (consumed.current.complete || consumed.current.selection !== selection)) {
      consumed.current.complete = true;
      return;
    }
    if (reduced || !forward || performance.now() - journey.capturedAt > 800) { consumed.current = {key, selection, complete:true}; return; }
    let timeline: gsap.core.Timeline | null = null;
    let context: gsap.Context | undefined;
    const scope = root.current;
    if (!scope) return;
    // Route restoration owns scrolling first; measure final viewport bounds.
    const frame = requestAnimationFrame(() => {
      // StrictMode can clean up after the first painted frame, then replay
      // setup. A cancelled, unfinished setup may restart for the same source;
      // completed navigation or an intentional image change never replays.
      const playback = {key, selection, complete:false};
      consumed.current = playback;
      context = gsap.context(() => {
        scope.dataset.readerHandoff = 'running';
        timeline = gsap.timeline({ paused: true });
        const carry = (selector: string, before: JourneyBox | undefined) => {
          const node = scope.querySelector<HTMLElement>(selector);
          if (!node || !before?.width) return;
          const after = node.getBoundingClientRect();
          if (!after.width) return;
          const scale = before.width / after.width;
          timeline!.fromTo(node, { x: before.left - after.left, y: before.top - after.top, scale, transformOrigin: 'top left' },
            { x: 0, y: 0, scale: 1, duration: 0.38, ease: 'power2.inOut', clearProps: 'transform,transformOrigin' }, 0);
        };
        const identity = (selector: string, before: JourneyBox | undefined, y: number) => {
          const node = scope.querySelector<HTMLElement>(selector), after = journeyTextBox(node);
          if (!node || !before?.width || !after?.width) return;
          // The preview places its title below the image; the reader places it
          // above. Keep identity within the destination header so it never
          // crosses navigation or captions while the image changes position.
          timeline!.fromTo(node, { scale:before.width / after.width, y, opacity:0.75, transformOrigin:'top left' },
            {scale:1,y:0,opacity:1,duration:0.38,ease:'power2.inOut',clearProps:'transform,transformOrigin,opacity'},0);
        };
        identity('.case-heading h1', journey.title, 12);
        identity('.case-project-number', journey.number, 8);
        const image = scope.querySelector('.case-figure .screenshot-frame');
        // Source dimensions reserve these bounds before decoding. Carry only
        // the exact selected identity; its honest loader remains available.
        if (journey.frame && image?.closest('.case-figure')?.getAttribute('data-source') === journey.screen) carry('.case-figure .screenshot-frame', journey.frame);
        else if (image) timeline.fromTo(image, {opacity:0.5}, {opacity:1,duration:0.18,clearProps:'opacity'}, 0);
        timeline.fromTo(scope.querySelectorAll('.case-heading p, .case-figure .image-caption'), {opacity:0}, {opacity:1,duration:0.18,clearProps:'opacity'}, 0.2);
        playFiniteMotion(timeline, { complete: () => { playback.complete = true; delete scope.dataset.readerHandoff; } });
      }, scope);
    });
    return () => { cancelAnimationFrame(frame); stopFiniteMotion(timeline); context?.revert(); delete scope.dataset.readerHandoff; };
  }, [root, journey, key, ready, forward, reduced, selection]);
}
