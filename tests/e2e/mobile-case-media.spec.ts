import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { caseStudyProjects } from '../fixtures/case-study-projects';

// Synthetic same-dimension rasters for controlled geometry/network regressions.
// The separate visual review uses every actual project asset.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://screens.example.test/**', async route => {
    const portrait = route.request().url().includes('88b64d21');
    const body = await sharp({ create: { width: portrait ? 572 : 1900, height: portrait ? 768 : 881, channels: 3, background: '#dce0d5' } }).png().toBuffer();
    await route.fulfill({ contentType: 'image/png', body });
  });
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/projects' ? caseStudyProjects : path.startsWith('/api/projects/') ? caseStudyProjects.find(project => path === `/api/projects/${project.slug}`) : path === '/api/profile' ? { name: 'Fixture owner', title: 'Developer', socials: [], experience: [] } : [];
    return route.fulfill({ json: body ?? [] });
  });
});

for (const width of [320, 390, 768, 1363]) for (const project of caseStudyProjects) test(`${project.slug} workflow order and complete frames at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 936 });
      await page.goto(`/projects/${project.slug}`);
      await expect(page.locator('.case-heading')).toBeVisible();
      for (const figure of await page.locator('.workflow-frames figure').all()) {
        const intro = figure.locator('figcaption'), details = figure.locator('.workflow-details'), full = figure.getByRole('button', { name: 'View full screen', exact: true });
        expect(await intro.evaluate(el => Boolean(el.compareDocumentPosition(el.nextElementSibling!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
        await expect(intro.locator('h3')).not.toHaveText('');
        await expect(intro.locator('p')).not.toHaveText('');
        expect(await details.evaluate(el => Boolean(el.compareDocumentPosition(el.nextElementSibling!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
        expect((await full.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        for (const frame of await details.locator('.screenshot-frame').all()) {
          await frame.scrollIntoViewIfNeeded();
          await expect(frame).toHaveAttribute('data-image-state', 'ready');
          const composition = await frame.evaluate(el => {
            const img = el.querySelector('.screenshot-button img') as HTMLImageElement;
            const bounds = el.getBoundingClientRect();
            return { height: bounds.height, expectedHeight: bounds.width * (Number(img.getAttribute('height')) || img.naturalHeight) / (Number(img.getAttribute('width')) || img.naturalWidth), transform: getComputedStyle(img).transform, fit: getComputedStyle(img).objectFit };
          });
          // Responsive srcset density rounds naturalWidth/naturalHeight to
          // integer CSS pixels. The measured source attributes retain precision.
          expect(composition.height).toBeCloseTo(composition.expectedHeight, 1);
          expect(composition.transform).toBe('none');
          expect(composition.fit).toBe('contain');
        }
        await full.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(full).toBeFocused();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('portrait Fit preserves the full image without upscaling; width and actual modes remain explicit', async ({ page }) => {
  for (const viewport of [{ width: 320, height: 234 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1363, height: 936 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/projects/construction-project-management-accounting-system');
    await page.locator('.case-media-chooser summary').click();
    await page.locator('.case-media-chooser').getByRole('button', { name: /AI project risk and forecast advisor/ }).click();
    const frame = page.locator('.case-figure .screenshot-frame');
    await expect(frame.locator('.screenshot-button img')).toHaveAttribute('src', /88b64d21/);
    await expect(frame).toHaveAttribute('data-image-state', 'ready');
    await expect(page.locator('.case-media-title strong')).toHaveText('AI project risk and forecast advisor');
    // Enlarge follows the last ready image during a source handoff. Wait for
    // the chosen portrait instead of inspecting the held previous overview.
    await expect(page.locator('.case-figure figcaption')).toContainText('advisor');
    const trigger = page.locator('.media-enlarge');
    await trigger.click();
    const dialog = page.getByRole('dialog'), region = dialog.locator('.case-inspector-image');
    await dialog.getByRole('region', { name: 'Image title and evidence note', exact: true }).focus();
    await page.keyboard.press('ArrowDown');
    const img = region.locator('.project-image-current img');
    await img.evaluate(node => (node as HTMLImageElement).decode());
    await expect(dialog.getByRole('button', { name: 'Fit', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const geometry = await region.evaluate(el => {
      const img = el.querySelector('.project-image-current img') as HTMLImageElement;
      const scale = Math.min(1, el.clientWidth / img.naturalWidth, el.clientHeight / img.naturalHeight);
      return { fits: el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth, fit: getComputedStyle(img).objectFit, visibleWidth: img.naturalWidth * scale, visibleHeight: img.naturalHeight * scale, width: el.clientWidth, height: el.clientHeight };
    });
    expect(geometry.fits).toBe(true);
    expect(geometry.height).toBeGreaterThan(0);
    expect(geometry.fit).toBe('scale-down');
    expect(geometry.visibleWidth).toBeLessThanOrEqual(Math.min(572, geometry.width));
    expect(geometry.visibleHeight).toBeLessThanOrEqual(Math.min(768, geometry.height));
    for (const name of ['Fit', 'Fit width', 'Actual size', 'Close gallery', 'Previous screenshot', 'Next screenshot']) {
      const bounds = await dialog.getByRole('button', { name, exact: true }).boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(44); expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.y).toBeGreaterThanOrEqual(0); expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
    }
    await dialog.getByRole('button', { name: 'Fit width', exact: true }).click();
    await expect(region).toHaveClass(/is-width/);
    await dialog.getByRole('button', { name: 'Actual size', exact: true }).click();
    await img.evaluate(node => (node as HTMLImageElement).decode());
    // Firefox's DOMRect can differ by ~0.00001px after fractional positioning.
    // Assert the computed 1:1 source size exactly instead of a rounded rect.
    expect(await img.evaluate(el => getComputedStyle(el).width)).toBe('572px');
    expect(await img.evaluate(el => getComputedStyle(el).height)).toBe('768px');
    await region.focus(); await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  }
});

test('viewer responsive failure can retry the complete original and retire an earlier attempt', async ({ page }) => {
  const body = await sharp({ create: { width: 1920, height: 883, channels: 3, background: '#dce0d5' } }).png().toBuffer();
  await page.route('**/projects/phase3/gamezone-rooms*', route => new URL(route.request().url()).pathname.endsWith('gamezone-rooms.webp') ? route.fulfill({ contentType: 'image/png', body }) : route.fulfill({ status: 503, body: '' }));
  await page.goto('/projects/gamezone-arena');
  await page.locator('.media-enlarge').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('This image is unavailable.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Retry original image', exact: true }).click();
  await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state', 'ready');
  await expect(dialog.locator('.project-image-current source')).toHaveCount(0);
  await expect(dialog.locator('.project-image-current img')).not.toHaveAttribute('srcset');
  await expect(dialog.locator('.project-image-current img')).toHaveAttribute('src', '/projects/phase3/gamezone-rooms.webp');
  await expect(dialog.getByText('This image is unavailable.')).toHaveCount(0);
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('h2')).toHaveText(/Session date and time/);
  await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state', 'ready');
});

test('small responsive portrait keeps its native density hint in the desktop viewer', async ({ page }) => {
  await page.setViewportSize({ width: 1363, height: 936 });
  await page.goto('/projects/full-stack-user-management-system');
  await page.locator('.case-media-chooser summary').click();
  await page.locator('.case-media-chooser').getByRole('button', { name: /Mobile registration/ }).click();
  await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state', 'ready');
  await expect(page.locator('.case-figure figcaption')).toContainText('Mobile registration');
  await page.locator('.media-enlarge').click();
  const image = page.locator('.case-inspector-image .project-image-current img');
  await image.evaluate(node => (node as HTMLImageElement).decode());
  const dimensions = await image.evaluate(node => ({ width: (node as HTMLImageElement).naturalWidth, height: (node as HTMLImageElement).naturalHeight }));
  expect(dimensions.width).toBeLessThanOrEqual(343);
  expect(dimensions.height).toBeLessThanOrEqual(654);
});
