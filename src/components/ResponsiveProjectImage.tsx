import { projectImages } from "../generated/project-images";

type Props = { src: string; alt: string; className?: string; sizes: string; priority?: boolean };

export function ResponsiveProjectImage({ src, alt, className, sizes, priority = false }: Props) {
  const asset = projectImages[src];
  if (!asset) return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" className={className} />;
  return <picture><source type="image/avif" srcSet={asset.avif} sizes={sizes} /><source type="image/webp" srcSet={asset.webp} sizes={sizes} /><img src={src} srcSet={asset.webp} sizes={sizes} alt={alt} width={asset.width} height={asset.height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ backgroundImage: `url(${asset.placeholder})`, backgroundSize: "cover" }} className={className} /></picture>;
}
