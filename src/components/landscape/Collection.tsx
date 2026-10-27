import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { gsap } from "gsap";
import { Link, useLocation, useNavigate, useNavigationType, useSearchParams } from "react-router-dom";
import { FiArrowDown, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useProjects } from "../../lib/hooks";
import { detailScreens, screenGeometry } from "../../lib/project-detail-screens";
import { PublicDataState } from "../PublicDataState";
import { ResponsiveProjectImage } from "../ResponsiveProjectImage";
import { CaseGallery } from '../CaseGallery';
import { MotionRig } from "./MotionRig";
import { ProfileBoundary } from './ProfileBoundary';
import { CedarBoundary } from './CedarBoundary';
import { LobbyBoundary } from './LobbyBoundary';
import { warmRig } from "./rig-loader";
import { finishFiniteMotion, playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { collectionReadinessDeadline, collectionTiming, createCollectionMotion } from './collection-motion';
import { motionQuery, prefersReducedMotion } from '../../lib/use-motion-preference';
import type { RigKind } from "./rig-models";
import type { Project } from "../../types";
import { projectDisplayName } from "../../../shared/content-integrity";
import "./selected-project.css";
import { JobPilotJourneyContext, journeyBox, journeyTextBox, ordinaryActivation, type JobPilotJourney } from './jobpilot-journey';
import type { BoundaryState } from './profile-boundary-state';
import { jobPilotPresentation, useJobPilotDesign } from './jobpilot-design-context';
import { JobPilotObjectDetail, JobPilotPreviewComposition } from './JobPilotPreviewComposition';

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
  const journeys = useContext(JobPilotJourneyContext);
  const journey = new URLSearchParams(location.search).get('project') === 'jobpilot-ai' ? journeys.get(location.state?.jobpilotReturn ?? location.key) : undefined;
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
    if (location.state?.collectionReturn && !location.state?.jobpilotReturn) { navigate(-1); return; }
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
      restored={Boolean(journey) || Boolean(selected?.kind === 'jobpilot' && location.state?.jobpilotReturn) || (navigation === 'POP' && Boolean(location.state?.collectionReturn))}
      journey={journey}
      returnScreen={selected?.kind === 'jobpilot' ? location.state?.jobpilotScreen : undefined}
    />
  );
}

