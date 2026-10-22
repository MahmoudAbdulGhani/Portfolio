import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const captions = readFileSync('src/lib/profile-introduction.en.vtt', 'utf8');
const source = readFileSync('src/lib/portrait-introduction.ts', 'utf8').replace(
  "import captions from './profile-introduction.en.vtt?raw';", `const captions = ${JSON.stringify(captions)};`,
);
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { PortraitIntroduction } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

function fixture(t, readyState = 4, options = {}) {
  const saved = Object.fromEntries(['document', 'HTMLVideoElement', 'matchMedia', 'sessionStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const storage = options.storage ?? new Map();
  if (options.muted) storage.set('profile-portrait-playback-v2', JSON.stringify({ muted: true, paused: false }));
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } });
  class Media extends EventTarget {
    currentTime = 0; paused = true; ended = false; muted = true; seeking = false; readyState = readyState; dataset = {}; plays = 0; bufferEnd = 0;
    get buffered() { return { length: this.bufferEnd ? 1 : 0, start: () => 0, end: () => this.bufferEnd }; }
    setAttribute() {} removeAttribute() {} remove() {} load() {}
    pause() { const playing = !this.paused; this.paused = true; if (playing) queueMicrotask(() => this.dispatchEvent(new Event('pause'))); }
    async play() { this.plays++; if (options.blocked?.(this)) throw new DOMException('Policy', 'NotAllowedError'); this.paused = false; this.ended = false; if (options.pending) return new Promise(() => {}); this.dispatchEvent(new Event('playing')); }
  }
  class Video extends Media {
    videoWidth = 480; videoHeight = 848; frames = new Map(); sequence = 0;
    canPlayType() { return 'probably'; }
    requestVideoFrameCallback(callback) { const id = ++this.sequence; this.frames.set(id, callback); return id; }
    cancelVideoFrameCallback(id) { this.frames.delete(id); }
    present(time) { this.currentTime = time; const callbacks = [...this.frames.values()]; this.frames.clear(); for (const callback of callbacks) callback(0, { mediaTime: time }); }
  }
  const media = [], attributes = new Map(), states = [];
  const stage = { setAttribute: (key, value) => attributes.set(key, value), removeAttribute: key => attributes.delete(key) };
  const host = { parentElement: stage, append: value => media.push(value) };
  globalThis.HTMLVideoElement = Video;
  globalThis.matchMedia = () => ({ matches: true });
  globalThis.document = { createElement: name => name === 'video' ? new Video() : name === 'audio' ? new Media() : {
    getContext: () => ({ clearRect() {}, drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray(64) }) }),
  } };
  const controller = new PortraitIntroduction(host, state => states.push(state));
  const environment = { visible: true, active: true, reduced: options.reduced ?? false, ready: true, imageFailed: false };
  controller.environment(environment);
  t.after(() => { controller.dispose(); for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
  return { controller, media, video: media[0], attributes, states, environment, storage };
}

test('ten full native repeats retain the decoded layer, entire CV cue and one callback', t => {
  const { controller, video, media, attributes, states } = fixture(t);
  assert.equal(video.currentTime, 0); assert.equal(video.loop, true);
  video.present(.24);
  for (let i = 0; i < 10; i++) {
    video.present(11.56); assert.equal(video.currentTime, 11.56);
    video.present(11.60); assert.equal(video.currentTime, 11.60);
    assert.match(states.at(-1).caption, /download my CV/);
    video.present(11.96); assert.equal(video.currentTime, 11.96);
    assert.equal(attributes.get('data-video-visible'), 'true');
    assert.equal(video.muted, false); assert.equal(media.length, 1); assert.equal(video.plays, 1);
    video.present(.24);
    assert.equal(video.frames.size, 1);
  }
  controller.toggleAnimation();
  assert.equal(video.frames.size, 0); assert.equal(video.paused, true);
});

test('explicit Enable sound restarts at zero and remains audible on subsequent native cycles', t => {
  const { controller, video, states } = fixture(t, 4, { muted: true });
  video.present(5); controller.sound(); assert.equal(video.currentTime, 0);
  video.present(.04); assert.equal(video.muted, false);
  video.present(11.60); video.dispatchEvent(new Event('timeupdate'));
  assert.equal(video.currentTime, 11.60);
  assert.match(states.at(-1).caption, /download my CV/);
  video.present(11.96); video.present(.28);
  assert.equal(video.muted, false); assert.equal(states.at(-1).state, 'speaking');
  assert.match(states.at(-1).caption, /Hi, I am Mahmoud/);
});

test('a stale loop frame cannot seek or unmute a newer speaking action', t => {
  const { controller, video, states } = fixture(t, 4, { muted: true });
  video.present(.24); const stale = [...video.frames.values()][0];
  controller.sound(); stale(0, { mediaTime: 11.6 });
  assert.equal(video.currentTime, 0);
  assert.equal(video.frames.size, 1);
  video.present(.04); assert.equal(video.muted, false);
});

test('hiding during a repeat cancels frame work and return preserves the chosen mute state', t => {
  const { controller, video, attributes, environment } = fixture(t, 4, { muted: true });
  video.present(.24); video.present(11.6);
  controller.environment({ ...environment, active: false });
  assert.equal(video.frames.size, 0); assert.equal(video.paused, true);
  assert.equal(attributes.has('data-video-visible'), false);
  controller.environment(environment); video.present(.24);
  assert.equal(video.muted, true); assert.equal(attributes.get('data-video-visible'), 'true');
});

test('mute retains the current pose while reduced motion restores the accepted still', t => {
  const { controller, video, attributes, environment } = fixture(t);
  video.present(2);
  controller.sound(); assert.equal(video.currentTime, 2);
  assert.equal(video.muted, true); assert.equal(attributes.get('data-video-visible'), 'true');
  controller.environment({ ...environment, reduced: true });
  assert.equal(video.frames.size, 0); assert.equal(attributes.has('data-video-visible'), false);
});

test('buffering cancels frame work; a late decoded frame cannot clear loading before playing resumes', t => {
  const { video, states } = fixture(t);
  video.present(.24);
  const stale = [...video.frames.values()][0];
  video.dispatchEvent(new Event('waiting'));
  assert.equal(video.frames.size, 0);
  stale(0, { mediaTime: .24 });
  assert.equal(states.at(-1).state, 'loading');
  assert.equal(video.frames.size, 0);
  video.dispatchEvent(new Event('playing')); video.present(.28);
  assert.equal(states.at(-1).state, 'speaking');
  assert.equal(video.frames.size, 1);
});

test('startup waits for native enough-data readiness without a fixed delay or a second element', t => {
  const { video, media, states, attributes } = fixture(t, 3);
  assert.equal(video.preload, 'auto'); assert.equal(video.plays, 0);
  assert.equal(states.at(-1).state, 'loading'); assert.equal(attributes.has('data-video-visible'), false);
  video.dispatchEvent(new Event('canplaythrough')); assert.equal(video.plays, 0);
  video.readyState = 4; video.dispatchEvent(new Event('canplaythrough'));
  video.dispatchEvent(new Event('canplaythrough')); video.dispatchEvent(new Event('progress'));
  video.present(.24);
  assert.equal(video.plays, 1); assert.equal(media.length, 1);
  assert.equal(states.at(-1).state, 'speaking'); assert.equal(video.muted, false);
});

test('advancing buffered data keeps a slow load alive; repeated progress without new data still times out in 15 seconds', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { video, states } = fixture(t, 3);
  t.mock.timers.tick(14_000); video.bufferEnd = 1; video.dispatchEvent(new Event('progress'));
  t.mock.timers.tick(14_000); video.bufferEnd = 2; video.dispatchEvent(new Event('progress'));
  assert.equal(states.at(-1).state, 'loading');
  t.mock.timers.tick(14_000); video.dispatchEvent(new Event('progress'));
  t.mock.timers.tick(1_000); assert.equal(states.at(-1).state, 'error');
  assert.equal(video.plays, 0);
});

