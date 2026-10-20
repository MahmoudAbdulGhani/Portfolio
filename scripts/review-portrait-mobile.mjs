import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const baseline = process.argv.includes('--before');
const phase = baseline ? 'before' : 'after';
const folder = 'docs/design/profile-portrait-mobile-composition';
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5194';
const widths = [[320, 844], [390, 844], [430, 932], [768, 1024], [1440, 900]];
await mkdir(folder, { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const assets = Object.fromEntries(await Promise.all(['png', 'webp'].map(async ext => [ext, hash(await readFile(`public/review-assets/profile-original-hands.${ext}`))])));
const prior = baseline ? null : JSON.parse(await readFile(`${folder}/before.json`, 'utf8'));
if (prior) expect(assets).toEqual(prior.assets);
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [];
try {
  for (const [width, height] of widths) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', req => { if (!['GET', 'HEAD'].includes(req.method())) writes.push(req.url()); });
    await page.goto(`${base}/review/profile-portrait`);
    const stage = page.locator('.standing-portrait-stage');
    await expect(stage).toHaveAttribute('data-state', 'ready');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.standing-portrait-image').evaluate(img => img.decode());
    const metrics = await page.evaluate(() => {
      const rect = selector => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const { x, y, width, height } = el.getBoundingClientRect();
        return { x, y, width, height };
      };
      const image = document.querySelector('.standing-portrait-image');
      return { overflow: document.documentElement.scrollWidth > innerWidth,
        image: { ...rect('.standing-portrait-image'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight },
        stage: rect('.standing-portrait-stage'), record: rect('.profile-record'),
        name: rect('.portrait-caption .eyebrow'), location: rect('.portrait-location'), languages: rect('.portrait-languages'),
        cv: rect('.profile-portrait > .inline-flex'), socials: rect('.profile-portrait .panel-links'),
        intro: document.querySelector('.profile-intro').textContent,
        records: document.querySelector('.profile-record').textContent,
        links: [...document.querySelectorAll('.profile-record a')].map(el => el.getAttribute('href')),
        identity: document.querySelector('.portrait-caption').textContent,
      };
    });
    expect(metrics.overflow).toBe(false);
    expect(Math.abs(metrics.image.width - metrics.image.height * 960 / 1696)).toBeLessThanOrEqual(1 / 64);
    const screenshot = await page.screenshot({ path: `${folder}/${phase}-${width}.jpg`, quality: 90 });
    const pixels = await sharp(screenshot).raw().toBuffer();
    metrics.screenshotPixelHash = hash(pixels);
    if (!baseline) {
      const old = prior.findings.find(row => row.width === width);
      expect(metrics.intro).toBe(old.metrics.intro);
      expect(metrics.records).toBe(old.metrics.records);
      expect(metrics.links).toEqual(old.metrics.links);
      expect(metrics.identity).toBe(old.metrics.identity);
      if (width >= 720) expect(metrics.screenshotPixelHash, `desktop/tablet unchanged at ${width}`).toBe(old.metrics.screenshotPixelHash);
      if (width >= 390 && width <= 430) {
        expect(metrics.image.width).toBeGreaterThanOrEqual(180);
        expect(metrics.image.width).toBeLessThanOrEqual(200);
      }
      const cv = page.getByRole('button', { name: 'Download CV', exact: true });
      await cv.focus();
      const pendingDownload = page.waitForEvent('download');
      await page.keyboard.press('Enter');
      const download = await pendingDownload;
      expect(await download.failure()).toBeNull();
      const pdf = await readFile(await download.path());
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
      metrics.download = { bytes: pdf.length, filename: download.suggestedFilename(), keyboard: true };
      await page.getByRole('tab', { name: 'Experience', exact: true }).focus();
      await page.keyboard.press('End');
      await expect(page.getByRole('tab', { name: 'Capabilities', exact: true })).toBeFocused();
      await page.getByRole('tab', { name: 'Experience', exact: true }).click();
      let release;
      const held = new Promise(resolve => { release = resolve; });
      await page.route('**/review-assets/profile-original-hands.webp', async route => { await held; await route.continue(); });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(stage).toHaveAttribute('data-state', 'loading');
      await page.evaluate(() => document.fonts.ready);
      const geometry = async () => ({ stage: await stage.boundingBox(), record: await page.locator('.profile-record').boundingBox(), cv: await cv.boundingBox() });
      const pending = await geometry();
      if (width <= 430) await page.screenshot({ path: `${folder}/loading-${width}.jpg`, quality: 90 });
      release();
      await expect(stage).toHaveAttribute('data-state', 'ready');
      expect(await geometry()).toEqual(pending);
      await page.route('**/review-assets/profile-original-hands.webp', route => route.abort());
      await page.reload();
      await expect(stage).toHaveAttribute('data-state', 'error');
      await page.evaluate(() => document.fonts.ready);
      expect(await geometry()).toEqual(pending);
      if (width <= 430) await page.screenshot({ path: `${folder}/fallback-${width}.jpg`, quality: 90 });
      metrics.loading = { stable: true, pending, fallback: await geometry() };
    }
    expect(errors).toEqual([]);
    expect(writes).toEqual([]);
    await page.close();
    // Capture the accepted default at the same widths, independently of the
    // review page. It must remain pixel-identical through this refinement.
    const current = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await current.goto(`${base}/profile`);
    await current.evaluate(() => document.fonts.ready);
    await current.locator('.portrait-panel img').evaluate(img => img.decode());
    const currentPixels = await sharp(await current.screenshot()).raw().toBuffer();
    const defaultProfileHash = hash(currentPixels);
    if (prior) expect(defaultProfileHash).toBe(prior.findings.find(row => row.width === width).defaultProfileHash);
    await current.close();
    findings.push({ width, height, metrics, defaultProfileHash, errors, writes });
  }
  if (!baseline) for (const [width, height] of widths) {
    const labels = Buffer.from(`<svg width="${width * 2 + 24}" height="62"><rect width="100%" height="100%" fill="#ecebe3"/><g font-family="Arial" font-size="18" fill="#252b26"><text x="12" y="38">PR #35 · ${width}px</text><text x="${width + 36}" y="38">Mobile refinement · ${width}px</text></g></svg>`);
    await sharp({ create: { width: width * 2 + 24, height: height + 62, channels: 3, background: '#ecebe3' } })
      .composite([{ input: labels, top: 0, left: 0 }, { input: `${folder}/before-${width}.jpg`, top: 62, left: 0 }, { input: `${folder}/after-${width}.jpg`, top: 62, left: width + 24 }])
      .jpeg({ quality: 92 }).toFile(`${folder}/comparison-${width}.jpg`);
  }
} finally { await browser.close(); }
await writeFile(`${folder}/${phase}.json`, JSON.stringify({ baseline: '376584bbc8297b2e0afaa8a80a36d69df3591af2', environment: 'Compiled review; frozen read-only public GET fixtures and existing CV. Windows Chrome emulation, not physical-device testing.', assets, findings }, null, 2) + '\n');
console.log(`${phase}: five widths captured; ${baseline ? 'PR #35 baseline saved' : 'assets/default/desktop preserved; keyboard CV and stable loading/failure verified'}.`);
