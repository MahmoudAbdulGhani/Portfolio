export const collectionTiming = { articulation: 0.82, handoff: 0.24, opening: 0.98, returning: 0.56 } as const;
export type CollectionPhase = 'idle' | 'selecting' | 'opening' | 'active' | 'closing';
export type RigRenderer = 'loading' | 'webgl' | 'fallback' | 'reduced' | 'photographic';

// One selection owns one state store. Route/source replacement retires the
// entire scene; decorative engine notifications cannot reopen a closing scene.
export function createCollectionMotion(selected: boolean, reduced: boolean, restored: boolean) {
  let state = {
    phase: (!selected ? 'idle' : reduced || restored ? 'active' : 'selecting') as CollectionPhase,
    renderer: (reduced ? 'reduced' : restored ? 'photographic' : 'loading') as RigRenderer,
    reduced, allowGPU: selected && !reduced && !restored,
  };
  const listeners = new Set<() => void>();
  const update = (next: typeof state) => { state = next; listeners.forEach(notify => notify()); };
  return {
    snapshot: () => state,
    subscribe: (notify: () => void) => { listeners.add(notify); return () => { listeners.delete(notify); }; },
    rendererReady: (renderer: 'webgl' | 'fallback') => { if (state.allowGPU) update({ ...state, renderer }); },
    restore: () => {
      if (state.phase !== 'active' || state.allowGPU) update({ ...state, phase: 'active', renderer: 'photographic', allowGPU: false });
    },
    open: () => {
      if (state.phase !== 'selecting') return false;
      update({ ...state, phase: 'opening' }); return true;
    },
    activate: () => {
      if (state.phase === 'selecting' || state.phase === 'opening') update({ ...state, phase: 'active' });
    },
    close: () => {
      if (state.phase === 'idle' || state.phase === 'closing') return false;
      update({ ...state, phase: 'closing' }); return true;
    },
    preference: (reduced: boolean) => update({ ...state, reduced, allowGPU: state.allowGPU && !reduced, renderer: reduced ? 'reduced' : state.renderer,
      phase: reduced && (state.phase === 'selecting' || state.phase === 'opening') ? 'active' : state.phase }),
  };
}
