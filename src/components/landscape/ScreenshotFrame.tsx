import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ResponsiveProjectImage } from '../ResponsiveProjectImage';
import './case-media.css';

type Props = {
  src: string; alt: string; label: string; ratio: string; className?: string; buttonClassName?: string;
  style?: CSSProperties; sizes?: string; priority?: boolean; enlarge: (trigger: HTMLButtonElement) => void;
};

export function ScreenshotFrame(props: Props) {
  const [retry, setRetry] = useState({ src: props.src, attempt: 0 });
  const attempt = retry.src === props.src ? retry.attempt : 0;
  // Each source/retry owns its state, observer and deadline. Events from a
  // detached image can only reach its retired attempt, never the current one.
  return <ScreenshotAttempt key={`${props.src}:${attempt}`} {...props} original={attempt > 0}
    retry={() => setRetry({ src: props.src, attempt: attempt + 1 })} />;
}

function ScreenshotAttempt({ src, alt, label, ratio, className = '', buttonClassName = '', style, sizes = '90vw', priority = false, enlarge, original, retry }: Props & { original: boolean; retry: () => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [eligible, setEligible] = useState(priority);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

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
  const ready = () => setStatus('ready');
  const failed = () => setStatus('failed');
  return <div ref={frame} className={`screenshot-frame ${className}`} data-image-state={status} style={{ aspectRatio: ratio, ...style }}>
    <button type="button" className={`screenshot-button ${buttonClassName}`} aria-label={`Enlarge ${label}`} disabled={status === 'failed'} onClick={event => enlarge(event.currentTarget)}>
      {/* Defer URLs until the visibility gate opens, then start immediately.
          Native lazy thresholds vary by browser and cannot own this deadline. */}
      {eligible && (original ? <img ref={image} src={src} alt={alt} loading="eager" onLoad={ready} onError={failed} /> : <ResponsiveProjectImage imageRef={image} src={src} alt={alt} sizes={sizes} priority={priority} loading="eager" fit="frame" onLoad={ready} onError={failed} />)}
    </button>
    {status === 'loading' && <span className="screenshot-status" aria-hidden="true">Loading image…</span>}
    {status === 'failed' && <div className="screenshot-status screenshot-error" role="status"><p>This image is unavailable.</p><button type="button" className="text-link" onClick={retry}>Retry image</button><span>You can also choose another image.</span></div>}
  </div>;
}
