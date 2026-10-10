import { expect, test } from '@playwright/test';
import { caseStudyProjects } from '../fixtures/case-study-projects';
import { caseStudyFor } from '../../shared/case-study-runtime';
import { projectDisplayName } from '../../shared/content-integrity';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://screens.example.test/**', route => route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1cAAAAASUVORK5CYII=', 'base64') }));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/projects' ? caseStudyProjects : path.startsWith('/api/projects/') ? caseStudyProjects.find(p => path === `/api/projects/${p.slug}`) : path === '/api/profile' ? { name: 'Test owner', shortName: 'Owner', title: 'Developer', socials: [], experience: [] } : [];
    return route.fulfill({ json: body ?? [] });
  });
});

for (const project of caseStudyProjects) test(`${projectDisplayName(project)} retains a concise sourced story and working reader at four widths`, async ({ page }) => {
  const study = caseStudyFor(project)!;
  for (const width of [1363, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1363 ? 936 : width === 1024 ? 1366 : 844 });
    await page.goto(`/projects/${project.slug}`);
    await expect(page.getByRole('heading', { name: projectDisplayName(project), exact: true })).toBeVisible();
    await expect(page.locator('.case-purpose')).toHaveText(study.summary);
    await expect(page.locator('#overview')).toContainText(study.problemHeading);
    await expect(page.locator('#workflow')).toContainText(study.workflowHeading);
    await expect(page.locator('#scope')).toContainText(study.limits[0]);
    await expect(page.locator('#contribution')).toHaveCount(['medicare-hub', 'home-services'].includes(project.slug) ? 0 : 1);
    await expect(page.locator('.case-actions a').last()).toHaveAttribute('href', project.github!);
    expect(await page.locator('.page-surface').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const caption of await page.locator('.workflow-frames figcaption').all()) {
      await expect(caption.locator('p')).not.toHaveText('');
      expect(await caption.locator('p').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
    }
    if (project.slug === 'home-services') await expect(page.locator('.story-credit')).toContainText('supplied');
    if (project.slug === 'medicare-hub') await expect(page.locator('.decision-path')).toContainText('not a simulated product screen');
    if (width === 390) {
      const decision = page.locator('.engineering-decisions summary').first();
      await decision.focus(); await page.keyboard.press('Enter');
      await expect(decision.locator('..')).toHaveAttribute('open', '');
      await expect(decision.locator('..').getByRole('link').first()).toHaveAttribute('href', study.sources.find(source => source.id === study.decisions[0].sources[0])!.url);
      const trigger = page.locator('.case-screen-tools > button');
      await trigger.focus(); await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog', { name: `${projectDisplayName(project)} image gallery` })).toBeVisible();
      await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
      const chapters = page.locator('.case-screen-tools .chapter-switch button');
      if (await chapters.count() > 1) {
        await page.locator('.case-media-chooser summary').click();
        await chapters.nth(1).click();
      }
      const next = page.locator('.next-project');
      await next.click();
      await expect(page.locator('.case-screen-tools .chapter-switch button').first()).toHaveAttribute('aria-pressed', 'true');
    }
  }
});

test('a delayed workflow image reserves its frame and keeps its caption in place', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/projects/case-media/jobpilot-source*', async route => {
    await pending;
    await route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1cAAAAASUVORK5CYII=', 'base64') });
  });
  await page.goto('/projects/jobpilot-ai');
  const figure = page.locator('.workflow-frames figure').first();
  await figure.scrollIntoViewIfNeeded();
  await expect(figure.locator('.screenshot-button img').first()).toBeAttached();
  const before = await figure.evaluate(el => ({ height: el.querySelector('button')!.getBoundingClientRect().height, caption: el.querySelector('figcaption')!.getBoundingClientRect().top, loaded: (el.querySelector('img') as HTMLImageElement).naturalWidth > 0 }));
  expect(before.height).toBeGreaterThan(150);
  expect(before.loaded).toBe(false);
  release();
  await figure.locator('.screenshot-button img').first().evaluate(img => (img as HTMLImageElement).decode());
  const after = await figure.evaluate(el => ({ height: el.querySelector('button')!.getBoundingClientRect().height, caption: el.querySelector('figcaption')!.getBoundingClientRect().top }));
  expect(after.height).toBeCloseTo(before.height, 0);
  expect(after.caption).toBeCloseTo(before.caption, 0);
});
