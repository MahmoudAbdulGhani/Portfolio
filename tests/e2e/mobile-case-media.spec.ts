import { expect, test } from '@playwright/test';
import { caseImage } from '../fixtures/case-image';
import { completeScreenSource, detailScreens, screenColumnWidth, screenGeometry } from '../../src/lib/project-detail-screens';
import { caseStudyProjects } from '../fixtures/case-study-projects';

// Synthetic same-dimension rasters for controlled geometry/network regressions.
// The separate visual review uses every actual project asset.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://screens.example.test/**', async route => {
    const body = await caseImage(route.request().url());
    await route.fulfill({ contentType: 'image/png', body });
  });
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/projects' ? caseStudyProjects : path.startsWith('/api/projects/') ? caseStudyProjects.find(project => path === `/api/projects/${project.slug}`) : path === '/api/profile' ? { name: 'Fixture owner', title: 'Developer', socials: [], experience: [] } : [];
    return route.fulfill({ json: body ?? [] });
  });
});

for (const width of [320, 390, 430, 768, 1024, 1440]) for (const project of caseStudyProjects) test(`${project.slug} workflow order and complete frames at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 936 });
      await page.goto(`/projects/${project.slug}`);
      await expect(page.locator('.case-heading')).toBeVisible();
      const secondaryWorkflow=page.locator('.jobpilot-secondary-workflow');
      const hasSecondaryWorkflow=['jobpilot-ai','lobby'].includes(project.slug);
      await expect(secondaryWorkflow).toHaveCount(hasSecondaryWorkflow?1:0);
      if(hasSecondaryWorkflow){
        await secondaryWorkflow.locator('summary').click();
        await expect(secondaryWorkflow).toHaveAttribute('open','');
      }
      await expect(page.locator('.workflow-detail-label')).toHaveCount(0);
      for (const figure of await page.locator('.workflow-frames figure').all()) {
        const intro = figure.locator('figcaption'), details = figure.locator('.workflow-details'), full = figure.getByRole('button', { name: /^Enlarge / });
        expect(await intro.evaluate(el => Boolean(el.compareDocumentPosition(el.nextElementSibling!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
        await expect(intro.locator('h3')).not.toHaveText('');
        await expect(intro.locator('p')).not.toHaveText('');
        // The complete screenshot is now the inspection action; a duplicate
        // full-screen button no longer separates it from the next step.
        await expect(figure.getByRole('button', { name: 'View full screen', exact: true })).toHaveCount(0);
        await expect(details.locator('.screenshot-frame')).toHaveCount(1);
        for (const frame of await details.locator('.screenshot-frame').all()) {
          await frame.scrollIntoViewIfNeeded();
          await expect(frame).toHaveAttribute('data-image-state', 'ready');
          const source = await frame.locator('.screenshot-button img').getAttribute('src');
          expect(source).not.toContain('/projects/case-media/');
          expect(completeScreenSource(source!)).toBe(source);
          const expected = screenGeometry({ src: source!, label: 'Regression' });
          const maximum = screenColumnWidth({ src: source!, label: 'Regression' });
          const composition = await frame.evaluate(el => {
            const img = el.querySelector('.screenshot-button img') as HTMLImageElement;
            const bounds = el.getBoundingClientRect();
            return { width: bounds.width, height: bounds.height, expectedHeight: bounds.width * (Number(img.getAttribute('height')) || img.naturalHeight) / (Number(img.getAttribute('width')) || img.naturalWidth), transform: getComputedStyle(img).transform, fit: getComputedStyle(img).objectFit };
          });
          // Responsive srcset density rounds naturalWidth/naturalHeight to
          // integer CSS pixels. The measured source attributes retain precision.
          expect(composition.width).toBeLessThanOrEqual(maximum);
          if (width === 1440 && source?.includes('gamezone-')) expect(composition.width).toBeCloseTo(1180, 0);
          expect(composition.height).toBeCloseTo(composition.width * expected.height / expected.width, 1);
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
    await page.locator('.case-media-chooser').getByRole('button', { name: /Project details and operations/ }).click();
    const frame = page.locator('.case-figure .screenshot-frame');
    await expect(frame.locator('.screenshot-button img')).toHaveAttribute('src', /b5279347/);
    await expect(frame).toHaveAttribute('data-image-state', 'ready');
    await expect(page.locator('.case-media-title strong')).toHaveText('Project details and operations');
    // Enlarge follows the last ready image during a source handoff. Wait for
    // the chosen portrait instead of inspecting the held previous overview.
    await expect(page.locator('.case-figure figcaption')).toContainText('Project details and operations');
    const trigger = page.locator('.media-enlarge');
    await trigger.click();
    const dialog = page.getByRole('dialog'), region = dialog.locator('.case-inspector-image');
    await dialog.getByRole('region', { name: 'Image description', exact: true }).focus();
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
    expect(geometry.visibleWidth).toBeLessThanOrEqual(Math.min(1920, geometry.width));
    expect(geometry.visibleHeight).toBeLessThanOrEqual(Math.min(2333, geometry.height));
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
    expect(await img.evaluate(el => getComputedStyle(el).width)).toBe('1920px');
    expect(await img.evaluate(el => getComputedStyle(el).height)).toBe('2333px');
    await region.focus(); await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  }
});

test('viewer responsive failure can retry the complete original and retire an earlier attempt', async ({ page }) => {
  const body = await caseImage('/projects/complete/gamezone-rooms.webp');
  await page.route('**/projects/complete/gamezone-rooms*', route => new URL(route.request().url()).pathname.endsWith('gamezone-rooms.webp') ? route.fulfill({ contentType: 'image/png', body }) : route.fulfill({ status: 503, body: '' }));
  await page.goto('/projects/gamezone-arena');
  await page.locator('.media-enlarge').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('This image is unavailable.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Retry original image', exact: true }).click();
  await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state', 'ready');
  await expect(dialog.locator('.project-image-current source')).toHaveCount(0);
  await expect(dialog.locator('.project-image-current img')).not.toHaveAttribute('srcset');
  await expect(dialog.locator('.project-image-current img')).toHaveAttribute('src', '/projects/complete/gamezone-rooms.webp');
  await expect(dialog.getByText('This image is unavailable.')).toHaveCount(0);
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('h2')).toHaveText(/Session date and time/);
  await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state', 'ready');
});

test('small responsive portrait keeps its native density hint in the desktop viewer', async ({ page }) => {
  await page.setViewportSize({ width: 1363, height: 936 });
  await page.goto('/projects/home-services');
  await page.locator('.case-media-chooser summary').click();
  await page.locator('.case-media-chooser').getByRole('button', { name: /Mobile navigation on the public demonstration page/ }).click();
  await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state', 'ready');
  await expect(page.locator('.case-figure figcaption')).toContainText('Mobile navigation on the public demonstration page');
  await page.locator('.media-enlarge').click();
  const image = page.locator('.case-inspector-image .project-image-current img');
  await image.evaluate(node => (node as HTMLImageElement).decode());
  const dimensions = await image.evaluate(node => ({ width: (node as HTMLImageElement).naturalWidth, height: (node as HTMLImageElement).naturalHeight }));
  expect(dimensions.width).toBeLessThanOrEqual(390);
  expect(dimensions.height).toBeLessThanOrEqual(844);
});

test('public media normalization excludes every registration excerpt alias and retains one complete capture', () => {
  const project = caseStudyProjects.find(project => project.slug === 'full-stack-user-management-system')!;
  const excerpt = '/projects/responsive/user-management-phone.webp';
  const variants = [excerpt, `${excerpt}?revision=2#image`, 'https://cms.example.test/projects/complete/user-management-phone-343w.avif?asset=1', '/projects/complete/user-management-phone-343w.webp', '/projects/responsive/%75ser-management-phone.webp'];
  for (const legacy of variants) {
    for (const screenshots of [undefined, [legacy], [...variants, '/projects/phase3/user-management-registration.webp', 'https://cms.example.test/projects/complete/user-management-registration.webp?revision=3']]) {
      const record = { ...project, coverImage: legacy, screenshots };
      const original = JSON.stringify(record);
      const screens = detailScreens(record);
      expect(screens.some(screen => screen.src.includes('user-management-phone'))).toBe(false);
      expect(screens.filter(screen => screen.src === '/projects/complete/user-management-registration.webp')).toHaveLength(1);
      expect(screens.find(screen => screen.src.endsWith('/user-management-registration.webp'))?.label).toBe('Public registration form · portrait capture');
      expect(new Set(screens.map(screen => screen.src)).size).toBe(screens.length);
      expect(JSON.stringify(record)).toBe(original);
    }
  }
});

