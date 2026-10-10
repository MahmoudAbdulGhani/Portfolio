import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";
import { ResponsiveProjectImage } from "./ResponsiveProjectImage";
import type { DetailScreen } from "../lib/project-detail-screens";
import "./case-gallery.css";
import { gsap } from 'gsap';
import { finishFiniteMotion, playFiniteMotion, stopFiniteMotion } from './landscape/finite-motion';
import { prefersReducedMotion, useMotionPreference } from '../lib/use-motion-preference';

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
  const [index, setIndex] = useState(initialIndex);
  const [actual, setActual] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null), closing = useRef(false);
  const unlock = useRef<(() => void) | null>(null);
  const reduced = useMotionPreference();
  const screen = screens[index];
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
    const region = dialog.current?.querySelector('.case-inspector-image');
    region?.scrollTo(0, 0);
  }, [index]);
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
        if (
          actual &&
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
          <div>
            <p className="public-eyebrow">{projectName}</p>
            <h2>{screen.label}</h2>
            {notice && <p className="case-inspector-notice">{notice}</p>}
          </div>
          <div className="case-inspector-tools">
            <button
              type="button"
              onClick={() => setActual(!actual)}
              aria-pressed={actual}
            >
              {actual ? "Fit width" : "Actual size"}
            </button>
            <button
              ref={close}
              type="button"
              onClick={requestClose}
              aria-label="Close gallery"
            >
              <FiX size={22} />
            </button>
          </div>
        </header>
        <div
          key={String(actual)}
          className={`case-inspector-image ${actual ? "is-actual" : ""}`}
          data-viewport={screen.viewport}
          role="region"
          tabIndex={0}
          aria-label={`${screen.label}. Scroll to inspect the full screenshot.`}
        >
          {failed === screen.src ? (
            <p className="case-shot-error">
              This image is unavailable. Select another screen below.
            </p>
          ) : (
            <ResponsiveProjectImage
              src={screen.src}
              alt={`${projectName}: ${screen.label}`}
              sizes="96vw"
              priority
              retainPrevious
              original={actual}
              onError={() => setFailed(screen.src)}
            />
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
                <ResponsiveProjectImage src={item.src} alt="" sizes="100px" />
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
