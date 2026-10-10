import { expect, test, type Page } from '@playwright/test';
import { caseStudyProjects } from '../fixtures/case-study-projects';

const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1cAAAAASUVORK5CYII=', 'base64');
async function fixtures(page: Page) {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('https://screens.example.test/**', route => route.fulfill({ contentType: 'image/png', body: pixel }));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/projects' ? caseStudyProjects : path.startsWith('/api/projects/') ? caseStudyProjects.find(p => path === `/api/projects/${p.slug}`) : path === '/api/profile' ? { name: 'Fixture owner', title: 'Developer', socials: [], experience: [] } : [];
    return route.fulfill({ json: body ?? [] });
  });
}
test.beforeEach(async ({ page }) => { await fixtures(page); });

test('tablet opening keeps its existing deadline after long frames on supported WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1366 });
  await page.addInitScript(() => {
    let injected = false;
    new MutationObserver(changes => {
      if (injected || !changes.some(change => change.attributeName === 'data-selection-state' && (change.target as HTMLElement).dataset.selectionState === 'opening')) return;
      injected = true;
      let count = 0;
      const stall = () => {
        const started = performance.now();
        // Controlled main-thread long frames; the renderer is still genuine
        // supported WebGL. This fixture is separate from real GPU observations.
        while (performance.now() - started < 650) { /* blocked frame */ }
        if (++count < 6) requestAnimationFrame(stall);
      };
      requestAnimationFrame(stall);
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-selection-state'] });
  });
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.is-expanded')).toHaveAttribute('data-selection-state', /opening|settled/, { timeout: 15_000 });
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('.is-expanded')).toHaveAttribute('data-selection-state', 'settled');
  expect(await page.locator('.selection-detail').evaluate(el => (el as HTMLElement).inert)).toBe(false);
  await expect(page.getByRole('link', { name: 'Open case study', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeFocused();
});

test('selection controls work before imagery and renderer readiness, including cancellation', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/710055a0-a275-4e6a-991d-4aaa23c6e549.png', async route => { await pending; await route.fulfill({ contentType: 'image/png', body: pixel }); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore JobPilot AI', exact: true }).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-content-state', 'ready');
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'selecting');
  await expect(page.getByRole('heading', { name: 'JobPilot AI', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open case study', exact: true })).toBeFocused();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeFocused();
  release();
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'idle');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('rapid clicks have one owner and route replacement retires the old opening', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const first = document.querySelector<HTMLButtonElement>('[data-project="jobpilot"]')!;
    const second = document.querySelector<HTMLButtonElement>('[data-project="lobby"]')!;
    first.click(); second.click(); first.click();
  });
  await expect(page).toHaveURL(/project=jobpilot-ai/);
  await expect(page.locator('.selection-detail')).toHaveCount(1);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Collection', exact: true }).click();
  await page.getByRole('button', { name: 'Explore Cedar Construction', exact: true }).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state', 'settled');
  await expect(page.locator('.selection-detail h1')).toHaveText('Cedar Construction');
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.waitForTimeout(1_000);
  await expect(page).toHaveURL(/project=construction-project-management-accounting-system/);
});

test('changing the preview before the first asset finishes still starts one opening', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/710055a0-a275-4e6a-991d-4aaa23c6e549.png', async route => { await pending; await route.fulfill({ contentType: 'image/png', body: pixel }); });
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'selecting');
  await page.locator('.chapter-switch button').nth(1).click();
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'active');
  release();
  await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready', 'true');
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeFocused();
});

test('a retired preview decode cannot overwrite the current failed preview state', async ({ page }) => {
  await page.addInitScript(() => {
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = function () {
      if (this.src.includes('710055a0-a275-4e6a-991d-4aaa23c6e549')) return new Promise<void>((_resolve, reject) => {
        (window as unknown as { rejectOldDecode: () => void }).rejectOldDecode = () => reject(new Error('retired decode'));
      });
      return decode.call(this);
    };
  });
  await page.route('**/79bf6e53-1fb5-4453-a438-fb5ead4a4961.png', route => route.abort());
  await page.goto('/?project=jobpilot-ai');
  await expect.poll(() => page.evaluate(() => Boolean((window as unknown as { rejectOldDecode?: () => void }).rejectOldDecode))).toBe(true);
  await page.locator('.chapter-switch button').nth(1).click();
  const unavailable = page.getByText('Preview unavailable. Open the case study for project details.');
  await expect(unavailable).toBeVisible();
  await page.evaluate(() => (window as unknown as { rejectOldDecode: () => void }).rejectOldDecode());
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'active');
  await expect(unavailable).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeFocused();
});

