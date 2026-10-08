import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useProjects } from "../../lib/hooks";
import { detailScreens } from "../../lib/project-detail-screens";
import { PublicDataState } from "../PublicDataState";
import { ResponsiveProjectImage } from "../ResponsiveProjectImage";
import { MotionRig } from "./MotionRig";
import { warmRig } from "./rig-loader";
import type { RigKind } from "./rig-models";
import type { Project } from "../../types";

// Art bindings are presentation only. All names, narratives and screenshots
// come from the published CMS records, including selection deep links.
const artwork: {
  slug: string;
  kind: RigKind;
  asset: string;
  displayTitle?: string;
}[] = [
  { slug: "jobpilot-ai", kind: "jobpilot", asset: "jobpilot-sculpture.webp" },
  { slug: "lobby", kind: "lobby", asset: "lobby-sculpture.webp" },
  {
    slug: "construction-project-management-accounting-system",
    kind: "cedar",
    asset: "archive-sculpture.webp",
    displayTitle: "Construction OS",
  },
];
type Sculpture = (typeof artwork)[number] & { project: Project };
const masks: Record<RigKind, string[]> = {
  jobpilot: [
    "polygon(0% 0%,38% 0%,55% 68%,0% 42%)",
    "polygon(38% 0%,67% 0%,55% 68%)",
    "polygon(67% 0%,100% 0%,100% 55%,55% 68%)",
    "polygon(100% 55%,100% 100%,55% 100%,55% 68%)",
    "polygon(55% 68%,55% 100%,0% 100%,0% 70%)",
    "polygon(0% 42%,55% 68%,0% 70%)",
  ],
  lobby: ["inset(0 50% 0 0)", "inset(0 0 0 50%)"],
  cedar: ["inset(0 0 66% 0)", "inset(34% 0 33% 0)", "inset(67% 0 0 0)"],
};

export function Collection() {
  const projects = useProjects();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [returned, setReturned] = useState<string | null>(
    () =>
      artwork.find((item) => item.slug === location.state?.returnProject)
        ?.kind ?? null,
  );
  const items = useMemo(
    () =>
      artwork.flatMap((art) => {
        const project = projects.data?.find(
          (project) =>
            project.slug === art.slug &&
            project.published &&
            project.showOnPortfolio !== false,
        );
        return project ? [{ ...art, project }] : [];
      }),
    [projects.data],
  );
  const selected = items.find((item) => item.slug === params.get("project"));
  if (projects.isLoading || projects.isError)
    return (
      <main className="stage">
        <PublicDataState
          loading={projects.isLoading}
          error={projects.isError}
          onRetry={() => void projects.refetch()}
          label="collection"
        />
      </main>
    );
  if (!items.length)
    return (
      <main className="stage landscape-empty">
        <h1>Collection</h1>
        <p>No featured projects are currently published.</p>
        <Link to="/projects">Explore projects</Link>
      </main>
    );
  const select = (slug: string) => {
    const next = new URLSearchParams(params);
    next.set("project", slug);
    setParams(next);
  };
  const restore = () => {
    setReturned(selected?.kind ?? null);
    const next = new URLSearchParams(params);
    next.delete("project");
    setParams(next);
  };
  return (
    <CollectionScene
      key={selected?.slug ?? "collection"}
      items={items}
      selected={selected}
      select={select}
      restore={restore}
      returned={returned}
    />
  );
}

