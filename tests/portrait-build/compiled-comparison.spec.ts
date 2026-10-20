import { expect, test } from '@playwright/test';

// This artifact exists only in the opt-in compiled review build.
test('compiled comparison includes photographs, download package and noindex', async ({ page, request }) => {
  const response = await page.goto('/review/portrait-comparison/index.html');
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle('Profile portrait adoption comparison');
  await expect(page.locator('h1')).toHaveText('Profile portrait adoption');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  for (const img of await page.locator('img').all()) {
    await img.evaluate(el => (el as HTMLImageElement).decode());
    expect(await img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  const archive = await request.get('/review/portrait-comparison/portrait-review.zip');
  expect(archive.ok()).toBe(true);
  expect((await archive.body()).subarray(0, 2).toString()).toBe('PK');
  const manifest = await request.get('/review/portrait-comparison/build.json');
  expect(await manifest.json()).toMatchObject({ review: true, route: '/review/profile-portrait' });
  for (const href of await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.getAttribute('href')!))) {
    expect((await request.get(new URL(href, page.url()).href)).ok(), `comparison link: ${href}`).toBe(true);
  }
});

test('explicit review builds retain a noindex alias of the adopted Profile',async({page})=>{
  await page.route('**/api/**',route=>route.fulfill({json:new URL(route.request().url()).pathname==='/api/profile'?{
    name:'Mahmoud Hussein Abdul Ghani',title:'Full-Stack Software Engineer',photo:'/myphoto.jpeg',bio:'Profile',experience:[],socials:[],location:'Tripoli, Lebanon',languages:'Arabic and English',
  }:[]}));
  await page.goto('/review/profile-portrait');
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state','ready');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');
  await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
  await expect(page.getByRole('button',{name:'Download CV',exact:true})).toHaveCount(1);
  await expect(page.locator('nav a[href^="/review/"]')).toHaveCount(0);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Profile',exact:true}).click();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  await expect(page.locator('.standing-portrait-stage')).toHaveCount(1);
});
