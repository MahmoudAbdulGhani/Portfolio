import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { caseStudyProjects } from '../fixtures/case-study-projects';
import { caseImage } from '../fixtures/case-image';

async function fixtures(page: Page) {
  await page.route('https://screens.example.test/**', async route => route.fulfill({ contentType: 'image/png', body: await caseImage(route.request().url()) }));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/projects' ? caseStudyProjects : path.startsWith('/api/projects/') ? caseStudyProjects.find(p => path === `/api/projects/${p.slug}`) : path === '/api/profile' ? { name: 'Test owner', title: 'Developer', socials: [], experience: [] } : [];
    return route.fulfill({ json: body ?? [] });
  });
}
const region = (page: Page) => page.getByRole('region', { name: 'The profile save boundary' });
async function proposeAndReview(page: Page) {
  const demo = region(page);
  await demo.getByRole('button', { name: 'Propose a change', exact: true }).click();
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Beirut');
  await expect(demo.locator('.boundary-proposed dd')).toHaveText('Tripoli');
  await demo.getByRole('button', { name: 'Review the change', exact: true }).click();
}
test.beforeEach(async ({ page }) => { await fixtures(page); });

test('saved information changes only after approval, stale approval is blocked, and no writes are sent', async ({ page }) => {
  const writes: string[] = [];
  page.on('request', request => { if (!['GET','HEAD'].includes(request.method())) writes.push(request.url()); });
  await page.goto('/?project=jobpilot-ai');
  const demo = region(page);
  await proposeAndReview(page);
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Beirut');
  await demo.getByRole('button', { name: 'Accept reviewed change', exact: true }).click();
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Tripoli');
  await expect(demo.getByRole('status')).toHaveText('Reviewed changes accepted. Saved location: Tripoli.');
  await demo.getByRole('button', { name: 'Reset', exact: true }).click();
  await proposeAndReview(page);
  await demo.getByRole('button', { name: 'Change the saved profile during review.', exact: true }).click();
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Byblos');
  await expect(demo.locator('.boundary-review-basis')).toContainText('Beirut → Tripoli');
  await demo.getByRole('button', { name: 'Accept reviewed change', exact: true }).click();
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Byblos');
  await expect(demo.getByRole('status')).toHaveText('Old review blocked. Review again before accepting.');
  await demo.getByRole('button', { name: 'Review again', exact: true }).click();
  await expect(demo.locator('.boundary-review-basis')).toContainText('Byblos → Tripoli');
  await demo.getByRole('button', { name: 'Accept reviewed change', exact: true }).click();
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Tripoli');
  expect(writes).toEqual([]);
});

test('rapid reset, close and reopen retire pending articulation and restore focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore JobPilot AI', exact: true }).click();
  const demo = region(page);
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state', 'settled');
  await demo.getByRole('button', { name: 'Propose a change', exact: true }).click();
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer', 'webgl');
  await expect(demo.locator('.boundary-art')).toHaveAttribute('data-pose', 'pending');
  await page.evaluate(() => {
    const demo = document.querySelector('.profile-boundary')!;
    const find = (text: string) => [...demo.querySelectorAll('button')].find(b => b.textContent === text)!;
    find('Review the change').click(); find('Reset').click();
  });
  await expect(demo).toHaveAttribute('data-phase', 'rest');
  await expect(demo.locator('canvas')).toHaveCount(0);
  await expect(demo.locator('.boundary-plate')).toHaveAttribute('transform','rotate(0 570 1035)');
  await expect(demo.getByRole('status')).toContainText('reset');
  await demo.getByRole('button', { name: 'Propose a change', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Explore JobPilot AI', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Explore JobPilot AI', exact: true }).click();
  await expect(region(page)).toHaveAttribute('data-phase', 'rest');
  await expect(page.getByRole('link', { name: 'Open case study', exact: true })).toBeFocused();
  await page.waitForTimeout(600);
  await expect(region(page)).toHaveAttribute('data-phase', 'rest');
});

