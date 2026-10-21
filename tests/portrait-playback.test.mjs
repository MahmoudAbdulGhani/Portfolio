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

function fixture(t, readyState = 4) {
  const saved = Object.fromEntries(['document', 'HTMLVideoElement', 'matchMedia'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  class Media extends EventTarget {
    currentTime = 0; paused = true; ended = false; muted = true; seeking = false; readyState = readyState; dataset = {}; plays = 0; bufferEnd = 0;
    get buffered() { return { length: this.bufferEnd ? 1 : 0, end: () => this.bufferEnd }; }
    setAttribute() {} removeAttribute() {} remove() {} load() {}
    pause() { this.paused = true; queueMicrotask(() => this.dispatchEvent(new Event('pause'))); }
    async play() { this.plays++; this.paused = false; this.ended = false; this.dispatchEvent(new Event('playing')); }
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
  const environment = { visible: true, active: true, reduced: false, ready: true, imageFailed: false };
  controller.environment(environment);
  t.after(() => { controller.dispose(); for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
  return { controller, media, video: media[0], attributes, states, environment };
}

test('ten silent cut points retain the decoded layer and reuse one muted video', t => {
  const { controller, video, media, attributes } = fixture(t);
  assert.equal(video.currentTime, .2);
  video.present(.24);
  for (let i = 0; i < 10; i++) {
    video.present(11.56); assert.equal(video.currentTime, 11.56);
    video.present(11.60); assert.equal(video.currentTime, .2);
    assert.equal(attributes.get('data-video-visible'), 'true');
    assert.equal(video.muted, true); assert.equal(media.length, 1);
    video.present(.24);
    assert.equal(video.frames.size, 1);
  }
  controller.toggleAnimation();
  assert.equal(video.frames.size, 0); assert.equal(video.paused, true);
});

test('explicit speech starts at zero, includes the last caption and completes once', t => {
  const { controller, video, states } = fixture(t);
  video.present(.24); controller.hear(); assert.equal(video.currentTime, 0);
  video.present(.04); assert.equal(video.muted, false);
  video.present(11.60); video.dispatchEvent(new Event('timeupdate'));
  assert.equal(video.currentTime, 11.60);
  assert.match(states.at(-1).caption, /download my CV/);
  video.currentTime = 12; video.ended = true; video.dispatchEvent(new Event('ended'));
  assert.equal(video.currentTime, .2); assert.equal(video.muted, true);
  video.present(.24); assert.equal(states.at(-1).state, 'looping');
  assert.equal(states.at(-1).caption, '');
});

test('a stale loop frame cannot seek or unmute a newer speaking action', t => {
  const { controller, video, states } = fixture(t);
  video.present(.24); const stale = [...video.frames.values()][0];
  controller.hear(); stale(0, { mediaTime: 11.6 });
  assert.equal(video.currentTime, 0); assert.equal(states.at(-1).speech, true);
  assert.equal(video.frames.size, 1);
  video.present(.04); assert.equal(video.muted, false);
});

test('hiding during a repeat cancels frame work and returns with sound off', t => {
  const { controller, video, attributes, environment } = fixture(t);
  video.present(.24); video.present(11.6);
  controller.environment({ ...environment, active: false });
  assert.equal(video.frames.size, 0); assert.equal(video.paused, true);
  assert.equal(attributes.has('data-video-visible'), false);
  controller.environment(environment); video.present(.24);
  assert.equal(video.muted, true); assert.equal(attributes.get('data-video-visible'), 'true');
});

test('mute retains the current pose while reduced motion restores the accepted still', t => {
  const { controller, video, attributes, environment } = fixture(t);
  video.present(.24); controller.hear(); video.present(2);
  controller.hear(); assert.equal(video.currentTime, 2);
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
  assert.equal(states.at(-1).state, 'looping');
  assert.equal(video.frames.size, 1);
});

test('silent startup waits for native enough-data readiness without a fixed delay or a second element', t => {
  const { video, media, states, attributes } = fixture(t, 3);
  assert.equal(video.preload, 'auto'); assert.equal(video.plays, 0);
  assert.equal(states.at(-1).state, 'loading'); assert.equal(attributes.has('data-video-visible'), false);
  video.dispatchEvent(new Event('canplaythrough')); assert.equal(video.plays, 0);
  video.readyState = 4; video.dispatchEvent(new Event('canplaythrough'));
  video.dispatchEvent(new Event('canplaythrough')); video.dispatchEvent(new Event('progress'));
  video.present(.24);
  assert.equal(video.plays, 1); assert.equal(media.length, 1);
  assert.equal(states.at(-1).state, 'looping'); assert.equal(video.muted, true);
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
  video.present(.24); controller.hear(); video.present(1);
  video.readyState = 3; video.dispatchEvent(new Event('waiting'));
  assert.equal(video.paused, true); assert.equal(video.frames.size, 0);
  assert.equal(attributes.get('data-video-visible'), 'true');
  const plays = video.plays;
  video.dispatchEvent(new Event('canplaythrough')); assert.equal(video.plays, plays);
  controller.hear(); // Explicit Mute while the spoken take is buffering.
  video.readyState = 4; video.dispatchEvent(new Event('canplaythrough')); video.present(1.04);
  assert.equal(video.muted, true); assert.equal(states.at(-1).speech, false);
  assert.equal(states.at(-1).state, 'looping'); assert.equal(states.at(-1).caption, '');
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
  controller.hear(); video.readyState = 3; video.dispatchEvent(new Event('waiting'));
  await Promise.resolve(); await Promise.resolve();
  assert.equal(states.at(-1).state, 'loading'); assert.equal(states.at(-1).speech, true);
  video.play = play; video.readyState = 4; video.dispatchEvent(new Event('canplaythrough')); video.present(.04);
  assert.equal(states.at(-1).state, 'speaking'); assert.equal(video.muted, false);
});
