import { useEffect, useRef } from "react";

// Keep native document scrolling usable when a phone keyboard reduces only
// the visual viewport, without changing desktop or other portfolio routes.
export function useContactViewport() {
  const page = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = page.current;
    if (!root) return;
    const mobile = window.matchMedia(
      "(max-width: 767px), (max-width: 960px) and (max-height: 500px)",
    );
    const viewport = window.visualViewport;
    let frame = 0;
    const keepVisible = () => {
      frame = 0;
      const active = document.activeElement;
      const editing =
        mobile.matches &&
        active instanceof HTMLElement &&
        root.contains(active) &&
        active.matches(
          ".input, .textarea, .contact-form button, .contact-success, .contact-success button",
        );
      root.dataset.contactKeyboard = String(
        editing && Boolean(viewport && viewport.height < innerHeight - 120),
      );
      if (!editing) return;
      const top = (viewport?.offsetTop ?? 0) + 16;
      const bottom =
        (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight) - 16;
      const box = active.getBoundingClientRect();
      const delta =
        box.height > bottom - top || box.top < top
          ? box.top - top
          : box.bottom > bottom
            ? box.bottom - bottom
            : 0;
      if (Math.abs(delta) > 1)
        window.scrollBy({ top: delta, behavior: "auto" });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(keepVisible);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    root.addEventListener("focusin", schedule);
    root.addEventListener("focusout", schedule);
    window.addEventListener("resize", schedule);
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("focusin", schedule);
      root.removeEventListener("focusout", schedule);
      window.removeEventListener("resize", schedule);
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      delete root.dataset.contactKeyboard;
    };
  }, []);
  return page;
}
