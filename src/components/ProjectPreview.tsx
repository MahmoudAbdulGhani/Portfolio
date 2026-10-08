import { useState } from 'react';
import { ResponsiveProjectImage } from './ResponsiveProjectImage';
import './project-preview.css';

/** Mount with a source key so a replacement screenshot starts in loading state. */
export function ProjectPreview({ src, alt }: { src: string; alt: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  return <div className="work-preview" data-image-state={state} aria-busy={state === 'loading'}>
    {state !== 'failed' && <ResponsiveProjectImage
      src={src}
      alt={alt}
      fit="frame"
      sizes="(max-width: 720px) 90vw, 42vw"
      onLoad={(event) => {
        const image = event.currentTarget;
        void image.decode().then(() => setState('ready'), () => setState('failed'));
      }}
      onError={() => setState('failed')}
    />}
    {state !== 'ready' && <span className="project-preview-status" role="status">
      {state === 'failed' ? 'Preview unavailable. Open the case study.' : 'Loading preview…'}
    </span>}
  </div>;
}
