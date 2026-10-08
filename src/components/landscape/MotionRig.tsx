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
  onReady: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const ready = (renderer: string) => {
      if (!cancelled) {
        if (host.current) host.current.dataset.renderer = renderer;
        setState(renderer);
        onReady();
      }
    };
    warmRig()
      .then(({ mountRig }) => {
        if (!cancelled && host.current)
          dispose = mountRig(host.current, kind, ready);
      })
      .catch(() => ready("fallback"));
    return () => {
      cancelled = true;
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
