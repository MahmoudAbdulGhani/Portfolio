import { expect, test } from '@playwright/test';
import sharp from 'sharp';

const person = {
  name: 'Mahmoud Hussein Abdul Ghani', title: 'Full-Stack Software Engineer',
  photo: '/myphoto.jpeg', bio: 'Portfolio portrait layout review.',
  socials: [], experience: [], location: 'Tripoli, Lebanon', languages: 'Arabic and English',
};
test.use({ deviceScaleFactor: 2 });
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', route => route.fulfill({
    status: route.request().method() === 'GET' ? 200 : 403,
    contentType: 'application/json',
    body: JSON.stringify(new URL(route.request().url()).pathname === '/api/profile' ? person : []),
  }));
});

for (const [width, height] of [[1363, 936], [1280, 720], [390, 844], [360, 800]]) {
  test(`Profile preserves the accepted frame and delivers native 2x detail at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/profile');
    const image = page.locator('.portrait-panel img');
    await expect(image).toHaveAttribute('width', '768');
    await expect(image).toHaveAttribute('height', '1259');
    await expect(image).toHaveAttribute('srcset', /768w.webp 768w/);
    await image.evaluate(img => (img as HTMLImageElement).decode());
    const metrics = await image.evaluate(img => {
      const el = img as HTMLImageElement, panel = el.parentElement!;
      const box = el.getBoundingClientRect(), frame = panel.getBoundingClientRect();
      return { width: box.width, dpr: devicePixelRatio, src: el.currentSrc,
        panelHeight: frame.height, panelRatio: frame.width / frame.height,
        inset: box.left - frame.left, topInset: box.top - frame.top,
        transform: getComputedStyle(el).transform, filter: getComputedStyle(el).filter,
        objectPosition: getComputedStyle(el).objectPosition,
        overflow: document.documentElement.scrollWidth > innerWidth };
    });
    const file = await page.request.get(metrics.src);
    const metadata = await sharp(await file.body()).metadata();
    expect(file.ok()).toBe(true);
    expect(metadata.width).toBeGreaterThanOrEqual(Math.ceil(metrics.width * metrics.dpr));
    expect(metadata.width).toBeLessThanOrEqual(768);
    expect(metadata.hasAlpha).toBe(true);
    expect(metrics.transform).toBe('none');
    expect(metrics.filter).toBe('none');
    expect(metrics.objectPosition).toBe('50% 0%');
    expect(metrics.inset).toBeCloseTo(width < 720 ? 10 : 20, 1);
    expect(metrics.topInset).toBeCloseTo(width < 720 ? 10 : 20, 1);
    if (width < 720) expect(metrics.panelHeight).toBe(220);
    else expect(metrics.panelRatio).toBeCloseTo(0.8, 2);
    expect(metrics.overflow).toBe(false);
    await expect(image).toHaveAttribute('alt', person.name);
  });
}

test('very wide Profile screens cap the portrait at native source detail', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/profile');
  const image = page.locator('.portrait-panel img');
  await image.evaluate(img => (img as HTMLImageElement).decode());
  const source = await image.evaluate(img => (img as HTMLImageElement).currentSrc);
  const metadata = await sharp(await (await page.request.get(source)).body()).metadata();
  expect(metadata.width).toBe(768);
  expect(await image.evaluate(img => img.getBoundingClientRect().width * devicePixelRatio)).toBeGreaterThan(768);
});

test('a future CMS portrait retains its own source and has no person-specific treatment', async ({ page }) => {
  await page.route('**/api/profile', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...person, photo: '/landscape/portrait-striped-cutout.webp' }) }));
  await page.goto('/profile');
  const image = page.locator('.portrait-panel img');
  await expect(page.locator('.portrait-panel')).toHaveClass(/is-cms-photo/);
  await expect(image).toHaveAttribute('src', '/landscape/portrait-striped-cutout.webp');
  expect(await image.getAttribute('srcset')).toBeNull();
  await expect(image).toHaveCSS('mask-image', 'none');
});

test('delayed portrait loading reserves the accepted panel and explicit image dimensions', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/landscape/portrait-striped-finished*', async route => { await held; await route.continue(); });
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  const panel = page.locator('.portrait-panel');
  await expect(panel.locator('img')).toHaveAttribute('height', '1259');
  await page.evaluate(() => document.fonts.ready);
  const before = await panel.boundingBox();
  release();
  await panel.locator('img').evaluate(img => (img as HTMLImageElement).decode());
  expect(await panel.boundingBox()).toEqual(before);
});
