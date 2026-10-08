import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";
import { ResponsiveProjectImage } from "./ResponsiveProjectImage";
import type { DetailScreen } from "../lib/project-detail-screens";
import "./case-gallery.css";

export function CaseGallery({
  screens,
  projectName,
  initialIndex,
  onClose,
  returnFocusTo,
}: {
  screens: DetailScreen[];
  projectName: string;
  initialIndex: number;
  onClose: () => void;
  returnFocusTo?: HTMLElement | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [actual, setActual] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const screen = screens[index];
  useEffect(() => {
    const modal = dialog.current;
    const trigger =
      returnFocusTo ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal?.showModal();
    close.current?.focus();
    return () => {
      modal?.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);
  useEffect(() => {
    dialog.current
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
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
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
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
              onClick={onClose}
              aria-label="Close gallery"
            >
              <FiX size={22} />
            </button>
          </div>
        </header>
        <div
          key={`${screen.src}:${actual}`}
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
          ) : actual ? (
            <img
              src={screen.src}
              alt={`${projectName}: ${screen.label}`}
              onError={() => setFailed(screen.src)}
            />
          ) : (
            <ResponsiveProjectImage
              src={screen.src}
              alt={`${projectName}: ${screen.label}`}
              sizes="96vw"
              priority
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
