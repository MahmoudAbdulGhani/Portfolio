import { useEffect, useState } from 'react';
import { motionQuery, prefersReducedMotion } from '../../lib/use-motion-preference';
import { ProfilePortrait } from './ProfilePortrait';
import './standing-portrait-prototype.css';

// Explicit review builds only. Original photograph RGB, extracted alpha; no
// generated likeness, video controls or continuing movement.
export function StandingPortraitPrototype({ name, photo }: { name: string; photo?: string | null }) {
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
        <span className="standing-portrait-status" role="status">Standing portrait unavailable. Current portrait shown.</span>
      </> : <>
        <div className="standing-portrait-figure" data-entrance={entrance} onAnimationEnd={() => setEntrance(false)}>
          <span className="standing-portrait-shadow" aria-hidden="true" />
          <img
            className="standing-portrait-image"
            src="/review-assets/profile-standing-original.webp"
            width={326}
            height={1027}
            alt={`${name}, standing with hands together`}
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
