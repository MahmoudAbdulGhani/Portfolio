import { projectImages, type ProjectImageAsset } from "../generated/project-images";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactEventHandler, type Ref } from 'react';
import { useMotionPreference } from '../lib/use-motion-preference';
import './responsive-project-image.css';

type Props = { src: string; alt: string; className?: string; sizes: string; priority?: boolean; loading?: 'eager' | 'lazy'; imageRef?: Ref<HTMLImageElement>; fit?: 'natural' | 'frame'; sources?: ProjectImageAsset; original?: boolean; retainPrevious?: boolean; onReadyImage?: (image: HTMLImageElement) => void; onLoad?: ReactEventHandler<HTMLImageElement>; onError?: ReactEventHandler<HTMLImageElement> };

function ProjectImagePicture({ src, alt, className, sizes, priority = false, loading = priority ? 'eager' : 'lazy', imageRef, fit = 'natural', sources, original, onLoad, onError }: Props) {
  const asset = original ? undefined : sources ?? projectImages[src];
  // A contained image needs a bounded picture too: intrinsic image height must
  // never determine the height of a fixed-aspect preview's flex item.
  if (fit === 'frame') return <picture className="responsive-project-image-frame">
    {asset && <><source type="image/avif" srcSet={asset.avif} sizes={sizes} /><source type="image/webp" srcSet={asset.webp} sizes={sizes} /></>}
    <img ref={imageRef} src={src} srcSet={asset?.webp} sizes={sizes} alt={alt} width={asset?.width} height={asset?.height} loading={loading} fetchPriority={priority ? "high" : "auto"} decoding="async" className={className} onLoad={onLoad} onError={onError} />
  </picture>;
  if (!asset) return <img ref={imageRef} src={src} alt={alt} loading={loading} fetchPriority={priority ? "high" : "auto"} decoding="async" className={className} onLoad={onLoad} onError={onError} />;
  return <picture><source type="image/avif" srcSet={asset.avif} sizes={sizes} /><source type="image/webp" srcSet={asset.webp} sizes={sizes} /><img ref={imageRef} src={src} srcSet={asset.webp} sizes={sizes} alt={alt} width={asset.width} height={asset.height} loading={loading} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ backgroundImage: `url(${asset.placeholder})`, backgroundSize: "cover" }} className={className} onLoad={onLoad} onError={onError} /></picture>;
}

type Snapshot = { src: string; url: string; width: number; height: number };
export function ResponsiveProjectImage(props: Props) {
  return props.retainPrevious ? <RetainedProjectImage {...props} /> : <ProjectImagePicture {...props} />;
}

function RetainedProjectImage(props: Props) {
  const [lastReady, setLastReady] = useState<Snapshot | null>(null);
  const remember = useCallback((snapshot: Snapshot) => setLastReady(previous => previous?.url === snapshot.url && previous.src === snapshot.src ? previous : snapshot), []);
  return <ImageHandoffAttempt key={`${props.src}:${Boolean(props.original)}`} {...props} previous={lastReady} remember={remember} />;
}

function ImageHandoffAttempt({ previous, remember, onReadyImage, onLoad, onError, imageRef, ...props }: Props & { previous: Snapshot | null; remember: (snapshot: Snapshot) => void }) {
  const image = useRef<HTMLImageElement>(null), active = useRef(true), finished = useRef(false);
  const [old, setOld] = useState(previous);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const reduced = useMotionPreference();
  useImperativeHandle(imageRef, () => image.current!);
  const ready = useCallback(() => {
    const node = image.current;
    if (!active.current || finished.current || !node?.naturalWidth) return;
    finished.current = true;
    setStatus('ready');
    remember({ src: props.src, url: node.currentSrc || node.src, width: node.naturalWidth, height: node.naturalHeight });
    onReadyImage?.(node);
  }, [props.src, remember, onReadyImage]);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth > 0 && status === 'loading') {
      const cached = setTimeout(ready, 0);
      return () => clearTimeout(cached);
    }
  }, [ready, status]);
  useEffect(() => {
    if (!old || status !== 'ready') return;
    const handoff = setTimeout(() => setOld(null), reduced ? 0 : 220);
    return () => clearTimeout(handoff);
  }, [old, status, reduced]);
  return <span className={`project-image-handoff ${props.fit === 'frame' ? 'is-frame' : 'is-natural'}`} data-image-state={status}
    style={{ aspectRatio: props.fit !== 'frame' && old && status === 'loading' ? `${old.width} / ${old.height}` : undefined }}>
    {old && <span className="project-image-previous" aria-hidden="true"><img src={old.url} alt="" /></span>}
    <span className="project-image-current">
      <ProjectImagePicture {...props} imageRef={image} onLoad={event => { ready(); onLoad?.(event); }} onError={event => {
        if (!active.current) return;
        finished.current = true; setStatus('failed'); onError?.(event);
      }} />
    </span>
  </span>;
}
