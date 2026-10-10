import { expect, test } from '@playwright/test';
import { caseStudyProjects } from '../fixtures/case-study-projects';

const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1cAAAAASUVORK5CYII=', 'base64');
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://screens.example.test/**', route => route.fulfill({ contentType: 'image/png', body: pixel }));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/projects' ? caseStudyProjects : path.startsWith('/api/projects/') ? caseStudyProjects.find(project => path === `/api/projects/${project.slug}`) : path === '/api/profile' ? { name: 'Fixture owner', title: 'Developer', socials: [], experience: [] } : [];
    return route.fulfill({ json: body ?? [] });
  });
});

test('every named image remains selectable at 320px without opening the viewer', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const slug of ['jobpilot-ai', 'construction-project-management-accounting-system']) {
    await page.goto(`/projects/${slug}`);
    const chooser = page.locator('.case-media-chooser');
    const summary = chooser.locator('summary');
    await expect(summary).toBeAttached();
    const choices = chooser.locator('button');
    const count = await choices.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let index = 0; index < count; index++) {
      await summary.focus(); await page.keyboard.press('Enter');
      await expect(chooser).toHaveAttribute('open', '');
      const choice = choices.nth(index);
      const label = await choice.locator('span').nth(1).innerText();
      expect(label.trim()).not.toBe('');
      expect(await choice.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      await choice.click();
      await expect(chooser).not.toHaveAttribute('open');
      await expect(summary).toBeFocused();
      await expect(choice).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.case-media-title strong')).toHaveText(label);
      await expect(page.locator('.case-media-title > span')).toHaveText(`${index + 1} / ${count}`);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(await page.locator('.page-surface').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
    await summary.press('Enter'); await summary.press('Escape');
    await expect(chooser).not.toHaveAttribute('open'); await expect(summary).toBeFocused();
    const enlarge = page.locator('.media-enlarge');
    await enlarge.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape'); await expect(enlarge).toBeFocused();
  }
});

