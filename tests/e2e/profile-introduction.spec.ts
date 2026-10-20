import { expect, test, type Page } from '@playwright/test';
const person = {
  name: 'Mahmoud Hussein Abdul Ghani', title: 'Full-Stack Software Engineer',
  photo: '/myphoto.jpeg', bio: 'Profile', experience: [], socials: [],
  location: 'Tripoli, Lebanon', languages: 'Arabic and English',
};
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill(new URL(route.request().url()).pathname === '/api/cv.pdf'
    ? { contentType: 'application/pdf', body: '%PDF-1.4\nCV fixture' }
    : { json: new URL(route.request().url()).pathname === '/api/profile' ? person : [] }));
});
const section = (page: Page) => page.locator('.portrait-introduction');
const play = (page: Page) => section(page).locator('button').first();
const stop = (page: Page) => section(page).getByRole('button', { name: 'Stop', exact: true });
async function open(page: Page) {
  await page.goto('/profile');
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state', 'ready');
}
// Only failure/race tests replace the browser's media surface. Responsive and
// complete-playback checks below decode the actual delivered encodes.
async function fakeMedia(page: Page, opaque = false) {
  await page.addInitScript(({ opaque }) => {
    type Entry = { media: HTMLMediaElement; resolve: () => void; paused: boolean };
    const entries: Entry[] = [];
    Object.assign(window, { portraitMedia: entries });
    HTMLMediaElement.prototype.play = function () {
      return new Promise<void>(resolve => { entries.push({ media: this, resolve, paused: false }); });
    };
    HTMLMediaElement.prototype.pause = function () { for (const e of entries) if (e.media === this) e.paused = true; };
    HTMLMediaElement.prototype.load = function () {};
    HTMLVideoElement.prototype.requestVideoFrameCallback = function (callback) {
      queueMicrotask(() => callback(0, {} as VideoFrameCallbackMetadata)); return 1;
    };
    HTMLVideoElement.prototype.cancelVideoFrameCallback = function () {};
    CanvasRenderingContext2D.prototype.drawImage = function () {};
    CanvasRenderingContext2D.prototype.getImageData = function () { return { data: new Uint8ClampedArray(64).fill(opaque ? 255 : 0) } as ImageData; };
    for (const [key, value] of Object.entries({ readyState: 4, videoWidth: 480, videoHeight: 848 })) {
      Object.defineProperty(HTMLMediaElement.prototype, key, { configurable: true, get: () => value });
      if (key.startsWith('video')) Object.defineProperty(HTMLVideoElement.prototype, key, { configurable: true, get: () => value });
    }
  }, { opaque });
}
async function event(page: Page, name: string, time?: number, index = -1) {
  await page.evaluate(({ name, time, index }) => {
    const entries = (window as unknown as { portraitMedia: { media: HTMLMediaElement; resolve: () => void }[] }).portraitMedia;
    const entry = entries[index < 0 ? entries.length - 1 : index];
    if (time !== undefined) Object.defineProperty(entry.media, 'currentTime', { configurable: true, value: time });
    entry.media.dispatchEvent(new Event(name));
    entry.resolve();
  }, { name, time, index });
}