test('Escape reverses the current pose and repeated close cannot restore twice', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    const frames: Array<{ progress: number; closing: boolean }> = [];
    (window as unknown as { motionFrames: typeof frames }).motionFrames = frames;
    document.addEventListener('rig-frame', event => frames.push((event as CustomEvent).detail), true);
  });
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/710055a0-a275-4e6a-991d-4aaa23c6e549.png', async route => { await pending; await route.fulfill({ contentType: 'image/png', body: pixel }); });
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.selection-detail')).toBeAttached();
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1_000));
  release();
  await expect.poll(async () => {
    await page.clock.runFor(16);
    return page.locator('.motion-rig').getAttribute('data-renderer').catch(() => null);
  }).toBe('webgl');
  await page.clock.runFor(180);
  const before = await page.evaluate(() => (window as unknown as { motionFrames: Array<{ progress: number; closing: boolean }> }).motionFrames.filter(frame => !frame.closing).at(-1)!.progress);
  expect(before).toBeGreaterThan(0); expect(before).toBeLessThan(1);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.clock.runFor(600);
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeFocused();
  await expect(page.locator('canvas')).toHaveCount(0);
  const closing = await page.evaluate(() => (window as unknown as { motionFrames: Array<{ progress: number; closing: boolean }> }).motionFrames.filter(frame => frame.closing).map(frame => frame.progress));
  expect(closing[0]).toBeLessThanOrEqual(before + 0.01);
  expect(closing.at(-1)).toBeCloseTo(0, 4);
  expect(closing.every((value, index) => !index || value <= closing[index - 1])).toBe(true);
});

test('browser Back restores selected content and collection focus without stale overlays', async ({ page }) => {
  await page.goto('/?view=collection');
  await page.getByRole('button', { name: 'Explore Lobby', exact: true }).click();
  await page.getByRole('link', { name: 'Open case study', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/lobby$/);
  await page.goBack();
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'active');
  await expect(page.getByRole('link', { name: 'Open case study', exact: true })).toBeFocused();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\?view=collection$/);
  await expect(page.getByRole('button', { name: 'Explore Lobby', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('reduced motion works on first render and preference changes retire an active renderer', async ({ page }) => {
  let engineRequests = 0;
  page.on('request', request => { if (request.url().includes('/motion-rig.ts')) engineRequests++; });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?project=lobby');
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state', 'settled');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(engineRequests).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'webgl');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'active');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(300);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'active');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeFocused();
});

test('renderer context loss cannot strand content, closing or GPU resources', async ({ page }) => {
  await page.goto('/?project=lobby');
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'webgl');
  await page.locator('canvas').evaluate(canvas => (canvas as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state', 'settled');
  await expect(page.getByRole('link', { name: 'Open case study', exact: true })).toBeEnabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore Lobby', exact: true })).toBeFocused();
});

test('a failed lazy engine leaves the photographic handoff and navigation usable', async ({ page }) => {
  await page.route('**/motion-rig.ts*', route => route.abort());
  await page.goto('/?project=construction-project-management-accounting-system');
  await expect(page.getByRole('link', { name: 'Open case study', exact: true })).toBeFocused();
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'fallback');
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state', 'settled');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore Cedar Construction', exact: true })).toBeFocused();
});

test('reader retains the loaded image and its caption until the next request is ready', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/79bf6e53-1fb5-4453-a438-fb5ead4a4961.png', async route => { await pending; await route.fulfill({ contentType: 'image/png', body: pixel }); });
  await page.goto('/projects/jobpilot-ai');
  const frame = page.locator('.case-figure .screenshot-frame');
  await expect(frame).toHaveAttribute('data-image-state', 'ready');
  const caption = await page.locator('.case-figure figcaption').textContent();
  await page.locator('.case-media-chooser summary').click();
  await page.locator('.case-media-chooser').getByRole('button', { name: /Discover jobs/ }).click();
  await expect(frame).toHaveAttribute('data-image-state', 'loading');
  await expect(frame.locator('.screenshot-previous img')).toBeVisible();
  await expect(page.locator('.case-figure figcaption')).toHaveText(caption);
  const before = await frame.boundingBox();
  release();
  await expect(frame).toHaveAttribute('data-image-state', 'ready');
  await expect(page.locator('.case-figure figcaption')).toContainText('Discover jobs');
  await expect(frame.locator('.screenshot-previous')).toHaveCount(0);
  expect((await frame.boundingBox())!.height).toBeCloseTo(before!.height, 0);
});