test('engineering disclosures show an expanded cue and preserve keyboard position', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/projects/jobpilot-ai');
  const details = page.locator('.engineering-decisions details').first();
  const summary = details.locator('summary');
  await summary.scrollIntoViewIfNeeded(); await summary.focus();
  const before = await summary.boundingBox();
  const indicator = summary.locator('.disclosure-indicator');
  await expect(indicator).toBeVisible();
  expect(await summary.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  expect(await summary.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(await indicator.evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  expect((await summary.boundingBox())!.y).toBeCloseTo(before!.y, 0);
  expect(await indicator.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await expect(details.getByRole('link').first()).toBeVisible();
  await page.keyboard.press('Space'); await expect(details).not.toHaveAttribute('open');
  await summary.click(); await expect(details).toHaveAttribute('open', '');
  const label = summary.locator('.disclosure-label > span');
  expect((await label.boundingBox())!.x + (await label.boundingBox())!.width).toBeLessThan((await indicator.boundingBox())!.x);
});

test('unavailable media retries the original without moving its caption', async ({ page }) => {
  let available = false;
  await page.route('**/projects/phase3/gamezone-rooms*', route => available ? route.fulfill({ contentType: 'image/png', body: pixel }) : route.fulfill({ status: 503, body: '' }));
  await page.goto('/projects/gamezone-arena');
  const frame = page.locator('.case-figure .screenshot-frame');
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute('data-image-state', 'failed');
  await expect(frame.getByText('This image is unavailable.')).toBeVisible();
  const before = await page.locator('.case-figure').evaluate(el => ({ height: el.querySelector('.screenshot-frame')!.getBoundingClientRect().height, caption: el.querySelector('figcaption')!.getBoundingClientRect().top }));
  available = true;
  await frame.getByRole('button', { name: 'Retry image' }).click();
  await expect(frame).toHaveAttribute('data-image-state', 'ready');
  await expect(frame.locator('.screenshot-button img')).toHaveAttribute('src', '/projects/phase3/gamezone-rooms.webp');
  const after = await page.locator('.case-figure').evaluate(el => ({ height: el.querySelector('.screenshot-frame')!.getBoundingClientRect().height, caption: el.querySelector('figcaption')!.getBoundingClientRect().top }));
  expect(after.height).toBeCloseTo(before.height, 0); expect(after.caption).toBeCloseTo(before.caption, 0);
  const trigger = frame.getByRole('button', { name: /Enlarge/ });
  await trigger.click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
});

test('primary loading space stays reserved and portrait captures keep their proportions', async ({ page }) => {
  await page.clock.install();
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/710055a0-a275-4e6a-991d-4aaa23c6e549.png', async route => { await pending; await route.fulfill({ contentType: 'image/png', body: pixel }); });
  await page.goto('/projects/jobpilot-ai');
  const frame = page.locator('.case-figure .screenshot-frame');
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute('data-image-state', 'loading');
  const before = await frame.boundingBox();
  await page.clock.fastForward(16_000);
  await expect(frame).toHaveAttribute('data-image-state', 'failed');
  await expect(frame.getByRole('button', { name: 'Retry image' })).toBeVisible();
  release(); await expect(frame).toHaveAttribute('data-image-state', 'ready');
  const after = await frame.boundingBox();
  expect(after!.height).toBeCloseTo(before!.height, 0); expect(after!.y).toBeCloseTo(before!.y, 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects/home-services');
  await page.locator('.case-media-chooser summary').click();
  await page.locator('.case-media-chooser').getByRole('button', { name: /Mobile navigation on the public demonstration page/ }).click();
  const portrait = page.locator('.case-figure .screenshot-frame');
  await expect(portrait.locator('.screenshot-button img')).toHaveAttribute('src', '/projects/phase2/home-services-mobile-menu.webp');
  const bounds = await portrait.boundingBox();
  expect(bounds!.width / bounds!.height).toBeCloseTo(390 / 844, 2);
  await expect(page.locator('.case-figure')).not.toHaveClass(/is-wide/);
  await page.goto('/projects/construction-project-management-accounting-system');
  await page.locator('.case-media-chooser summary').click();
  await page.locator('.case-media-chooser').getByRole('button', { name: /AI project risk and forecast advisor/ }).click();
  const advisor = await page.locator('.case-figure .screenshot-frame').boundingBox();
  expect(advisor!.width / advisor!.height).toBeCloseTo(572 / 768, 2);
  await expect(page.locator('.case-figure')).toHaveClass(/is-phone/);
  const inspect = page.locator('.media-enlarge');
  await inspect.click();
  await expect(page.locator('.case-inspector-notice')).toContainText('demonstration data, not business results');
  await page.keyboard.press('Escape'); await expect(inspect).toBeFocused();
});

for (const slug of ['jobpilot-ai', 'gamezone-arena']) test(`${slug} waits offscreen beyond the deadline before loading workflow media`, async ({ page }) => {
  await page.clock.install();
  await page.goto(`/projects/${slug}`);
  const frame = page.locator('.workflow-frames .screenshot-frame').last();
  await expect(frame).toBeAttached();
  expect((await frame.boundingBox())!.y).toBeGreaterThan((page.viewportSize()!.height) + 600);
  await expect(frame.locator('.screenshot-button img')).toHaveCount(0);
  const dimensions = await frame.evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
  await page.clock.fastForward(16_000);
  await expect(frame).toHaveAttribute('data-image-state', 'loading');
  await expect(frame.getByText('This image is unavailable.')).toHaveCount(0);
  await expect(frame.locator('.screenshot-button img')).toHaveCount(0);
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute('data-image-state', 'ready');
  expect(await frame.evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }))).toEqual(dimensions);
});

test('a workflow deadline starts once at eligibility and does not reset when visibility changes', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-10T00:00:00Z') });
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/8a7fd732-16a0-4b77-a1ad-8ad92e6151f1.png', async route => {
    await pending; await route.fulfill({ contentType: 'image/png', body: pixel });
  });
  await page.goto('/projects/jobpilot-ai');
  await expect(page.locator('.case-heading')).toBeAttached();
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1_000));
  const frame = page.locator('.workflow-frames .screenshot-frame').last();
  await frame.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(frame.locator('.screenshot-button img')).toBeAttached();
  await page.clock.fastForward(10_000);
  await page.locator('.case-heading').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await frame.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.clock.fastForward(4_999);
  await expect(frame).toHaveAttribute('data-image-state', 'loading');
  await page.clock.fastForward(1);
  await expect(frame).toHaveAttribute('data-image-state', 'failed');
  release();
  await expect(frame).toHaveAttribute('data-image-state', 'ready');
});

