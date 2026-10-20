import { useEffect, useState } from 'react';
import { motionQuery, prefersReducedMotion } from '../../lib/use-motion-preference';
import { ProfilePortrait } from './ProfilePortrait';
import './profile-standing-portrait.css';

// Approved original-photo cutout and documented tone curve. The previous
// portrait is requested only after a failed load, within the reserved stage.
export function ProfileStandingPortrait({ name, photo }: { name: string; photo?: string | null }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [entrance, setEntrance] = useState(false);
  useEffect(() => {
    const media = matchMedia(motionQuery);
    const cancel = () => { if (media.matches) setEntrance(false); };
    media.addEventListener('change', cancel);
    return () => media.removeEventListener('change', cancel);
  }, []);
  return (
    <div className="standing-portrait-stage" data-state={state} aria-busy={state === 'loading'}>
      {state === 'error' ? <>
        <ProfilePortrait name={name} photo={photo} />
        <span className="standing-portrait-status" role="status">Portrait unavailable. Previous portrait shown.</span>
      </> : <>
        <div className="standing-portrait-figure" data-entrance={entrance} onAnimationEnd={() => setEntrance(false)}>
          <img
            className="standing-portrait-image"
            src="/review-assets/profile-original-hands.webp"
            width={960}
            height={1696}
            alt={`${name}, photographed from hair to below both hands, wearing a striped shirt and backpack`}
            fetchPriority="high"
            decoding="async"
            onLoad={() => { setState('ready'); setEntrance(!prefersReducedMotion()); }}
            onError={() => setState('error')}
          />
        </div>
        {state === 'loading' && <span className="standing-portrait-status" role="status">Loading portrait…</span>}
      </>}
    </div>
  );
}
