import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { PiArrowsOutSimple, PiDesktop, PiDeviceMobile, PiDeviceTablet } from 'react-icons/pi';
import type { GalleryProject } from './CinematicProjects';
import { coverDirections, projectPreviewImages } from './project-cover-directions';
import { CaseScreenshot } from '../CaseScreenshot';
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
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const inspecting = hovered || focused;
  const inspectionRef = useRef(inspecting);
  useEffect(() => {
    inspectionRef.current = inspecting;
    timelineRef.current?.paused(inspecting);
  }, [inspecting]);
  useEffect(() => {
    const mask = viewport.current;
    const target = image.current;
    if (!mask || !target || loaded !== src || failed === src) return;
    let timeline: gsap.core.Timeline | undefined;
    const measure = () => {
      timeline?.kill();
      timelineRef.current = null;
      // Laptop previews fill the real screen opening proportionally. Wide
      // captures keep the navigation at the left; the viewer retains the full
      // image. Responsive phone/tablet captures always fit their entire width.
      const ratio = target.naturalWidth / target.naturalHeight;
      const width = kind === 'laptop' ? Math.max(mask.clientWidth, mask.clientHeight * ratio) : mask.clientWidth;
      target.style.width = `${width}px`;
      const height = width / ratio;
      const distance = Math.max(0, height - mask.clientHeight);
      setScrollable(distance >= 2);
      const currentY = Number(gsap.getProperty(target, 'y')) || 0;
      gsap.set(target, { x: 0, y: distance < 2 ? 0 : Math.max(-distance, Math.min(0, currentY)) });
      if (!running || distance < 2) return;
      const delay = { laptop: 3, phone: 3.6, tablet: 4.2 }[kind];
      const duration = { laptop: 7, phone: 8, tablet: 9 }[kind];
      timeline = gsap.timeline({ repeat: -1, repeatDelay: 2, paused: inspectionRef.current });
      timelineRef.current = timeline;
      timeline.to(target, { y: -distance, duration, ease: 'power1.inOut' }, delay)
        .to(target, { y: 0, duration: 2.4, ease: 'power2.inOut' }, '+=3');
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(mask);
    return () => { observer.disconnect(); timeline?.kill(); timelineRef.current = null; };
  }, [running, loaded, failed, src, kind]);

  return <div className={`cw-device cw-device--${kind}`} data-device={kind} data-source={native ? 'responsive' : 'cms'} data-running={running && !inspecting && scrollable && loaded === src && failed !== src}>
    <img className="cw-device-frame" src={`/projects/devices/${kind}.webp`} alt="" aria-hidden loading={priority ? 'eager' : 'lazy'} draggable={false} />
    <button ref={viewport} type="button" className="cw-device-screen" aria-label={`Enlarge ${label}`} onClick={onOpen} onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      {failed === src ? <span className="cw-device-error">Preview unavailable</span> : <img ref={image} src={src} alt={label} loading={priority ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(src)} onError={() => setFailed(src)} draggable={false} />}
      <span className="cw-device-inspect" aria-hidden><PiArrowsOutSimple size={18} /></span>
    </button>
  </div>;
}

export function CinematicProjectCover({ project, active, paused, priority, resolveImage, onOpen }: Props) {
  const direction = coverDirections[project.slug];
  const [focusedDevice, setFocusedDevice] = useState(1);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const sources = project.screenshots?.length ? project.screenshots : project.coverImage ? [project.coverImage] : [];
  const frames = (direction?.screens ?? sources.slice(0, 3).map((_, index) => ({ index, label: `Screen ${index + 1}` }))).filter(frame => sources[frame.index]);
  if (!frames.length && sources.length) frames.push({ index: 0, label: 'Product overview' });
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, () => true);
  const visible = useSyncExternalStore(subscribeVisibility, visibilitySnapshot, () => false);
  const running = active && !paused && !reduced && visible;
  const kinds: DeviceKind[] = ['laptop', 'phone', 'tablet'];
  const gallery = projectPreviewImages(project);
  const deviceScreens = frames.map((frame, index) => {
    const kind = kinds[index];
    const capture = kind === 'laptop' ? undefined : direction?.responsive?.[kind];
    return { kind, src: capture?.src ?? sources[frame.index], label: capture?.label ?? frame.label, viewport: kind === 'laptop' ? undefined : kind };
  });
  const selected = Math.min(focusedDevice, deviceScreens.length - 1);
  const screen = deviceScreens[selected];
  const select = (index: number, focus = false) => { setFocusedDevice(index); if (focus) buttons.current[index]?.focus(); };
  const titles = ['Desktop', 'Phone', 'Tablet'];
  const icons = [PiDesktop, PiDeviceMobile, PiDeviceTablet];
  return <div className="cw-product-cover" aria-label={`${project.name}: three independently scrolling screens`} data-running={running}>
    <div className="cw-device-composition cw-desktop-composition">{frames.map((frame, index) => {
      const kind = kinds[index];
      const capture = kind === 'laptop' ? undefined : direction?.responsive?.[kind];
      const source = capture?.src ?? sources[frame.index];
      return <DeviceScreen key={`${kind}:${source}`} kind={kind} native={Boolean(capture)} src={resolveImage(source)} label={`${project.name}: ${capture?.label ?? frame.label}`} running={running} priority={priority || active} onOpen={() => onOpen(gallery.indexOf(source))} />;
    })}
    </div>
    {screen && <div className="cw-mobile-showcase">
      <div className="cw-device-tabs" role="tablist" aria-label={`${project.name} device previews`}>{deviceScreens.map((item, index) => { const Icon = icons[index]; return <button type="button" key={item.kind} role="tab" id={`${id}-tab-${index}`} aria-selected={selected === index} aria-controls={`${id}-panel`} tabIndex={selected === index ? 0 : -1} ref={el => { buttons.current[index] = el; }} onClick={() => select(index)} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault(); select(event.key === 'Home' ? 0 : event.key === 'End' ? deviceScreens.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + deviceScreens.length) % deviceScreens.length, true);
      }}><Icon aria-hidden /><span>{titles[index]}</span></button>; })}</div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${selected}`}>
        <CaseScreenshot key={screen.src} screen={{ src: resolveImage(screen.src), label: titles[selected], viewport: screen.viewport }} projectName={project.name} priority={priority} preview pausedByParent={!running} onOpen={() => onOpen(gallery.indexOf(screen.src))} />
      </div>
      <div className="cw-device-companions">{deviceScreens.map((item, index) => index === selected ? null : <div key={item.kind}><button type="button" className="cw-companion-select" onClick={() => select(index)} aria-label={`Focus ${titles[index]} preview for ${project.name}`}><img src={resolveImage(item.src)} alt="" loading="lazy" /><span>{titles[index]}</span></button><button className="cw-companion-expand" type="button" onClick={() => onOpen(gallery.indexOf(item.src))} aria-label={`Enlarge ${project.name}: ${titles[index]}`}>Expand<PiArrowsOutSimple aria-hidden /></button></div>)}</div>
    </div>}
    {!frames.length && <p className="cw-device-error">Project screenshots coming soon.</p>}
  </div>;
}
