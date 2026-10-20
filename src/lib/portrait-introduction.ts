import captions from './profile-introduction.en.vtt?raw';

const root = '/media/profile/mahmoud-introduction';
export const introductionCues = [...captions.matchAll(/(\d\d):(\d\d\.\d+) --> (\d\d):(\d\d\.\d+)\r?\n([\s\S]*?)(?=\r?\n\r?\n|$)/g)].map(cue => ({
  start: Number(cue[1]) * 60 + Number(cue[2]), end: Number(cue[3]) * 60 + Number(cue[4]),
  text: cue[5].trim().replace(/\s+/g, ' '),
}));
export const introductionTranscript = introductionCues.map(cue => cue.text).join(' ');
export type PlaybackSnapshot = {
  state: 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';
  audioOnly: boolean; caption: string; message: string;
};
export const initialPlayback: PlaybackSnapshot = { state: 'idle', audioOnly: false, caption: '', message: 'Plays once, with sound.' };

// Each activation owns a fresh element and abortable callbacks. A retired play
// promise can only pause its own element, never the next session's media.
export class PortraitIntroduction {
  private snapshot = initialPlayback;
  private owner?: { media: HTMLMediaElement; abort: AbortController; alpha: boolean; frame?: number };
  private generation = 0;
  private deadline?: ReturnType<typeof setTimeout>;
  private disposed = false;
  constructor(private host: HTMLElement, private publish: (snapshot: PlaybackSnapshot) => void) {}

