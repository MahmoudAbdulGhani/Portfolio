// Read-only, real-media review of the local production build. Public records
// and unmodified remote PNGs use the Phase 3 snapshot/hash cache, not pixels.
import { chromium, expect } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const base = 'http://127.0.0.1:5184';
const output = 'docs/design/phase3/lazy-image-followup';
const content = JSON.parse(await readFile('.motion-preview/phase3-public-content.json', 'utf8'));
const originals = JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json', 'utf8')).records;
await mkdir(output, { recursive: true });
const findings = [];
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const width of [1363, 390]) for (const slug of ['jobpilot-ai', 'gamezone-arena']) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    const errors = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      if (!['GET', 'HEAD'].includes(route.request().method())) { writes.push(route.request().method()); return route.abort(); }
      return route.continue();
    });
    await page.route('**/api/**', route => {
      if (route.request().method() !== 'GET') return route.abort();
      const path = new URL(route.request().url()).pathname;
      const body = content[path] ?? content['/api/projects'].find(project => path === `/api/projects/${project.slug}`);
      return body === undefined ? route.abort() : route.fulfill({ json: body });
    });
    for (const original of originals) await page.route(original.src, async route => {
      const bytes = await readFile(original.file);
      if (createHash('sha256').update(bytes).digest('hex') !== original.sha256) throw new Error('Original media hash changed');
      return route.fulfill({ contentType: 'image/png', body: bytes });
    });
    await page.goto(`${base}/projects/${slug}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.case-heading').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const later = page.locator('.workflow-frames .screenshot-frame').last();
    await expect(later.locator('img')).toHaveCount(0);
    // Real wall time, no clock acceleration: linger at the introduction.
    await page.waitForTimeout(16_000);
    await expect(later).toHaveAttribute('data-image-state', 'loading');
    await expect(later.locator('img')).toHaveCount(0);
    await expect(page.getByText('This image is unavailable.')).toHaveCount(0);
    await page.screenshot({ path: `${output}/${slug}-intro-after-16s-${width}.jpg`, quality: 85 });
    const workflow = [];
    for (const figure of await page.locator('.workflow-frames figure').all()) {
      const frame = figure.locator('.screenshot-frame');
      const geometry = () => figure.evaluate(el => ({ height: el.querySelector('.screenshot-frame').getBoundingClientRect().height, captionOffset: el.querySelector('figcaption').getBoundingClientRect().top - el.getBoundingClientRect().top }));
      const before = await geometry();
      await frame.scrollIntoViewIfNeeded();
      await expect(frame).toHaveAttribute('data-image-state', 'ready');
      const after = await geometry();
      expect(after.height).toBeCloseTo(before.height, 0);
      expect(after.captionOffset).toBeCloseTo(before.captionOffset, 0);
      workflow.push({ caption: await figure.locator('figcaption').innerText(), before, after,
        image: await frame.locator('.screenshot-button img').evaluate(img => ({ src: img.src, currentSrc: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight })) });
    }
    await page.screenshot({ path: `${output}/${slug}-later-workflow-${width}.jpg`, quality: 85 });
    const trigger = later.getByRole('button', { name: /Enlarge/ });
    await trigger.click(); await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: `${output}/${slug}-viewer-${width}.jpg`, quality: 85 });
    await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
    await trigger.click(); await page.getByRole('button', { name: /Close/i }).click(); await expect(trigger).toBeFocused();
    const chooser = page.locator('.case-media-chooser');
    await chooser.locator('summary').click(); await chooser.locator('button').nth(1).click();
    await expect(chooser.locator('summary')).toBeFocused();
    const primary = page.locator('.case-figure .screenshot-frame');
    await expect(primary).toHaveAttribute('data-image-state', 'ready');
    await primary.scrollIntoViewIfNeeded();
    const primaryGeometry = () => page.locator('.case-figure').evaluate(el => ({ height: el.querySelector('.screenshot-frame').getBoundingClientRect().height, captionOffset: el.querySelector('figcaption').getBoundingClientRect().top - el.getBoundingClientRect().top }));
    const selectedGeometry = await primaryGeometry();
    await page.screenshot({ path: `${output}/${slug}-selected-${width}.jpg`, quality: 85 });
    // Controlled transport failure, followed by the actual original bytes.
    // This exercises retry; it is not evidence of a spontaneous CDN failure.
    const source = await primary.locator('.screenshot-button img').getAttribute('src');
    const assetPath = source.split('?')[0].replace(/\.[^.]+$/, '');
    const faultMatcher = url => url.href.startsWith(assetPath) || url.pathname.startsWith(assetPath);
    await page.route(faultMatcher, route => route.abort());
    // A fresh document removes its decoded-image cache, so this fault reaches
    // the transport rather than silently reusing the already inspected image.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await chooser.locator('summary').click(); await chooser.locator('button').nth(1).click();
    await expect(primary).toHaveAttribute('data-image-state', 'failed');
    await primary.scrollIntoViewIfNeeded();
    const failedGeometry = await primaryGeometry();
    expect(failedGeometry).toEqual(selectedGeometry);
    await page.screenshot({ path: `${output}/${slug}-controlled-error-${width}.jpg`, quality: 85 });
    await page.unroute(faultMatcher);
    await primary.getByRole('button', { name: 'Retry image' }).click();
    await expect(primary).toHaveAttribute('data-image-state', 'ready');
    await expect(primary.locator('picture')).toHaveCount(0);
    const retryGeometry = await primaryGeometry();
    expect(retryGeometry).toEqual(selectedGeometry);
    await page.screenshot({ path: `${output}/${slug}-retry-ready-${width}.jpg`, quality: 85 });
    const retryTrigger = primary.getByRole('button', { name: /Enlarge/ });
    await retryTrigger.click(); await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape'); await expect(retryTrigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]); expect(writes).toEqual([]);
    findings.push({ slug, width, waitMilliseconds: 16_000, offscreenReadyToWait: true, workflow,
      selection: 'ready; chooser summary focus restored', retry: 'controlled transport abort; original actual image ready',
      selectedGeometry, failedGeometry, retryGeometry, horizontalOverflow: false,
      viewer: 'workflow and retried primary opened; Escape and Close returned focus', errors, writes });
    console.log(`${slug} ${width}px: offscreen wait, ${workflow.length} workflows, selection, retry, viewer passed`);
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(`${output}/findings.json`, JSON.stringify({ date: new Date().toISOString(), interface: 'Local production build',
  records: 'Frozen Phase 3 public GET snapshot; API detail counters intercepted; no writes',
  media: 'Actual local assets and unmodified public PNG cache verified against Phase 3 SHA-256; no pixel fixtures',
  clock: 'Real 16-second introduction wait', reducedMotion: true, findings }, null, 2) + '\n');