for (const width of [320, 390, 430, 768, 1024, 1440]) test(`User Management exposes only complete images through every public selection path at ${width}px`, async ({ page }) => {
  const project = caseStudyProjects.find(project => project.slug === 'full-stack-user-management-system')!;
  await page.route('**/api/projects/full-stack-user-management-system', route => route.fulfill({ json: {
    ...project, coverImage: '/projects/responsive/user-management-phone.webp?legacy=1',
    screenshots: [...project.screenshots!, '/projects/responsive/user-management-phone.webp', '/projects/complete/user-management-phone-343w.avif?legacy=2', '/projects/phase3/user-management-registration.webp', 'https://cms.example.test/projects/complete/user-management-registration.webp?legacy=3'],
  } }));
  const requested: string[] = [];
  page.on('request', request => requested.push(request.url()));
  const labels = ['Public platform statistics', 'Public registration form · portrait capture'];
    await page.setViewportSize({ width, height: 936 });
    await page.goto('/projects/full-stack-user-management-system');
    const chooser = page.locator('.case-media-chooser');
    await chooser.locator('summary').click();
    await expect(chooser.locator('li button')).toHaveCount(2);
    await expect(chooser.locator('.media-choice-number')).toHaveText(['01', '02']);
    await expect(chooser.getByText(/Registration form excerpt/)).toHaveCount(0);
    await chooser.locator('summary').click();
    for (const [index, label] of labels.entries()) {
      await chooser.locator('summary').click();
      await chooser.getByRole('button', { name: new RegExp(label) }).click();
      await expect(page.locator('.case-media-title > span')).toHaveText(`${index + 1} / 2`);
      await expect(page.locator('.case-media-title strong')).toHaveText(label);
      await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state', 'ready');
      await expect(page.locator('.case-figure figcaption')).toContainText(index === 0 ? 'Public aggregate statistics, with sample account totals.' : label);
      const trigger = page.locator('.media-enlarge');
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.locator('h2')).toHaveText(label);
      await expect(dialog.locator('.case-inspector-thumbs button')).toHaveCount(2);
      await expect(dialog.locator('footer > p')).toHaveText(`${index + 1} / 2`);
      await dialog.getByRole('button', { name: 'Next screenshot', exact: true }).click();
      await expect(dialog.locator('h2')).toHaveText(labels[(index + 1) % 2]);
      await dialog.getByRole('button', { name: 'Previous screenshot', exact: true }).click();
      await expect(dialog.locator('h2')).toHaveText(label);
      await page.keyboard.press('ArrowRight');
      await expect(dialog.locator('h2')).toHaveText(labels[(index + 1) % 2]);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
    const workflow = page.locator('.workflow-frames .screenshot-frame');
    await expect(workflow).toHaveCount(1);
    await workflow.scrollIntoViewIfNeeded();
    await expect(workflow.locator('img')).toHaveAttribute('src', '/projects/complete/user-management-registration.webp');
    const gallerySummary = page.locator('.case-gallery-disclosure > summary');
    await expect(gallerySummary).toContainText('All project images (2)');
    await gallerySummary.click();
    const figures = page.locator('.reader-gallery figure');
    await expect(figures).toHaveCount(2);
    await expect(figures.locator('h3')).toHaveText(labels);
    for (const [index, figure] of (await figures.all()).entries()) {
      await figure.scrollIntoViewIfNeeded();
      await expect(figure.locator('.screenshot-frame')).toHaveAttribute('data-image-state', 'ready');
      const trigger = figure.getByRole('button', { name: /^Enlarge / });
      await trigger.click();
      await expect(page.getByRole('dialog').locator('h2')).toHaveText(labels[index]);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
    await expect(page.getByText(/Registration form excerpt/)).toHaveCount(0);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/projects\/user-management\/dashboard\.webp/);
    expect(await page.locator('img').evaluateAll(images => images.some(image => image.src.includes('user-management-phone')))).toBe(false);
  expect(requested.some(url => url.includes('user-management-phone'))).toBe(false);
});