test('inspector interruption and route unmount restore focus and scrolling', async ({ page }) => {
  await page.goto('/projects');
  await page.getByRole('link', { name: /GameZone Arena/ }).first().click();
  const trigger = page.locator('.media-enlarge');
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await trigger.click(); await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('disclosure interruption and reduced motion finish with correct expanded state and unclipped content', async ({ page }) => {
  await page.goto('/projects/jobpilot-ai');
  const details = page.locator('.engineering-decisions details').first();
  const summary = details.locator('summary');
  await summary.click(); await summary.click(); await summary.click();
  await expect(summary).toHaveAttribute('aria-expanded', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(details).toHaveAttribute('open', '');
  const content = details.locator('.disclosure-content');
  await expect.poll(() => content.evaluate(el => getComputedStyle(el).height === '0px' ? false : el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  await expect(details.getByRole('link').first()).toBeVisible();
  await summary.focus(); await page.keyboard.press('Space');
  await expect(details).not.toHaveAttribute('open');
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await expect(summary).toBeFocused();
});

test('touch needs no hover, pixel density stays bounded and the active rig does not render continuously', async ({ browser, baseURL }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
  try {
    await fixtures(page);
    await page.addInitScript(() => {
      (window as unknown as { draws: number }).draws = 0;
      for (const name of ['drawElements', 'drawArrays'] as const) {
        const draw = WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name] = function (...args: Parameters<typeof draw>) {
          (window as unknown as { draws: number }).draws++;
          return draw.apply(this, args);
        } as typeof draw;
      }
    });
    let engineRequests = 0;
    page.on('request', request => { if (request.url().includes('/motion-rig.ts')) engineRequests++; });
    await page.goto(`${baseURL}/`);
    await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeVisible();
    expect(engineRequests).toBe(0);
    expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false);
    for (const name of ['JobPilot AI', 'Lobby', 'Cedar Construction']) {
      await page.getByRole('button', { name: `Explore ${name}`, exact: true }).tap();
      await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'webgl');
      await expect(page.locator('.stage')).toHaveAttribute('data-selection-state', 'settled');
      const density = await page.locator('canvas').evaluate(canvas => (canvas as HTMLCanvasElement).width / canvas.getBoundingClientRect().width);
      expect(density).toBeLessThanOrEqual(1.25);
      await page.waitForTimeout(100);
      const draws = await page.evaluate(() => (window as unknown as { draws: number }).draws);
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => (window as unknown as { draws: number }).draws)).toBe(draws);
      await page.getByRole('button', { name: 'Collection', exact: true }).tap();
      await expect(page.getByRole('button', { name: `Explore ${name}`, exact: true })).toBeFocused();
      await expect(page.locator('canvas')).toHaveCount(0);
    }
  } finally { await page.close(); }
});

test('reader Back restores the previous reading position and hash links still reach their target', async ({ page }) => {
  await page.goto('/projects/jobpilot-ai#engineering');
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator('#engineering').evaluate(el => Math.abs(el.getBoundingClientRect().top - document.getElementById('main-content')!.getBoundingClientRect().top))).toBeLessThanOrEqual(1);
  const next = page.locator('.next-project');
  await next.scrollIntoViewIfNeeded();
  const position = await page.locator('#main-content').evaluate(el => el.scrollTop);
  expect(position).toBeGreaterThan(500);
  await next.click();
  await expect(page).toHaveURL(/construction-project-management-accounting-system$/);
  await page.goBack();
  await expect(page).toHaveURL(/jobpilot-ai#engineering$/);
  // Hash destinations deliberately take priority over a saved scroll position.
  await expect(page.locator('#engineering')).toBeInViewport();
  await page.goto('/projects/jobpilot-ai');
  await next.scrollIntoViewIfNeeded();
  const saved = await page.locator('#main-content').evaluate(el => el.scrollTop);
  await next.click();
  await expect(page).toHaveURL(/construction-project-management-accounting-system$/);
  await page.goBack();
  await expect.poll(() => page.locator('#main-content').evaluate(el => el.scrollTop)).toBeCloseTo(saved, 0);
  await expect(page.locator('#main-content')).toBeFocused();
});

test('Profile groups enter once and preference changes finish without replay', async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/profile');
  const record = page.locator('.profile-record');
  const pose = () => record.evaluate(el => ({ opacity:getComputedStyle(el).opacity, y:new DOMMatrixReadOnly(getComputedStyle(el).transform).m42 }));
  await expect(record).toBeVisible();
  expect(await pose()).toEqual({ opacity:'1', y:0 });
  await page.emulateMedia({ reducedMotion:'no-preference' });
  await page.clock.runFor(320);
  expect(await pose()).toEqual({ opacity:'1', y:0 });
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Projects',exact:true}).click();
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1_000));
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Profile',exact:true}).evaluate(el => (el as HTMLAnchorElement).click());
  await expect(record).toBeAttached();
  await page.clock.runFor(100);
  expect((await pose()).y).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion:'reduce' });
  await expect.poll(pose).toEqual({ opacity:'1', y:0 });
  await page.emulateMedia({ reducedMotion:'no-preference' });
  await page.clock.runFor(320);
  expect(await pose()).toEqual({ opacity:'1', y:0 });
});
