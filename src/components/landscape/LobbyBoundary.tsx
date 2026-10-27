import { useEffect, useId, useLayoutEffect, useReducer, useRef } from 'react';
import { gsap } from 'gsap';
import { CaseDisclosure } from './CaseDisclosure';
import { playFiniteMotion, stopFiniteMotion } from './finite-motion';
import { useMotionPreference } from '../../lib/use-motion-preference';
import { initialLobby, lobbyCallPermission, lobbyEvidence, lobbyParticipants, lobbyReducer, type LobbyParticipant } from './lobby-boundary-state';
import type { LobbyState } from './lobby-boundary-state';
import './lobby-boundary.css';

export function LobbyBoundary({ suspended = false, headingLevel = 3, headingId, concise = false, initialState, onStateChange, disclosureOpen = false }: { suspended?: boolean; headingLevel?: 2 | 3; headingId?: string; concise?: boolean; initialState?: LobbyState; onStateChange?: (state: LobbyState) => void; disclosureOpen?: boolean }) {
  const [state, dispatch] = useReducer(lobbyReducer, initialState, value => value ?? initialLobby());
  useEffect(() => { onStateChange?.(state); }, [state, onStateChange]);
  const reduced = useMotionPreference(), id = useId();
  const result = useRef<HTMLDivElement>(null), connection = useRef<SVGGElement>(null);
  const permission = lobbyCallPermission(state), member = state.members.includes(state.participant);
  const blocked = state.participant === 'rowan', allowed = state.phase === 'allowed';
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const Subheading = headingLevel === 2 ? 'h3' : 'h4';
  const step = state.phase === 'inspect' ? 0 : ['joined', 'rejected'].includes(state.phase) ? 1 : 2;
  const source = (file: string) => `${lobbyEvidence.repository}/blob/${lobbyEvidence.revision}/${file}`;
  useLayoutEffect(() => {
    if (!result.current || !connection.current) return;
    const opacity = allowed ? 1 : state.phase === 'inspect' ? 0.45 : 0.75;
    if (reduced || suspended || state.phase === 'inspect') {
      gsap.set(result.current, { opacity: 1 }); gsap.set(connection.current, { opacity }); return;
    }
    const timeline = gsap.timeline({ paused: true });
    timeline.fromTo(result.current, { opacity: 0.65 }, { opacity: 1, duration: 0.18 });
    timeline.to(connection.current, { opacity, duration: 0.38, ease: 'power2.inOut' }, 0);
    playFiniteMotion(timeline);
    return () => stopFiniteMotion(timeline);
  }, [state.phase, state.participant, state.members, allowed, reduced, suspended]);
  const outcome = state.phase === 'allowed' ? 'Call access permitted' : state.phase === 'denied' ? 'Call access denied' : state.phase === 'rejected' ? 'Join rejected' : state.phase === 'joined' ? 'Membership recorded' : 'Inspect the connection';
  const explanation = state.phase === 'rejected' ? 'Rowan is blocked from this room. Having its invitation code does not override the block.' : state.phase === 'joined' ? 'Mira is now a room member. Try to enter the call to check access separately.' : state.phase === 'inspect' ? blocked ? 'Rowan has the same invitation, but a room block prevents joining.' : member ? 'Mira is a room member. Call access still needs an explicit attempt.' : 'Mira has an invitation. A shared code alone is not active membership.' : permission.reason;
  return <section className="lobby-boundary" data-presentation={concise ? 'concise' : undefined} aria-label="Lobby connection and access" data-phase={state.phase} data-participant={state.participant} inert={suspended}>
    <header className="lobby-heading">
      <Heading className="lobby-title" id={headingId} tabIndex={headingId ? -1 : undefined}>A connection becomes access only when the rules allow it.</Heading>
      <p className="lobby-label">{concise ? 'Fictional participants · local demo.' : 'Engineering demonstration — fictional participants.'}</p>
      <ol className="lobby-progress" role="list" aria-label="Lobby demonstration progress">
        {['Inspect', 'Join', 'Try access'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}><span aria-hidden="true" className="lobby-step-number">{index + 1}</span>{label}{index < 2 && <span aria-hidden="true" className="lobby-step-arrow">→</span>}</li>)}
      </ol>
    </header>
    <div className="lobby-body">
      <div className="lobby-content">
        {!concise && <p className="lobby-intro">An invitation offers a connection. Joining the room and entering its call are separate checks.</p>}
        <div className="lobby-participant-control"><label htmlFor={`${id}-participant`}>Fictional participant</label><select id={`${id}-participant`} value={state.participant} onChange={event => dispatch({ type: 'participant', participant: event.target.value as LobbyParticipant })}><option value="mira">Mira · invited</option><option value="rowan">Rowan · blocked from this room</option></select><span>Sample condition selector · both have an invitation.</span></div>
        <dl className="lobby-facts">
          <div><dt>1 Participant</dt><dd>{lobbyParticipants[state.participant]} · session ready</dd></div>
          <div><dt>2 Room</dt><dd>Studio room · active</dd></div>
          <div><dt>Room relationship</dt><dd className="lobby-membership">{member ? 'Active member' : blocked ? 'Blocked · not a member' : 'Invited · not a member'}</dd></div>
          <div><dt>Current call permission</dt><dd className="lobby-permission">{permission.allowed ? 'Eligible for the call check' : 'Not allowed · membership required'}</dd></div>
        </dl>
        <div className="lobby-result" ref={result} data-outcome={state.phase}>
          <Subheading>{outcome}</Subheading><p className="lobby-explanation">{explanation}</p>
          <p className="lobby-invariant">{['denied', 'rejected'].includes(state.phase) ? 'No membership or room-content changes.' : allowed ? 'Illustration only · no real call is opened.' : 'Room contents stay unchanged throughout this demonstration.'}</p>
        </div>
        <div className="lobby-actions"><button className="lobby-primary" onClick={() => dispatch({ type: 'attempt' })}>Try to enter the call</button><button className="lobby-join" onClick={() => dispatch({ type: 'join' })}>Join with the invitation</button><button onClick={() => dispatch({ type: 'reset' })}>Reset</button></div>
        {!concise && <p className="lobby-local-note">Local sample only. Joining models membership; call access models the first permission check, with available capacity assumed.</p>}
      </div>
      <div className="lobby-art" aria-hidden="true" data-renderer="photographic-svg" data-access={allowed ? 'allowed' : 'unresolved'}>
        <svg viewBox="0 0 1254 1254" focusable="false">
          <image href="/landscape/lobby-sculpture.webp" width="1254" height="1254" />
          <g className="lobby-art-markers"><path d="M558 502 L166 1176 H490 M738 820 L1085 1176 H770" /><circle cx="558" cy="502" r="48" /><text x="558" y="525">1</text><circle cx="738" cy="820" r="48" /><text x="738" y="843">2</text></g>
          <g className="lobby-connection" ref={connection}><path className="lobby-connection-first" d="M558 555 L638 652" /><path className="lobby-connection-second" d="M670 692 L738 767" /><path className="lobby-connection-bridge" d="M638 652 L670 692" /></g>
        </svg>
        <div className="lobby-art-labels"><div><strong>1 Pale ribbon</strong><span>{lobbyParticipants[state.participant]} · offered connection</span></div><div><strong>2 Dark ribbon</strong><span>Studio room · access boundary</span></div></div>
        <p className="lobby-art-result">{allowed ? 'Connection permitted' : state.phase === 'denied' || state.phase === 'rejected' ? 'Connection denied · gap remains' : 'Connection awaits the checks'}</p>
      </div>
    </div>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{state.announcement}</p>
    <CaseDisclosure defaultOpen={disclosureOpen} className="lobby-disclosure" title="Source basis and demonstration limits">
      {concise && <p className="lobby-local-note">Local sample only. Joining models membership; call access models the first permission check, with available capacity assumed.</p>}
      <p>This describes the team’s implementation, not individual authorship. Mahmoud’s documented contribution covers authenticated and guest access, invitations, validation and Supabase-backed workflows; the full team and role remain in the case study. Ribbon labels are artistic associations. The photograph stays fixed; only explanatory guides receive brief emphasis.</p>
      <p>The shared guest-room link carries a room code. The browser establishes a Supabase session (including anonymous guests) and invokes guest.join_channel. The SQL function checks identity, normalized code, active/unexpired room, room blocks and display-name rules. It restores an eligible existing membership or creates one after a capacity check. A block is checked before either write. Joining changes membership and room activity; it does not consume an invitation record. Existing eligible membership can be reused, and the new-member capacity check follows the restore branch.</p>
      <p>CallsService.authorizeMembership independently requires a room and membership with no left_at or removed_at, then checks active status and room expiry. The guarded HTTP token route validates the request/session before that service. Token issuance also checks LiveKit availability and call capacity, with an exception for an identity already in the call. These later operations are not simulated here.</p>
      <p>Guest data SELECT policies and published Postgres Changes use guest.is_active_channel_member, matching the active-membership condition. The helper itself does not check room status or expiry, unlike call authorization. A separate membership policy lets a removed user read their own membership change. Supabase subscriptions are distinct from LiveKit media; this inspection does not establish immediate revocation of an existing connection or prove production security.</p>
      <p>Mira, Rowan, Studio room, a ready session, valid shared code, unexpired room and available capacity are fictional fixed inputs. The participant selector, Reset, progress display and explicit reattempt are teaching controls. Rowan’s pre-existing block models a supported rejection; this demo never creates a real block. It uses in-memory state only: no invitations, room-content fetches, sockets, media permissions or backend writes. The actual Lobby database, policies and LiveKit integration were not executed.</p>
      <p>Explore the guest-access and call-access code below.</p>
      <ul>{[
        ['Invitation and membership rules', 'apps/api/supabase/migrations/20260808070905_guest_member_moderation.sql'],
        ['Guest identity and data policies', 'apps/api/supabase/migrations/20260805153246_use_supabase_anonymous_auth.sql'],
        ['Shared link and room subscriptions', 'apps/web/src/app/features/guest-room/services/guest-channel.store.ts'],
        ['HTTP call authorization and media grants', 'apps/api/src/modules/calls/calls.service.ts'],
        ['Guarded call routes', 'apps/api/src/modules/calls/calls.controller.ts'],
      ].map(([label, file]) => <li key={file}><a href={source(file)} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul>
    </CaseDisclosure>
  </section>;
}