test('buffer recovery holds the decoded layer until enough data, and Mute invalidates pending speech', t => {
  const { controller, video, states, attributes } = fixture(t);
  video.present(.24); video.present(1);
  video.readyState = 3; video.dispatchEvent(new Event('waiting'));
  assert.equal(video.paused, true); assert.equal(video.frames.size, 0);
  assert.equal(attributes.get('data-video-visible'), 'true');
  const plays = video.plays;
  video.dispatchEvent(new Event('canplaythrough')); assert.equal(video.plays, plays);
  controller.sound(); // Explicit Mute while the spoken take is buffering.
  video.readyState = 4; video.dispatchEvent(new Event('canplaythrough')); video.present(1.04);
  assert.equal(video.muted, true); assert.equal(states.at(-1).speech, false);
  assert.equal(states.at(-1).state, 'looping'); assert.match(states.at(-1).caption, /full-stack developer/);
});

test('Pause, offscreen and navigation cancel a queued buffer recovery', t => {
  const { controller, video, states, environment } = fixture(t, 3);
  controller.toggleAnimation(); video.readyState = 4; video.dispatchEvent(new Event('canplaythrough'));
  assert.equal(video.plays, 0); assert.equal(states.at(-1).manualPause, true);
  controller.toggleAnimation(); video.present(.24);
  video.readyState = 3; video.dispatchEvent(new Event('waiting'));
  controller.environment({ ...environment, visible: false });
  const plays = video.plays;
  video.readyState = 4; video.bufferEnd = 12; video.dispatchEvent(new Event('progress')); video.dispatchEvent(new Event('canplaythrough'));
  assert.equal(video.plays, plays); assert.equal(video.muted, true);
  controller.dispose(); video.dispatchEvent(new Event('canplaythrough'));
  assert.equal(video.plays, plays); assert.equal(video.frames.size, 0);
});

