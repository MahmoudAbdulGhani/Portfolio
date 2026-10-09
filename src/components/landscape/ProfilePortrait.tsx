import './profile-portrait.css';
import { profilePortrait } from '../../generated/profile-portrait';

// Mirror the accepted portrait column and its internal padding, rather than
// advertising the entire viewport column as the image's rendered width.
const sizes = '(max-width: 719px) calc(49.28vw - 20px), (max-width: 1050px) calc(29.92vw - 40px), calc(28.16vw - 40px)';

export function ProfilePortrait({ name, photo }: { name: string; photo?: string | null }) {
  // Replace the old local default with the user's supplied photograph. A future
  // CMS photo still takes precedence, without applying a person-specific mask.
  const useCutout = !photo || photo === '/myphoto.jpeg';
  return (
    <div className={`portrait-panel ${useCutout ? 'is-cutout' : 'is-cms-photo'}`}>
      <img
        src={useCutout ? profilePortrait.src : photo}
        srcSet={useCutout ? profilePortrait.srcSet : undefined}
        sizes={useCutout ? sizes : undefined}
        width={useCutout ? profilePortrait.width : undefined}
        height={useCutout ? profilePortrait.height : undefined}
        alt={name}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}
