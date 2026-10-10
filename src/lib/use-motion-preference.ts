import { useSyncExternalStore } from 'react';

export const motionQuery = '(prefers-reduced-motion: reduce)';
export const prefersReducedMotion = () => typeof window === 'undefined' || window.matchMedia(motionQuery).matches;
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(motionQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};

// Native preference on the first client render, including later OS changes.
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => true);
}
