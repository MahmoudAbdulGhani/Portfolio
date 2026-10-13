import { useEffect, useRef, useState } from "react";
import { warmRig } from "./rig-loader";
import type { RigKind } from "./rig-models";

export function MotionRig({
  kind,
  reduced,
  disabled = false,
  onReady,
}: {
  kind: RigKind;
  reduced: boolean;
  disabled?: boolean;
  onReady: (renderer: 'webgl' | 'fallback') => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    if (reduced || disabled) return;
    let cancelled = false;
    let firstFrame = 0, paintFrame = 0;
    let dispose: (() => void) | undefined;
    const ready = (renderer: 'webgl' | 'fallback') => {
      if (!cancelled) {
        if (host.current) host.current.dataset.renderer = renderer;
        setState(renderer);
        onReady(renderer);
      }
    };
    warmRig()
      .then(({ mountRig }) => {
        if (cancelled) return;
        // Let selection acknowledgement paint before cold GPU initialization.
        firstFrame = requestAnimationFrame(() => {
          if (cancelled) return;
          paintFrame = requestAnimationFrame(() => {
            if (!cancelled && host.current) {
              try { dispose = mountRig(host.current, kind, ready); }
              catch { ready('fallback'); }
            }
          });
        });
      })
      .catch(() => ready("fallback"));
    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(paintFrame);
      dispose?.();
    };
  }, [kind, reduced, disabled, onReady]);
  return reduced ? null : (
    <div
      ref={host}
      className={`motion-rig rig-${disabled ? 'fallback' : state}`}
      data-renderer={disabled ? 'fallback' : undefined}
      data-rig={kind}
      aria-hidden="true"
    />
  );
}
