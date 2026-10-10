import { projectImages, type ProjectImageAsset } from "../generated/project-images";
import type { ReactEventHandler, Ref } from 'react';
import './responsive-project-image.css';

type Props = { src: string; alt: string; className?: string; sizes: string; priority?: boolean; loading?: 'eager' | 'lazy'; imageRef?: Ref<HTMLImageElement>; fit?: 'natural' | 'frame'; sources?: ProjectImageAsset; onLoad?: ReactEventHandler<HTMLImageElement>; onError?: ReactEventHandler<HTMLImageElement> };

export function ResponsiveProjectImage({ src, alt, className, sizes, priority = false, loading = priority ? 'eager' : 'lazy', imageRef, fit = 'natural', sources, onLoad, onError }: Props) {
  const asset = sources ?? projectImages[src];
  // A contained image needs a bounded picture too: intrinsic image height must
  // never determine the height of a fixed-aspect preview's flex item.
  if (fit === 'frame') return <picture className="responsive-project-image-frame">
    {asset && <><source type="image/avif" srcSet={asset.avif} sizes={sizes} /><source type="image/webp" srcSet={asset.webp} sizes={sizes} /></>}
    <img ref={imageRef} src={src} srcSet={asset?.webp} sizes={sizes} alt={alt} width={asset?.width} height={asset?.height} loading={loading} fetchPriority={priority ? "high" : "auto"} decoding="async" className={className} onLoad={onLoad} onError={onError} />
  </picture>;
  if (!asset) return <img ref={imageRef} src={src} alt={alt} loading={loading} fetchPriority={priority ? "high" : "auto"} decoding="async" className={className} onLoad={onLoad} onError={onError} />;
  return <picture><source type="image/avif" srcSet={asset.avif} sizes={sizes} /><source type="image/webp" srcSet={asset.webp} sizes={sizes} /><img ref={imageRef} src={src} srcSet={asset.webp} sizes={sizes} alt={alt} width={asset.width} height={asset.height} loading={loading} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ backgroundImage: `url(${asset.placeholder})`, backgroundSize: "cover" }} className={className} onLoad={onLoad} onError={onError} /></picture>;
}
