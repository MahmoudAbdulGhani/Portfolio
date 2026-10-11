// Fictional, browser-local illustration of the documented review/apply boundary.
// No persistence, provider calls or real profile identifiers.
export type BoundaryPhase = 'rest' | 'propose' | 'review' | 'accept';
export type BoundaryState = {
  phase: BoundaryPhase;
  saved: string;
  revision: number;
  reviewed: { saved: string; revision: number } | null;
  blocked: boolean;
  announcement: string;
};
export type BoundaryAction = 'propose' | 'review' | 'accept' | 'change-saved' | 'reset';
export const proposedLocation = 'Tripoli';
export const initialBoundary = (): BoundaryState => ({
  phase: 'rest', saved: 'Beirut', revision: 1, reviewed: null, blocked: false, announcement: '',
});
export function boundaryReducer(state: BoundaryState, action: BoundaryAction): BoundaryState {
  if (action === 'reset') return { ...initialBoundary(), announcement: 'Demonstration reset. Saved location: Beirut.' };
  if (action === 'propose' && state.phase === 'rest') return { ...state, phase: 'propose', announcement: 'Tripoli proposed. Saved location remains Beirut.' };
  if (action === 'review' && (state.phase === 'propose' || (state.phase === 'review' && state.blocked))) return {
    ...state, phase: 'review', reviewed: { saved: state.saved, revision: state.revision }, blocked: false,
    announcement: `Reviewing ${state.saved} to ${proposedLocation}. Your approval is required.`,
  };
  if (action === 'change-saved' && state.phase === 'review' && state.saved !== 'Byblos') return {
    ...state, saved: 'Byblos', revision: state.revision + 1,
    announcement: 'Saved location changed to Byblos. The old review cannot be applied.',
  };
  if (action === 'accept' && state.phase === 'review' && state.reviewed) {
    if (state.reviewed.revision !== state.revision) return {
      ...state, blocked: true, announcement: 'Old review blocked. Review again before accepting.',
    };
    return { ...state, phase: 'accept', saved: proposedLocation, revision: state.revision + 1,
      announcement: 'Reviewed changes accepted. Saved location: Tripoli.' };
  }
  // Repeated approval, clicks from obsolete phases and interrupted resets cannot write.
  return state;
}
