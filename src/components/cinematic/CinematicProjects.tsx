import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { PiArrowUpRight, PiArrowRight, PiArrowLeft, PiArrowsOutSimple, PiX, PiPause, PiPlay, PiImages } from 'react-icons/pi';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './cinematic-projects.css';

gsap.registerPlugin(ScrollTrigger);

export interface GalleryProject {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  stack: string[];
  screenshots?: string[];
  coverImage?: string | null;
  imageAlt?: string | null;
  featured: boolean;
  published?: boolean;
  showOnPortfolio?: boolean;
  order: number;
}

interface GalleryProps {
  projects: GalleryProject[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  ctaLabel?: string;
  allProjectsHref?: string;
  projectHref?: (slug: string) => string;
  resolveImage?: (url: string) => string;
  ambientSrc?: string;
}

const directions: Record<string, { layout: string; primary: number; secondary?: number; tertiary?: number; shortName?: string }> = {
  'jobpilot-ai': { layout: 'hero', primary: 0, secondary: 1, tertiary: 3 },
  lobby: { layout: 'lobby', primary: 1, secondary: 2 },
  'gamezone-arena': { layout: 'gamezone', primary: 2, secondary: 4 },
  'construction-project-management-accounting-system': { layout: 'panorama', primary: 0, shortName: 'Cedar Construction' },
  unihub: { layout: 'reverse', primary: 2, secondary: 1 },
};

const identity = (url: string) => url;
const defaultProjectHref = (slug: string) => `/projects/${encodeURIComponent(slug)}`;

function useProjectChapters(root: RefObject<HTMLElement | null>, signature: string) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const headingBottom = section.querySelector('.cw-heading')?.getBoundingClientRect().bottom ?? box.top;
      setNavigatorVisible(headingBottom < 16 && box.bottom > 180);
      const scenes = Array.from(section.querySelectorAll<HTMLElement>('.cw-scene'));
      let nearest = 0;
      let distance = Infinity;
      scenes.forEach((scene, index) => {
        const rect = scene.getBoundingClientRect();
        const focused = (scene === document.activeElement || scene.contains(document.activeElement)) && rect.top < viewport * .65 && rect.bottom > viewport * .35;
        const nextDistance = Math.abs(rect.top + rect.height * .4 - viewport * .45) - (focused ? viewport * 2 : 0);
        if (nextDistance < distance) { nearest = index; distance = nextDistance; }
      });
      setActiveChapter(nearest);
      const progress = Math.max(0, Math.min(1, -box.top / Math.max(1, box.height - viewport)));
      section.style.setProperty('--cw-progress', String(progress));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [root, signature]);
  return { activeChapter, navigatorVisible };
}