function CollectionScene({
  items,
  selected,
  select,
  restore,
  returned,
}: {
  items: Sculpture[];
  selected?: Sculpture;
  select: (slug: string) => void;
  restore: () => void;
  returned: string | null;
}) {
  const root = useRef<HTMLElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const closing = useRef(false);
  const [ready, setReady] = useState(false);
  const [rigReady, setRigReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const reduced = Boolean(useReducedMotion());
  const readyRig = useCallback(() => setRigReady(true), []);
  useEffect(() => {
    const objects = root.current?.querySelectorAll(".object");
    return () => {
      animation.current?.kill();
      if (objects) gsap.killTweensOf(objects);
    };
  }, []);
  const hover = (kind: RigKind, active: boolean) => {
    if (!reduced && active) void warmRig().catch(() => {});
    if (selected || reduced || animation.current?.isActive()) return;
    const object = root.current?.querySelector(`.${kind}-object`);
    if (!object) return;
    gsap.to(object, {
      rotationY: active ? (kind === "lobby" ? -6 : 4) : 0,
      y: active ? -8 : 0,
      scale: active ? 1.018 : 1,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };
  const screens = selected ? detailScreens(selected.project) : [];
  const back = useCallback(() => {
    if (!selected || closing.current) return;
    closing.current = true;
    animation.current?.kill();
    const scope = root.current;
    if (!scope) return;
    const mesh = scope.querySelector<HTMLElement>(".motion-rig");
    const gpu = !reduced && mesh?.dataset.renderer === "webgl";
    scope.querySelector<HTMLElement>(".selection-detail")!.inert = true;
    if (gpu) mesh.dispatchEvent(new CustomEvent("rig-close"));
    const duration = reduced ? 0.01 : gpu ? 1.55 : 0.8;
    const timeline = gsap.timeline({ onComplete: restore });
    animation.current = timeline;
    timeline
      .to(
        ".selection-detail",
        { opacity: 0, y: 12, duration: reduced ? 0.01 : 0.2 },
        0,
      )
      .to(
        ".product-surface",
        { opacity: 0, scale: 0.9, duration: reduced ? 0.01 : 0.35 },
        0,
      )
      .to(
        scope.querySelectorAll(".object"),
        { x: 0, y: 0, scale: 1, opacity: 1, duration, ease: "power3.inOut" },
        0,
      )
      .to(
        scope.querySelector(`.${selected.kind}-object .object-core`),
        { opacity: 1, duration: reduced ? 0.01 : 0.3 },
        gpu ? 1.15 : 0.1,
      );
  }, [selected, reduced, restore]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      items.map(
        (item) =>
          new Promise<void>((resolve) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = `/landscape/${item.asset}`;
          }),
      ),
    ).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [items]);
  useEffect(() => {
    if (!selected) return;
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !document.querySelector('[role="dialog"], dialog[open]')
      )
        back();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [selected, back]);
  useLayoutEffect(() => {
    const scope = root.current;
    if (
      !scope ||
      closing.current ||
      !ready ||
      (selected && !reduced && !rigReady)
    )
      return;
    const ctx = gsap.context(() => {
      const objects = Array.from(
        scope.querySelectorAll<HTMLElement>(".object"),
      );
      const duration = (value: number) => (reduced ? 0.01 : value);
      if (!selected) {
        animation.current = gsap
          .timeline({
            onComplete: () => {
              if (returned)
                scope
                  .querySelector<HTMLElement>(`[data-project="${returned}"]`)
                  ?.focus({ preventScroll: true });
            },
          })
          .fromTo(
            objects,
            {
              opacity: returned ? 1 : 0,
              y: returned ? 0 : 24,
              scale: returned ? 1 : 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: duration(returned ? 0.01 : 0.85),
              stagger: reduced ? 0 : 0.12,
              ease: "power3.out",
            },
          );
        return;
      }
      const object = scope.querySelector<HTMLElement>(
        `.${selected.kind}-object`,
      )!;
      const core = object.querySelector(".object-core");
      const leaves = object.querySelectorAll(".piece");
      const detail = scope.querySelector<HTMLElement>(".selection-detail")!;
      detail.inert = true;
      const mobile = innerWidth < 720;
      const shift =
        selected.kind === "jobpilot"
          ? {
              x: mobile ? 0 : innerWidth * 0.14,
              y: mobile ? -40 : -20,
              scale: mobile ? 0.92 : 1.03,
            }
          : selected.kind === "lobby"
            ? {
                x: mobile ? -55 : -innerWidth * 0.25,
                y: mobile ? -200 : -80,
                scale: mobile ? 1.45 : 1.5,
              }
            : {
                x: mobile ? 55 : -innerWidth * 0.39,
                y: mobile ? -200 : 55,
                scale: mobile ? 2.4 : 2.1,
              };
      const gpu =
        scope.querySelector<HTMLElement>(".motion-rig")?.dataset.renderer ===
        "webgl";
      const timeline = gsap.timeline({
        onComplete: () => {
          detail.inert = false;
          scope
            .querySelector<HTMLElement>(".open-case")
            ?.focus({ preventScroll: true });
        },
      });
      animation.current = timeline;
      timeline
        .to(
          objects.filter((item) => item !== object),
          {
            opacity: 0.12,
            scale: 0.76,
            x: (index: number) => (index ? 100 : -100),
            y: 30,
            duration: duration(0.65),
          },
          0,
        )
        .to(
          object,
          { ...shift, duration: duration(0.9), ease: "power3.inOut" },
          0,
        )
        .to(core, { opacity: 0, duration: duration(0.22) }, 0);
      if (!gpu && !reduced) {
        timeline
          .set(leaves, { opacity: 1 }, 0)
          .to(
            leaves,
            {
              x: (index: number) => (index % 2 ? 1 : -1) * (mobile ? 55 : 130),
              rotationY: (index: number) => (index % 2 ? 25 : -25),
              duration: 0.9,
              stagger: 0.05,
            },
            0,
          )
          .to(leaves, { opacity: 0, duration: 0.25 }, 1);
      }
      timeline
        .fromTo(
          ".product-surface",
          { opacity: 0, scale: 0.76, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: duration(0.72),
            ease: "power3.out",
          },
          reduced ? 0 : 0.85,
        )
        .fromTo(
          detail,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: duration(0.35) },
          reduced ? 0 : 1.25,
        )
        .to(
          core,
          { opacity: gpu ? 0 : 0.16, duration: duration(0.25) },
          reduced ? 0 : 1.04,
        );
    }, scope);
    return () => {
      ctx.revert();
    };
  }, [selected, ready, rigReady, reduced, returned]);
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="stage"
      ref={root}
      aria-label="Project collection"
    >
      <div className="floor" />
      <div className="objects" aria-hidden="true">
        {items.map((item) => (
          <div key={item.kind} className={`${item.kind}-object object`}>
            <img
              className="object-core"
              src={`/landscape/${item.asset}`}
              alt=""
              fetchPriority={item.kind === "jobpilot" ? "high" : "auto"}
            />
            <div className="piece-rig">
              {masks[item.kind].map((mask, index) => (
                <img
                  key={index}
                  className="piece"
                  src={`/landscape/${item.asset}`}
                  alt=""
                  style={{ clipPath: mask, opacity: 0 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {!selected && (
        <>
          <h1 className="sr-only">Selected project collection</h1>
          <div className="project-targets">
            {items.map((item, index) => (
              <button
                key={item.kind}
                className={`project-hit ${item.kind}-hit`}
                data-project={item.kind}
                aria-label={`Explore ${item.displayTitle ?? item.project.name}`}
                aria-describedby={
                  item.displayTitle ? `collection-${item.kind}-name` : undefined
                }
                onClick={() => select(item.slug)}
                onPointerEnter={() => hover(item.kind, true)}
                onPointerLeave={() => hover(item.kind, false)}
                onFocus={() => hover(item.kind, true)}
                onBlur={() => hover(item.kind, false)}
              >
                <span className="project-label">
                  <span className="project-number">
                    {String(index + 1).padStart(2, "0")}
                    <span />
                  </span>
                  <span className="project-copy">
                    <span className="project-name">
                      {item.displayTitle ?? item.project.name}
                    </span>
                    {item.displayTitle && (
                      <span
                        className="sr-only"
                        id={`collection-${item.kind}-name`}
                      >
                        {item.project.name}
                      </span>
                    )}
                    <span className="project-purpose">
                      {item.project.tagline || item.project.description}
                    </span>
                    {item.kind === "jobpilot" && (
                      <span className="project-action">
                        Explore project
                        <FiArrowRight />
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {selected && (
        <>
          <MotionRig
            kind={selected.kind}
            reduced={reduced}
            onReady={readyRig}
          />
          {screens[chapter] && (
            <div className="product-surface" style={{ opacity: 0 }}>
              <ResponsiveProjectImage
                src={screens[chapter].src}
                alt={`${selected.project.name}: ${screens[chapter].label}`}
                sizes="(max-width: 720px) 90vw, 64vw"
                priority
              />
            </div>
          )}
          <section
            className="selection-detail"
            aria-label="Selected project"
            style={{ opacity: 0 }}
            inert={!reduced && !rigReady}
          >
            <div>
              <span className="eyebrow">SELECTED WORK</span>
              <h1>{selected.project.name}</h1>
              <p>{selected.project.tagline || selected.project.description}</p>
            </div>
            <div className="selection-actions">
              {screens.length > 1 && (
                <div
                  className="chapter-switch"
                  role="group"
                  aria-label="Preview workflow"
                >
                  {screens.slice(0, 2).map((screen, index) => (
                    <button
                      key={screen.src}
                      aria-pressed={chapter === index}
                      onClick={() => setChapter(index)}
                    >
                      {screen.label}
                    </button>
                  ))}
                </div>
              )}
              <Link
                className="solid-action open-case"
                to={`/projects/${selected.slug}`}
                state={{ collection: `/?project=${selected.slug}` }}
              >
                Open case study
                <FiArrowRight />
              </Link>
              <button className="back-collection" onClick={back}>
                <FiArrowLeft />
                Collection
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
