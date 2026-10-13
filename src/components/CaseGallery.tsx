import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";
import { ResponsiveProjectImage } from "./ResponsiveProjectImage";
import { screenAsset, screenGeometry, type DetailScreen } from "../lib/project-detail-screens";
import "./case-gallery.css";
import { gsap } from 'gsap';
import { finishFiniteMotion, playFiniteMotion, stopFiniteMotion } from './landscape/finite-motion';
import { prefersReducedMotion, useMotionPreference } from '../lib/use-motion-preference';
import { useImageInspection } from '../lib/use-image-inspection';

export function CaseGallery({
  screens,
  projectName,
  initialIndex,
  onClose,
  returnFocusTo,
  notice,
}: {
  screens: DetailScreen[];
  projectName: string;
  initialIndex: number;
  onClose: () => void;
  returnFocusTo?: HTMLElement | null;
  notice?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selectedSource, setSelectedSource] = useState(screens[initialIndex]?.src ?? screens[0]?.src);
  const index = Math.max(0, screens.findIndex(screen => screen.src === selectedSource));
  const setIndex = (next: number) => setSelectedSource(screens[next]?.src);
  const [retry, setRetry] = useState<{ src: string; attempt: number } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const imageRegion = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null), closing = useRef(false);
  const unlock = useRef<(() => void) | null>(null);
  const reduced = useMotionPreference();
  const screen = screens[index];
  const geometry = screenGeometry(screen);
  const inspection = useImageInspection(imageRegion, screen.src, geometry);
  const fit = inspection.mode, setFit = inspection.setMode;
  const actual = fit === 'actual' || fit === 'zoom';
  useLayoutEffect(() => {
    const modal = dialog.current;
    const trigger =
      returnFocusTo ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    const overflow = document.body.style.overflow;
    const padding = document.body.style.paddingRight;
    const scrollbar = innerWidth - document.documentElement.clientWidth;
    if (scrollbar > 0) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar}px`;
    document.body.style.overflow = "hidden";
    let locked = true;
    const releaseScroll = () => {
      if (!locked) return;
      locked = false;
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = padding;
    };
    unlock.current = releaseScroll;
    modal?.showModal();
    close.current?.focus();
    if (modal) {
      if (prefersReducedMotion()) modal.dataset.viewerState = 'active';
      else {
        modal.dataset.viewerState = 'opening';
        const timeline = gsap.timeline({ paused: true });
        animation.current = timeline;
        timeline.fromTo(modal, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' });
        playFiniteMotion(timeline, { complete: () => { modal.dataset.viewerState = 'active'; } });
      }
    }
    return () => {
      stopFiniteMotion(animation.current);
      modal?.close();
      releaseScroll();
      unlock.current = null;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);
  useEffect(() => { if (reduced) finishFiniteMotion(animation.current); }, [reduced]);
  const requestClose = () => {
    if (closing.current) return;
    closing.current = true;
    stopFiniteMotion(animation.current);
    const modal = dialog.current;
    if (!modal || reduced) { onClose(); return; }
    modal.dataset.viewerState = 'closing';
    const timeline = gsap.timeline({ paused: true });
    animation.current = timeline;
    timeline.to(modal, { opacity: 0, y: 6, duration: 0.22, ease: 'power2.in' });
    playFiniteMotion(timeline, { complete: onClose });
  };
  useEffect(() => {
    dialog.current
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    caption.current?.scrollTo(0, 0);
  }, [index, fit]);
  const step = (delta: number) =>
    setIndex((index + delta + screens.length) % screens.length);
  return (
    <dialog
      ref={dialog}
      className="case-inspector"
      aria-label={`${projectName} image gallery`}
      onCancel={(event) => {
        event.preventDefault();
        // A repeated native close request may be non-cancelable. Retire the
        // React owner and scroll lock immediately instead of leaving a hidden
        // mounted dialog until its decorative exit finishes.
        if (!event.cancelable) {
          stopFiniteMotion(animation.current);
          unlock.current?.();
          onClose();
        } else requestClose();
      }}
      onClose={() => {
        if (dialog.current?.open) return; // Ignore a Strict Mode re-open's old event.
        stopFiniteMotion(animation.current);
        unlock.current?.();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')]
            .filter((element) => element.getClientRects().length > 0 && !element.closest('[inert]'));
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
        if (
          fit !== 'fit' &&
          (event.target as HTMLElement).classList.contains(
            "case-inspector-image",
          )
        )
          return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          step(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="case-inspector-inner">
        <header>
          <div ref={caption} className="case-inspector-caption" role="region" tabIndex={0} aria-label="Image title and evidence note">
            <p className="public-eyebrow">{projectName}</p>
            <h2>{screen.label}</h2>
            {notice && <p className="case-inspector-notice">{notice}</p>}
            <p className="case-inspector-gesture-hint">Pinch to zoom; drag to pan. Fit resets the view.</p>
          </div>
          <div className="case-inspector-tools">
            <div className="case-inspector-modes">{(['fit', 'width', 'actual'] as const).map(mode => <button key={mode} type="button" onClick={() => setFit(mode)} aria-pressed={fit === mode}>{mode === 'fit' ? 'Fit' : mode === 'width' ? 'Fit width' : 'Actual size'}</button>)}</div>
            <div className="case-inspector-zoom"><button type="button" aria-label="Zoom out" onClick={() => inspection.zoomAt(1 / 1.5)}>−</button><button type="button" aria-label="Zoom in" onClick={() => inspection.zoomAt(1.5)}>+</button><span role="status" className="inspection-zoom-status">{fit === 'zoom' ? `${Math.round(inspection.factor * 100)}%` : fit === 'fit' ? 'Overview' : fit === 'actual' ? '100%' : 'Fit width'}</span></div>
            <button
              ref={close}
              type="button"
              onClick={requestClose}
              aria-label="Close gallery"
            >
              <FiX size={18} /><span>Close</span>
            </button>
          </div>
        </header>
        <div
          ref={imageRegion}
          className={`case-inspector-image is-${fit}`}
          data-viewport={screen.viewport}
          role="region"
          tabIndex={0}
          aria-label={`${screen.label}. ${fit === 'fit' ? 'Complete image fitted to the viewer.' : 'Scroll to inspect the full screenshot.'}`}
          {...inspection.gestures}
          onKeyDown={event => {
            if (event.key === '+' || event.key === '=') { event.preventDefault(); inspection.zoomAt(1.5); }
            if (event.key === '-') { event.preventDefault(); inspection.zoomAt(1 / 1.5); }
            if (event.key === '0') { event.preventDefault(); setFit('fit'); }
          }}
        >
          {failed === screen.src ? (
            <div className="case-shot-error" role="status"><p>This image is unavailable.</p><button type="button" onClick={() => { imageRegion.current?.focus(); setRetry(previous => ({ src: screen.src, attempt: previous?.src === screen.src ? previous.attempt + 1 : 1 })); setFailed(null); }}>Retry original image</button><p>You can also select another screen below.</p></div>
          ) : (
            <div className="case-inspection-canvas" style={fit === 'zoom' ? { width: geometry.width * inspection.factor, height: geometry.height * inspection.factor } : undefined}><ResponsiveProjectImage
              key={`${screen.src}:${retry?.src === screen.src ? retry.attempt : 0}`}
              src={screen.src}
              sources={screenAsset(screen.src)}
              alt={`${projectName}: ${screen.label}`}
              // Bound the responsive density hint too: a width descriptor with
              // an oversized sizes value can inflate CSS intrinsic dimensions
              // and make scale-down enlarge a physically small source.
              sizes={`(min-width: ${Math.ceil(geometry.width / 0.96)}px) ${geometry.width}px, 96vw`}
              priority
              retainPrevious
              fit={fit === 'fit' ? 'frame' : 'natural'}
              original={actual || retry?.src === screen.src}
              onError={() => setFailed(screen.src)}
            /></div>
          )}
        </div>
        {screens.length > 1 && (
          <nav className="case-inspector-thumbs" aria-label="Choose screenshot">
            {screens.map((item, position) => (
              <button
                type="button"
                key={item.src}
                aria-label={`Show ${item.label}`}
                aria-current={position === index ? "true" : undefined}
                onClick={() => setIndex(position)}
              >
                {/* Remote originals without a thumbnail variant stay on demand.
                    The numbered, named selector remains accessible. */}
                {screenAsset(item.src) && <ResponsiveProjectImage src={item.src} sources={screenAsset(item.src)} alt="" sizes="100px" />}
                <span>{String(position + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </nav>
        )}
        <footer>
          <p aria-live="polite">
            {index + 1} / {screens.length}
          </p>
          <div>
            <button
              type="button"
              aria-label="Previous screenshot"
              disabled={screens.length < 2}
              onClick={() => step(-1)}
            >
              <FiArrowLeft />
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              disabled={screens.length < 2}
              onClick={() => step(1)}
            >
              <FiArrowRight />
            </button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
