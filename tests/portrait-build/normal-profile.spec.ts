import { expect, test } from '@playwright/test';

test('normal build excludes review routes and comparison artifacts while exposing the approved Profile',async({page,request})=>{
  await page.route('**/api/**',route=>route.fulfill({json:new URL(route.request().url()).pathname==='/api/profile'?{
    name:'Mahmoud Hussein Abdul Ghani',title:'Full-Stack Software Engineer',photo:'/myphoto.jpeg',bio:'Profile',location:'Tripoli, Lebanon',languages:'Arabic and English',socials:[],experience:[],
  }:[]}));
  await page.goto('/profile');
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state','ready');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  await expect(page.locator('nav a[href^="/review/"]')).toHaveCount(0);
  await page.goto('/review/profile-portrait');
  await expect(page.getByRole('heading',{name:'This page wandered off.'})).toBeVisible();
  await expect(page.locator('.standing-portrait-stage')).toHaveCount(0);
  const comparison=await request.get('/review/portrait-comparison/index.html');
  expect(await comparison.text()).not.toContain('Profile portrait adoption comparison');
});
