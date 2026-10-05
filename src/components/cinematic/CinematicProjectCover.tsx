import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { PiArrowLeft, PiArrowRight, PiArrowsOutSimple, PiPause, PiPlay, PiLockSimple } from 'react-icons/pi';
import type { GalleryProject } from './CinematicProjects';
import { coverDirections } from './project-cover-directions';
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

interface Props {
  project: GalleryProject;
  active: boolean;
  paused: boolean;
  priority: boolean;
  resolveImage: (url: string) => string;
  onOpen: (index: number) => void;
}

export function CinematicProjectCover({ project, active, paused, priority, resolveImage, onOpen }: Props) {
  const direction = coverDirections[project.slug] ?? {
    theme: 'lobby', category: 'FEATURED PRODUCT', headline: project.name, emphasis: '', features: project.stack.slice(0, 3), screens: [{ index: 0, label: 'Product overview' }],
  };
  const sources = project.screenshots?.length ? project.screenshots : project.coverImage ? [project.coverImage] : [];
  const frames = direction.screens.filter((frame) => sources[frame.index]);
  if (!frames.length && sources.length) frames.push({ index: 0, label: 'Product overview' });
  const frameSignature = frames.map((frame) => `${frame.index}:${sources[frame.index]}`).join('|');
  const [selection, setSelection] = useState({ current: 0, previous: 0 });
  const [userPaused, setUserPaused] = useState(false);
  const [loaded, setLoaded] = useState('');
  const [failed, setFailed] = useState<string | null>(null);
  const image = useRef<HTMLImageElement>(null);
  const outgoing = useRef<HTMLImageElement>(null);
  const viewport = useRef<HTMLButtonElement>(null);
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, () => true);
  const visible = useSyncExternalStore(subscribeVisibility, visibilitySnapshot, () => false);
  const current = Math.min(selection.current, Math.max(0, frames.length - 1));
  const frame = frames[current];
  const src = frame ? resolveImage(sources[frame.index]) : '';
  const previous = frames[Math.min(selection.previous, Math.max(0, frames.length - 1))];
  const previousSrc = previous ? resolveImage(sources[previous.index]) : '';
  const running = active && !paused && !userPaused && !reduced && visible && loaded === src && failed !== src;

  useEffect(() => {
    if (!active) return;
    const preloads = frames.map((item) => {
      const preload = new Image();
      preload.src = resolveImage(sources[item.index]);
      return preload;
    });
    return () => { preloads.forEach((preload) => { preload.onload = null; }); };
    // The signature includes the actual CMS URLs and frame order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, frameSignature, resolveImage]);

  useEffect(() => {
    const target = image.current;
    const old = outgoing.current;
    const mask = viewport.current;
    if (!target || !mask || loaded !== src) return;
    gsap.set(target, { opacity: 1, y: 0 });
    if (old) gsap.set(old, { opacity: 0, y: 0 });
    if (!running) return;
    let timeline: gsap.core.Timeline;
    let measuredWidth = mask.clientWidth;
    const animate = (crossfade: boolean) => {
      timeline?.kill();
      gsap.set(target, { opacity: 1, y: 0 });
      if (old) gsap.set(old, { opacity: 0 });
      timeline = gsap.timeline();
      if (crossfade && previousSrc !== src && old) {
        gsap.set(old, { opacity: 1 });
        timeline.fromTo(target, { opacity: 0 }, { opacity: 1, duration: .65, ease: 'power2.inOut' }, 0)
          .to(old, { opacity: 0, duration: .65 }, 0);
      }
      const overflow = Math.max(0, target.getBoundingClientRect().height - mask.clientHeight);
      if (overflow > 8) timeline.to(target, { y: -Math.min(overflow, mask.clientHeight * .65), duration: 2.7, ease: 'power1.inOut' }, 1.25);
      if (frames.length > 1) timeline.call(() => {
        setSelection((value) => ({ current: (value.current + 1) % frames.length, previous: value.current }));
      }, [], 4.6);
    };
    animate(true);
    const observer = new ResizeObserver(() => {
      if (mask.clientWidth !== measuredWidth) {
        measuredWidth = mask.clientWidth;
        animate(false);
      }
    });
    observer.observe(mask);
    return () => {
      observer.disconnect(); timeline.kill();
      gsap.set(target, { opacity: 1, y: 0 });
      if (old) gsap.set(old, { opacity: 0, y: 0 });
    };
  }, [running, loaded, src, previousSrc, frames.length]);

  const select = (index: number) => {
    setUserPaused(true);
    setSelection((value) => ({ current: index, previous: value.current }));
  };

  return <div className={`cw-product-cover cw-product-cover--${direction.theme}`} data-running={running} aria-label={`${project.name} animated product cover`}>
    {direction.environment && <img className="cw-cover-environment" src={direction.environment} alt="" loading={priority ? 'eager' : 'lazy'} decoding="async" />}
    <div className="cw-cover-copy"><p className="cw-cover-category">{direction.category}</p>
      <h4>{direction.headline}<em>{direction.emphasis}</em></h4>
      <p className="cw-cover-features">{direction.features.map((feature) => <span key={feature}>{feature}</span>)}</p>
    </div>
    <div className="cw-cover-product">
      <div className="cw-cover-chrome"><span><PiLockSimple size={12} />{direction.theme === 'cedar' ? 'Cedar Construction' : project.name}</span><span className="cw-cover-screen-label">{frame?.label ?? 'Product preview'}</span></div>
      <button ref={viewport} className="cw-cover-viewport" type="button" disabled={!frame} onClick={() => frame && onOpen(frame.index)} aria-label={`Enlarge ${project.name}: ${frame?.label ?? 'product preview'}`}>
        {src && failed !== src ? <>
          {previousSrc !== src && <img ref={outgoing} className="cw-cover-screen cw-cover-screen--outgoing" style={{ opacity: loaded === src ? 0 : 1 }} src={previousSrc} alt="" aria-hidden="true" />}
          <img ref={image} key={src} className="cw-cover-screen" src={src} alt={`${project.name}: ${frame.label}`} loading={priority || active ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(src)} onError={() => setFailed(src)} />
          <span className="cw-cover-enlarge"><PiArrowsOutSimple size={18} /><span>Inspect screen</span></span>
        </> : <span className="cw-cover-unavailable">{src ? 'Preview unavailable. Open the gallery for more screens.' : 'Product screenshots coming soon.'}</span>}
      </button>
    </div>
    <div className="cw-cover-controls">
      <div className="cw-cover-steps" aria-label={`${project.name} preview screens`}>{frames.map((item, index) => <button type="button" key={item.index} aria-label={`${project.name}: ${item.label}`} aria-current={current === index ? 'true' : undefined} onClick={() => select(index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong></button>)}</div>
      <div className="cw-cover-transport">
        <button type="button" aria-label={`Previous ${project.name} preview`} disabled={frames.length < 2} onClick={() => select((current - 1 + frames.length) % frames.length)}><PiArrowLeft size={18} /></button>
        <button type="button" className="cw-cover-play" aria-label={`${userPaused ? 'Play' : 'Pause'} ${project.name} preview`} aria-pressed={userPaused || paused || reduced} disabled={paused || reduced || frames.length < 2} onClick={() => setUserPaused(!userPaused)}>{userPaused || paused || reduced ? <PiPlay size={16} /> : <PiPause size={16} />}<span>{paused || reduced ? 'Still preview' : userPaused ? 'Play' : 'Pause'}</span></button>
        <button type="button" aria-label={`Next ${project.name} preview`} disabled={frames.length < 2} onClick={() => select((current + 1) % frames.length)}><PiArrowRight size={18} /></button>
      </div>
    </div>
  </div>;
}
