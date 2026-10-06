import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { PiArrowUpRight, PiArrowRight, PiArrowLeft, PiX, PiPause, PiPlay } from 'react-icons/pi';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './cinematic-projects.css';
import { CinematicProjectCover } from './CinematicProjectCover';

gsap.registerPlugin(ScrollTrigger);

export interface GalleryProject {
  id: string;
  slug: string;
  name: string;
  type?: string;
  tagline?: string | null;
  description?: string | null;
  stack: string[];
  myRole?: string | null;
  contributions?: string[];
  impactSummary?: string | null;
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

const directions: Record<string, { layout: string; primary: number; shortName?: string }> = {
  'jobpilot-ai': { layout: 'hero', primary: 0 },
  lobby: { layout: 'lobby', primary: 1 },
  'gamezone-arena': { layout: 'gamezone', primary: 0 },
  'construction-project-management-accounting-system': { layout: 'panorama', primary: 0, shortName: 'Cedar Construction' },
  unihub: { layout: 'reverse', primary: 2 },
};

const identity = (url: string) => url;
const defaultProjectHref = (slug: string) => `/projects/${encodeURIComponent(slug)}`;

function useActivePreview(root: RefObject<HTMLElement | null>, signature: string) {
  const [previewChapter, setPreviewChapter] = useState<number | null>(null);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const scenes = Array.from(section.querySelectorAll<HTMLElement>('.cw-scene'));
      let mostVisible = 0;
      let preview: number | null = null;
      scenes.forEach((scene, index) => {
        const cover = scene.querySelector('.cw-product-cover')?.getBoundingClientRect();
        if (cover) {
          const visible = Math.max(0, Math.min(cover.bottom, viewport) - Math.max(cover.top, 160));
          const ratio = visible / Math.min(cover.height, viewport - 160);
          if (ratio > .3 && visible > mostVisible) { mostVisible = visible; preview = index; }
        }
      });
      setPreviewChapter(preview);
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
  return { previewChapter };
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
        const panels = Array.from(scene.querySelectorAll('.cw-product-cover'));
        const hero = scene.classList.contains('cw-scene--hero');
        if (hero && !mobile) {
          const timeline = gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top 90%', end: 'top 20%', scrub: .8 } });
          timeline.fromTo(panels[0], { y: 30, scale: .98 }, { y: 0, scale: 1, ease: 'none', force3D: false }, 0);
        } else {
          gsap.fromTo(panels, {
            y: mobile ? 10 : 28,
          }, {
            y: 0, duration: mobile ? .45 : .7,
            ease: 'power3.out', force3D: false,
            scrollTrigger: { trigger: scene, start: 'top 88%', once: true },
          });
        }
        gsap.fromTo(scene.querySelector('.cw-caption'), { y: mobile ? 12 : 24, opacity: 1 }, {
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
            xTo(((e.clientX - b.left) / b.width - .5) * 8);
            yTo(((e.clientY - b.top) / b.height - .5) * 6);
          };
          const leave = () => { xTo(0); yTo(0); };
          stage.addEventListener('pointermove', move);
          stage.addEventListener('pointerleave', leave);
          cleanups.push(() => { stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); });
        });
      }
      return () => {
        cleanups.forEach((cleanup) => cleanup());
        const targets = section.querySelectorAll('.cw-product-cover, .cw-stage-body, .cw-caption');
        gsap.killTweensOf(targets);
        gsap.set(targets, { clearProps: 'transform,clipPath,opacity' });
      };
    }, root);
    return () => {
      media.revert();
      const targets = section.querySelectorAll('.cw-product-cover, .cw-stage-body, .cw-caption');
      gsap.killTweensOf(targets);
      gsap.set(targets, { clearProps: 'transform,clipPath,opacity' });
    };
  }, [root, paused, signature]);
}

