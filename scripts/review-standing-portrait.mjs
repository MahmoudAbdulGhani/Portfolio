import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const output = 'docs/design/profile-portrait-original-refinement';
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5194';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [];
try {
  for (const [width, height] of [[320, 844], [390, 844], [768, 1024], [1440, 900]]) {
    const record = { width, height, pages: [] };
    for (const [label, route] of [['current', '/profile'], ['proposed', '/review/profile-portrait']]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [], writes = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.url()); });
      await page.goto(`${base}${route}`);
      await expect(page.locator('.profile-record')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.locator(label === 'current' ? '.portrait-panel img' : '.standing-portrait-image').evaluate(img => img.decode());
      const metrics = await page.evaluate(() => {
        const main = document.querySelector('.profile-page');
        const image = main.querySelector('img');
        const portrait = document.querySelector('.standing-portrait-stage');
        const record = document.querySelector('.profile-record').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth || main.scrollWidth > main.clientWidth,
          image: { width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight },
          introductionTop: record.top, portraitHeight: portrait?.getBoundingClientRect().height,
          animation: portrait ? getComputedStyle(portrait).animationName : null,
          figureAnimation: document.querySelector('.standing-portrait-figure') ? getComputedStyle(document.querySelector('.standing-portrait-figure')).animationName : null,
          intro: document.querySelector('.profile-intro').textContent,
          records: document.querySelector('.profile-record').textContent,
          links: [...document.querySelectorAll('.profile-record a')].map(a => a.getAttribute('href')),
        };
      });
      expect(metrics.overflow).toBe(false);
      await page.screenshot({ path: `${output}/${label}-${width}.jpg`, quality: 90 });
      if (label === 'proposed') {
        expect(metrics.animation).toBe('none');
        expect(metrics.figureAnimation).toBe('none');
        // CSS layout quantizes dimensions to subpixels; compare in rendered
        // pixels so a 0.013px rounding difference cannot imply distortion.
        expect(Math.abs(metrics.image.width - metrics.image.height * metrics.image.naturalWidth / metrics.image.naturalHeight)).toBeLessThanOrEqual(1 / 64);
        if (width < 720) {
          expect(metrics.portraitHeight).toBe(width < 360 ? 240 : 272);
          expect(metrics.introductionTop).toBeLessThan(width < 360 ? 580 : 520);
        }
        const cv = page.getByRole('button', { name: 'Download CV', exact: true });
        if (width < 720) {
          const portraitBox = await page.locator('.standing-portrait-stage').boundingBox();
          const cvBox = await cv.boundingBox();
          expect(cvBox.x).toBeGreaterThanOrEqual(portraitBox.x + portraitBox.width);
        }
        await cv.focus();
        await expect(cv).toBeFocused();
        const download = page.waitForEvent('download');
        await page.keyboard.press('Enter');
        const file = await download;
        expect(await file.failure()).toBeNull();
        const bytes = await readFile(await file.path());
        expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
        metrics.cv = { filename: file.suggestedFilename(), bytes: bytes.length, keyboard: true, signature: '%PDF-' };
        const tab = page.getByRole('tab', { name: 'Experience', exact: true });
        await tab.focus(); await page.keyboard.press('ArrowRight');
        await expect(page.getByRole('tab', { name: 'Education & training' })).toBeFocused();
        await expect(page.getByRole('tab', { name: 'Education & training' })).toHaveAttribute('aria-selected', 'true');
        await page.keyboard.press('End');
        await expect(page.getByRole('tab', { name: 'Capabilities', exact: true })).toHaveAttribute('aria-selected', 'true');
        await page.screenshot({ path: `${output}/capabilities-${width}.jpg`, quality: 85 });
      }
      expect(errors).toEqual([]); expect(writes).toEqual([]);
      record.pages.push({ label, ...metrics, errors, writes });
      await page.close();
    }
    expect(record.pages[0].intro).toBe(record.pages[1].intro);
    expect(record.pages[0].records).toBe(record.pages[1].records);
    expect(record.pages[0].links).toEqual(record.pages[1].links);
    const pendingPage = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await pendingPage.route('**/review-assets/profile-original-hands.webp', async route => { await held; await route.continue(); });
    await pendingPage.goto(`${base}/review/profile-portrait`, { waitUntil: 'domcontentloaded' });
    const stage = pendingPage.locator('.standing-portrait-stage');
    await expect(stage).toHaveAttribute('data-state', 'loading');
    await pendingPage.evaluate(() => document.fonts.ready);
    const geometry = async () => ({ stage: await stage.boundingBox(), record: await pendingPage.locator('.profile-record').boundingBox() });
    const before = await geometry();
    if (width === 390) await pendingPage.screenshot({ path: `${output}/loading-390.jpg`, quality: 90 });
    release();
    await expect(stage).toHaveAttribute('data-state', 'ready');
    const after = await geometry();
    expect(after).toEqual(before);
    await pendingPage.route('**/review-assets/profile-original-hands.webp', route => route.abort());
    await pendingPage.reload();
    await expect(stage).toHaveAttribute('data-state', 'error');
    await expect(stage.locator('.portrait-panel img')).toHaveAttribute('src', /portrait-striped-finished/);
    await pendingPage.evaluate(() => document.fonts.ready);
    const fallback = await geometry();
    expect(fallback).toEqual(before);
    if (width === 390) await pendingPage.screenshot({ path: `${output}/fallback-390.jpg`, quality: 90 });
    record.loading = { before, after, fallback, stable: true };
    await pendingPage.close();
    findings.push(record);
  }
  for (const width of [390, 1440]) {
    const height = width === 390 ? 844 : 900;
    const label = Buffer.from(`<svg width="${width * 2 + 24}" height="62"><rect width="100%" height="100%" fill="#f3f0e9"/><g font-family="Arial" font-size="20" fill="#252b26"><text x="16" y="38">Current · ${width}px</text><text x="${width + 40}" y="38">Proposed · ${width}px</text></g></svg>`);
    await sharp({ create: { width: width * 2 + 24, height: height + 62, channels: 3, background: '#f3f0e9' } })
      .composite([{ input: label, left: 0, top: 0 }, { input: `${output}/current-${width}.jpg`, left: 0, top: 62 }, { input: `${output}/proposed-${width}.jpg`, left: width + 24, top: 62 }])
      .jpeg({ quality: 92 }).toFile(`${output}/comparison-${width}.jpg`);
  }
} finally { await browser.close(); }
await writeFile(`${output}/validation.json`, JSON.stringify({
  baseline: '160cfda7c579477de33d20fa6b1371c1194b087b',
  environment: 'Compiled portrait-review build; local read-only frozen public content and CV; Windows Chrome. Phone/tablet dimensions are browser emulation, not physical device testing.', findings,
}, null, 2) + '\n');
console.log('Portrait screenshots, comparisons, keyboard CV and record parity checks passed.');
