import './profile-portrait.css';

const portrait = '/landscape/portrait-striped-cutout.webp';

export function ProfilePortrait({ name, photo }: { name: string; photo?: string | null }) {
  // Replace the old local default with the user's supplied photograph. A future
  // CMS photo still takes precedence, without applying a person-specific mask.
  const useCutout = !photo || photo === '/myphoto.jpeg';
  return (
    <div className={`portrait-panel ${useCutout ? 'is-cutout' : 'is-cms-photo'}`}>
      <img
        src={useCutout ? portrait : photo}
        srcSet={useCutout ? '/landscape/portrait-striped-cutout-480w.webp 480w, /landscape/portrait-striped-cutout.webp 768w' : undefined}
        sizes={useCutout ? '(max-width: 719px) 45vw, (max-width: 1050px) 30vw, 32vw' : undefined}
        width={useCutout ? 768 : undefined}
        height={useCutout ? 1259 : undefined}
        alt={name}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}
