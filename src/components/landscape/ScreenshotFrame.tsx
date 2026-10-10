import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ResponsiveProjectImage } from '../ResponsiveProjectImage';
import './case-media.css';
import { useMotionPreference } from '../../lib/use-motion-preference';

type Props = {
  src: string; alt: string; label: string; ratio: string; className?: string; buttonClassName?: string;
  style?: CSSProperties; sizes?: string; priority?: boolean; enlarge: (trigger: HTMLButtonElement) => void;
  onImageReady?: (src: string) => void;
};
type Snapshot = { src: string; url: string; fit: string; position: string };

export function ScreenshotFrame(props: Props) {
  const [retry, setRetry] = useState({ src: props.src, attempt: 0 });
  const [lastReady, setLastReady] = useState<Snapshot | null>(null);
  const remember = useCallback((snapshot: Snapshot) => setLastReady(previous => previous?.src === snapshot.src && previous.url === snapshot.url ? previous : snapshot), []);
  const attempt = retry.src === props.src ? retry.attempt : 0;
  // Each source/retry owns its state, observer and deadline. Events from a
  // detached image can only reach its retired attempt, never the current one.
  return <ScreenshotAttempt key={`${props.src}:${attempt}`} {...props} original={attempt > 0} previous={lastReady} remember={remember}
    retry={() => setRetry({ src: props.src, attempt: attempt + 1 })} />;
}

function ScreenshotAttempt({ src, alt, label, ratio, className = '', buttonClassName = '', style, sizes = '90vw', priority = false, enlarge, original, retry, previous, remember, onImageReady }: Props & { original: boolean; retry: () => void; previous: Snapshot | null; remember: (snapshot: Snapshot) => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [eligible, setEligible] = useState(priority);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [old, setOld] = useState(previous);
  const reduced = useMotionPreference();

  useEffect(() => {
    if (eligible) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        setEligible(true);
      }
    }, { rootMargin: '600px 0px' });
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, [eligible]);

  useEffect(() => {
    if (!eligible || status !== 'loading') return;
    // A cached image may finish before React receives its load event.
    if (image.current?.complete && image.current.naturalWidth > 0) {
      const ready = setTimeout(() => setStatus('ready'), 0);
      return () => clearTimeout(ready);
    }
    const deadline = setTimeout(() => setStatus('failed'), 15_000);
    return () => clearTimeout(deadline);
  }, [eligible, status]);
  useEffect(() => {
    const node = image.current;
    if (status !== 'ready' || !node?.naturalWidth) return;
    const styles = getComputedStyle(node);
    remember({ src, url: node.currentSrc || node.src, fit: styles.objectFit, position: styles.objectPosition });
    onImageReady?.(src);
  }, [status, src, remember, onImageReady]);
  useEffect(() => {
    if (!old || status !== 'ready') return;
    const handoff = setTimeout(() => setOld(null), reduced ? 0 : 220);
    return () => clearTimeout(handoff);
  }, [old, status, reduced]);
  const ready = () => setStatus('ready');
  const failed = () => setStatus('failed');
  return <div ref={frame} className={`screenshot-frame ${className}${old ? ' has-previous-image' : ''}`} data-image-state={status} style={{ aspectRatio: ratio, ...style }}>
    {old && <span className="screenshot-previous" aria-hidden="true"><img src={old.url} alt="" style={{ objectFit: old.fit as CSSProperties['objectFit'], objectPosition: old.position }} /></span>}
    <button type="button" className={`screenshot-button ${buttonClassName}`} aria-label={`Enlarge ${label}`} disabled={status === 'failed'} onClick={event => enlarge(event.currentTarget)}>
      {/* Defer URLs until the visibility gate opens, then start immediately.
          Native lazy thresholds vary by browser and cannot own this deadline. */}
      {eligible && (original ? <img ref={image} src={src} alt={alt} loading="eager" onLoad={ready} onError={failed} /> : <ResponsiveProjectImage imageRef={image} src={src} alt={alt} sizes={sizes} priority={priority} loading="eager" fit="frame" onLoad={ready} onError={failed} />)}
    </button>
    {status === 'loading' && <span className="screenshot-status" aria-hidden="true">Loading image…</span>}
    {status === 'failed' && <div className="screenshot-status screenshot-error" role="status"><p>This image is unavailable.</p><button type="button" className="text-link" onClick={retry}>Retry image</button><span>You can also choose another image.</span></div>}
  </div>;
}
