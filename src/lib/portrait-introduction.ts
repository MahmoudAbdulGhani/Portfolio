import captions from './profile-introduction.en.vtt?raw';

const root = '/media/profile/mahmoud-introduction';
export const introductionCues = [...captions.matchAll(/(\d\d):(\d\d\.\d+) --> (\d\d):(\d\d\.\d+)\r?\n([\s\S]*?)(?=\r?\n\r?\n|$)/g)].map(cue => ({
  start: Number(cue[1]) * 60 + Number(cue[2]), end: Number(cue[3]) * 60 + Number(cue[4]), text: cue[5].trim().replace(/\s+/g, ' '),
}));
export const introductionTranscript = introductionCues.map(cue => cue.text).join(' ');
export type PlaybackSnapshot = {
  state: 'idle' | 'loading' | 'looping' | 'speaking' | 'paused' | 'blocked' | 'error';
  speech: boolean; muted: boolean; requiresPlay: boolean; manualPause: boolean; animationUnavailable: boolean; caption: string; message: string;
};
export const initialPlayback: PlaybackSnapshot = { state: 'idle', speech: false, muted: true, requiresPlay: false, manualPause: false, animationUnavailable: false, caption: '', message: '' };
type Owner = { media: HTMLMediaElement; abort: AbortController; alpha: boolean; buffering: boolean; bufferEnd: number; resumeToken?: number; frame?: number };
type Environment = { visible: boolean; active: boolean; reduced: boolean; ready: boolean; imageFailed: boolean };
type Preferences = { muted: boolean; paused: boolean };
const preferenceKey = 'profile-portrait-playback-v2';
let memoryPreferences: Preferences | undefined;
function preferences(): Preferences {
  try {
    const value = JSON.parse(sessionStorage.getItem(preferenceKey) ?? 'null');
    return { muted: typeof value?.muted === 'boolean' ? value.muted : false, paused: value?.paused === true };
  } catch { return memoryPreferences ?? { muted: false, paused: false }; }
}

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
  private preference = preferences();
  constructor(private host: HTMLElement, private publish: (snapshot: PlaybackSnapshot) => void) {
    this.snapshot = { ...initialPlayback, muted: this.preference.muted, manualPause: this.preference.paused, state: this.preference.paused ? 'paused' : 'idle' };
    this.publish(this.snapshot);
  }
  private remember(patch: Partial<Preferences>) {
    this.preference = { ...this.preference, ...patch }; memoryPreferences = this.preference;
    try { sessionStorage.setItem(preferenceKey, JSON.stringify(this.preference)); } catch { /* Session memory still preserves choices within this page. */ }
  }
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
      if (owner) owner.resumeToken = undefined;
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
      // Explicit audio under reduced motion may continue while visible once.
      if (this.snapshot.speech && this.owner === this.audio && this.present && wasReduced && next.reduced) return;
      this.cancel(); this.pauseMedia(); this.still();
      this.update({ state: this.snapshot.manualPause ? 'paused' : this.blocked ? 'blocked' : this.videoFailed ? 'error' : 'idle', speech: false, caption: '', animationUnavailable: next.reduced || this.videoFailed,
        requiresPlay: next.reduced || this.videoFailed || this.blocked }); return;
    }
    this.update({ animationUnavailable: this.videoFailed });
    if (!wasPresent || wasReduced || this.snapshot.state === 'idle') this.reconcile();
  }
  private reconcile() {
    if (!this.canLoop || this.snapshot.speech || (this.desired && this.owner === this.video)) return;
    const owner = this.video ?? this.makeVideo();
    if (owner) this.start(owner, false);
  }
  private unavailable(message: string) {
    this.cancel(); this.pauseMedia(); this.still(); this.videoFailed = true;
    this.release(this.video); this.video = undefined;
    this.update({ state: 'error', speech: false, caption: '', requiresPlay: true, animationUnavailable: true, message });
  }
  private audioUnavailable(message: string) {
    this.cancel(); this.pauseMedia(); this.still();
    this.release(this.audio); this.audio = undefined;
    this.update({ state: 'error', speech: false, caption: '', requiresPlay: true, message });
  }
  private watch(owner: Owner, token: number) {
    clearTimeout(this.deadline);
    this.deadline = setTimeout(() => {
      if (!this.current(owner) || this.token !== token) return;
      if (owner === this.video) this.unavailable('Animation loading timed out. Play introduction for audio, or read the transcript.');
      else this.audioUnavailable('Audio loading timed out. Play introduction to retry, or read the transcript.');
    }, 15_000);
  }
  private makeVideo() {
    const video = document.createElement('video');
    if (!video.canPlayType('video/webm; codecs="vp9, opus"')) {
      this.unavailable('Transparent animation is unavailable here. Play introduction uses audio.'); return undefined;
    }
    video.playsInline = true; video.loop = true; video.muted = true; video.defaultMuted = true; video.className = 'standing-portrait-video';
    const owner = this.attach(video); this.video = owner;
    // This element exists only after eligible visibility. Let the selected file
    // buffer while the still remains visible; never preload both resolutions.
    video.preload = 'auto';
    video.src = `${root}-${matchMedia('(max-width: 719px)').matches ? 480 : 720}.webm`; return owner;
  }
  private makeAudio() {
    const owner = this.attach(document.createElement('audio')); this.audio = owner; owner.media.src = `${root}.mp3`; return owner;
  }
  private attach(media: HTMLMediaElement): Owner {
    const owner: Owner = { media, abort: new AbortController(), alpha: false, buffering: false, bufferEnd: 0 };
    media.preload = 'none'; media.setAttribute('aria-hidden', 'true');
    const listen = (name: string, callback: () => void) => media.addEventListener(name, () => { if (this.current(owner)) callback(); }, { signal: owner.abort.signal });
    listen('playing', () => {
      if (!this.desired || !this.present) { media.muted = true; media.pause(); return; }
      if (owner.buffering && media instanceof HTMLVideoElement && media.readyState < 4) { media.pause(); return; }
      owner.buffering = false; owner.resumeToken = undefined;
      if (media instanceof HTMLVideoElement) this.frame(owner, this.token);
      else { clearTimeout(this.deadline); this.update({ state: this.preference.muted ? 'looping' : 'speaking', speech: !this.preference.muted }); }
    });
    listen('waiting', () => {
      if (!this.desired) return;
      // A full native wrap briefly waits while seeking back into cached data.
      // Let the engine finish that seek without manufacturing a refill pause
      // and a new play command on every cycle. A genuinely stalled wrap still
      // uses the same inactivity watchdog and retains its last decoded frame.
      if (media instanceof HTMLVideoElement && media.loop && media.seeking && media.currentTime < .1
        && media.buffered.length && media.buffered.start(0) <= .1 && media.buffered.end(media.buffered.length - 1) >= media.duration - .01) {
        this.watch(owner, this.token); return;
      }
      owner.buffering = true;
      if (media instanceof HTMLVideoElement) {
        // Pausing to refill can reject an in-flight play promise. Invalidate
        // that attempt before the owned pause; it is not a media failure.
        this.cancel(); owner.resumeToken = this.token; media.pause();
      }
      if (this.snapshot.state !== 'loading') this.update({ state: 'loading' });
      this.watch(owner, this.token);
    });
    listen('progress', () => {
      // A slow download is not a failed load. Only genuinely advancing data
      // refreshes the existing 15s inactivity watchdog; repeated events do not.
      const end = media.buffered.length ? media.buffered.end(media.buffered.length - 1) : 0;
      if (end > owner.bufferEnd) {
        owner.bufferEnd = end;
        if (this.desired && this.snapshot.state === 'loading') this.watch(owner, this.token);
      }
      this.recover(owner);
    });
    listen('canplaythrough', () => this.recover(owner));
    listen('seeked', () => this.recover(owner));
    listen('pause', () => {
      if (this.desired && media.paused && !media.ended && !(media instanceof HTMLVideoElement && owner.buffering)) { this.remember({ paused: true }); this.cancel(); this.pauseMedia(); this.update({ state: 'paused', manualPause: true, speech: false, caption: '', message: 'Animation paused.' }); }
    });
    listen('timeupdate', () => {
      if (this.desired) this.caption(media.currentTime);
    });
    listen('ended', () => {
      if (!this.desired || !media.ended) return;
      // Native video looping normally emits no ended event. Keep a safe full-
      // duration restart for engines that do, never a review-only trim point.
      if (owner === this.video && this.canLoop) this.start(owner, true);
      else { this.cancel(); this.pauseMedia(); this.still(); this.update({ state: 'idle', speech: false, caption: '', requiresPlay: true, message: 'Introduction finished.' }); if (this.canLoop) this.reconcile(); }
    });
    listen('error', () => {
      if (owner === this.video) this.unavailable('Transparent animation unavailable. Play introduction uses audio.');
      else this.audioUnavailable('Audio unavailable. Play introduction to retry, or read the transcript.');
    });
    this.host.append(media); return owner;
  }
  private caption(time: number) {
    const caption = introductionCues.find(cue => time >= cue.start && time < cue.end)?.text ?? '';
    if (caption !== this.snapshot.caption) this.update({ caption });
  }
  private alpha(owner: Owner) {
    if (owner.alpha) return;
    const video = owner.media as HTMLVideoElement;
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
  private frame(owner: Owner, token: number) {
    const video = owner.media as HTMLVideoElement;
    const reveal = () => {
      if (!this.current(owner) || this.token !== token || !this.desired || !this.present || this.env.reduced || owner.buffering) return;
      owner.frame = undefined;
      try {
        this.alpha(owner);
        this.host.parentElement?.setAttribute('data-video-visible', 'true'); clearTimeout(this.deadline);
        const state = video.muted ? 'looping' : 'speaking';
        if (this.snapshot.state !== state) this.update({ state, speech: !video.muted });
        this.caption(video.currentTime);
        // Native looping preserves the full recording. One frame callback is
        // reused across wraps, with no per-cycle play/reload or announcement.
        if (typeof video.requestVideoFrameCallback === 'function') owner.frame = video.requestVideoFrameCallback(reveal);
      } catch { this.unavailable('Transparent animation unavailable. Play introduction uses audio.'); }
    };
    if (owner.frame !== undefined) video.cancelVideoFrameCallback(owner.frame);
    if (typeof video.requestVideoFrameCallback === 'function') owner.frame = video.requestVideoFrameCallback(reveal);
    else if (video.readyState >= 2) reveal();
  }
  private start(owner: Owner, restart: boolean) {
    this.cancel(); this.pauseMedia(); this.owner = owner;
    const token = this.token;
    if (restart || owner.media.ended) owner.media.currentTime = 0;
    owner.media.muted = this.preference.muted; owner.media.playbackRate = 1; this.desired = true;
    this.update({ state: 'loading', muted: this.preference.muted, speech: false, requiresPlay: false, caption: '' }); this.watch(owner, token);
    owner.buffering = owner === this.video && owner.media.readyState < 4;
    if (owner.buffering) owner.resumeToken = token;
    else void this.play(owner, token);
  }
  private recover(owner: Owner) {
    if (!this.current(owner) || !this.desired || !this.present || owner.resumeToken !== this.token || owner.media.readyState < 4) return;
    // Native HAVE_ENOUGH_DATA estimates a runway through the remaining take.
    // Resume once per command, rather than on every progress/playing event.
    owner.resumeToken = undefined;
    void this.play(owner, this.token);
  }
  private async play(owner: Owner, token: number) {
    try {
      if (owner === this.video) this.alpha(owner);
      owner.media.muted = this.preference.muted;
      await owner.media.play();
      // A stale promise must not pause a newer command on the reused element.
      if (this.disposed || this.owner !== owner || !this.desired || !this.present) { owner.media.muted = true; owner.media.pause(); }
    } catch (error) {
      if (!this.current(owner) || this.token !== token) return;
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        if (!owner.media.muted) {
          // Browser policy decides. A blocked audible attempt is latched muted
          // for this session; unrelated interactions never re-enable sound.
          this.remember({ muted: true }); owner.media.muted = true;
          this.update({ muted: true, speech: false, message: 'Sound autoplay was blocked. Enable sound to hear the introduction.' });
          void this.play(owner, token); return;
        }
        this.cancel(); this.pauseMedia(); this.still(); this.blocked = true;
        this.update({ state: 'blocked', speech: false, muted: true, caption: '', requiresPlay: true, message: 'Automatic playback was blocked. Use Play introduction.' });
      } else if (owner === this.video) this.unavailable('Animation unavailable. Play introduction uses audio.');
      else this.audioUnavailable('Audio unavailable. Play introduction to retry, or read the transcript.');
    }
  }
  toggleAnimation() {
    if (!this.present || this.disposed) return;
    if (this.snapshot.requiresPlay) { this.playIntroduction(); return; }
    const pause = !this.snapshot.manualPause && !this.blocked;
    this.remember({ paused: pause });
    this.cancel(); this.pauseMedia();
    this.update({ manualPause: pause, speech: false, caption: '', state: pause ? 'paused' : 'idle', message: pause ? 'Introduction paused.' : 'Introduction resumed.' });
    if (!pause) { this.blocked = false; if (this.env.reduced || this.videoFailed) this.playIntroduction(); else this.reconcile(); }
  }
  sound() {
    if (!this.present || this.disposed) return;
    const muted = !this.snapshot.muted;
    this.cancel();
    this.remember({ muted });
    if (this.owner) this.owner.media.muted = muted;
    this.update({ muted, speech: !muted && this.desired && !this.owner?.media.paused,
      ...(this.desired && this.snapshot.state !== 'loading' ? { state: muted ? 'looping' : 'speaking' } : {}), message: muted ? 'Introduction muted.' : 'Sound enabled.' });
    // Mute never pauses or seeks. Explicitly enabling sound starts a complete
    // take, but cannot override a visitor's manual pause.
    if (this.snapshot.manualPause) return;
    if (!muted) {
      if (this.snapshot.requiresPlay) this.playIntroduction();
      else if (this.owner && this.desired) this.start(this.owner, true);
    } else if (this.owner && this.desired) {
      if (this.owner.buffering) { this.owner.resumeToken = this.token; this.watch(this.owner, this.token); }
      else if (this.owner === this.video && !this.owner.media.paused) this.frame(this.owner, this.token);
    }
  }
  private playIntroduction() {
    this.remember({ paused: false }); this.blocked = false;
    this.update({ manualPause: false, requiresPlay: false });
    if (this.env.reduced || this.videoFailed) {
      this.still(); this.start(this.audio ?? this.makeAudio(), this.owner !== this.audio || !!this.audio?.media.ended);
    } else {
      const owner = this.video ?? this.makeVideo();
      if (owner) this.start(owner, false);
      else if (this.videoFailed) this.start(this.audio ?? this.makeAudio(), true);
    }
  }
  dispose() {
    this.disposed = true; this.cancel(); this.pauseMedia(); this.still(); this.release(this.video); this.release(this.audio); this.owner = undefined;
  }
}