function useGalleryMotion(root: RefObject<HTMLElement | null>, paused: boolean, signature: string) {
  useLayoutEffect(() => {
    if (!root.current || paused) return;
    const section = root.current;
    const media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 761px)', mobile: '(max-width: 760px)', reduced: '(prefers-reduced-motion: reduce)' }, (context) => {
      if (context.conditions?.reduced) return;
      const mobile = !!context.conditions?.mobile;
      section.querySelectorAll<HTMLElement>('.cw-scene').forEach((scene) => {
        const panels = Array.from(scene.querySelectorAll('.cw-panel'));
        const hero = scene.classList.contains('cw-scene--hero');
        if (hero && !mobile) {
          const timeline = gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top 90%', end: 'top 20%', scrub: .8 } });
          timeline.fromTo(panels[0], { y: 54, x: 24, scale: .9, rotation: -2 }, { y: 0, x: 0, scale: 1, rotation: 0, ease: 'none', force3D: false }, 0);
          if (panels[1]) timeline.fromTo(panels[1], { x: -84, y: -30, rotation: -4 }, { x: 0, y: 0, rotation: 0, ease: 'none', force3D: false }, 0);
          if (panels[2]) timeline.fromTo(panels[2], { x: 74, y: 70, rotation: 6 }, { x: 0, y: 0, rotation: 0, ease: 'none', force3D: false }, .08);
        } else {
          const panorama = scene.classList.contains('cw-scene--panorama');
          const reverse = scene.classList.contains('cw-scene--reverse');
          // Enter from above, keeping the screenshot footprint away from captions.
          gsap.fromTo(panels, {
            x: mobile ? 0 : reverse ? 48 : panorama ? 0 : -28,
            y: mobile ? -16 : -62,
            scale: mobile ? 1 : .94,
            rotation: mobile ? 0 : -2,
          }, {
            x: 0, y: 0, scale: 1, rotation: 0, duration: mobile ? .55 : 1.25,
            stagger: mobile ? .06 : .18, ease: 'power3.out', force3D: false,
            scrollTrigger: { trigger: scene, start: 'top 88%', once: true },
          });
        }
        gsap.fromTo(scene.querySelector('.cw-caption'), { y: mobile ? 12 : 24, opacity: .65 }, {
          y: 0, opacity: 1, duration: .8, ease: 'power2.out', force3D: false,
          scrollTrigger: { trigger: scene, start: 'top 84%', once: true },
        });
      });
      const cleanups: (() => void)[] = [];
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !mobile) {
        section.querySelectorAll<HTMLElement>('.cw-stage').forEach((stage) => {
          const body = stage.querySelector('.cw-stage-body');
          const xTo = gsap.quickTo(body, 'x', { duration: .7, ease: 'power3.out', force3D: false });
          const yTo = gsap.quickTo(body, 'y', { duration: .7, ease: 'power3.out', force3D: false });
          const move = (e: PointerEvent) => {
            const b = stage.getBoundingClientRect();
            xTo(((e.clientX - b.left) / b.width - .5) * 20);
            yTo(((e.clientY - b.top) / b.height - .5) * 14);
          };
          const leave = () => { xTo(0); yTo(0); };
          stage.addEventListener('pointermove', move);
          stage.addEventListener('pointerleave', leave);
          cleanups.push(() => { stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); });
        });
      }
      return () => {
        cleanups.forEach((cleanup) => cleanup());
        const targets = section.querySelectorAll('.cw-panel, .cw-stage-body, .cw-caption');
        gsap.killTweensOf(targets);
        gsap.set(targets, { clearProps: 'transform,clipPath,opacity' });
      };
    }, root);
    return () => {
      media.revert();
      const targets = section.querySelectorAll('.cw-panel, .cw-stage-body, .cw-caption');
      gsap.killTweensOf(targets);
      gsap.set(targets, { clearProps: 'transform,clipPath,opacity' });
    };
  }, [root, paused, signature]);
}

