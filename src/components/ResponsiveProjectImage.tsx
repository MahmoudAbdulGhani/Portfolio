import { projectImages } from "../generated/project-images";
import type { ReactEventHandler } from 'react';

type Props = { src: string; alt: string; className?: string; sizes: string; priority?: boolean; onLoad?: ReactEventHandler<HTMLImageElement>; onError?: ReactEventHandler<HTMLImageElement> };

export function ResponsiveProjectImage({ src, alt, className, sizes, priority = false, onLoad, onError }: Props) {
  const asset = projectImages[src];
  if (!asset) return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" className={className} onLoad={onLoad} onError={onError} />;
  return <picture><source type="image/avif" srcSet={asset.avif} sizes={sizes} /><source type="image/webp" srcSet={asset.webp} sizes={sizes} /><img src={src} srcSet={asset.webp} sizes={sizes} alt={alt} width={asset.width} height={asset.height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ backgroundImage: `url(${asset.placeholder})`, backgroundSize: "cover" }} className={className} onLoad={onLoad} onError={onError} /></picture>;
}