for (const width of [320, 390, 430, 768, 1440]) test(`real transparent video, deferred requests and stable layout at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1024 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const media: string[] = [];
  page.on('request', r => { if (/\/media\/profile\//.test(r.url())) media.push(r.url()); });
  await open(page);
  await expect(page.locator('video,audio')).toHaveCount(0);
  expect(media).toEqual([]);
  const geometry = async () => page.evaluate(() => ['.standing-portrait-stage', '.standing-portrait-image', '.portrait-introduction', '.profile-intro', '.record-tabs'].map(selector => {
    const el = document.querySelector(selector) as HTMLElement; return { width: el.offsetWidth, height: el.offsetHeight, top: el.offsetTop };
  }));
  const before = await geometry();
  if (width < 720) expect(before[0].width).toBe(width === 320 ? 180 : width === 390 ? 190 : 200);
  await play(page).focus(); await page.keyboard.press('Enter');
  await expect(section(page)).toHaveAttribute('data-playback', 'playing');
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-speaking', 'true');
  await expect(page.locator('video')).toHaveAttribute('src', `/media/profile/mahmoud-introduction-${width < 720 ? 480 : 720}.webm`);
  await expect(section(page).locator('.portrait-playback-captions')).toContainText('full-stack developer');
  expect(await geometry()).toEqual(before);
  expect(media.every(url => url.endsWith(`${width < 720 ? 480 : 720}.webm`))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.querySelector('main')!.scrollWidth > document.querySelector('main')!.clientWidth)).toBe(false);
  await play(page).click(); await expect(section(page)).toHaveAttribute('data-playback', 'paused');
  await play(page).click(); await expect(section(page)).toHaveAttribute('data-playback', 'playing');
  await stop(page).click();
  await expect(section(page)).toHaveAttribute('data-playback', 'idle');
  await expect(page.locator('video,audio')).toHaveCount(0);
  await expect(stop(page)).toBeFocused();
  expect(await geometry()).toEqual(before);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CV', exact: true }).press('Enter');
  expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
});

test('real recording completes once, restores portrait and replays only on activation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await play(page).click();
  await expect(section(page)).toHaveAttribute('data-playback', 'playing');
  await expect(section(page).locator('.portrait-playback-captions')).toContainText('dependable back-end systems', { timeout: 10_000 });
  await expect(section(page).locator('.portrait-playback-captions')).toContainText('download my CV', { timeout: 7000 });
  await expect(section(page)).toHaveAttribute('data-playback', 'ended', { timeout: 7000 });
  await expect(page.locator('video,audio')).toHaveCount(0);
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('visibility', 'visible');
  await play(page).press('Enter'); await expect(section(page)).toHaveAttribute('data-playback', 'playing');
  await stop(page).click();
});

test('reduced motion and Listen instead use real voice with a still portrait and transcript', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await open(page);
  await expect(play(page)).toHaveText('Listen to introduction');
  await play(page).click(); await expect(section(page)).toHaveAttribute('data-playback', 'playing');
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.locator('audio')).toHaveAttribute('src', '/media/profile/mahmoud-introduction.mp3');
  await expect(section(page).locator('.portrait-playback-captions')).toContainText('full-stack developer');
  await stop(page).click();
  await section(page).locator('summary').press('Enter');
  await expect(section(page).locator('details p')).toHaveText('Hi, I am Mahmoud, a full-stack developer. I build clear interfaces and dependable back-end systems. Explore my projects, or download my CV.');
});

test('opaque decoded frames fail closed and require a fresh explicit audio action', async ({ page }) => {
  await fakeMedia(page, true); await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await play(page).click(); await event(page, 'playing');
  await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await expect(page.locator('video,audio')).toHaveCount(0);
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('visibility', 'visible');
  await expect(play(page)).toBeFocused();
  await play(page).click(); await event(page, 'playing');
  await expect(page.locator('audio')).toHaveCount(1); await expect(section(page)).toHaveAttribute('data-playback', 'playing');
});

test('stop and route exit invalidate pending play promises and all retired events', async ({ page }) => {
  await fakeMedia(page); await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await play(page).click(); await stop(page).click();
  await event(page, 'playing', 1, 0); await event(page, 'error', undefined, 0); await event(page, 'ended', undefined, 0);
  await expect(section(page)).toHaveAttribute('data-playback', 'idle');
  await play(page).click(); await event(page, 'playing', 1);
  await expect(section(page)).toHaveAttribute('data-playback', 'playing');
  await page.locator('header nav a[href="/projects"]').click();
  await event(page, 'playing');
  await expect(page.locator('video,audio')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { portraitMedia: { paused: boolean; media: HTMLMediaElement }[] }).portraitMedia.every(e => e.paused && !e.media.hasAttribute('src')))).toBe(true);
  await page.goBack();
  await expect(section(page)).toHaveAttribute('data-playback', 'idle');
});

test('cancellable initial and buffering watchdogs leave CV, tabs, portrait and retry usable', async ({ page }) => {
  await fakeMedia(page); await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await page.clock.install();
  await play(page).click(); await stop(page).click(); await page.clock.fastForward(15_001);
  await expect(section(page)).toHaveAttribute('data-playback', 'idle');
  await play(page).click(); await page.clock.fastForward(15_001);
  await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await play(page).click(); await event(page, 'playing');
  await event(page, 'waiting'); await expect(section(page)).toHaveAttribute('data-playback', 'loading');
  await event(page, 'playing'); await expect(section(page)).toHaveAttribute('data-playback', 'playing');
  await event(page, 'waiting'); await page.clock.fastForward(15_001);
  await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await page.getByRole('tab', { name: 'Capabilities', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Capabilities', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('visibility', 'visible');
});

test('preference changes stop safely; hidden/offscreen pauses require explicit resume', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fakeMedia(page); await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await play(page).click(); await event(page, 'playing');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(section(page)).toHaveAttribute('data-playback', 'paused');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(section(page)).toHaveAttribute('data-playback', 'paused');
  await play(page).click(); await event(page, 'playing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(section(page)).toHaveAttribute('data-playback', 'idle');
  await expect(page.locator('video,audio')).toHaveCount(0);
  await expect(play(page)).toHaveText('Listen to introduction');
  await play(page).click(); await event(page, 'playing');
  // A short viewport actually scrolls the entire stage out of view; with an
  // empty record fixture on a tall screen, the page can hit its scroll limit
  // while part of the figure is still visible.
  await page.setViewportSize({ width: 390, height: 600 });
  await page.locator('.record-tabs').evaluate(el => el.scrollIntoView());
  await expect(section(page)).toHaveAttribute('data-playback', 'paused');
  await play(page).scrollIntoViewIfNeeded();
  await expect(section(page)).toHaveAttribute('data-playback', 'paused');
});

test('caption timing follows provided cue boundaries; media errors never auto-start audio', async ({ page }) => {
  await fakeMedia(page); await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await play(page).click(); await event(page, 'playing');
  for (const [time, text] of [[0.25, ''], [0.26, 'Hi, I am Mahmoud, a full-stack developer.'], [4.08, ''], [4.66, 'I build clear interfaces and dependable back-end systems.'], [8.1, ''], [8.76, 'Explore my projects, or download my CV.'], [11.68, '']] as const) {
    await event(page, 'timeupdate', time);
    await expect(section(page).locator('.portrait-playback-captions')).toHaveText(text);
  }
  await event(page, 'error'); await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await expect(page.locator('audio,video')).toHaveCount(0);
  await play(page).click(); await event(page, 'error');
  await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await expect(page.locator('audio,video')).toHaveCount(0);
});

test('real failed video/audio requests preserve stable layout, focus and CV access', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/media/profile/**', route => route.abort());
  await open(page);
  const geometry = () => section(page).evaluate(el => ({ height: (el as HTMLElement).offsetHeight, top: (el as HTMLElement).offsetTop }));
  const before = await geometry();
  await play(page).click();
  await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await expect(play(page)).toBeFocused();
  await expect(page.locator('video,audio')).toHaveCount(0);
  expect(await geometry()).toEqual(before);
  await play(page).click(); await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await expect(page.locator('video,audio')).toHaveCount(0);
  expect(await geometry()).toEqual(before);
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('visibility', 'visible');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CV', exact: true }).press('Enter');
  expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
});

test('unsupported video requires fresh audio activation instead of starting voice automatically', async ({ page }) => {
  await page.addInitScript(() => { HTMLVideoElement.prototype.canPlayType = () => ''; });
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await play(page).click(); await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await expect(page.locator('video,audio')).toHaveCount(0);
  await play(page).click(); await expect(section(page)).toHaveAttribute('data-playback', 'playing');
  await expect(page.locator('audio')).toHaveCount(1); await expect(page.locator('video')).toHaveCount(0);
});

test('a rejected play promise keeps focus and CV/records usable without starting another media owner', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Blocked', 'NotAllowedError'));
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await play(page).press('Enter'); await expect(section(page)).toHaveAttribute('data-playback', 'error');
  await expect(play(page)).toBeFocused();
  await expect(page.locator('video,audio')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CV', exact: true }).press('Enter');
  expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
  await page.getByRole('tab', { name: 'Capabilities', exact: true }).press('Enter');
  await expect(page.getByRole('tab', { name: 'Capabilities', exact: true })).toHaveAttribute('aria-selected', 'true');
});

test('CV and record controls remain independent during an active session', async ({ page }) => {
  await fakeMedia(page); await page.emulateMedia({ reducedMotion: 'no-preference' }); await open(page);
  await play(page).click(); await event(page, 'playing');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CV', exact: true }).press('Enter');
  expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
  await page.getByRole('tab', { name: 'Capabilities', exact: true }).press('Enter');
  await expect(page.getByRole('tab', { name: 'Capabilities', exact: true })).toHaveAttribute('aria-selected', 'true');
  await stop(page).click(); await expect(section(page)).toHaveAttribute('data-playback', 'idle');
});
