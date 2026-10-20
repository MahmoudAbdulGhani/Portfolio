import { useEffect, useRef, useState, type RefObject } from 'react';
import { FiPause, FiPlay, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { initialPlayback, introductionTranscript, PortraitIntroduction } from '../../lib/portrait-introduction';
import { motionQuery } from '../../lib/use-motion-preference';
import './profile-introduction.css';

export function ProfileIntroduction({ host }: { host: RefObject<HTMLDivElement | null> }) {
  const [playback, setPlayback] = useState(initialPlayback);
  const controller = useRef<PortraitIntroduction | null>(null);
  useEffect(() => {
    if (!host.current) return;
    const current = new PortraitIntroduction(host.current, setPlayback); controller.current = current;
    const preference = matchMedia(motionQuery), stage = host.current.closest('.standing-portrait-stage')!;
    let visible = false;
    const sync = () => current.environment({ visible, active: !document.hidden, reduced: preference.matches,
      ready: stage.getAttribute('data-state') === 'ready' && stage.querySelector('.standing-portrait-figure')?.getAttribute('data-entrance') === 'false',
      imageFailed: stage.getAttribute('data-state') === 'error' });
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting && entries[0].intersectionRatio > 0; sync(); });
    observer.observe(stage);
    const imageState = new MutationObserver(sync);
    imageState.observe(stage, { subtree: true, attributes: true, attributeFilter: ['data-state', 'data-entrance'] });
    const exited = () => current.environment({ visible: false, active: false, reduced: preference.matches, ready: false, imageFailed: false });
    preference.addEventListener('change', sync); document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', exited); window.addEventListener('pageshow', sync); sync();
    return () => {
      current.dispose(); controller.current = null; observer.disconnect(); imageState.disconnect();
      preference.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pagehide', exited); window.removeEventListener('pageshow', sync);
    };
  }, [host]);
  const paused = playback.manualPause || playback.state === 'blocked';
  return <section className="portrait-introduction" aria-label="Mahmoud’s introduction" data-playback={playback.state}>
    <div className="portrait-playback-controls">
      <button type="button" aria-label={playback.speech ? 'Mute introduction' : 'Hear introduction'} onClick={() => controller.current?.hear()}>
        {playback.speech ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}<span>{playback.speech ? 'Mute introduction' : 'Hear introduction'}</span>
      </button>
      <button type="button" aria-label={paused ? 'Resume animation' : 'Pause animation'} aria-disabled={playback.animationUnavailable} onClick={() => controller.current?.toggleAnimation()}>
        {paused ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}<span>{paused ? 'Resume' : 'Pause'}</span>
      </button>
    </div>
    <div className="portrait-playback-details">
      <p className="portrait-playback-captions" aria-live="off">{playback.state === 'error' ? 'Animation unavailable. Hear introduction or read the transcript.' : playback.state === 'blocked' ? 'Animation blocked. Use Resume or Hear introduction.' : playback.caption}</p>
      <span className="sr-only" role="status">{playback.message}</span>
      <details className="portrait-transcript"><summary>Read introduction transcript</summary><p>{introductionTranscript}</p></details>
    </div>
  </section>;
}
