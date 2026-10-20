import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { initialPlayback, introductionTranscript, PortraitIntroduction } from '../../lib/portrait-introduction';
import { motionQuery } from '../../lib/use-motion-preference';
import './profile-introduction.css';

export function ProfileIntroduction({ host }: { host: RefObject<HTMLDivElement | null> }) {
  const [playback, setPlayback] = useState(initialPlayback);
  const controller = useRef<PortraitIntroduction | null>(null);
  const id = useId();
  useEffect(() => {
    if (!host.current) return;
    const current = new PortraitIntroduction(host.current, setPlayback);
    controller.current = current;
    const preference = matchMedia(motionQuery);
    const changed = () => current.reducedMotion(preference.matches);
    changed(); preference.addEventListener('change', changed);
    const hidden = () => { if (document.hidden) current.pause('Paused while the page is hidden. Resume when you are ready.'); };
    const exited = () => current.stop();
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', exited);
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) current.pause('Paused while the portrait is offscreen. Resume when you are ready.');
    });
    const stage = host.current.closest('.standing-portrait-stage')!;
    observer.observe(stage);
    const imageState = new MutationObserver(() => {
      if (stage.getAttribute('data-state') === 'error') current.selectAudio('Portrait unavailable. The previous portrait and audio remain available.');
    });
    imageState.observe(stage, { attributes: true, attributeFilter: ['data-state'] });
    if (stage.getAttribute('data-state') === 'error') current.selectAudio();
    return () => {
      current.dispose(); controller.current = null;
      observer.disconnect(); imageState.disconnect();
      preference.removeEventListener('change', changed);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', exited);
    };
  }, [host]);
  const { state, audioOnly } = playback;
  const label = state === 'playing' ? 'Pause introduction' : state === 'paused' ? 'Resume introduction' : state === 'loading' ? 'Loading introduction…' : state === 'ended' ? 'Replay introduction' : audioOnly ? 'Listen to introduction' : 'Meet Mahmoud · 12 sec';
  return <section className="portrait-introduction" aria-label="Mahmoud’s introduction" data-playback={state}>
    <div className="portrait-playback-controls">
      <button type="button" aria-describedby={`${id}-sound`} aria-disabled={state === 'loading'} onClick={() => void controller.current?.play()}>{label}</button>
      <button type="button" onClick={() => controller.current?.stop()}>Stop</button>
      <button type="button" aria-pressed={audioOnly} onClick={() => controller.current?.selectAudio()}>Listen instead</button>
    </div>
    <p id={`${id}-sound`} className="portrait-playback-note">With sound · {audioOnly ? 'still portrait + audio' : 'video or audio'}</p>
    <p className="portrait-playback-captions" aria-live="off">{state === 'error' ? 'Playback unavailable. Retry, listen instead or read the transcript.' : playback.caption}</p>
    <span className="sr-only" role="status">{playback.message}</span>
    <details className="portrait-transcript"><summary>Read introduction transcript</summary><p>{introductionTranscript}</p></details>
  </section>;
}