test('changing sources retires the previous deadline and late request events', async ({ page }) => {
  await page.clock.install();
  let releaseOld!: () => void, releaseNew!: () => void;
  const oldRequest = new Promise<void>(resolve => { releaseOld = resolve; });
  const newRequest = new Promise<void>(resolve => { releaseNew = resolve; });
  await page.route('**/710055a0-a275-4e6a-991d-4aaa23c6e549.png', async route => { await oldRequest; await route.fulfill({ status: 503, body: '' }); });
  await page.route('**/79bf6e53-1fb5-4453-a438-fb5ead4a4961.png', async route => { await newRequest; await route.fulfill({ contentType: 'image/png', body: pixel }); });
  await page.goto('/projects/jobpilot-ai');
  const frame = page.locator('.case-figure .screenshot-frame');
  await expect(frame.locator('.screenshot-button img')).toBeAttached();
  await page.clock.fastForward(10_000);
  await page.locator('.case-media-chooser summary').click();
  await page.locator('.case-media-chooser').getByRole('button', { name: /Discover jobs/ }).click();
  await expect(frame.locator('.screenshot-button img')).toHaveAttribute('src', /79bf6e53/);
  await page.clock.fastForward(5_000);
  await expect(frame).toHaveAttribute('data-image-state', 'loading');
  releaseNew(); await expect(frame).toHaveAttribute('data-image-state', 'ready');
  releaseOld(); await page.clock.fastForward(16_000);
  await expect(frame).toHaveAttribute('data-image-state', 'ready');
  await expect(frame.getByText('This image is unavailable.')).toHaveCount(0);
});

test('retry owns a fresh deadline and ignores the retired responsive request', async ({ page }) => {
  await page.clock.install();
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/projects/phase3/gamezone-rooms*', async route => {
    if (new URL(route.request().url()).pathname.endsWith('gamezone-rooms.webp')) return route.fulfill({ contentType: 'image/png', body: pixel });
    await pending; await route.fulfill({ status: 503, body: '' });
  });
  await page.goto('/projects/gamezone-arena');
  const frame = page.locator('.case-figure .screenshot-frame');
  await expect(frame.locator('.screenshot-button img')).toBeAttached();
  await page.clock.fastForward(15_000);
  await expect(frame).toHaveAttribute('data-image-state', 'failed');
  await frame.getByRole('button', { name: 'Retry image' }).click();
  await expect(frame).toHaveAttribute('data-image-state', 'ready');
  await expect(frame.locator('picture')).toHaveCount(0);
  release(); await page.clock.fastForward(16_000);
  await expect(frame).toHaveAttribute('data-image-state', 'ready');
});

test('returning to a decoded cached image is ready without a second request', async ({ browser, baseURL }) => {
  // A separate page with fetch-only API fixtures keeps native image caching
  // enabled. Playwright request routing disables the browser's HTTP cache.
  const cachedPage = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    await cachedPage.addInitScript(projects => {
      const fetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const path = new URL(typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString(), location.href).pathname;
        if (path.startsWith('/api/')) {
          const body = path === '/api/projects' ? projects : path.startsWith('/api/projects/') ? projects.find(project => path === `/api/projects/${project.slug}`) : [];
          return Promise.resolve(new Response(JSON.stringify(body ?? []), { headers: { 'Content-Type': 'application/json' } }));
        }
        return fetch(input, init);
      };
    }, caseStudyProjects);
    await cachedPage.goto(`${baseURL}/projects/gamezone-arena`);
    const frame = cachedPage.locator('.case-figure .screenshot-frame');
    await expect(frame).toHaveAttribute('data-image-state', 'ready');
    const src = await frame.locator('.screenshot-button img').evaluate(img => (img as HTMLImageElement).currentSrc);
    const requests = await cachedPage.evaluate(url => performance.getEntriesByName(url).length, src);
    const chooser = cachedPage.locator('.case-media-chooser');
    await chooser.locator('summary').click(); await chooser.locator('button').nth(1).click();
    await expect(frame).toHaveAttribute('data-image-state', 'ready');
    await chooser.locator('summary').click(); await chooser.locator('button').first().click();
    await expect(frame).toHaveAttribute('data-image-state', 'ready');
    expect(await frame.locator('.screenshot-button img').evaluate(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
    expect(await cachedPage.evaluate(url => performance.getEntriesByName(url).length, src)).toBe(requests);
  } finally { await cachedPage.close(); }
});