function Screen({ src, alt, priority, className, onOpen }: { src: string; alt: string; priority: boolean; className: string; onOpen: () => void }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return <button type="button" className={`cw-panel ${className}`} onClick={onOpen} aria-label={`Enlarge ${alt}`}>
    {failedSrc === src ? <span className="cw-image-error">This screenshot is unavailable. Open the project to see more.</span> :
      <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" onError={() => setFailedSrc(src)} />}
    <span className="cw-enlarge" aria-hidden="true"><PiArrowsOutSimple size={18} /></span>
  </button>;
}

export function CinematicProjects({ projects, eyebrow = '03 / PROJECTS', heading = 'Selected work', description, ctaLabel = 'View all projects', allProjectsHref = '/projects', projectHref = defaultProjectHref, resolveImage = identity, ambientSrc = '/assets/cinematic-ambient.webp' }: GalleryProps) {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('cinematic-motion') === 'paused'; } catch { return false; }
  });
  const [viewer, setViewer] = useState<{ project: GalleryProject; index: number } | null>(null);
  const [viewerFailedSrc, setViewerFailedSrc] = useState<string | null>(null);
  const featured = projects.filter((p) => p.featured && p.published !== false && p.showOnPortfolio !== false)
    .sort((a, b) => a.order - b.order);
  const signature = featured.map((p) => `${p.id}:${p.screenshots?.join(',')}`).join('|');
  const { activeChapter, navigatorVisible } = useProjectChapters(root, signature);
  useGalleryMotion(root, paused, signature);

  const viewerId = viewer?.project.id;
  useEffect(() => {
    const modal = dialog.current;
    if (!viewerId || !modal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.showModal();
    return () => { modal.close(); document.body.style.overflow = previousOverflow; };
  }, [viewerId]);

  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>('.cw-thumbnails button[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [viewer?.index, viewerId]);

  const close = () => { dialog.current?.close(); setViewer(null); };
  const images = viewer?.project.screenshots?.length ? viewer.project.screenshots : viewer?.project.coverImage ? [viewer.project.coverImage] : [];
  const step = (delta: number) => setViewer((v) => v ? { ...v, index: (v.index + delta + images.length) % images.length } : null);
  const words = heading.trim().split(/\s+/);
  const titleLead = words.slice(0, -1).join(' ');
  const titleLast = words.at(-1);

  return <section ref={root} id="projects" className={`cw-gallery ${paused ? 'cw-paused' : ''} ${titleLead.length > 16 || description ? 'cw-gallery--expanded-heading' : ''}`} aria-labelledby="cw-title">
    <img className="cw-ambient" src={ambientSrc} alt="" aria-hidden="true" />
    <div className="cw-container">
      <header className="cw-heading">
        <div><p className="cw-eyebrow">{eyebrow}</p><h2 id="cw-title">{titleLead && <span>{titleLead}</span>}<em>{titleLast}</em></h2>{description && <p className="cw-intro">{description}</p>}</div>
        <div className="cw-utilities"><p className="cw-heading-note">A closer look at the products<br />behind the pixels.</p><a className="cw-all" href={allProjectsHref}>{ctaLabel}<PiArrowRight size={20} /></a>
          <button className="cw-motion" type="button" aria-pressed={paused} onClick={() => { setPaused(!paused); try { localStorage.setItem('cinematic-motion', paused ? 'playing' : 'paused'); } catch { /* Motion still works when storage is unavailable. */ } }}>
            {paused ? <PiPlay size={14} /> : <PiPause size={14} />}<span>{paused ? 'Motion paused' : 'Pause motion'}</span>
          </button>
        </div>
      </header>

      <div className="cw-scenes">
        {featured.map((project, index) => {
          const direction = directions[project.slug] ?? { layout: index === 0 ? 'hero' : index % 2 ? 'panorama' : 'reverse', primary: 0 };
          const sources = project.screenshots?.length ? project.screenshots : project.coverImage ? [project.coverImage] : [];
          const primary = Math.min(direction.primary, Math.max(0, sources.length - 1));
          const secondary = direction.secondary !== undefined && sources[direction.secondary] ? direction.secondary : undefined;
          const tertiary = direction.tertiary !== undefined && sources[direction.tertiary] ? direction.tertiary : undefined;
          const name = direction.shortName ?? project.name;
          const open = (screen: number) => setViewer({ project, index: screen });
          return <article key={project.id} id={`cw-scene-${project.slug}`} tabIndex={-1} className={`cw-scene cw-scene--${direction.layout}`} aria-labelledby={`cw-${project.slug}`}>
            <div className="cw-stage"><div className="cw-stage-body">
              {sources[primary] ? <Screen src={resolveImage(sources[primary])} alt={`${project.name}, screenshot ${primary + 1}`} priority={index === 0} className="cw-primary" onOpen={() => open(primary)} /> : <div className="cw-no-image">Screenshots coming soon</div>}
              {secondary !== undefined && <Screen src={resolveImage(sources[secondary])} alt={`${project.name}, screenshot ${secondary + 1}`} priority={index === 0} className="cw-secondary" onOpen={() => open(secondary)} />}
              {tertiary !== undefined && <Screen src={resolveImage(sources[tertiary])} alt={`${project.name}, screenshot ${tertiary + 1}`} priority={index === 0} className="cw-tertiary" onOpen={() => open(tertiary)} />}
            </div></div>
            <div className="cw-caption">
              <p className="cw-project-number"><span className="cw-ordinal">{String(index + 1).padStart(2, '0')}</span><span>{project.stack.slice(0, 3).join(' · ')}</span></p>
              <h3 id={`cw-${project.slug}`}>{name}</h3>
              <p className="cw-tagline">{project.tagline || project.description}</p>
              <div className="cw-actions"><a className="cw-explore" href={projectHref(project.slug)}>Explore project<span><PiArrowUpRight size={20} /></span></a>
                {!!sources.length && <button className="cw-gallery-link" type="button" onClick={() => open(primary)}><PiImages size={17} />{sources.length} {sources.length === 1 ? 'screen' : 'screens'}</button>}
              </div>
            </div>
          </article>;
        })}
      </div>
      {!featured.length && <p className="cw-empty">New projects are on their way. Come back soon.</p>}
      <footer className="cw-section-end"><span>{String(featured.length).padStart(2, '0')} projects. Real products. Built with purpose.</span><a href={allProjectsHref}>The complete collection<PiArrowRight size={20} /></a></footer>
    </div>
    {!!featured.length && navigatorVisible && <nav className="cw-chapters" aria-label="Featured project chapters">
      <div className="cw-chapter-progress" aria-hidden="true"><span /></div>
      {featured.map((project, index) => <a key={project.id} href={`#cw-scene-${project.slug}`} aria-current={activeChapter === index ? 'location' : undefined} onClick={(event) => {
        event.preventDefault();
        const scene = document.getElementById(`cw-scene-${project.slug}`);
        scene?.scrollIntoView({ block: 'center', behavior: paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        scene?.focus({ preventScroll: true });
      }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{directions[project.slug]?.shortName ?? project.name}</strong></a>)}
    </nav>}
    {viewer && <dialog ref={dialog} className="cw-viewer" aria-labelledby="cw-viewer-title" onCancel={close} onClick={(e) => { if (e.target === e.currentTarget) close(); }} onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } }}>
      <div className="cw-viewer-inner"><header><div><p className="cw-eyebrow">PROJECT GALLERY</p><h3 id="cw-viewer-title">{directions[viewer.project.slug]?.shortName ?? viewer.project.name}</h3></div><button type="button" className="cw-icon-button" onClick={close} aria-label="Close screenshot gallery" autoFocus><PiX size={22} /></button></header>
        <div className="cw-viewer-image">{viewerFailedSrc === images[viewer.index] ? <p className="cw-image-error">This screenshot is unavailable. Use the arrow controls to see another screen.</p> : <img key={images[viewer.index]} src={resolveImage(images[viewer.index])} alt={`${viewer.project.name}, full screenshot ${viewer.index + 1}`} onError={() => setViewerFailedSrc(images[viewer.index])} />}</div>
        <nav className="cw-thumbnails" aria-label="Project screenshots">{images.map((src, index) => <button type="button" key={`${src}-${index}`} aria-label={`Show screenshot ${index + 1}`} aria-current={index === viewer.index ? 'true' : undefined} onClick={() => setViewer({ ...viewer, index })}>
          <img src={resolveImage(src)} alt="" loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span>
        </button>)}</nav>
        <footer><p aria-live="polite">Screenshot {viewer.index + 1} of {images.length}</p><div><button type="button" className="cw-icon-button" onClick={() => step(-1)} disabled={images.length < 2} aria-label="Previous screenshot"><PiArrowLeft size={22} /></button><button type="button" className="cw-icon-button" onClick={() => step(1)} disabled={images.length < 2} aria-label="Next screenshot"><PiArrowRight size={22} /></button><a href={projectHref(viewer.project.slug)}>View case study<PiArrowUpRight size={18} /></a></div></footer>
      </div>
    </dialog>}
  </section>;
}
