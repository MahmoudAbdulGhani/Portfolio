import type { gsap as Gsap } from 'gsap';

type Timeline = ReturnType<typeof Gsap.timeline>;
export type FiniteMotion = { finish: () => void; cancel: () => void; active: () => boolean };
const running = new WeakMap<Timeline, FiniteMotion>();

// Keep finite UI transitions on elapsed wall time. GSAP's global ticker smooths
// long frames (500ms becomes 33ms), which can indefinitely delay UI readiness.
// GSAP still owns interpolation; only this finite transition's clock is local.
export function playFiniteMotion(timeline: Timeline, { from = timeline.time(), to = timeline.totalDuration(), complete = timeline.eventCallback('onComplete') }: {
  from?: number; to?: number; complete?: (() => void) | null;
} = {}): FiniteMotion {
  running.get(timeline)?.cancel();
  timeline.eventCallback('onComplete', null);
  timeline.pause(from);
  const started = performance.now();
  const duration = Math.abs(to - from) * 1_000;
  const direction = to >= from ? 1 : -1;
  let active = true, frame = 0, deadline = 0;
  const release = () => {
    cancelAnimationFrame(frame);
    clearTimeout(deadline);
    if (running.get(timeline) === control) running.delete(timeline);
  };
  const finish = () => {
    if (!active) return;
    active = false;
    release();
    timeline.totalTime(to, false);
    complete?.();
  };
  const tick = () => {
    if (!active) return;
    const elapsed = performance.now() - started;
    if (elapsed >= duration) { finish(); return; }
    timeline.totalTime(from + direction * elapsed / 1_000, false);
    frame = requestAnimationFrame(tick);
  };
  const control: FiniteMotion = { finish, active: () => active, cancel: () => {
    if (!active) return;
    active = false;
    release();
  } };
  running.set(timeline, control);
  // This completion does not depend on GSAP's onComplete, a rendered frame or
  // an uncancelled decorative tween. Unmount/supersession cancel both handles.
  deadline = window.setTimeout(finish, duration);
  frame = requestAnimationFrame(tick);
  return control;
}

export function stopFiniteMotion(timeline: Timeline | null | undefined) {
  if (!timeline) return;
  running.get(timeline)?.cancel();
  timeline.kill();
}
