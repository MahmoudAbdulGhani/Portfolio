// A local teaching subset, not a Lobby client or a backend security test.
export const lobbyEvidence = {
  repository: 'https://github.com/Ahmad-khalaf517/lobby',
  revision: '2c8b1d3948b799acfe76d2559723aace143a1f52',
};
export const lobbyParticipants = { mira: 'Mira', rowan: 'Rowan' };
export type LobbyParticipant = keyof typeof lobbyParticipants;
export type LobbyCallFacts = { roomExists: boolean; activeMember: boolean; roomActive: boolean; roomExpired: boolean };
export function evaluateLobbyCall(facts: LobbyCallFacts) {
  // CallsService.authorizeMembership checks these in this order.
  if (!facts.roomExists) return { allowed: false, reason: 'The room was not found.' };
  if (!facts.activeMember) return { allowed: false, reason: 'Active room membership is required before entering the call.' };
  if (!facts.roomActive || facts.roomExpired) return { allowed: false, reason: 'The room is no longer active.' };
  return { allowed: true, reason: 'Active membership and an active room permit the next call step.' };
}
export type LobbyState = {
  participant: LobbyParticipant;
  members: LobbyParticipant[];
  phase: 'inspect' | 'denied' | 'joined' | 'allowed' | 'rejected';
  announcement: string;
};
export type LobbyAction = { type: 'participant'; participant: LobbyParticipant } | { type: 'attempt' | 'join' | 'reset' };
export const initialLobby = (): LobbyState => ({ participant: 'mira', members: [], phase: 'inspect', announcement: '' });
export const lobbyCallPermission = (state: LobbyState) => evaluateLobbyCall({ roomExists: true, activeMember: state.members.includes(state.participant), roomActive: true, roomExpired: false });
export function lobbyReducer(state: LobbyState, action: LobbyAction): LobbyState {
  if (action.type === 'reset') return { ...initialLobby(), announcement: 'Demonstration reset. Mira has an invitation and has not joined the room.' };
  if (action.type === 'participant') {
    if (!(action.participant in lobbyParticipants) || action.participant === state.participant) return state;
    return { ...state, participant: action.participant, phase: 'inspect', announcement: `${lobbyParticipants[action.participant]} selected. ${action.participant === 'rowan' ? 'Blocked from joining this fictional room.' : state.members.includes('mira') ? 'Active room member.' : 'Invited, not yet a room member.'}` };
  }
  const name = lobbyParticipants[state.participant];
  if (action.type === 'join') {
    // guest.join_channel rejects a channel_blocks entry before restoring/inserting membership.
    if (state.participant === 'rowan') return { ...state, phase: 'rejected', announcement: 'Join rejected. Rowan is blocked from this room. Membership and room contents are unchanged.' };
    return { ...state, members: state.members.includes('mira') ? state.members : [...state.members, 'mira'], phase: 'joined', announcement: 'Mira joined the fictional room. Active membership is recorded. Try call access separately.' };
  }
  const permission = lobbyCallPermission(state);
  return { ...state, phase: permission.allowed ? 'allowed' : 'denied', announcement: `${name}: ${permission.allowed ? 'call access permitted' : 'call access denied'}. ${permission.reason}${permission.allowed ? ' No real call is opened.' : ' Membership and room contents are unchanged.'}` };
}
