import { expect, test } from '@playwright/test';

const person = {
  name: 'Mahmoud Hussein Abdul Ghani', title: 'Full-Stack Software Engineer',
  photo: '/myphoto.jpeg', bio: 'Profile review', experience: [],
  socials: [{ label: 'GitHub', url: 'https://github.com/MahmoudAbdulGhani' }, { label: 'LinkedIn', url: 'https://www.linkedin.com/' }, { label: 'Instagram', url: 'https://www.instagram.com/' }, { label: 'WhatsApp', url: 'https://www.whatsapp.com/' }],
  location: 'Tripoli, Lebanon', languages: 'Arabic: Native | English: Professional Working Proficiency',
};
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({
    json: new URL(route.request().url()).pathname === '/api/profile' ? person : [],
  }));
});

for (const width of [320, 390, 430, 768, 1440]) {
  test(`Profile preserves natural ratio and content access at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/profile');
    const stage = page.locator('.standing-portrait-stage');
    await expect(stage).toHaveAttribute('data-state', 'ready');
    await expect(stage.locator('img')).toHaveAttribute('src', '/review-assets/profile-original-hands.webp');
    const metrics = await page.locator('.standing-portrait-image').evaluate(el => {
      const img = el as HTMLImageElement, rect = img.getBoundingClientRect();
      const main = document.querySelector('.profile-page')!;
      return { width: rect.width, height: rect.height, nativeRatio: img.naturalWidth / img.naturalHeight,
        // The normal route also mounts independent header/assistant UI. Check
        // all Profile descendants, including the portrait and record groups.
        animationCount: main.getAnimations({ subtree: true }).length,
        activeAnimations: main.getAnimations({ subtree: true }).map(animation => ({
          target: animation.effect instanceof KeyframeEffect ? (animation.effect.target as Element | null)?.className : null,
          state: animation.playState,
        })),
        overflow: main.scrollWidth > main.clientWidth || document.documentElement.scrollWidth > innerWidth,
        top: document.querySelector('.profile-record')!.getBoundingClientRect().top };
    });
    expect(Math.abs(metrics.width - metrics.height * metrics.nativeRatio)).toBeLessThanOrEqual(1 / 64);
    expect(metrics.overflow).toBe(false);
    expect(metrics.animationCount, JSON.stringify(metrics.activeAnimations)).toBe(0);
    if (width < 720) {
      expect(metrics.width).toBe(width === 320 ? 180 : width === 390 ? 190 : 200);
      const portrait = await page.locator('.profile-portrait').boundingBox();
      const name = await page.locator('.portrait-caption .eyebrow').boundingBox();
      const languages = await page.locator('.portrait-languages').boundingBox();
      const links = await page.locator('.profile-details .panel-links').boundingBox();
      const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
      const introduction = await page.locator('.profile-intro').boundingBox();
      const tabs = await page.getByRole('tablist').boundingBox();
      const stageBox = await stage.boundingBox();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('.profile-intro')).toHaveCount(1);
      expect(heading!.y + heading!.height).toBeLessThanOrEqual(name!.y);
      expect(name!.y + name!.height).toBeLessThanOrEqual(stageBox!.y);
      expect(name!.height).toBe(20);
      expect(Math.abs(name!.width - portrait!.width)).toBeLessThanOrEqual(1 / 64);
      expect(Math.abs(languages!.width - portrait!.width)).toBeLessThanOrEqual(1 / 64);
      expect(introduction!.y).toBeGreaterThanOrEqual(stageBox!.y + stageBox!.height);
      expect(languages!.y).toBeGreaterThanOrEqual(introduction!.y + introduction!.height);
      expect(links!.y).toBeGreaterThanOrEqual(languages!.y + languages!.height);
      expect(tabs!.y).toBeGreaterThanOrEqual(links!.y + links!.height);
      // A visual CSS reorder alone would leave assistive reading order wrong.
      expect(await page.locator('main').evaluate(main => {
        const nodes = ['.profile-mobile-heading .eyebrow', 'h1', '.portrait-caption .eyebrow', '.standing-portrait-stage', '.portrait-location', '.portrait-actions button', '.profile-intro', '.portrait-languages', '.panel-links', '.record-tabs'].map(selector => main.querySelector(selector)!);
        return nodes.every((node, i) => !i || Boolean(nodes[i - 1].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING));
      })).toBe(true);
      for (const link of await page.locator('.profile-details .panel-links a').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    } else expect((await stage.boundingBox())!.height).toBe(width < 1051 ? 424 : 520);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('header nav a[href^="/review/"]')).toHaveCount(0);
    const cv = page.getByRole('button', { name: 'Download CV', exact: true });
    await expect(cv).toBeVisible();
    if (width < 720) {
      const portraitBox = await stage.boundingBox();
      const cvBox = await cv.boundingBox();
      const locationBox = await page.locator('.portrait-location').boundingBox();
      expect(cvBox!.height).toBeGreaterThanOrEqual(44);
      expect(locationBox!.height).toBe(24);
      if (width < 390) {
        expect(cvBox!.y).toBeGreaterThanOrEqual(portraitBox!.y + portraitBox!.height);
        expect(locationBox!.y).toBeGreaterThanOrEqual(portraitBox!.y + portraitBox!.height);
      } else {
        expect(cvBox!.x).toBeGreaterThanOrEqual(portraitBox!.x + portraitBox!.width);
        expect(locationBox!.x).toBeGreaterThanOrEqual(portraitBox!.x + portraitBox!.width);
        expect(locationBox!.y).toBeGreaterThanOrEqual(portraitBox!.y + portraitBox!.height / 2);
        expect(cvBox!.y).toBeGreaterThanOrEqual(locationBox!.y + locationBox!.height);
        expect(cvBox!.y + cvBox!.height).toBeLessThanOrEqual(portraitBox!.y + portraitBox!.height);
      }
    }
    await cv.focus();
    const fullyAboveFooter = async () => page.evaluate(() => {
      const rect = document.activeElement!.getBoundingClientRect(), main = document.querySelector('main')!.getBoundingClientRect();
      return rect.top >= main.top && rect.bottom <= Math.min(main.bottom, document.querySelector('footer')!.getBoundingClientRect().top);
    });
    expect(await fullyAboveFooter()).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Listen to introduction', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(cv).toBeFocused();
    await page.getByRole('tab', { name: 'Experience', exact: true }).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'Capabilities', exact: true })).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Capabilities', exact: true })).toHaveAttribute('aria-selected', 'true');
    expect(await fullyAboveFooter()).toBe(true);
    await page.getByRole('link', { name: 'Let’s build something useful' }).focus();
    expect(await fullyAboveFooter()).toBe(true);
  });
}

test('default Profile uses the approved cutout once without a review flag', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('.standing-portrait-image')).toHaveAttribute('src', '/review-assets/profile-original-hands.webp');
  await expect(page.locator('.standing-portrait-stage')).toHaveCount(1);
  await expect(page.locator('.portrait-panel')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Download CV', exact: true })).toHaveCount(1);
});

test('crossing the Profile breakpoint moves single content elements and retains the portrait and selected record', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/profile');
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state', 'ready');
  const portrait = await page.locator('.standing-portrait-stage').elementHandle();
  await page.getByRole('tab', { name: 'Capabilities', exact: true }).click();
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.locator('.profile-mobile-heading')).toHaveCount(width < 720 ? 1 : 0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('.profile-intro')).toHaveCount(1);
    await expect(page.locator('.portrait-languages')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Download CV', exact: true })).toHaveCount(1);
    await expect(page.getByRole('tab', { name: 'Capabilities', exact: true })).toHaveAttribute('aria-selected', 'true');
    expect(await portrait!.evaluate(el => el === document.querySelector('.standing-portrait-stage'))).toBe(true);
  }
});

for (const width of [320, 390, 430, 768, 1440]) test(`loading, decode and error fallback preserve geometry at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/review-assets/profile-original-hands.webp', async route => { await held; await route.continue(); });
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  const stage = page.locator('.standing-portrait-stage');
  await expect(stage).toHaveAttribute('aria-busy', 'true');
  await expect(stage.getByRole('status')).toHaveText('Loading portrait…');
  await page.evaluate(() => document.fonts.ready);
  const geometry = async () => Promise.all(['h1', '.profile-intro', '.standing-portrait-stage', '.profile-record', '.portrait-caption .eyebrow', '.portrait-location', '.portrait-languages', '.profile-standing-portrait .inline-flex', '.profile-standing-portrait .panel-links'].map(selector => page.locator(selector).boundingBox()));
  const before = await geometry();
  release();
  await expect(stage).toHaveAttribute('data-state', 'ready');
  expect(await geometry()).toEqual(before);
  await page.route('**/review-assets/profile-original-hands.webp', route => route.abort());
  await page.reload();
  await expect(stage).toHaveAttribute('data-state', 'error');
  await expect(stage.locator('.portrait-panel img')).toHaveAttribute('src', /portrait-striped-finished/);
  await expect(stage.getByRole('status')).toContainText('Previous portrait shown');
  const fallbackImage = await stage.locator('.portrait-panel').boundingBox();
  const fallbackStatus = await stage.getByRole('status').boundingBox();
  expect(fallbackStatus!.y).toBeGreaterThanOrEqual(fallbackImage!.y + fallbackImage!.height);
  await page.evaluate(() => document.fonts.ready);
  expect(await geometry()).toEqual(before);
  await expect(page.getByRole('button', { name: 'Download CV', exact: true })).toBeEnabled();
});

test('entrance uses only opacity and 12px movement once, with immediate reduced-motion cancellation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state', 'ready');
  const entrance = await page.locator('.standing-portrait-figure').evaluate(el => {
    const style = getComputedStyle(el);
    const animation = el.getAnimations()[0];
    return { name: style.animationName, duration: style.animationDuration, iterations: style.animationIterationCount,
      frames: animation?.effect instanceof KeyframeEffect ? animation.effect.getKeyframes().map(frame => ({ opacity: frame.opacity, transform: frame.transform })) : [] };
  });
  expect(entrance).toEqual({ name: 'standing-portrait-entrance', duration: '0.6s', iterations: '1',
    frames: [{ opacity: '0', transform: 'translateY(12px)' }, { opacity: '1', transform: 'translateY(0px)' }] });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.standing-portrait-figure')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.standing-portrait-figure')).toHaveCSS('transform', 'none');
  await expect(page.locator('.standing-portrait-figure')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.standing-portrait-figure')).toHaveCSS('animation-name', 'none');
});
