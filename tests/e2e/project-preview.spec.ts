import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Real aspect ratios, including the tall image that triggered the regression.
const examples = [
  ['jobpilot-ai', 'JobPilot AI', '/preview-remote.png'],
  ['lobby', 'Lobby', '/projects/lobby/friends.webp'],
  ['gamezone-arena', 'GameZone Arena', '/projects/gamezone-arena/user_overview.webp'],
  ['construction-project-management-accounting-system', 'Construction Project Management & Accounting System', '/preview-remote.png'],
  ['unihub', 'UniHub', '/projects/unihub/Admin.webp'],
  ['full-stack-user-management-system', 'User Management', '/projects/user-management/dashboard.webp'],
  ['medicare-hub', 'Medicare Hub', '/projects/cinematic/medicare-logo.webp'],
  ['home-services', 'Home Services', '/projects/cinematic/home-services.webp'],
];
const records = examples.map(([slug, name, src], index) => ({
  id: slug, slug, name, type: 'CMS category', stack: ['React'],
  published: true, showOnPortfolio: true, order: index,
  coverImage: src, screenshots: [src],
  tagline: 'CMS tagline', description: 'CMS description', overview: 'CMS overview',
  features: [], team: [], contributions: [], visual: '',
}));

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', route => route.fulfill({
    status: route.request().method() === 'GET' ? 200 : 403,
    contentType: 'application/json',
    body: JSON.stringify(new URL(route.request().url()).pathname === '/api/projects' ? records
      : new URL(route.request().url()).pathname === '/api/profile' ? { name: 'CMS Owner', title: 'Developer', photo: '/myphoto.jpeg', socials: [], experience: [] }
      : []),
  }));
  // Exercise the remote/unoptimized path without relying on a live image host.
  const image = await readFile('public/projects/cinematic/home-services.webp');
  await page.route('**/preview-remote.png', route => route.fulfill({ contentType: 'image/webp', body: image }));
});

for (const [width, height] of [[1363, 936], [1280, 720], [390, 844], [320, 568]]) {
  test(`all eight previews remain complete on hover and Gallery/Index changes at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/projects');
    await expect(page.locator('.work-entry')).toHaveCount(8);
    const composition = await page.locator('.work-entry').evaluateAll(entries => entries.slice(0, 2).map(el => {
      const frame = el.querySelector('.work-preview')!;
      const rect = frame.getBoundingClientRect();
      return { width: rect.width, top: rect.top, ratio: rect.width / rect.height, padding: parseFloat(getComputedStyle(frame).paddingLeft) };
    }));
    for (const frame of composition) {
      expect(frame.ratio).toBeCloseTo(1.6, 2);
      expect(frame.padding).toBe(width < 720 ? 8 : 12);
    }
    if (width >= 720) {
      expect(composition[0].width).toBeCloseTo(composition[1].width, 1);
      expect(composition[0].top).toBeCloseTo(composition[1].top, 1);
      const categories = await page.locator('.work-caption p').evaluateAll(elements => elements.slice(0, 2).map(el => el.getBoundingClientRect().top));
      expect(categories[0]).toBeCloseTo(categories[1], 1);
    }
    for (let index = 0; index < examples.length; index++) {
      const card = page.locator('.work-entry').nth(index);
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator('.work-preview')).toHaveAttribute('data-image-state', 'ready');
      await card.hover();
      const bounds = await card.evaluate(el => {
        const frame = el.querySelector('.work-preview')!.getBoundingClientRect();
        const picture = el.querySelector('picture')!.getBoundingClientRect();
        const image = el.querySelector('img')!;
        const rect = image.getBoundingClientRect();
        const style = getComputedStyle(image);
        // The painted contain rectangle must fit in both dimensions. Checking
        // only computed object-fit missed the original overflowing img box.
        const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
        return {
          pictureInside: picture.left >= frame.left - 1 && picture.top >= frame.top - 1 && picture.right <= frame.right + 1 && picture.bottom <= frame.bottom + 1,
          imageInside: rect.left >= frame.left - 1 && rect.top >= frame.top - 1 && rect.right <= frame.right + 1 && rect.bottom <= frame.bottom + 1,
          paintedInside: image.naturalWidth * scale <= rect.width + 1 && image.naturalHeight * scale <= rect.height + 1,
          loaded: image.complete && image.naturalWidth > 0,
          fit: style.objectFit, transform: style.transform,
        };
      });
      expect(bounds).toEqual({ pictureInside: true, imageInside: true, paintedInside: true, loaded: true, fit: 'contain', transform: 'none' });
      await expect(card).toHaveAttribute('href', `/projects/${examples[index][0]}`);
    }
    expect(await page.evaluate(() => document.body.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Index', exact: true }).click();
    await expect(page.locator('.project-index .work-entry')).toHaveCount(8);
    await expect(page.locator('.project-index img')).toHaveCount(0);
    await page.getByRole('button', { name: 'Gallery', exact: true }).click();
    await expect(page.locator('.work-preview')).toHaveCount(8);
  });
}

test('slow and failed previews reserve their frame and keep the case study keyboard accessible', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/preview-remote.png', async route => {
    await held;
    await route.fulfill({ status: 404, body: 'Missing preview' });
  });
  await page.goto('/projects');
  const card = page.locator('.work-entry').first();
  const frame = card.locator('.work-preview');
  await expect(frame).toHaveAttribute('aria-busy', 'true');
  await expect(card.getByRole('status')).toHaveText('Loading preview…');
  const before = await frame.boundingBox();
  release();
  await expect(frame).toHaveAttribute('data-image-state', 'failed');
  await expect(frame).toHaveAttribute('aria-busy', 'false');
  await expect(card.getByRole('status')).toHaveText('Preview unavailable. Open the case study.');
  await expect(card.locator('img')).toHaveCount(0);
  const after = await frame.boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  await card.focus();
  await expect(card).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/jobpilot-ai$/);
});