test('viewer keeps the complete registration source when refreshed CMS media changes the count', async ({ page }) => {
  const project = caseStudyProjects.find(project => project.slug === 'full-stack-user-management-system')!;
  let record = project;
  await page.route('**/api/projects/full-stack-user-management-system', route => route.fulfill({ json: record }));
  await page.clock.install();
  await page.goto('/projects/full-stack-user-management-system');
  const trigger = page.locator('.media-enlarge');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Next screenshot', exact: true }).click();
  await expect(dialog.locator('h2')).toHaveText('Public registration form · portrait capture');
  await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state', 'ready');
  record = { ...project, coverImage: '/projects/responsive/user-management-phone.webp', screenshots: ['/projects/complete/user-management-phone-343w.avif'] };
  await page.clock.fastForward(61_000);
  await page.evaluate(() => { window.dispatchEvent(new Event('offline')); window.dispatchEvent(new Event('online')); });
  await expect(dialog.locator('footer > p')).toHaveText('1 / 1');
  await expect(dialog.locator('h2')).toHaveText('Public registration form · portrait capture');
  // A single remaining image needs no thumbnail navigation.
  await expect(dialog.locator('.case-inspector-thumbs')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Next screenshot', exact: true })).toBeDisabled();
  await expect(dialog.locator('.project-image-current img')).toHaveAttribute('src', '/projects/complete/user-management-registration.webp');
  record = project;
  await page.clock.fastForward(61_000);
  await page.evaluate(() => { window.dispatchEvent(new Event('offline')); window.dispatchEvent(new Event('online')); });
  await expect(dialog.locator('footer > p')).toHaveText('2 / 2');
  await expect(dialog.locator('h2')).toHaveText('Public registration form · portrait capture');
  await expect(dialog.locator('.case-inspector-thumbs button')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
