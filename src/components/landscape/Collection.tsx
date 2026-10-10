import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { gsap } from "gsap";
import { Link, useLocation, useNavigate, useNavigationType, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useProjects } from "../../lib/hooks";
import { detailScreens } from "../../lib/project-detail-screens";
import { PublicDataState } from "../PublicDataState";
import { ResponsiveProjectImage } from "../ResponsiveProjectImage";
import { MotionRig } from "./MotionRig";
import { warmRig } from "./rig-loader";
import { finishFiniteMotion, playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { collectionTiming, createCollectionMotion } from './collection-motion';
import { motionQuery, prefersReducedMotion } from '../../lib/use-motion-preference';
import type { RigKind } from "./rig-models";
import type { Project } from "../../types";
import { projectDisplayName } from "../../../shared/content-integrity";
import "./selected-project.css";

// Labels are presentation only; full names, narratives and screenshots stay CMS-owned.
const artwork: {
  slug: string;
  kind: RigKind;
  asset: string;
  category: string;
}[] = [
  {
    slug: "jobpilot-ai",
    kind: "jobpilot",
    asset: "jobpilot-sculpture.webp",
    category: "AI career workspace",
  },
  {
    slug: "lobby",
    kind: "lobby",
    asset: "lobby-sculpture.webp",
    category: "Real-time communication",
  },
  {
    slug: "construction-project-management-accounting-system",
    kind: "cedar",
    asset: "archive-sculpture.webp",
    category: "Project operations & accounting",
  },
];
type Sculpture = (typeof artwork)[number] & { project: Project; displayTitle: string };
type Origin = { kind: RigKind; scroll: { x: number; y: number }; width: number; objects?: Partial<Record<RigKind, { left: number; top: number; width: number }>> };
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
  const navigate = useNavigate();
  const navigation = useNavigationType();
  const [params, setParams] = useSearchParams();
  const selectionLock = useRef(false);
  const [origin, setOrigin] = useState<Origin | null>(() => {
    const kind = artwork.find(item => item.slug === location.state?.returnProject)?.kind;
    return location.state?.collectionReturn ?? (kind ? { kind, scroll: { x: 0, y: 0 }, width: innerWidth } : null);
  });
  useEffect(() => { selectionLock.current = false; }, [location.key]);
  const items = useMemo(
    () =>
      artwork.flatMap((art) => {
        const project = projects.data?.find(
          (project) =>
            project.slug === art.slug &&
            project.published &&
            project.showOnPortfolio !== false,
        );
        return project ? [{ ...art, project, displayTitle: projectDisplayName(project) }] : [];
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
    if (selectionLock.current || selected) return;
    selectionLock.current = true;
    const kind = items.find(item => item.slug === slug)!.kind;
    const objects = Object.fromEntries(items.map(item => {
      const box = document.querySelector(`.stage .${item.kind}-object`)!.getBoundingClientRect();
      return [item.kind, { left: box.left, top: box.top, width: box.width }];
    }));
    const returning: Origin = { kind, scroll: { x: scrollX, y: scrollY }, width: innerWidth, objects };
    setOrigin(returning);
    const next = new URLSearchParams(params);
    next.set("project", slug);
    setParams(next, { state: { collectionReturn: returning } });
  };
  const restore = () => {
    if (!selected) return;
    setOrigin(previous => previous ?? { kind: selected.kind, scroll: { x: 0, y: 0 }, width: innerWidth });
    if (location.state?.collectionReturn) { navigate(-1); return; }
    const next = new URLSearchParams(params);
    next.delete("project");
    setParams(next, { replace: true });
  };
  return (
    <CollectionScene
      key={selected?.slug ?? "collection"}
      items={items}
      selected={selected}
      select={select}
      restore={restore}
      origin={origin}
      restored={navigation === 'POP' && Boolean(location.state?.collectionReturn)}
    />
  );
}

function CollectionScene({ items, selected, select, restore, origin, restored }: {
  items: Sculpture[]; selected?: Sculpture; select: (slug: string) => void; restore: () => void; origin: Origin | null; restored: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const originalTransforms = useRef(new Map<HTMLElement, { x: number; y: number; scale: number }>());
  const [motion] = useState(() => createCollectionMotion(Boolean(selected), prefersReducedMotion(), restored));
  const state = useSyncExternalStore(motion.subscribe, motion.snapshot, motion.snapshot);
  const reduced = state.reduced;
  const kind = selected?.kind;
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [decoded, setDecoded] = useState<Set<string>>(() => new Set());
  const [failedPreview, setFailedPreview] = useState<string | null>(null);
  const screens = selected ? detailScreens(selected.project) : [];
  // Selection can change before the first request finishes. Any completed
  // preview attempt makes the handoff eligible; chapter changes cannot cancel
  // or restart the selection's finite opening clock.
  const previewReady = !screens.length || decoded.size > 0;
  const eligible = ready && previewReady && (state.renderer !== 'loading' || !state.allowGPU);
  const markDecoded = (src: string) => setDecoded(previous => new Set(previous).add(src));
  const readyRig = useCallback((renderer: 'webgl' | 'fallback') => {
    motion.rendererReady(renderer);
    if (renderer === 'fallback' && motion.snapshot().phase === 'opening') finishFiniteMotion(animation.current);
  }, [motion]);

  useLayoutEffect(() => {
    if (!selected || !restored) return;
    stopFiniteMotion(animation.current);
    motion.restore();
    const scope = root.current;
    if (scope) {
      gsap.set(scope.querySelector('.product-surface'), { opacity: 1, scale: 1, y: 0 });
      gsap.set(scope.querySelector('.selection-detail'), { opacity: 1, y: 0 });
      gsap.set(scope.querySelector('.' + selected.kind + '-object .object-core'), { opacity: 0 });
      scope.querySelector<HTMLElement>('.open-case')?.focus({ preventScroll: true });
    }
  }, [motion, restored, selected]);

  useEffect(() => {
    const media = window.matchMedia(motionQuery);
    const change = () => {
      motion.preference(media.matches);
      if (media.matches) finishFiniteMotion(animation.current);
    };
    media.addEventListener('change', change);
    return () => { media.removeEventListener('change', change); stopFiniteMotion(animation.current); };
  }, [motion]);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;
    // Acknowledgement/focus never wait on imagery, WebGL or choreography.
    if (selected) scope.querySelector<HTMLElement>('.open-case')?.focus({ preventScroll: true });
    else if (origin) {
      window.scrollTo(origin.scroll.x, origin.scroll.y);
      scope.querySelector<HTMLElement>('[data-project="' + origin.kind + '"]')?.focus({ preventScroll: true });
    }
    if (selected && origin?.objects && origin.width === innerWidth) {
      for (const item of items) {
        const object = scope.querySelector<HTMLElement>('.' + item.kind + '-object')!;
        const before = origin.objects[item.kind], after = object.getBoundingClientRect();
        if (before) {
          const transform = { x: before.left - after.left, y: before.top - after.top, scale: before.width / after.width };
          originalTransforms.current.set(object, transform);
          gsap.set(object, { ...transform, transformOrigin: 'top left' });
        }
      }
    }
  }, [items, selected, origin]);

  useEffect(() => {
    let cancelled = false;
    const images = items.map(item => {
      const image = new Image();
      return { image, loaded: new Promise<void>(resolve => { image.onload = image.onerror = () => resolve(); image.src = '/landscape/' + item.asset; }) };
    });
    Promise.all(images.map(item => item.loaded)).then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; for (const { image } of images) image.onload = image.onerror = null; };
  }, [items]);

  const hover = (_kind: RigKind, active: boolean) => {
    if (!motion.snapshot().reduced && active) void warmRig().catch(() => {});
  };

  const back = useCallback(() => {
    if (!selected || !motion.close()) return;
    const scope = root.current;
    if (!scope) { restore(); return; }
    const previous = animation.current?.time() ?? 0;
    stopFiniteMotion(animation.current);
    if (motion.snapshot().reduced) { restore(); return; }
    const mesh = scope.querySelector<HTMLElement>('.motion-rig');
    const gpu = mesh?.dataset.renderer === 'webgl';
    const objects = [...scope.querySelectorAll<HTMLElement>('.object')];
    const object = scope.querySelector<HTMLElement>('.' + selected.kind + '-object')!;
    const duration = collectionTiming.returning;
    const progress = Math.min(1, previous / collectionTiming.articulation);
    const timeline = gsap.timeline({ paused: true, onUpdate: () => {
      if (gpu) mesh.dispatchEvent(new CustomEvent('rig-frame', { detail: { progress: progress * (1 - timeline.time() / duration), closing: true } }));
    } });
    animation.current = timeline;
    timeline.to(scope.querySelector('.selection-detail'), { opacity: 0, duration: 0.16 }, 0)
      .to(scope.querySelector('.product-surface'), { opacity: 0, duration: 0.2 }, 0)
      .to(objects, { x: (_index, target) => originalTransforms.current.get(target)?.x ?? 0,
        y: (_index, target) => originalTransforms.current.get(target)?.y ?? 0,
        scale: (_index, target) => originalTransforms.current.get(target)?.scale ?? 1,
        opacity: 1, duration, ease: 'power3.inOut' }, 0)
      .to(object.querySelector('.object-core'), { opacity: 1, duration: 0.12 }, gpu ? 0.42 : 0.1);
    if (gpu) timeline.to(mesh, { opacity: 1, duration: 0.08 }, 0).to(mesh, { opacity: 0, duration: 0.12 }, 0.44);
    // The close owner restores navigation even if decorative tweens are killed.
    playFiniteMotion(timeline, { complete: restore });
  }, [selected, motion, restore]);

  useEffect(() => {
    if (!selected) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('[role="dialog"], dialog[open]')) back();
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [selected, back]);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || !kind || motion.snapshot().phase === 'closing') return;
    const object = scope.querySelector<HTMLElement>('.' + kind + '-object')!;
    const objects = [...scope.querySelectorAll<HTMLElement>('.object')];
    if (motion.snapshot().phase === 'active') {
      gsap.set(objects.filter(item => item !== object), { opacity: 0.12 });
      gsap.set(object.querySelector('.object-core'), { opacity: 0 });
      gsap.set(scope.querySelector('.product-surface'), { opacity: 1, scale: 1, y: 0 });
      return;
    }
    if (!eligible || !motion.open()) return;
    const mesh = scope.querySelector<HTMLElement>('.motion-rig');
    const gpu = mesh?.dataset.renderer === 'webgl';
    const ctx = gsap.context(() => {
      const duration = reduced ? 0.01 : collectionTiming.articulation;
      const timeline = gsap.timeline({ paused: true, onUpdate: () => {
        if (gpu) mesh.dispatchEvent(new CustomEvent('rig-frame', { detail: { progress: Math.min(1, timeline.time() / collectionTiming.articulation), closing: false } }));
      } });
      animation.current = timeline;
      timeline.to(objects.filter(item => item !== object), { opacity: 0.12, duration: reduced ? 0.01 : 0.16 }, 0)
        .to(object.querySelector('.object-core'), { opacity: 0, duration: reduced ? 0.01 : 0.12 }, gpu ? 0.04 : 0.68)
        .fromTo(scope.querySelector('.product-surface'), { opacity: 0, scale: 1, y: 0 }, { opacity: 1, duration: reduced ? 0.01 : collectionTiming.handoff, ease: 'power2.inOut' }, reduced ? 0 : 0.68);
      if (gpu) timeline.to(mesh, { opacity: 1, duration: 0.12 }, 0.04).to(mesh, { opacity: 0, duration: 0.2 }, 0.78);
      else timeline.to(object, { opacity: 0.12, duration, ease: 'power2.inOut' }, 0);
      playFiniteMotion(timeline, { complete: () => motion.activate() });
    }, scope);
    const timeline = animation.current;
    return () => { stopFiniteMotion(timeline); ctx.revert(); };
  }, [eligible, kind, reduced, motion]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`stage${selected ? " is-expanded" : ""}`}
      data-selection-state={state.phase === 'active' ? 'settled' : state.phase === 'selecting' ? 'loading' : state.phase}
      data-motion-phase={state.phase}
      data-content-state="ready"
      data-motion-renderer={state.renderer}
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
                aria-label={`Explore ${item.displayTitle}`}
                aria-describedby={
                  item.displayTitle !== item.project.name
                    ? `collection-${item.kind}-name`
                    : undefined
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
                    <span className="project-name">{item.displayTitle}</span>
                    {item.displayTitle !== item.project.name && (
                      <span
                        className="sr-only"
                        id={`collection-${item.kind}-name`}
                      >
                        {item.project.name}
                      </span>
                    )}
                    <span className="project-purpose">{item.category}</span>
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
          {previewReady && state.allowGPU && !reduced && (
            <MotionRig
              kind={selected.kind}
              reduced={reduced}
              onReady={readyRig}
            />
          )}
          <div className="selection-frame">
            <div className="selection-image-frame">
              {screens[chapter] && !decoded.has(screens[chapter].src) && (
                <p className="selection-preview-status" role="status">
                  Loading project preview…
                </p>
              )}
              {(!screens[chapter] ||
                failedPreview === screens[chapter].src) && (
                <p className="selection-preview-status" role="status">
                  Preview unavailable. Open the case study for project details.
                </p>
              )}
              {screens[chapter] && (
                <div
                  className="product-surface"
                  data-image-ready={
                    decoded.has(screens[chapter].src) &&
                    failedPreview !== screens[chapter].src
                  }
                  style={{ opacity: 0 }}
                >
                  <ResponsiveProjectImage
                    src={screens[chapter].src}
                    alt={`${selected.project.name}: ${screens[chapter].label}`}
                    sizes="(max-width: 1000px) 88vw, 880px"
                    priority
                    retainPrevious
                    onReadyImage={(image) => {
                      const src = screens[chapter].src;
                      void image
                        .decode()
                        .then(() => {
                          if (!image.isConnected) return;
                          setFailedPreview((previous) =>
                            previous === src ? null : previous,
                          );
                          markDecoded(src);
                        })
                        .catch(() => {
                          if (!image.isConnected) return;
                          setFailedPreview(src);
                          markDecoded(src);
                        });
                    }}
                    onError={() => {
                      setFailedPreview(screens[chapter].src);
                      markDecoded(screens[chapter].src);
                    }}
                  />
                </div>
              )}
            </div>
            <section
              className="selection-detail"
              aria-label="Selected project"
              aria-describedby={
                selected.displayTitle !== selected.project.name
                  ? "selected-project-full-name"
                  : undefined
              }
              inert={state.phase === 'closing'}
            >
              <div className="selection-caption">
                <div className="selection-caption-inner">
                  <h1>{selected.displayTitle}</h1>
                  <p>{selected.category}</p>
                </div>
              </div>
              {selected.displayTitle !== selected.project.name && (
                <span id="selected-project-full-name" className="sr-only">
                  {selected.project.name}
                </span>
              )}
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
          </div>
        </>
      )}
    </main>
  );
}
