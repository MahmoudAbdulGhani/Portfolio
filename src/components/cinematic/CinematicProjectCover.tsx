import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { PiArrowsOutSimple } from 'react-icons/pi';
import type { GalleryProject } from './CinematicProjects';
import { coverDirections, projectPreviewImages } from './project-cover-directions';
import './project-covers.css';

const subscribeMotion = (callback: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
const reducedSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const subscribeVisibility = (callback: () => void) => {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
};
const visibilitySnapshot = () => document.visibilityState === 'visible';

type DeviceKind = 'laptop' | 'phone' | 'tablet';
interface Props {
  project: GalleryProject;
  active: boolean;
  paused: boolean;
  priority: boolean;
  resolveImage: (url: string) => string;
  onOpen: (index: number) => void;
}

function DeviceScreen({ kind, src, label, native, running, priority, onOpen }: {
  kind: DeviceKind; src: string; label: string; native: boolean; running: boolean; priority: boolean; onOpen: () => void;
}) {
  const viewport = useRef<HTMLButtonElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState('');
  const [failed, setFailed] = useState('');
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const mask = viewport.current;
    const target = image.current;
    if (!mask || !target || loaded !== src || failed === src) return;
    let timeline: gsap.core.Timeline | undefined;
    const measure = () => {
      timeline?.kill();
      // Fit the entire source width. Only genuine vertical overflow scrolls;
      // a desktop screenshot cannot become responsive through zoom/cropping.
      const ratio = target.naturalWidth / target.naturalHeight;
      const width = mask.clientWidth;
      target.style.width = `${width}px`;
      const height = width / ratio;
      const distance = Math.max(0, height - mask.clientHeight);
      setScrollable(distance >= 2);
      const currentY = Number(gsap.getProperty(target, 'y')) || 0;
      gsap.set(target, { x: 0, y: distance < 2 ? 0 : Math.max(-distance, Math.min(0, currentY)) });
      if (!running || distance < 2) return;
      const delay = { laptop: 1.1, phone: 1.7, tablet: 2.3 }[kind];
      const duration = { laptop: 5.2, phone: 5.8, tablet: 6.4 }[kind];
      timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
      timeline.to(target, { y: -distance, duration, ease: 'power1.inOut' }, delay)
        .to(target, { y: 0, duration: 1.8, ease: 'power2.inOut' }, `+=1.5`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(mask);
    return () => { observer.disconnect(); timeline?.kill(); };
  }, [running, loaded, failed, src, kind]);

  return <div className={`cw-device cw-device--${kind}`} data-device={kind} data-source={native ? 'responsive' : 'cms'} data-running={running && scrollable && loaded === src && failed !== src}>
    <img className="cw-device-frame" src={`/projects/devices/${kind}.webp`} alt="" aria-hidden loading={priority ? 'eager' : 'lazy'} draggable={false} />
    <button ref={viewport} type="button" className="cw-device-screen" aria-label={`Enlarge ${label}`} onClick={onOpen}>
      {failed === src ? <span className="cw-device-error">Preview unavailable</span> : <img ref={image} src={src} alt={label} loading={priority ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(src)} onError={() => setFailed(src)} draggable={false} />}
      <span className="cw-device-inspect" aria-hidden><PiArrowsOutSimple size={18} /></span>
    </button>
  </div>;
}

export function CinematicProjectCover({ project, active, paused, priority, resolveImage, onOpen }: Props) {
  const direction = coverDirections[project.slug];
  const sources = project.screenshots?.length ? project.screenshots : project.coverImage ? [project.coverImage] : [];
  const frames = (direction?.screens ?? sources.slice(0, 3).map((_, index) => ({ index, label: `Screen ${index + 1}` }))).filter(frame => sources[frame.index]);
  if (!frames.length && sources.length) frames.push({ index: 0, label: 'Product overview' });
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, () => true);
  const visible = useSyncExternalStore(subscribeVisibility, visibilitySnapshot, () => false);
  const running = active && !paused && !reduced && visible;
  const kinds: DeviceKind[] = ['laptop', 'phone', 'tablet'];
  const gallery = projectPreviewImages(project);
  return <div className="cw-product-cover cw-device-composition" aria-label={`${project.name}: three independently scrolling screens`} data-running={running}>
    {frames.map((frame, index) => {
      const kind = kinds[index];
      const capture = kind === 'laptop' ? undefined : direction?.responsive?.[kind];
      const source = capture?.src ?? sources[frame.index];
      return <DeviceScreen key={`${kind}:${source}`} kind={kind} native={Boolean(capture)} src={resolveImage(source)} label={`${project.name}: ${capture?.label ?? frame.label}`} running={running} priority={priority || active} onOpen={() => onOpen(gallery.indexOf(source))} />;
    })}
    {!frames.length && <p className="cw-device-error">Project screenshots coming soon.</p>}
  </div>;
}
