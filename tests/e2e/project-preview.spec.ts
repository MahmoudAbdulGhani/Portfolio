import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// CMS case-study media must survive independently of the dedicated gallery covers.
const examples = [
  ['jobpilot-ai', 'JobPilot AI', '/preview-remote.png'],
  ['lobby', 'Lobby', '/projects/lobby/friends.webp'],
  ['gamezone-arena', 'GameZone Arena', '/projects/gamezone-arena/user_overview.webp'],
  ['construction-project-management-accounting-system', 'Construction Project Management & Accounting System', '/preview-remote.png'],
  ['unihub', 'UniHub', '/projects/unihub/Admin.webp'],
  ['full-stack-user-management-system', 'Full-Stack User Management System', '/projects/user-management/dashboard.webp'],
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
      : new URL(route.request().url()).pathname.startsWith('/api/projects/') ? records.find(record => record.slug === new URL(route.request().url()).pathname.split('/').at(-1))
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
      expect(frame.padding).toBe(0);
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
      await expect(card.locator('.work-preview')).toHaveAttribute('data-cover-authored', 'true');
      await expect(card.locator('img')).toHaveAttribute('width', '1600');
      await expect(card.locator('img')).toHaveAttribute('height', '1000');
      await expect(card.locator('img')).toHaveAttribute('src', `/projects/gallery-covers/${examples[index][0]}.webp`);
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
          fillsFrame: Math.abs(rect.left - frame.left) < 1 && Math.abs(rect.top - frame.top) < 1 && Math.abs(rect.right - frame.right) < 1 && Math.abs(rect.bottom - frame.bottom) < 1,
          paintedInside: image.naturalWidth * scale <= rect.width + 1 && image.naturalHeight * scale <= rect.height + 1,
          loaded: image.complete && image.naturalWidth > 0,
          fit: style.objectFit, transform: style.transform,
          frameBorder: getComputedStyle(el.querySelector('.work-preview')!).borderWidth,
          frameRadius: getComputedStyle(el.querySelector('.work-preview')!).borderRadius,
          frameShadow: getComputedStyle(el.querySelector('.work-preview')!).boxShadow,
        };
      });
      expect(bounds).toEqual({ pictureInside: true, imageInside: true, fillsFrame: true, paintedInside: true, loaded: true, fit: 'contain', transform: 'none', frameBorder: '0px', frameRadius: '0px', frameShadow: 'none' });
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
  await page.route('**/projects/gallery-covers/jobpilot-ai*', async route => {
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
  await page.keyboard.press('Tab');
  await card.focus();
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS('outline-style', 'solid');
  await expect(card).toHaveCSS('outline-width', '2px');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/jobpilot-ai$/);
});

test('shared display names remain searchable by either title and preserve functional descriptions and media', async ({ page }) => {
  await page.goto('/projects');
  const search = page.getByRole('searchbox', { name: 'Search projects or technologies' });
  for (const query of ['Cedar Construction', examples[3][1]]) {
    await search.fill(query);
    await expect(page.locator('.work-entry')).toHaveCount(1);
    const result = page.locator('.work-entry');
    await expect(result.locator('h2')).toHaveText('Cedar Construction');
    await expect(result).toHaveAttribute('aria-label', `Open ${examples[3][1]} case study`);
    await expect(result).toHaveAttribute('href', `/projects/${examples[3][0]}`);
  }
  await search.fill('User Management');
  await page.getByRole('button', { name: 'Index', exact: true }).click();
  await expect(page.locator('.project-index h2')).toHaveText('User Management');
  await expect(page.locator('.project-index .work-entry')).toHaveAttribute('aria-label', `Open ${examples[5][1]} case study`);
  await page.locator('.work-entry').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('User Management');
  await expect(page.locator('.case-functional-name')).toHaveText(examples[5][1]);
  await expect(page.locator('img[src="/projects/user-management/dashboard.webp"]').first()).toBeVisible();
  await expect(page.locator('img[src*="/projects/gallery-covers/"]')).toHaveCount(0);
});

test('a future CMS project still bounds its tall original without a dedicated cover', async ({ page }) => {
  const original = { ...records[2], id: 'future-project', slug: 'future-project', name: 'Future CMS project' };
  await page.route('**/api/projects', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify([original]) }));
  for (const [width, height] of [[1363, 936], [360, 800]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/projects');
    const card = page.locator('.work-entry');
    const frame = card.locator('.work-preview');
    await expect(frame).toHaveAttribute('data-image-state', 'ready');
    await expect(card.locator('img')).toHaveAttribute('src', examples[2][2]);
    await card.hover();
    const bounds = await frame.evaluate(el => {
      const frame = el.getBoundingClientRect();
      const image = el.querySelector('img')!;
      return {
        padding: parseFloat(getComputedStyle(el).paddingLeft),
        tall: image.naturalHeight > image.naturalWidth,
        contained: [...el.querySelectorAll('picture, img')].every(child => {
          const rect = child.getBoundingClientRect();
          return rect.left >= frame.left - 1 && rect.top >= frame.top - 1 && rect.right <= frame.right + 1 && rect.bottom <= frame.bottom + 1;
        }),
        fit: getComputedStyle(image).objectFit,
      };
    });
    expect(bounds).toEqual({ padding: width < 720 ? 8 : 12, tall: true, contained: true, fit: 'contain' });
    await expect(card).toHaveAttribute('href', '/projects/future-project');
  }
});
