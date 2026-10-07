import type { ReactNode } from "react";

// Two masked instances of the supplied raster share one measured hinge.
// The screen travels with the lid; the base never rotates with it.
export function LaptopOpening({ show, enabled, cinematic, children }: {
  show: boolean;
  enabled: boolean;
  cinematic: boolean;
  children: ReactNode;
}) {
  return <div className={`chapter-laptop-opening ${show ? "is-open" : ""} ${enabled ? "motion-enabled" : "motion-disabled"} ${cinematic ? "is-cinematic" : ""}`}>
    <div className="chapter-laptop-camera">
      <div className="chapter-lid">
        <div className="chapter-screen"><div className="chapter-screen-content">{children}</div></div>
        <img className="chapter-lid-art" src="/projects/cinematic/laptop-studio.webp" alt="" loading="lazy" draggable={false} />
      </div>
      <img className="chapter-base-art" src="/projects/cinematic/laptop-studio.webp" alt="" loading="lazy" draggable={false} />
    </div>
  </div>;
}