  private update(patch: Partial<PlaybackSnapshot>) {
    if (this.disposed) return;
    this.snapshot = { ...this.snapshot, ...patch };
    this.publish(this.snapshot);
  }
  private clearDeadline() { clearTimeout(this.deadline); }
  private retire() {
    this.generation++;
    this.clearDeadline();
    const owner = this.owner;
    this.owner = undefined;
    if (owner) {
      owner.abort.abort();
      const media = owner.media;
      if (media instanceof HTMLVideoElement && owner.frame !== undefined) media.cancelVideoFrameCallback(owner.frame);
      media.pause();
      media.removeAttribute('src');
      media.load();
      media.remove();
    }
    this.host.parentElement?.removeAttribute('data-speaking');
  }
  stop(message = 'Stopped. Portrait restored.') {
    this.retire();
    this.update({ state: 'idle', caption: '', message });
  }
  selectAudio(message = 'Still portrait selected. Press Listen to introduction.') {
    this.stop(message);
    this.update({ audioOnly: true });
  }
  reducedMotion(reduce: boolean) {
    if (reduce) this.selectAudio('Reduced motion: still portrait and audio. Press Listen to introduction.');
  }
  private fail(message: string, audioOnly = this.snapshot.audioOnly) {
    this.retire();
    this.update({ state: 'error', audioOnly, caption: '', message });
  }
  pause(message = 'Paused. Resume when you are ready.') {
    if (!this.owner || !['playing', 'loading'].includes(this.snapshot.state)) return;
    this.clearDeadline();
    this.owner.media.pause();
    this.update({ state: 'paused', message });
  }
  private watch(owner: NonNullable<PortraitIntroduction['owner']>) {
    this.clearDeadline();
    this.deadline = setTimeout(() => {
      if (this.owner === owner) this.fail('Loading took too long. Retry, or choose Listen instead.');
    }, 15_000);
  }
  private decoded(owner: NonNullable<PortraitIntroduction['owner']>) {
    if (this.owner !== owner || this.snapshot.state === 'paused') return;
    const video = owner.media;
    if (!(video instanceof HTMLVideoElement) || video.readyState < 2) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 4;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Alpha check unavailable');
      // Sample source pixels, not a scaled whole-frame average. Both delivered
      // first frames have transparent corners; opaque/black decoders fail closed.
      for (const x of [0, video.videoWidth - 4]) {
        context.clearRect(0, 0, 4, 4);
        context.drawImage(video, x, 0, 4, 4, 0, 0, 4, 4);
        const data = context.getImageData(0, 0, 4, 4).data;
        if (!Array.from({ length: 16 }, (_, i) => data[i * 4 + 3]).every(alpha => alpha < 16)) throw new Error('Opaque decoder');
      }
      owner.alpha = true;
      video.muted = false;
      this.host.parentElement?.setAttribute('data-speaking', 'true');
      this.clearDeadline();
      this.update({ state: 'playing', message: 'Playing introduction with sound.' });
    } catch {
      this.fail('Transparent video is unavailable here. Choose Listen instead, then press Listen to introduction.', true);
    }
  }
  async play() {
    if (this.disposed || this.snapshot.state === 'loading') return;
    if (this.snapshot.state === 'playing') { this.pause(); return; }
    if (!this.owner) {
      const video = document.createElement('video');
      if (!this.snapshot.audioOnly && !video.canPlayType('video/webm; codecs="vp9, opus"')) {
        this.fail('Video decoding is unavailable. Press Listen to introduction to use audio.', true);
        return;
      }
      const media = this.snapshot.audioOnly ? document.createElement('audio') : video;
      const owner = { media, abort: new AbortController(), alpha: false };
      this.owner = owner;
      const listen = (event: string, callback: () => void) => media.addEventListener(event, () => {
        if (this.owner === owner && !this.disposed) callback();
      }, { signal: owner.abort.signal });
      media.preload = 'none';
      media.setAttribute('aria-hidden', 'true');
      if (media instanceof HTMLVideoElement) {
        media.playsInline = true;
        media.muted = true;
        media.className = 'standing-portrait-video';
      }
      listen('playing', () => {
        if (this.snapshot.state === 'paused') { media.pause(); return; }
        if (media instanceof HTMLVideoElement && !owner.alpha) {
          if ('requestVideoFrameCallback' in media) {
            (owner as NonNullable<PortraitIntroduction['owner']>).frame = media.requestVideoFrameCallback(() => this.decoded(owner));
          } else this.decoded(owner);
        } else {
          this.clearDeadline();
          this.update({ state: 'playing', message: this.snapshot.audioOnly ? 'Playing audio with the still portrait.' : 'Playing introduction with sound.' });
        }
      });
      listen('waiting', () => {
        if (this.snapshot.state !== 'playing') return;
        this.update({ state: 'loading', message: 'Buffering introduction. You can stop or use audio.' });
        this.watch(owner);
      });
      listen('pause', () => {
        if (!media.ended && ['playing', 'loading'].includes(this.snapshot.state)) this.pause();
      });
      listen('timeupdate', () => this.update({ caption: introductionCues.find(cue => media.currentTime >= cue.start && media.currentTime < cue.end)?.text ?? '' }));
      listen('ended', () => {
        this.retire();
        this.update({ state: 'ended', caption: '', message: 'Introduction finished. Replay whenever you like.' });
      });
      listen('error', () => this.fail(this.snapshot.audioOnly ? 'Audio unavailable. Retry, or read the transcript.' : 'Video unavailable. Choose Listen instead, then press Listen to introduction.', true));
      this.host.append(media);
      // This is the sole request boundary. No media element/source exists until
      // the visitor explicitly activates the native button.
      media.src = this.snapshot.audioOnly ? `${root}.mp3` : `${root}-${matchMedia('(max-width: 719px)').matches ? 480 : 720}.webm`;
    }
    const owner = this.owner, token = this.generation;
    this.update({ state: 'loading', message: 'Loading introduction. Stop is available.' });
    this.watch(owner);
    try {
      await owner.media.play();
      if (this.disposed || this.owner !== owner || token !== this.generation) owner.media.pause();
    } catch (error) {
      if (this.disposed || this.owner !== owner || token !== this.generation) return;
      this.fail(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Playback was blocked. Press play to retry, or choose Listen instead.'
        : 'Introduction could not load. Retry, or choose Listen instead.');
    }
  }
  dispose() { this.disposed = true; this.retire(); }
}