export function CinematicProjects({ projects, eyebrow = '03 / PROJECTS', heading = 'Selected work', ctaLabel = 'View all projects', allProjectsHref = '/projects', projectHref = defaultProjectHref, resolveImage = identity, ambientSrc = '/assets/cinematic-ambient.webp' }: GalleryProps) {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('cinematic-motion') === 'paused'; } catch { return false; }
  });
  const [viewer, setViewer] = useState<{ project: GalleryProject; index: number } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [viewerFailedSrc, setViewerFailedSrc] = useState<string | null>(null);
  const featured = projects.filter((p) => p.featured && p.published !== false && p.showOnPortfolio !== false)
    .sort((a, b) => a.order - b.order);
  const signature = featured.map((p) => `${p.id}:${p.screenshots?.join(',')}`).join('|');
  const { previewChapter } = useActivePreview(root, signature);
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

  return <section ref={root} id="projects" data-preview-active={previewChapter !== null} className={`cw-gallery ${paused ? 'cw-paused' : ''} ${titleLead.length > 16 ? 'cw-gallery--expanded-heading' : ''}`} aria-labelledby="cw-title">
    <img className="cw-ambient" src={ambientSrc} alt="" aria-hidden="true" />
    <div className="cw-container">
      <header className="cw-heading">
        <div><p className="cw-eyebrow">{eyebrow}</p><h2 id="cw-title">{titleLead && <span>{titleLead}</span>}{" "}<em>{titleLast}</em></h2></div>
        <div className="cw-utilities"><a className="cw-all" href={allProjectsHref}>{ctaLabel}<PiArrowRight size={20} /></a>
          <button className="cw-motion" type="button" aria-pressed={paused} onClick={() => { setPaused(!paused); try { localStorage.setItem('cinematic-motion', paused ? 'playing' : 'paused'); } catch { /* Motion still works when storage is unavailable. */ } }}>
            {paused ? <PiPlay size={14} /> : <PiPause size={14} />}<span>{paused ? 'Motion paused' : 'Pause motion'}</span>
          </button>
        </div>
      </header>

      <div className="cw-scenes">
        {featured.map((project, index) => {
          const direction = directions[project.slug] ?? { layout: index === 0 ? 'hero' : index % 2 ? 'panorama' : 'reverse', primary: 0 };
          const name = direction.shortName ?? project.name;
          const open = (screen: number) => { setZoomed(false); setViewer({ project, index: screen }); };
          return <article key={project.id} id={`cw-scene-${project.slug}`} tabIndex={-1} className={`cw-scene cw-scene--${direction.layout}`} aria-labelledby={`cw-${project.slug}`}>
            <div className="cw-stage"><div className="cw-stage-body">
              <CinematicProjectCover project={project} active={previewChapter === index && !viewer} paused={paused} priority={index === 0} resolveImage={resolveImage} onOpen={open} />
            </div></div>
            <div className="cw-caption">
              <h3 id={`cw-${project.slug}`}>{name}</h3>
              <a className="cw-explore" href={projectHref(project.slug)}>Explore project<PiArrowUpRight size={20} /></a>
            </div>
          </article>;
        })}
      </div>
      {!featured.length && <p className="cw-empty">New projects are on their way. Come back soon.</p>}
    </div>
    {viewer && <dialog ref={dialog} className={`cw-viewer ${zoomed ? 'cw-viewer--zoomed' : ''}`} aria-labelledby="cw-viewer-title" onCancel={close} onClick={(e) => { if (e.target === e.currentTarget) close(); }} onKeyDown={(e) => { if (zoomed && (e.target as HTMLElement).classList.contains('cw-viewer-image')) return; if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } }}>
      <div className="cw-viewer-inner"><header><div><p className="cw-eyebrow">PROJECT GALLERY</p><h3 id="cw-viewer-title">{directions[viewer.project.slug]?.shortName ?? viewer.project.name}</h3></div><div className="cw-viewer-tools"><button type="button" className="cw-icon-button cw-zoom" onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>{zoomed ? 'Fit screen' : 'Zoom in'}</button><button type="button" className="cw-icon-button" onClick={close} aria-label="Close screenshot gallery" autoFocus><PiX size={22} /></button></div></header>
        <div className="cw-viewer-image" role={zoomed ? 'region' : undefined} tabIndex={zoomed ? 0 : undefined} aria-label={zoomed ? 'Zoomed screenshot. Scroll to inspect the interface.' : undefined}>{viewerFailedSrc === images[viewer.index] ? <p className="cw-image-error">This screenshot is unavailable. Use the arrow controls to see another screen.</p> : <img key={images[viewer.index]} src={resolveImage(images[viewer.index])} alt={`${viewer.project.name}, full screenshot ${viewer.index + 1}`} onError={() => setViewerFailedSrc(images[viewer.index])} />}</div>
        <nav className="cw-thumbnails" aria-label="Project screenshots">{images.map((src, index) => <button type="button" key={`${src}-${index}`} aria-label={`Show screenshot ${index + 1}`} aria-current={index === viewer.index ? 'true' : undefined} onClick={() => setViewer({ ...viewer, index })}>
          <img src={resolveImage(src)} alt="" loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span>
        </button>)}</nav>
        <footer><p aria-live="polite">Screenshot {viewer.index + 1} of {images.length}</p><div><button type="button" className="cw-icon-button" onClick={() => step(-1)} disabled={images.length < 2} aria-label="Previous screenshot"><PiArrowLeft size={22} /></button><button type="button" className="cw-icon-button" onClick={() => step(1)} disabled={images.length < 2} aria-label="Next screenshot"><PiArrowRight size={22} /></button><a href={projectHref(viewer.project.slug)}>View case study<PiArrowUpRight size={18} /></a></div></footer>
      </div>
    </dialog>}
  </section>;
}
