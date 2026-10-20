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
    json: new URL(route.request().url()).pathname === '/api/profile' ? person : [],
  }));
});

for (const [width, height] of [[1363,936], [1280,720], [390,844], [360,800]]) {
  test(`Profile delivers the approved transparent asset at natural ratio at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/profile');
    const image = page.locator('.standing-portrait-image');
    await expect(image).toHaveAttribute('width', '960');
    await expect(image).toHaveAttribute('height', '1696');
    await image.evaluate(img => (img as HTMLImageElement).decode());
    const metrics = await image.evaluate(img => {
      const el = img as HTMLImageElement, box = el.getBoundingClientRect();
      return {width:box.width,height:box.height,src:el.currentSrc,dpr:devicePixelRatio,
        transform:getComputedStyle(el).transform,filter:getComputedStyle(el).filter,
        overflow:document.documentElement.scrollWidth>innerWidth};
    });
    const file = await page.request.get(metrics.src), metadata = await sharp(await file.body()).metadata();
    expect(file.ok()).toBe(true);
    expect(metadata.width).toBe(960); expect(metadata.height).toBe(1696); expect(metadata.hasAlpha).toBe(true);
    expect(metrics.width*metrics.dpr).toBeLessThanOrEqual(960);
    expect(Math.abs(metrics.width-metrics.height*960/1696)).toBeLessThanOrEqual(1/64);
    expect(metrics.transform).toBe('none'); expect(metrics.filter).toBe('none'); expect(metrics.overflow).toBe(false);
    await expect(image).toHaveAttribute('alt',`${person.name}, photographed from hair to below both hands, wearing a striped shirt and backpack`);
    await expect(page.locator('.portrait-panel')).toHaveCount(0);
    await expect(page.locator('.standing-portrait-stage')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  });
}

test('success requests one approved portrait and no fallback, including across the breakpoint',async({page})=>{
  const requests:string[]=[];
  page.on('request',request=>{if(/profile-original-hands|portrait-striped-finished/.test(request.url()))requests.push(request.url());});
  await page.setViewportSize({width:390,height:844}); await page.goto('/profile');
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state','ready');
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('.profile-mobile-heading')).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('.profile-mobile-heading')).toHaveCount(1);
  expect(requests).toHaveLength(1); expect(requests[0]).toContain('/review-assets/profile-original-hands.webp');
  await expect(page.locator('.standing-portrait-figure')).toHaveCSS('animation-name','none');
});

test('a supplied CMS photo remains the unmodified fallback after a failed approved-image load',async({page})=>{
  await page.route('**/api/profile',route=>route.fulfill({json:{...person,photo:'/landscape/portrait-striped-cutout.webp'}}));
  await page.route('**/review-assets/profile-original-hands.webp',route=>route.abort());
  await page.goto('/profile');
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state','error');
  const image=page.locator('.portrait-panel img');
  await expect(page.locator('.portrait-panel')).toHaveClass(/is-cms-photo/);
  await expect(image).toHaveAttribute('src','/landscape/portrait-striped-cutout.webp');
  expect(await image.getAttribute('srcset')).toBeNull();
  await expect(image).toHaveCSS('mask-image','none');
  await expect(page.getByRole('status')).toHaveText('Portrait unavailable. Previous portrait shown.');
});

test('very wide Profile screens preserve the approved bounded stage without upscaling',async({page})=>{
  await page.setViewportSize({width:1920,height:1080}); await page.goto('/profile');
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state','ready');
  const stage=await page.locator('.standing-portrait-stage').boundingBox(),image=await page.locator('.standing-portrait-image').boundingBox();
  expect(stage!.height).toBe(520); expect(image!.width).toBeCloseTo(520*960/1696,1);
  expect(image!.width*2).toBeLessThan(960);
});
