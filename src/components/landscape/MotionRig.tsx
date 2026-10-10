import { useEffect, useRef, useState } from "react";
import { warmRig } from "./rig-loader";
import type { RigKind } from "./rig-models";

export function MotionRig({
  kind,
  reduced,
  onReady,
}: {
  kind: RigKind;
  reduced: boolean;
  onReady: (renderer: 'webgl' | 'fallback') => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    if (reduced) return;
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
        // Let selection acknowledgement paint before cold GPU initialization.
        firstFrame = requestAnimationFrame(() => {
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
  }, [kind, reduced, onReady]);
  return reduced ? null : (
    <div
      ref={host}
      className={`motion-rig rig-${state}`}
      data-rig={kind}
      aria-hidden="true"
    />
  );
}
