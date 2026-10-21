import captions from './profile-introduction.en.vtt?raw';

const root = '/media/profile/mahmoud-introduction';
// Editorial cut points for the silent repeat only. The spoken introduction
// always starts at zero and plays through its natural end, including “CV”.
export const portraitLoop = { start: 0.20, end: 11.60 } as const;
export const introductionCues = [...captions.matchAll(/(\d\d):(\d\d\.\d+) --> (\d\d):(\d\d\.\d+)\r?\n([\s\S]*?)(?=\r?\n\r?\n|$)/g)].map(cue => ({
  start: Number(cue[1]) * 60 + Number(cue[2]), end: Number(cue[3]) * 60 + Number(cue[4]), text: cue[5].trim().replace(/\s+/g, ' '),
}));
export const introductionTranscript = introductionCues.map(cue => cue.text).join(' ');
export type PlaybackSnapshot = {
  state: 'idle' | 'loading' | 'looping' | 'speaking' | 'paused' | 'blocked' | 'error';
  speech: boolean; manualPause: boolean; animationUnavailable: boolean; caption: string; message: string;
};
export const initialPlayback: PlaybackSnapshot = { state: 'idle', speech: false, manualPause: false, animationUnavailable: false, caption: '', message: '' };
type Owner = { media: HTMLMediaElement; abort: AbortController; alpha: boolean; buffering: boolean; frame?: number };
type Environment = { visible: boolean; active: boolean; reduced: boolean; ready: boolean; imageFailed: boolean };

