import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function useRouteRestoration() {
  const location = useLocation(), navigation = useNavigationType();
  const positions = useRef(new Map<string, { x: number; y: number; main?: { x: number; y: number } }>());
  const entry = useRef(location.key), pathname = useRef(location.pathname), restoring = useRef(false);
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    let popFocusFrame = 0;
    const save = (event: Event) => {
      if (restoring.current && event.type === 'scroll') return;
      const main = document.querySelector<HTMLElement>('.landscape-route > main');
      positions.current.set(entry.current, { x: scrollX, y: scrollY, main: main ? { x: main.scrollLeft, y: main.scrollTop } : undefined });
    };
    const pop = (event: PopStateEvent) => {
      save(event);
      cancelAnimationFrame(popFocusFrame);
      if (window.location.pathname !== '/' || new URLSearchParams(window.location.search).get('project') !== 'jobpilot-ai') return;
      // Rapid Back may cancel the reader before React commits it, leaving the
      // same preview mounted. Its mount effects cannot restore focus then.
      popFocusFrame = requestAnimationFrame(() => {
        if (window.location.pathname !== '/' || new URLSearchParams(window.location.search).get('project') !== 'jobpilot-ai') return;
        document.querySelector<HTMLElement>('.stage.has-profile-boundary .open-case')?.focus({preventScroll:true});
      });
    };
    document.addEventListener('scroll', save, { passive: true, capture: true });
    // Capture before the route replaces a tall document and clamps scrollY.
    document.addEventListener('click', save, true);
    window.addEventListener('popstate', pop);
    return () => {
      document.removeEventListener('scroll', save, true);
      document.removeEventListener('click', save, true);
      window.removeEventListener('popstate', pop);
      cancelAnimationFrame(popFocusFrame);
      history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    const changedPage = pathname.current !== location.pathname;
    const focusNeeded = changedPage && location.pathname !== '/' && Boolean(document.querySelector('.landscape-route'));
    pathname.current = location.pathname;
    entry.current = location.key;
    // Explicit Collection returns reuse this owner if their history entry is
    // unavailable. Ordinary Back/Forward continue to use the entry-key cache.
    const position = navigation === 'POP' ? positions.current.get(location.key) : location.state?.routeRestore;
    const returningJobPilot = location.pathname === '/' && new URLSearchParams(location.search).get('project') === 'jobpilot-ai' && Boolean(position);
    let cancelled = false, frame = 0, focused = false, deadline = 0;
    restoring.current = true;
    const observer = new MutationObserver(restore);
    function restore() {
      if (cancelled) return;
      const main = document.getElementById('main-content');
      if (focusNeeded && main && !focused) {
        main.focus({ preventScroll: true }); focused = true;
      }
      if (location.hash && !returningJobPilot) {
        const target = document.getElementById(location.hash.slice(1));
        if (!target) return;
        observer.disconnect();
        clearTimeout(deadline);
        void document.fonts.ready.then(() => {
          if (!cancelled) frame = requestAnimationFrame(() => {
            target.scrollIntoView({ block: 'start', behavior: 'instant' });
            restoring.current = false;
          });
        });
        return;
      }
      window.scrollTo({ top: position?.y ?? 0, left: position?.x ?? 0, behavior: 'instant' });
      main?.scrollTo({ top: position?.main?.y ?? 0, left: position?.main?.x ?? 0, behavior: 'instant' });
      const mainRestored = !position?.main || Boolean(main && Math.abs(main.scrollTop - position.main.y) <= 1);
      if (mainRestored && (!position || Math.abs(scrollY - position.y) <= 1) && (!focusNeeded || focused)) {
        observer.disconnect(); clearTimeout(deadline); restoring.current = false;
      }
    }
    // Preserve the existing bounded wait for asynchronous hash/content mounts.
    deadline = window.setTimeout(() => { observer.disconnect(); restoring.current = false; }, 10_000);
    observer.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
    restore();
    return () => { cancelled = true; observer.disconnect(); cancelAnimationFrame(frame); clearTimeout(deadline); restoring.current = false; };
  }, [location.key, location.pathname, location.search, location.hash, location.state?.routeRestore, navigation]);
}