test('an owned refill pause cannot turn the interrupted play promise into a media error', async t => {
  const { controller, video, states } = fixture(t);
  video.present(.24); await Promise.resolve();
  const play = video.play;
  video.play = function () {
    this.paused = false;
    return new Promise((resolve, reject) => this.addEventListener('pause', () => reject(new DOMException('Refill pause', 'AbortError')), { once: true }));
  };
  controller.sound(); controller.sound(); video.readyState = 3; video.dispatchEvent(new Event('waiting'));
  await Promise.resolve(); await Promise.resolve();
  assert.equal(states.at(-1).state, 'loading');
  video.play = play; video.readyState = 4; video.dispatchEvent(new Event('canplaythrough')); video.present(.04);
  assert.equal(states.at(-1).state, 'speaking'); assert.equal(video.muted, false);
});

test('audible autoplay rejection immediately attempts muted once and latches that preference', async t => {
  const { video, controller, states, environment } = fixture(t, 4, { blocked: media => !media.muted });
  await Promise.resolve(); await Promise.resolve(); video.present(.28);
  assert.equal(video.plays, 2); assert.equal(video.muted, true); assert.equal(states.at(-1).state, 'looping');
  controller.environment({ ...environment, active: false }); controller.environment(environment); video.present(.3);
  assert.equal(video.plays, 3); assert.equal(video.muted, true);
});

test('both blocked attempts retain still with Play and do not retry on visibility changes', async t => {
  const { video, controller, states, environment, attributes } = fixture(t, 4, { blocked: () => true });
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(video.plays, 2); assert.equal(states.at(-1).requiresPlay, true); assert.equal(attributes.size, 0);
  controller.environment({ ...environment, active: false }); controller.environment(environment);
  assert.equal(video.plays, 2);
  controller.toggleAnimation(); await Promise.resolve(); assert.equal(video.plays, 3);
});

test('mute never stops or seeks video, while sound cannot override persistent manual pause', t => {
  const { video, controller, states, environment, storage } = fixture(t);
  video.present(5); controller.sound(); assert.equal(video.currentTime, 5); assert.equal(video.paused, false);
  controller.toggleAnimation(); controller.sound();
  assert.equal(video.paused, true); assert.equal(states.at(-1).manualPause, true);
  assert.deepEqual(JSON.parse(storage.get('profile-portrait-playback-v2')), { muted: false, paused: true });
  controller.environment({ ...environment, visible: false }); controller.environment(environment);
  assert.equal(video.paused, true); assert.equal(video.plays, 1);
});

test('new controller restores mute and pause session preferences without loading media', t => {
  const storage = new Map([['profile-portrait-playback-v2', JSON.stringify({ muted: true, paused: true })]]);
  const { media, states } = fixture(t, 4, { storage });
  assert.equal(media.length, 0); assert.equal(states.at(-1).manualPause, true); assert.equal(states.at(-1).muted, true);
});

test('reduced motion creates no video and explicit audio ends once without background repeats', t => {
  const { controller, media, states, attributes, environment } = fixture(t, 4, { reduced: true });
  assert.equal(media.length, 0); assert.equal(states.at(-1).requiresPlay, true);
  controller.toggleAnimation(); const audio = media[0]; assert.equal(audio.plays, 1); assert.notEqual(audio.loop, true);
  audio.currentTime = 11; audio.dispatchEvent(new Event('timeupdate')); assert.match(states.at(-1).caption, /download my CV/);
  audio.ended = true; audio.dispatchEvent(new Event('ended'));
  assert.equal(audio.plays, 1); assert.equal(audio.paused, true); assert.equal(attributes.size, 0);
  controller.environment({ ...environment, active: false }); controller.environment(environment);
  assert.equal(audio.plays, 1);
});

test('cached native loop seeks retain the layer and do not manufacture a pause or play per cycle', t => {
  const { video, attributes } = fixture(t); video.duration = 12.008; video.bufferEnd = 12.008;
  for(let cycle=0;cycle<10;cycle++){
    video.present(11.96); video.currentTime = 0; video.seeking = true; video.dispatchEvent(new Event('waiting'));
    assert.equal(video.paused, false); assert.equal(video.plays, 1); assert.equal(attributes.get('data-video-visible'), 'true');
    video.seeking = false; video.dispatchEvent(new Event('playing')); video.present(.04); assert.equal(video.frames.size, 1);
  }
});

test('Mute during a pending first play retains the unchanged inactivity watchdog without pausing it', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { controller, video, states } = fixture(t, 4, { pending: true });
  controller.sound(); assert.equal(video.paused, false); assert.equal(video.muted, true);
  t.mock.timers.tick(14_999); assert.equal(states.at(-1).state, 'loading');
  t.mock.timers.tick(1); assert.equal(states.at(-1).state, 'error'); assert.equal(video.plays, 1);
});
