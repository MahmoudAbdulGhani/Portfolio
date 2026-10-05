import { useEffect, useRef } from "react";
import "./portfolio-pointer.css";

const interactive = "a[href],button,summary,[role='button'],[role='tab'],[role='link'],label[for]";
const native = "input,textarea,select,[contenteditable]:not([contenteditable='false']),[role='textbox'],[data-native-cursor],:disabled,[aria-disabled='true'],[aria-busy='true']";

export function PortfolioPointer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pointer = ref.current;
    const root = pointer?.closest(".public-portfolio");
    if (!pointer || !root) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0, y = 0;
    const hide = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer.dataset.visible = "false";
      pointer.dataset.active = "false";
      pointer.dataset.pressed = "false";
    };
    const move = (event: PointerEvent) => {
      const target = event.target;
      if (!fine.matches || reduced.matches || event.pointerType !== "mouse" || !(target instanceof Element) || !root.contains(target) || target.closest(native)) {
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      pointer.dataset.active = String(Boolean(target.closest(interactive)));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        pointer.style.transform = `translate3d(${x}px,${y}px,0)`;
        pointer.dataset.visible = "true";
        frame = 0;
      });
    };
    const down = () => { pointer.dataset.pressed = "true"; };
    const up = () => { pointer.dataset.pressed = "false"; };
    const key = () => hide();
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointercancel", hide, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    document.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", hide);
    fine.addEventListener("change", hide);
    reduced.addEventListener("change", hide);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", hide);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", hide);
      fine.removeEventListener("change", hide);
      reduced.removeEventListener("change", hide);
    };
  }, []);

  return <div ref={ref} className="portfolio-pointer" aria-hidden="true" data-visible="false"><span /></div>;
}
