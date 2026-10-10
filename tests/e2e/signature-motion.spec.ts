import { expect, test } from '@playwright/test';
import { caseStudyProjects } from '../fixtures/case-study-projects';

const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1cAAAAASUVORK5CYII=', 'base64');
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('https://screens.example.test/**', route => route.fulfill({ contentType: 'image/png', body: pixel }));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/projects' ? caseStudyProjects : path.startsWith('/api/projects/') ? caseStudyProjects.find(p => path === `/api/projects/${p.slug}`) : path === '/api/profile' ? { name: 'Fixture owner', title: 'Developer', socials: [], experience: [] } : [];
    return route.fulfill({ json: body ?? [] });
  });
});

test('tablet opening keeps its existing deadline after long frames on supported WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1366 });
  await page.addInitScript(() => {
    let injected = false;
    new MutationObserver(changes => {
      if (injected || !changes.some(change => change.attributeName === 'data-selection-state' && (change.target as HTMLElement).dataset.selectionState === 'opening')) return;
      injected = true;
      let count = 0;
      const stall = () => {
        const started = performance.now();
        // Controlled main-thread long frames; the renderer is still genuine
        // supported WebGL. This fixture is separate from real GPU observations.
        while (performance.now() - started < 650) { /* blocked frame */ }
        if (++count < 6) requestAnimationFrame(stall);
      };
      requestAnimationFrame(stall);
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-selection-state'] });
  });
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.is-expanded')).toHaveAttribute('data-selection-state', /opening|settled/, { timeout: 15_000 });
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('.is-expanded')).toHaveAttribute('data-selection-state', 'settled');
  expect(await page.locator('.selection-detail').evaluate(el => (el as HTMLElement).inert)).toBe(false);
  await expect(page.getByRole('link', { name: 'Open case study', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeFocused();
});
