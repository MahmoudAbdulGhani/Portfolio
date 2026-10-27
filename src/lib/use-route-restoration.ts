import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { jobPilotReviewAddress } from '../components/landscape/jobpilot-design-context';

export function useRouteRestoration() {
  const location = useLocation(), navigation = useNavigationType();
  const positions = useRef(new Map<string, { x: number; y: number; main?: { x: number; y: number } }>());
  const entry = useRef(location.key), pathname = useRef(location.pathname), restoring = useRef(false);
  const address = useRef(location.pathname + location.search + location.hash);
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    let popFocusFrame = 0;
    const save = (event: Event) => {
      // History can move before React retires the old document. Its clamped
      // scroll must not overwrite the intentional click's source position.
      if (event.type === 'scroll' && (restoring.current || window.location.pathname + window.location.search + window.location.hash !== address.current)) return;
      const main = document.querySelector<HTMLElement>('.landscape-route > main');
      positions.current.set(entry.current, { x: scrollX, y: scrollY, main: main ? { x: main.scrollLeft, y: main.scrollTop } : undefined });
    };
    const pop = (event: PopStateEvent) => {
      save(event);
      cancelAnimationFrame(popFocusFrame);
      const review = jobPilotReviewAddress(window.location.pathname);
      const preview = (window.location.pathname === '/' || review?.collection) && (new URLSearchParams(window.location.search).get('project') === 'jobpilot-ai' || Boolean(review && 'project' in review && new URLSearchParams(window.location.search).get('project') === review.project));
      const reader = window.location.pathname === '/projects/jobpilot-ai' || review?.reader;
      if (!preview && !reader) return;
      const destination = window.location.pathname + window.location.search + window.location.hash;
      // Rapid Back can cancel the destination before React commits it. The
      // still-mounted JobPilot preview/reader cannot rely on a mount effect.
      popFocusFrame = requestAnimationFrame(() => {
        if (window.location.pathname + window.location.search + window.location.hash !== destination) return;
        document.querySelector<HTMLElement>(preview ? '.stage .open-case' : '.project-reader#main-content')?.focus({preventScroll:true});
        // A cancelled navigation also leaves the same reader mounted at its
        // previous scroll. Native Back still gives an engineering hash priority.
        if (reader && window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({block:'start',behavior:'instant'});
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
    const atCollection = location.pathname === '/' || jobPilotReviewAddress(location.pathname)?.collection;
    const focusNeeded = changedPage && !atCollection && Boolean(document.querySelector('.landscape-route'));
    pathname.current = location.pathname;
    entry.current = location.key;
    address.current = location.pathname + location.search + location.hash;
    // Explicit Collection returns reuse this owner if their history entry is
    // unavailable. Ordinary Back/Forward continue to use the entry-key cache.
    const review = jobPilotReviewAddress(location.pathname);
    const position = navigation === 'POP' ? positions.current.get(location.key) ?? (review && 'project' in review ? location.state?.routeRestore : undefined) : location.state?.routeRestore;
    const returningJobPilot = atCollection && (new URLSearchParams(location.search).get('project') === 'jobpilot-ai' || Boolean(review && 'project' in review)) && Boolean(position);
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
