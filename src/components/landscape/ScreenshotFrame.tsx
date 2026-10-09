import { useEffect, useState, type CSSProperties } from 'react';
import { ResponsiveProjectImage } from '../ResponsiveProjectImage';
import './case-media.css';

export function ScreenshotFrame({ src, alt, label, ratio, className = '', buttonClassName = '', style, sizes = '90vw', priority = false, enlarge }: {
  src: string; alt: string; label: string; ratio: string; className?: string; buttonClassName?: string;
  style?: CSSProperties; sizes?: string; priority?: boolean; enlarge: (trigger: HTMLButtonElement) => void;
}) {
  const [state, setState] = useState({ src, status: 'loading' });
  const [retry, setRetry] = useState({ src, attempt: 0 });
  const status = state.src === src ? state.status : 'loading';
  const attempt = retry.src === src ? retry.attempt : 0;
  useEffect(() => {
    if (status !== 'loading') return;
    const deadline = setTimeout(() => setState({ src, status: 'failed' }), 15_000);
    return () => clearTimeout(deadline);
  }, [src, status, attempt]);
  const ready = () => setState({ src, status: 'ready' });
  const failed = () => setState({ src, status: 'failed' });
  return <div className={`screenshot-frame ${className}`} data-image-state={status} style={{ aspectRatio: ratio, ...style }}>
    <button type="button" className={`screenshot-button ${buttonClassName}`} aria-label={`Enlarge ${label}`} disabled={status === 'failed'} onClick={event => enlarge(event.currentTarget)}>
      {attempt > 0 ? <img key={`${src}:${attempt}`} src={src} alt={alt} onLoad={ready} onError={failed} /> : <ResponsiveProjectImage key={src} src={src} alt={alt} sizes={sizes} priority={priority} fit="frame" onLoad={ready} onError={failed} />}
    </button>
    {status === 'loading' && <span className="screenshot-status" aria-hidden="true">Loading image…</span>}
    {status === 'failed' && <div className="screenshot-status screenshot-error" role="status"><p>This image is unavailable.</p><button type="button" className="text-link" onClick={() => { setState({ src, status: 'loading' }); setRetry({ src, attempt: attempt + 1 }); }}>Retry image</button><span>You can also choose another image.</span></div>}
  </div>;
}