// Reuse the same video across visual cycles and spoken takes. Each command
// invalidates pending promises, frames and timers without reloading that file.
export class PortraitIntroduction {
  private snapshot = initialPlayback;
  private env: Environment = { visible: false, active: false, reduced: true, ready: false, imageFailed: false };
  private video?: Owner;
  private audio?: Owner;
  private owner?: Owner;
  private token = 0;
  private desired = false;
  private blocked = false;
  private videoFailed = false;
  private disposed = false;
  private deadline?: ReturnType<typeof setTimeout>;
  constructor(private host: HTMLElement, private publish: (snapshot: PlaybackSnapshot) => void) {}
  private update(patch: Partial<PlaybackSnapshot>) {
    if (this.disposed) return;
    this.snapshot = { ...this.snapshot, ...patch }; this.publish(this.snapshot);
  }
  private get present() { return this.env.visible && this.env.active; }
  private get canLoop() { return this.present && this.env.ready && !this.env.reduced && !this.snapshot.manualPause && !this.videoFailed && !this.blocked; }
  private current(owner: Owner) { return !this.disposed && this.owner === owner; }
  private still() { this.host.parentElement?.removeAttribute('data-video-visible'); }
  private cancel() {
    this.token++; clearTimeout(this.deadline);
    for (const owner of [this.video, this.audio]) {
      if (owner?.frame !== undefined && owner.media instanceof HTMLVideoElement) {
        owner.media.cancelVideoFrameCallback(owner.frame); owner.frame = undefined;
      }
    }
  }
  private pauseMedia() {
    this.desired = false;
    for (const owner of [this.video, this.audio]) if (owner) { owner.media.muted = true; owner.media.pause(); }
  }
  private release(owner?: Owner) {
    if (!owner) return;
    owner.abort.abort(); owner.media.pause(); owner.media.removeAttribute('src'); owner.media.load(); owner.media.remove();
    if (this.owner === owner) this.owner = undefined;
  }
  environment(next: Environment) {
    if (this.disposed) return;
    const wasPresent = this.present, wasReduced = this.env.reduced;
    this.env = next;
    if (next.imageFailed && !this.videoFailed) this.unavailable('Portrait animation unavailable. Hear the introduction with the still portrait.');
    if (!this.present || next.reduced) {
      // Explicit audio under reduced motion may continue while visible.
      if (this.snapshot.speech && this.owner === this.audio && this.present && wasReduced && next.reduced) return;
      const wasSpeech = this.snapshot.speech;
      this.cancel(); this.pauseMedia(); this.still();
      this.update({ state: this.snapshot.manualPause ? 'paused' : this.blocked ? 'blocked' : this.videoFailed ? 'error' : 'idle', speech: false, caption: '', animationUnavailable: next.reduced || this.videoFailed,
        ...(wasSpeech ? { message: 'Introduction muted. Use Hear introduction to restart with sound.' } : {}) }); return;
    }
    this.update({ animationUnavailable: this.videoFailed });
    if (!wasPresent || wasReduced || this.snapshot.state === 'idle') this.reconcile();
  }
  private reconcile() {
    if (!this.canLoop || this.snapshot.speech || (this.desired && this.owner === this.video)) return;
    const owner = this.video ?? this.makeVideo();
    if (owner) void this.start(owner, false, false);
  }
  private unavailable(message: string) {
    this.cancel(); this.pauseMedia(); this.still(); this.videoFailed = true;
    this.release(this.video); this.video = undefined;
    this.update({ state: 'error', speech: false, caption: '', animationUnavailable: true, message });
  }
  private audioUnavailable(message: string) {
    this.cancel(); this.pauseMedia(); this.still();
    this.release(this.audio); this.audio = undefined;
    this.update({ state: 'error', speech: false, caption: '', message });
  }
  private watch(owner: Owner, token: number) {
    clearTimeout(this.deadline);
    this.deadline = setTimeout(() => {
      if (!this.current(owner) || this.token !== token) return;
      if (owner === this.video) this.unavailable('Animation loading timed out. Hear introduction for audio, or read the transcript.');
      else this.audioUnavailable('Audio loading timed out. Hear introduction to retry, or read the transcript.');
    }, 15_000);
  }
  private makeVideo() {
    const video = document.createElement('video');
    if (!video.canPlayType('video/webm; codecs="vp9, opus"')) {
      this.unavailable('Transparent animation is unavailable here. Hear introduction uses audio.'); return undefined;
    }
    video.playsInline = true; video.muted = true; video.defaultMuted = true; video.className = 'standing-portrait-video';
    const owner = this.attach(video); this.video = owner;
    video.src = `${root}-${matchMedia('(max-width: 719px)').matches ? 480 : 720}.webm`; return owner;
  }
  private makeAudio() {
    const owner = this.attach(document.createElement('audio')); this.audio = owner; owner.media.src = `${root}.mp3`; return owner;
  }
  private attach(media: HTMLMediaElement): Owner {
    const owner: Owner = { media, abort: new AbortController(), alpha: false, buffering: false };
    media.preload = 'none'; media.setAttribute('aria-hidden', 'true');
    const listen = (name: string, callback: () => void) => media.addEventListener(name, () => { if (this.current(owner)) callback(); }, { signal: owner.abort.signal });
    listen('playing', () => {
      if (!this.desired || !this.present) { media.muted = true; media.pause(); return; }
      owner.buffering = false;
      if (media instanceof HTMLVideoElement) this.frame(owner, this.token);
      else { clearTimeout(this.deadline); this.update({ state: 'speaking', message: 'Playing introduction with sound.' }); }
    });
    listen('waiting', () => {
      if (!this.desired) return;
      owner.buffering = true;
      if (owner.frame !== undefined && media instanceof HTMLVideoElement) {
        media.cancelVideoFrameCallback(owner.frame); owner.frame = undefined;
      }
      this.update({ state: 'loading' }); this.watch(owner, this.token);
    });
    listen('pause', () => {
      if (this.desired && media.paused && !media.ended) { this.cancel(); this.pauseMedia(); this.update({ state: 'paused', manualPause: true, speech: false, caption: '', message: 'Animation paused.' }); }
    });
    listen('timeupdate', () => {
      if (this.snapshot.speech) {
        const caption = introductionCues.find(cue => media.currentTime >= cue.start && media.currentTime < cue.end)?.text ?? '';
        if (caption !== this.snapshot.caption) this.update({ caption });
      } else if (owner === this.video && typeof (media as HTMLVideoElement).requestVideoFrameCallback !== 'function') {
        this.checkLoop(owner);
      }
    });
    listen('ended', () => {
      if (!this.desired || !media.ended) return;
      const spoke = this.snapshot.speech; media.muted = true;
      this.update({ speech: false, caption: '', ...(spoke ? { message: this.canLoop ? 'Introduction finished. Animation continues without sound.' : 'Introduction finished.' } : {}) });
      if (owner === this.video && this.canLoop) this.restartLoop(owner);
      else { this.desired = false; this.still(); this.update({ state: 'idle' }); this.reconcile(); }
    });
    listen('error', () => {
      if (owner === this.video) this.unavailable('Transparent animation unavailable. Hear introduction uses audio.');
      else this.audioUnavailable('Audio unavailable. Hear introduction to retry, or read the transcript.');
    });
    this.host.append(media); return owner;
  }
  private frame(owner: Owner, token: number) {
    const video = owner.media as HTMLVideoElement;
    const reveal = () => {
      if (!this.current(owner) || this.token !== token || !this.desired || !this.present || this.env.reduced || owner.buffering) return;
      owner.frame = undefined;
      if (this.checkLoop(owner)) return;
      try {
        if (!owner.alpha) {
          const canvas = document.createElement('canvas'); canvas.width = canvas.height = 4;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          if (!context || video.readyState < 2) throw new Error('No decoded frame');
          for (const x of [0, video.videoWidth - 4]) {
            context.clearRect(0,0,4,4); context.drawImage(video,x,0,4,4,0,0,4,4);
            const data = context.getImageData(0,0,4,4).data;
            if (!Array.from({ length: 16 }, (_, i) => data[i*4+3]).every(alpha => alpha < 16)) throw new Error('Opaque decoder');
          }
          owner.alpha = true; video.dataset.alpha = 'verified';
        }
        video.muted = !this.snapshot.speech;
        this.host.parentElement?.setAttribute('data-video-visible', 'true'); clearTimeout(this.deadline);
        const state = this.snapshot.speech ? 'speaking' : 'looping';
        if (this.snapshot.state !== state) this.update({ state, ...(this.snapshot.speech ? { message: 'Playing introduction with sound.' } : {}) });
        // One callback per presented video frame, with no React update unless
        // state changes. This keeps the silent cut precise without a wall clock.
        if (typeof video.requestVideoFrameCallback === 'function') owner.frame = video.requestVideoFrameCallback(reveal);
      } catch { this.unavailable('Transparent animation unavailable. Hear introduction uses audio.'); }
    };
    if (owner.frame !== undefined) video.cancelVideoFrameCallback(owner.frame);
    if (typeof video.requestVideoFrameCallback === 'function') owner.frame = video.requestVideoFrameCallback(reveal);
    else if (video.readyState >= 2) reveal();
  }
  private async start(owner: Owner, speech: boolean, restart: boolean, retainFrame = false) {
    this.cancel(); this.pauseMedia(); this.owner = owner;
    const token = this.token;
    if (restart) {
      if (!retainFrame) this.still();
      owner.media.currentTime = speech ? 0 : portraitLoop.start;
    } else if (owner === this.video && !speech && (owner.media.currentTime < portraitLoop.start || owner.media.currentTime >= portraitLoop.end)) {
      owner.media.currentTime = portraitLoop.start;
    }
    owner.media.muted = owner === this.video || !speech; owner.media.playbackRate = 1; this.desired = true;
    this.update({ state: 'loading', speech, caption: '', ...(speech ? { message: 'Loading introduction with sound.' } : {}) }); this.watch(owner, token);
    try {
      await owner.media.play();
      // A stale promise must not pause a newer command on the reused element.
      if (this.disposed || this.owner !== owner || !this.desired || !this.present) { owner.media.muted = true; owner.media.pause(); }
    } catch (error) {
      if (!this.current(owner) || this.token !== token) return;
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        this.cancel(); this.pauseMedia(); this.still(); this.blocked = true;
        this.update({ state: 'blocked', speech: false, caption: '', message: 'Automatic animation was blocked. Use Resume animation or Hear introduction.' });
      } else if (owner === this.video) this.unavailable('Animation unavailable. Hear introduction uses audio.');
      else this.audioUnavailable('Audio unavailable. Hear introduction to retry, or read the transcript.');
    }
  }
  private checkLoop(owner: Owner) {
    if (this.current(owner) && this.desired && !this.snapshot.speech && this.canLoop && !owner.media.seeking && owner.media.currentTime >= portraitLoop.end) {
      this.restartLoop(owner); return true;
    }
    return false;
  }
  private restartLoop(owner: Owner) {
    // Retain the last decoded video frame during the seek. Do not insert a
    // third photographic pose or blend faces. The source cut remains a cut.
    if (this.current(owner) && this.canLoop) void this.start(owner, false, true, true);
  }
  toggleAnimation() {
    if (this.env.reduced || this.videoFailed) return;
    const pause = !this.snapshot.manualPause && !this.blocked;
    this.cancel(); this.pauseMedia();
    this.update({ manualPause: pause, speech: false, caption: '', state: pause ? 'paused' : 'idle', message: pause ? 'Animation paused.' : 'Animation resumed without sound.' });
    if (!pause) { this.blocked = false; this.reconcile(); }
  }
  hear() {
    if (!this.present || this.disposed) return;
    if (this.snapshot.speech) {
      this.cancel(); this.pauseMedia();
      if (this.owner !== this.video) this.still();
      this.update({ speech: false, caption: '', state: 'idle', message: 'Introduction muted.' }); this.reconcile(); return;
    }
    const audioOnly = this.env.reduced || this.videoFailed || this.snapshot.manualPause;
    this.blocked = false;
    const owner = audioOnly ? this.audio ?? this.makeAudio() : this.video ?? this.makeVideo();
    if (owner) void this.start(owner, true, true, owner === this.video);
    // Synchronous unsupported-codec discovery can fall back in this same user
    // gesture; failure of decoded alpha leaves Hear available for a fresh tap.
    else if (this.videoFailed) void this.start(this.audio ?? this.makeAudio(), true, true);
  }
  dispose() {
    this.disposed = true; this.cancel(); this.pauseMedia(); this.still(); this.release(this.video); this.release(this.audio); this.owner = undefined;
  }
}
