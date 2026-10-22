import { useEffect, useRef, useState, type RefObject } from 'react';
import { FiPause, FiPlay, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { initialPlayback, introductionTranscript, PortraitIntroduction } from '../../lib/portrait-introduction';
import { motionQuery } from '../../lib/use-motion-preference';
import './profile-introduction.css';

export function ProfileIntroduction({ host }: { host: RefObject<HTMLDivElement | null> }) {
  const [playback, setPlayback] = useState(initialPlayback);
  const controller = useRef<PortraitIntroduction | null>(null);
  const captions = useRef<HTMLParagraphElement>(null);
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
  const revealCaptions = () => {
      // Profile owns a scroll surface above the footer. Reveal the already
      // reserved caption space on an explicit hearing action, once, without
      // moving focus or following each cue. Never scroll the outer document.
      const main = captions.current?.closest('main');
      if (main && captions.current) {
        const viewport = main.getBoundingClientRect();
        const caption = captions.current.getBoundingClientRect();
        const portrait = host.current?.closest('.standing-portrait-stage')?.getBoundingClientRect();
        const bottom = Math.min(viewport.bottom, window.innerHeight);
        let delta = Math.max(0, caption.bottom + 6 - bottom);
        // Keyboard/browser focus can have scrolled the controls to the centre,
        // hiding the face. Bring the full figure back when the group fits.
        if (portrait) {
          const groupHeight = caption.bottom - portrait.top;
          const available = bottom - viewport.top;
          if (groupHeight <= available) {
            const inset = Math.min(6, (available - groupHeight) / 2);
            if (portrait.top - delta < viewport.top + inset) delta = portrait.top - viewport.top - inset;
          } else if (portrait.top < viewport.top) {
            // A very short viewport cannot hold the whole group. Keep captions
            // visible while restoring as much of the figure as space allows.
            delta = caption.bottom + 6 - bottom;
          }
        }
        if (delta !== 0) main.scrollTo({ top: main.scrollTop + delta, behavior: 'instant' });
      }
  };
  const sound = () => { if (playback.muted) revealCaptions(); controller.current?.sound(); };
  const action = playback.manualPause ? 'Resume' : playback.requiresPlay ? 'Play introduction' : 'Pause';
  return <section className="portrait-introduction" aria-label="Mahmoud’s introduction" data-playback={playback.state}>
    <div className="portrait-playback-controls">
      <button type="button" aria-label={playback.muted ? 'Enable sound' : 'Mute introduction'} onClick={sound}>
        {playback.muted ? <FiVolume2 aria-hidden="true" /> : <FiVolumeX aria-hidden="true" />}<span>{playback.muted ? 'Enable sound' : 'Mute'}</span>
      </button>
      <button type="button" aria-label={action === 'Play introduction' ? action : `${action} introduction`} onClick={() => { if (action !== 'Pause') revealCaptions(); controller.current?.toggleAnimation(); }}>
        {action === 'Pause' ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}<span>{action}</span>
      </button>
    </div>
    <div className="portrait-playback-details">
      <p ref={captions} className="portrait-playback-captions" aria-live="off">{playback.state === 'error' ? 'Animation unavailable. Play introduction or read transcript.' : playback.state === 'blocked' ? 'Playback blocked. Use Play introduction.' : playback.caption}</p>
      <span className="sr-only" role="status">{playback.message}</span>
      <details className="portrait-transcript"><summary aria-label="Read introduction transcript">Transcript</summary><p>{introductionTranscript}</p></details>
    </div>
  </section>;
}