function CollectionScene({ items, selected, select, restore, origin, restored, journey, returnScreen }: {
  items: Sculpture[]; selected?: Sculpture; select: (slug: string) => void; restore: () => void; origin: Origin | null; restored: boolean; journey?: JobPilotJourney; returnScreen?: string;
}) {
  const location = useLocation();
  const design = useJobPilotDesign();
  const { candidate, refined } = jobPilotPresentation(design, selected?.kind === 'jobpilot');
  const collectionPath = design?.collectionPath ?? '/';
  const navigation = useNavigationType();
  const journeys = useContext(JobPilotJourneyContext);
  const [initialPreview] = useState(() => ({ boundary: journey?.boundary, disclosure: journey?.disclosure }));
  const boundaryState = useRef<BoundaryState | undefined>(journey?.boundary);
  const rememberPreview = useCallback((patch: Partial<JobPilotJourney>) => {
    if (!journey) return;
    const cached = journeys.get(journey.key);
    if (cached) journeys.set(journey.key, { ...cached, ...patch });
  }, [journey, journeys]);
  const rememberBoundary = useCallback((value: BoundaryState) => {
    boundaryState.current = value;
    // Once an origin exists, subsequent preview edits also survive Forward /
    // Back without requiring another explicit case-study opening.
    rememberPreview({ boundary: value });
  }, [rememberPreview]);
  const root = useRef<HTMLElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const openingProgress = useRef(0);
  const originalTransforms = useRef(new Map<HTMLElement, { x: number; y: number; scale: number }>());
  const [motion] = useState(() => createCollectionMotion(Boolean(selected), prefersReducedMotion(), restored));
  const [readinessDeadline] = useState(() => performance.now() + collectionReadinessDeadline);
  const state = useSyncExternalStore(motion.subscribe, motion.snapshot, motion.snapshot);
  const reduced = state.reduced;
  const kind = selected?.kind;
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(() => {
    const screens = selected ? detailScreens(selected.project).slice(0, 2) : [];
    return Math.max(0, screens.findIndex(screen => screen.src === (journey?.screen ?? returnScreen)));
  });
  const [decoded, setDecoded] = useState<Set<string>>(() => new Set());
  const [failedPreview, setFailedPreview] = useState<string | null>(null);
  const [inspection, setInspection] = useState<{ index: number; trigger: HTMLButtonElement } | null>(null);
  const [hasPreview, setHasPreview] = useState(false);
  const hasPreviewRef = useRef(false);
  useLayoutEffect(() => { hasPreviewRef.current = hasPreview; }, [hasPreview]);
  const screens = selected ? detailScreens(selected.project) : [];
  // Keep GPU work behind a completed image attempt. Slow requests retain the
  // photograph; the bounded owner can recover without waiting on that request.
  const previewReady = !screens.length || decoded.size > 0;
  const eligible = ready && previewReady && (state.renderer !== 'loading' || !state.allowGPU);
  const activePreview = state.phase === 'active' ? hasPreview : null;
  const markDecoded = (src: string) => setDecoded(previous => previous.has(src) ? previous : new Set(previous).add(src));
  const previewLoaded = () => {
    const src = screens[chapter]?.src;
    if (!src) return;
    setFailedPreview(previous => previous === src ? null : previous);
    setHasPreview(true);
    markDecoded(src);
  };
  const recoverOpening = useCallback(() => {
    const phase = motion.snapshot().phase;
    if (phase !== 'selecting' && phase !== 'opening') return;
    stopFiniteMotion(animation.current);
    // This retires the renderer, not just the pending label. The layout effect
    // below applies the final photographic pose; late assets can paint there.
    motion.fallback();
  }, [motion]);
  const readyRig = useCallback((renderer: 'webgl' | 'fallback') => {
    const phase = motion.snapshot().phase;
    // A synchronous initialization can outlive its timer. Reject its late
    // notification before starting another opening clock on an obsolete rig.
    if (phase === 'selecting' && performance.now() >= readinessDeadline) {
      recoverOpening();
      return;
    }
    motion.rendererReady(renderer);
    if (renderer === 'fallback' && motion.snapshot().phase === 'opening') finishFiniteMotion(animation.current);
  }, [motion, readinessDeadline, recoverOpening]);
  useEffect(() => {
    // Import independently of network/decode, but create no canvas or scene
    // until its screenshot attempt finishes. MotionRig owns cancellation.
    if (kind && state.allowGPU) void warmRig().catch(() => {});
  }, [kind, state.allowGPU]);

  useEffect(() => {
    if (!kind) return;
    const pending = () => {
      if (motion.snapshot().phase === 'selecting') recoverOpening();
    };
    const deadline = window.setTimeout(pending, Math.max(0, readinessDeadline - performance.now()));
    const visibility = () => {
      // Hidden pages cannot promise painted animation frames. Retire the
      // pending opening so returning to the tab has usable photographic content.
      if (document.hidden) recoverOpening();
      else if (performance.now() >= readinessDeadline) pending();
    };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => { clearTimeout(deadline); document.removeEventListener('visibilitychange', visibility); };
  }, [kind, motion, readinessDeadline, recoverOpening]);

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
          if(!refined)gsap.set(object, { ...transform, transformOrigin: 'top left' });
        }
      }
    }
  }, [items, selected, origin, refined]);

  useLayoutEffect(() => {
    if(!refined||!root.current)return;
    const scope=root.current,object=scope.querySelector<HTMLElement>('.jobpilot-object'),frame=scope.querySelector<HTMLElement>('.selection-image-frame');
    if(!object||!frame)return;
    // This owns the refined photograph's placement. The opening timeline keeps
    // ownership of opacity/rig progress; return never moves it through UI.
    const fit=()=>{
      if(motion.snapshot().phase==='closing')return;
      gsap.set(object,{x:0,y:0,scale:1,transformOrigin:'top left'});
      const source=object.getBoundingClientRect(),target=frame.getBoundingClientRect();
      if(!source.width||!target.width)return;
      const scale=Math.min(target.width/source.width,target.height/source.height)*.92;
      gsap.set(object,{x:target.left+(target.width-source.width*scale)/2-source.left,y:target.top+(target.height-source.height*scale)/2-source.top,scale});
    };
    fit();const observer=new ResizeObserver(fit);observer.observe(frame);
    return()=>observer.disconnect();
  },[refined,motion,kind]);

  useLayoutEffect(() => {
    const headingId = selected ? `${selected.kind}-engineering` : null;
    const returning = selected?.kind === 'jobpilot' && restored && (navigation === 'POP' || Boolean(location.state?.routeRestore));
    if (headingId && location.hash === `#${headingId}` && !returning) {
      root.current?.querySelector<HTMLElement>(`#${headingId}`)?.focus({ preventScroll: true });
    }
  }, [items, selected, location.key, location.hash, location.state?.routeRestore, navigation, restored]);

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
    stopFiniteMotion(animation.current);
    if (motion.snapshot().reduced) { restore(); return; }
    const mesh = scope.querySelector<HTMLElement>('.motion-rig');
    const gpu = mesh?.dataset.renderer === 'webgl';
    const objects = [...scope.querySelectorAll<HTMLElement>('.object')];
    const object = scope.querySelector<HTMLElement>('.' + selected.kind + '-object')!;
    const duration = collectionTiming.returning;
    const progress = openingProgress.current;
    const timeline = gsap.timeline({ paused: true, onUpdate: () => {
      if (gpu) mesh.dispatchEvent(new CustomEvent('rig-frame', { detail: { progress: progress * (1 - timeline.time() / duration), closing: true } }));
    } });
    animation.current = timeline;
    timeline.to(scope.querySelector('.selection-detail'), { opacity: 0, duration: 0.16 }, 0)
      .to(scope.querySelector('.product-surface'), { opacity: 0, duration: 0.2 }, 0)
      .to(objects, { x: (_index, target) => refined ? Number(gsap.getProperty(target,'x')) : originalTransforms.current.get(target)?.x ?? 0,
        y: (_index, target) => refined ? Number(gsap.getProperty(target,'y')) : originalTransforms.current.get(target)?.y ?? 0,
        scale: (_index, target) => refined ? Number(gsap.getProperty(target,'scale')) : originalTransforms.current.get(target)?.scale ?? 1,
        opacity: 1, duration, ease: 'power3.inOut' }, 0)
      .to(object.querySelector('.object-core'), { opacity: 1, duration: 0.12 }, gpu ? 0.42 : 0.1);
    if (gpu) timeline.to(mesh, { opacity: 1, duration: 0.08 }, 0).to(mesh, { opacity: 0, duration: 0.12 }, 0.44);
    // The close owner restores navigation even if decorative tweens are killed.
    playFiniteMotion(timeline, { complete: restore });
  }, [selected, motion, restore, refined]);

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
      const preview = activePreview ?? false;
      gsap.set(objects.filter(item => item !== object), { opacity: candidate ? 0 : 0.12 });
      // A recovered opening can precede a slow network/decode. Keep the real
      // photograph until a decoded screenshot can crossfade over it.
      const ctx = gsap.context(() => {
        gsap.to(object, { opacity: preview ? (candidate ? 0 : 0.12) : 1, duration: reduced ? 0 : collectionTiming.handoff });
        if (motion.snapshot().renderer === 'webgl') gsap.set(object.querySelector('.object-core'), { opacity: 0 });
        else gsap.to(object.querySelector('.object-core'), { opacity: preview ? 0 : 1, duration: reduced ? 0 : collectionTiming.handoff });
        const rig = scope.querySelector('.motion-rig');
        if (rig && !preview && motion.snapshot().renderer === 'webgl') gsap.set(rig, { opacity: 1 });
        else if (rig) gsap.to(rig, { opacity: 0, duration: reduced ? 0 : collectionTiming.handoff });
      }, scope);
      gsap.set(scope.querySelector('.product-surface'), { opacity: 1, scale: 1, y: 0 });
      return () => ctx.kill(false);
    }
    if (!eligible || !motion.open()) return;
    const mesh = scope.querySelector<HTMLElement>('.motion-rig');
    const gpu = mesh?.dataset.renderer === 'webgl';
    const ctx = gsap.context(() => {
      const duration = reduced ? 0.01 : collectionTiming.articulation;
      const timeline = gsap.timeline({ paused: true, onUpdate: () => {
        openingProgress.current = Math.min(1, timeline.time() / collectionTiming.articulation);
        if (gpu) mesh.dispatchEvent(new CustomEvent('rig-frame', { detail: { progress: Math.min(1, timeline.time() / collectionTiming.articulation), closing: false } }));
      } });
      animation.current = timeline;
      timeline.to(objects.filter(item => item !== object), { opacity: candidate ? 0 : 0.12, duration: reduced ? 0.01 : candidate ? 0.22 : 0.16 }, 0)
        .to(object.querySelector('.object-core'), { opacity: 0, duration: reduced ? 0.01 : 0.12 }, gpu ? 0.04 : 0.68)
        .fromTo(scope.querySelector('.product-surface'), { opacity: 0, scale: 1, y: 0 }, { opacity: 1, duration: reduced ? 0.01 : collectionTiming.handoff, ease: 'power2.inOut' }, reduced ? 0 : candidate ? 0.54 : 0.68);
      if (gpu) timeline.to(mesh, { opacity: 1, duration: 0.12 }, 0.04).to(mesh, { opacity: () => hasPreviewRef.current ? 0 : 1, duration: 0.2 }, 0.78);
      else timeline.to(object, { opacity: candidate ? 0 : 0.12, duration, ease: 'power2.inOut' }, 0);
      playFiniteMotion(timeline, { complete: () => motion.activate() });
    }, scope);
    const timeline = animation.current;
    return () => { stopFiniteMotion(timeline); ctx.revert(); };
  // An image arriving mid-articulation must not cancel its owning clock.
  // Only an active selection crossfades its held artwork into the new image.
  }, [eligible, kind, reduced, motion, state.renderer, activePreview, candidate]);

  const caseLink = selected && <Link className="solid-action open-case" to={design && selected.kind === 'jobpilot' ? design.readerPath : `/projects/${selected.slug}`}
    state={{ collection: selected.kind === 'jobpilot' ? `${collectionPath}${location.search}${location.hash}` : `/?project=${selected.slug}`, ...(selected.kind === 'jobpilot' ? {jobpilotJourney: { key: location.key, screen: screens[chapter]?.src }} : {}) }}
    onClick={event => {
      if (selected.kind !== 'jobpilot' || !ordinaryActivation(event)) return;
      const scope = root.current;
      const image = scope?.querySelector<HTMLImageElement>('.project-image-current img');
      const currentImage = image?.closest('.project-image-current');
      const sameImage = image?.complete && image.naturalWidth && decoded.has(screens[chapter]?.src) && failedPreview !== screens[chapter]?.src
        && (!scope?.querySelector('.project-image-previous') || Boolean(currentImage && Number(getComputedStyle(currentImage).opacity) >= 0.99));
      journeys.set(location.key, {
        key: location.key, url: `${collectionPath}${location.search}${location.hash}`, routeState: location.state ?? {}, historyIndex: history.state?.idx ?? -1,
        screen: screens[chapter]?.src, boundary: boundaryState.current,
        disclosure: scope?.querySelector('.boundary-disclosure')?.getAttribute('data-expanded') === 'true',
        position: { x: scrollX, y: scrollY }, capturedAt: performance.now(),
        frame: sameImage ? journeyBox(image) : undefined,
        title: journeyTextBox(scope?.querySelector('.selection-caption h1') ?? null),
        number: journeyBox(scope?.querySelector('.selection-project-number') ?? null),
      });
    }}>Open case study<FiArrowRight /></Link>;
  const screenChoices = screens.length > 1 && <div className="chapter-switch" role="group" aria-label="Preview workflow">
    {screens.slice(0,2).map((screen,index)=><button key={screen.src} aria-pressed={chapter===index}
      onClick={()=>{rememberPreview({screen:screen.src});setChapter(index);}}>{screen.label}</button>)}
  </div>;
  const backLink=<button className="back-collection" onClick={back}><FiArrowLeft />Collection</button>;
  const caption=<div className="selection-caption"><div className="selection-caption-inner">
    {candidate&&<JobPilotObjectDetail />}
    {selected?.kind==='jobpilot'&&<span className="selection-project-number">01</span>}
    {candidate&&<span className="selection-category">{selected?.category}</span>}
    <h1>{selected?.displayTitle}</h1><p>{candidate?'Review before saving':selected?.category}</p>
  </div></div>;
  const fullName=selected&&selected.displayTitle!==selected.project.name&&<span id="selected-project-full-name" className="sr-only">{selected.project.name}</span>;
  const navigationLinks=selected&&<div className="selection-project-links" role="group" aria-label="Selected project navigation">
    {caseLink}<Link className="explore-engineering" tabIndex={0} to={{search:location.search,hash:`#${selected.kind}-engineering`}} replace state={selected.kind==='jobpilot'?{...location.state,routeRestore:undefined}:location.state}>Explore the engineering<FiArrowDown /></Link>
  </div>;
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`stage${selected ? " is-expanded" : ""}${selected?.kind === 'jobpilot' ? ' has-profile-boundary' : selected?.kind === 'cedar' ? ' has-cedar-boundary' : selected?.kind === 'lobby' ? ' has-lobby-boundary' : ''}`}
      data-selection-state={state.phase === 'active' ? 'settled' : state.phase === 'selecting' ? 'loading' : state.phase}
      data-motion-phase={state.phase}
      data-content-state="ready"
      data-preview-state={failedPreview === screens[chapter]?.src ? 'failed' : decoded.has(screens[chapter]?.src) ? 'ready' : 'loading'}
      data-motion-renderer={state.renderer}
      data-motion-framing={refined?'product':undefined}
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
          {((previewReady && state.allowGPU) || state.renderer === 'fallback') && !reduced && (
            <MotionRig
              kind={selected.kind}
              reduced={reduced}
              disabled={!state.allowGPU}
              onReady={readyRig}
            />
          )}
          <JobPilotPreviewComposition candidate={candidate} refined={refined} choices={screenChoices}
            identity={<section className="selection-detail" aria-label="Selected project" aria-describedby={fullName?'selected-project-full-name':undefined} inert={state.phase==='closing'}>{backLink}{caption}{fullName}</section>}
            actions={<div className="selection-actions jobpilot-refined-actions" inert={state.phase==='closing'}>{navigationLinks}</div>}
            intro={selected.kind === 'jobpilot' && <p className="selection-boundary-intro">Engineering demonstration · sample data.</p>}
            image={
            <div className="selection-image-frame" style={!screens[chapter] ? { aspectRatio: 2.15 } : undefined}>
              {screens[chapter] && (!decoded.has(screens[chapter].src) || (state.phase === 'selecting' && failedPreview !== screens[chapter].src)) && (
                <p className="selection-preview-status" role="status">
                  {decoded.has(screens[chapter].src) ? 'Preparing project preview…' : 'Loading project preview…'}
                </p>
              )}
              {(!screens[chapter] ||
                failedPreview === screens[chapter].src) && (
                <p className="selection-preview-status" role="status">
                  Preview unavailable. Open the case study for project details.
                </p>
              )}
              {screens[chapter] && (
                <button
                  type="button"
                  className="product-surface"
                  aria-label={`Enlarge ${selected.displayTitle}: ${screens[chapter].label}`}
                  disabled={!decoded.has(screens[chapter].src) || failedPreview === screens[chapter].src || state.phase === 'closing'}
                  onClick={event => setInspection({ index: chapter, trigger: event.currentTarget })}
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
                    dimensions={screenGeometry(screens[chapter])}
                    priority
                    retainPrevious
                    onReadyImage={previewLoaded}
                    onError={() => {
                      setFailedPreview(screens[chapter].src);
                      markDecoded(screens[chapter].src);
                    }}
                  />
                </button>
              )}
              {screens[chapter] && decoded.has(screens[chapter].src) && failedPreview !== screens[chapter].src && <span className="screenshot-inspect-cue">Tap to inspect</span>}
            </div>}
            detail={<section
              className="selection-detail"
              aria-label="Selected project"
              aria-describedby={
                selected.displayTitle !== selected.project.name
                  ? "selected-project-full-name"
                  : undefined
              }
              inert={state.phase === 'closing'}
            >
              {caption}{fullName}
              <div className="selection-actions">
                {!candidate && screenChoices}
                {navigationLinks}{backLink}
              </div>
            </section>}
          />
          {selected.kind === 'jobpilot' && <div className="collection-boundary" onClick={() => {
            rememberPreview({ disclosure: root.current?.querySelector('.boundary-disclosure')?.getAttribute('data-expanded') === 'true' });
          }}><ProfileBoundary concise={refined} headingLevel={2} headingId="jobpilot-engineering" suspended={state.phase === 'closing'} initialState={initialPreview.boundary} onStateChange={rememberBoundary} disclosureOpen={initialPreview.disclosure} /></div>}
          {selected.kind === 'cedar' && <div className="collection-cedar-boundary"><CedarBoundary headingLevel={2} headingId="cedar-engineering" suspended={state.phase === 'closing'} /></div>}
          {selected.kind === 'lobby' && <div className="collection-lobby-boundary"><LobbyBoundary headingLevel={2} headingId="lobby-engineering" suspended={state.phase === 'closing'} /></div>}
          {inspection && <CaseGallery screens={screens} projectName={selected.displayTitle} initialIndex={inspection.index} returnFocusTo={inspection.trigger} onClose={() => setInspection(null)} />}
        </>
      )}
    </main>
  );
}