test('keyboard and reduced motion preserve every state, disclosure and navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?project=jobpilot-ai');
  const demo = region(page);
  const primary = demo.locator('.boundary-primary');
  await primary.focus();
  for (const phase of ['propose','review','accept']) {
    await page.keyboard.press('Enter');
    await expect(demo).toHaveAttribute('data-phase',phase);
    await expect(primary).toBeFocused();
    await expect(demo.locator('.boundary-plate')).toHaveAttribute('transform',phase === 'accept' ? 'rotate(0 570 1035)' : 'rotate(-3.5 570 1035)');
  }
  await expect(demo.locator('canvas')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await expect(demo.getByRole('button',{name:'Reset',exact:true})).toBeFocused();
  await page.keyboard.press('Space');
  await expect(demo).toHaveAttribute('data-phase','rest');
  await demo.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(demo.locator('details')).toHaveAttribute('open','');
  await expect(demo.locator('.disclosure-content')).toContainText('fresh suggestions');
  await expect(demo.locator('.disclosure-content')).toContainText('does not edit a real');
  const violations = (await new AxeBuilder({page}).include('.profile-boundary').analyze()).violations;
  expect(violations).toEqual([]);
  await page.getByRole('link',{name:'Open case study',exact:true}).click();
  await expect(page).toHaveURL(/projects\/jobpilot-ai/);
  await expect(region(page)).toHaveCount(1);
  await expect(page.locator('.decision-path')).toHaveCount(0);
});

test('unavailable WebGL retains the complete controls and explanation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
      return type === 'webgl2' ? null : Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto('/?project=jobpilot-ai');
  const demo = region(page);
  await proposeAndReview(page);
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-renderer','fallback');
  await expect(demo.locator('.boundary-art')).toHaveAttribute('data-renderer','photographic-svg');
  await expect(demo.locator('svg').first()).toBeVisible();
  await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Tripoli');
  await demo.locator('summary').click();
  await expect(demo.locator('.disclosure-content')).toContainText('row locks');
});

test('context loss retains the boundary and an OS preference change finishes articulation immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'no-preference' });
  await page.goto('/?project=jobpilot-ai');
  const demo = region(page);
  await demo.getByRole('button',{name:'Propose a change',exact:true}).click();
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-renderer','webgl');
  await page.locator('.motion-rig canvas').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-renderer','fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
  await demo.getByRole('button',{name:'Reset',exact:true}).click();
  await demo.getByRole('button',{name:'Propose a change',exact:true}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(demo.locator('canvas')).toHaveCount(0);
  await expect(demo.locator('.boundary-plate')).toHaveAttribute('transform','rotate(-3.5 570 1035)');
  await expect(demo.locator('.boundary-message')).toHaveCSS('opacity','1');
  await demo.getByRole('button',{name:'Review the change',exact:true}).click();
  await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Tripoli');
});

test('plate returns to alignment after approval and performs no perpetual updates', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/?project=jobpilot-ai');
  const demo = region(page);
  await proposeAndReview(page);
  const plate = demo.locator('.boundary-plate');
  await expect(plate).toHaveAttribute('transform','rotate(-3.5 570 1035)');
  await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
  await expect(plate).toHaveAttribute('transform','rotate(0 570 1035)');
  const changes = await plate.evaluate(el=>new Promise<number>(resolve=>{
    let count=0;
    const observer=new MutationObserver(records=>{count+=records.length;});
    observer.observe(el,{attributes:true});
    setTimeout(()=>{observer.disconnect();resolve(count);},500);
  }));
  expect(changes).toBe(0);
});

for (const width of [1440,768,390,320]) test(`comparison and actions stay readable at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:width===1440?650:844});
  await page.goto('/?project=jobpilot-ai');
  await proposeAndReview(page);
  const demo = region(page);
  const header = await page.getByRole('banner').boundingBox();
  const intro = await page.locator('.selection-boundary-intro').boundingBox();
  const preview = await page.locator('.selection-image-frame').boundingBox();
  expect(intro!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
  expect(intro!.y + intro!.height).toBeLessThanOrEqual(preview!.y);
  expect(await demo.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  const boxes = await demo.locator('.boundary-comparison > div').evaluateAll(elements=>elements.map(el=>{
    const box=el.getBoundingClientRect(); return {x:box.x,y:box.y,width:box.width,height:box.height};
  }));
  if(width<=390) expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y+boxes[0].height);
  await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
  await expect(demo.locator('.boundary-saved dd')).toHaveText('Tripoli');
});
