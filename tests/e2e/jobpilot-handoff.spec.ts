import { expect, test, type Page } from '@playwright/test';
import { caseStudyProjects } from '../fixtures/case-study-projects';
import { caseImage, sourceRequest } from '../fixtures/case-image';

// New handoff failures must be investigated, including in the broad CI run.
test.describe.configure({ retries: 0 });

const slug = 'jobpilot-ai';
const open = (page: Page) => page.getByRole('link', { name: 'Open case study', exact: true });
const choices = (page: Page) => page.getByRole('group', {name:'Preview workflow'}).getByRole('button');
async function setup(page: Page, fallback = true) {
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({json: path === '/api/projects' ? caseStudyProjects : path.startsWith('/api/projects/') ? caseStudyProjects.find(p => path === `/api/projects/${p.slug}`) : path === '/api/profile' ? {name:'Test owner',title:'Developer',socials:[],experience:[]} : []});
  });
  await page.route('https://screens.example.test/**', async route => route.fulfill({contentType:'image/png', body: await caseImage(route.request().url())}));
  if(fallback) await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return type === 'webgl2' ? null : native.call(this,type,...args);
    } as typeof native;
  });
}
async function selected(page: Page) {
  await page.goto('/?view=collection');
  await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
}
async function readerReady(page: Page, label: string) {
  await expect(page).toHaveURL(`/projects/${slug}`);
  await expect(page.locator('.case-media-title strong')).toHaveText(label);
  await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
  await expect(page.locator('[data-reader-handoff="running"]')).toHaveCount(0);
  const geometry = await page.locator('.case-figure').evaluate(figure => {
    const image = figure.querySelector<HTMLImageElement>('.screenshot-button img')!, r = image.getBoundingClientRect();
    return { height:r.height, expectedHeight:r.width*image.naturalHeight/image.naturalWidth, bottom:r.bottom, caption:figure.querySelector('figcaption')!.getBoundingClientRect().top, overflow:document.documentElement.scrollWidth > innerWidth };
  });
  // Generated small rasters round their source height by a pixel. Compare
  // rendered pixel error, as the existing complete-image checks do.
  expect(Math.abs(geometry.height-geometry.expectedHeight)).toBeLessThan(1);
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.caption);
  expect(geometry.overflow).toBe(false);
}
for(const index of [0,1]) test(`preview image ${index + 1} survives reader, explicit return, Back and Forward`, async ({page}) => {
  await setup(page); await selected(page);
  await choices(page).nth(index).click();
  const label=await choices(page).nth(index).innerText();
  await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
  await open(page).scrollIntoViewIfNeeded();
  await open(page).evaluate(link => link.addEventListener('click', () => {
    (window as unknown as {openingPosition:number}).openingPosition = scrollY;
  }, {capture:true,once:true}));
  await open(page).click();
  const position=await page.evaluate(()=>(window as unknown as {openingPosition:number}).openingPosition);
  await readerReady(page,label);
  await page.locator('.case-back').click();
  await expect(page).toHaveURL(/view=collection.*project=jobpilot-ai/);
  await expect(choices(page).nth(index)).toHaveAttribute('aria-pressed','true');
  await expect(open(page)).toBeFocused();
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase','active');
  await expect.poll(()=>page.evaluate(saved => {
    const scrolling=document.scrollingElement!;
    // A retired complete image can make the new document a few pixels shorter.
    // Verify the exact saved position wherever the document can represent it.
    return Math.abs(scrollY-Math.min(saved,scrolling.scrollHeight-scrolling.clientHeight));
  }, position)).toBeLessThan(0.5);
  await page.goForward(); await readerReady(page,label);
  await page.goBack(); await expect(open(page)).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/?view=collection');
  await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeFocused();
});

test('keyboard return retains stale review and disclosure without replaying the sculpture opening', async ({page})=>{
  await setup(page); await page.emulateMedia({reducedMotion:'reduce'}); await selected(page);
  const boundary=page.locator('.profile-boundary');
  await boundary.getByRole('button',{name:'Propose a change',exact:true}).click();
  await boundary.getByRole('button',{name:'Review the change',exact:true}).click();
  await boundary.getByRole('button',{name:'Change the saved profile during review.'}).click();
  await boundary.locator('summary').click();
  await open(page).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
  await page.locator('.case-back').focus(); await page.keyboard.press('Enter');
  await expect(open(page)).toBeFocused();
  await expect(boundary).toHaveAttribute('data-stale','true');
  await expect(boundary.locator('.boundary-saved .boundary-value')).toHaveText('Byblos');
  await expect(boundary.locator('details')).toHaveAttribute('data-expanded','true');
  await expect(page.locator('canvas, [data-reader-handoff]')).toHaveCount(0);
  await page.getByRole('link',{name:'Explore the engineering'}).click();
  await expect(boundary.locator('details')).toHaveAttribute('data-expanded','true');
  await expect(page.locator('#jobpilot-engineering')).toBeFocused();
  await boundary.getByRole('button',{name:'Accept reviewed change'}).click();
  await expect(boundary.getByRole('button',{name:'Review again'})).toBeVisible();
});

test('navigation is immediate while the selected image and renderer are unavailable', async ({page})=>{
  await setup(page);
  let release!:()=>void; const wait=new Promise<void>(resolve=>{release=resolve;});
  await page.route(sourceRequest('710055a0-a275-4e6a-991d-4aaa23c6e549.png'),async route=>{await wait; await route.abort();});
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase','selecting');
  await open(page).click();
  await expect(page).toHaveURL('/projects/jobpilot-ai');
  await expect(page.locator('.case-figure .screenshot-status').first()).toHaveText('Loading image…');
  await expect(page.locator('[data-reader-handoff="running"]')).toHaveCount(0);
  release();
  await expect(page.locator('.case-figure').getByText('This image is unavailable.')).toBeVisible();
  await page.locator('.case-back').click();
  await expect(open(page)).toBeFocused();
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase','active');
});

test('normal-motion handoff moves real elements and interruption cleans transforms without delaying return', async ({page})=>{
  await setup(page); await selected(page);
  await page.clock.install();
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));
  const start = () => expect.poll(async () => {
    // React may commit the destination after the synthetic frame finishes.
    // Drive its next frame until setup is observed, then sample that timeline.
    await page.clock.runFor(16);
    return page.locator('.project-reader').getAttribute('data-reader-handoff').catch(()=>null);
  }).toBe('running');
  await open(page).click();
  await start(); await page.clock.runFor(50);
  await expect(page.locator('.case-heading h1')).toHaveCount(1);
  expect(await page.locator('.case-heading h1').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
  expect(await page.locator('.case-figure .screenshot-frame').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
  await page.locator('.case-back').click();
  await expect(open(page)).toBeFocused();
  await page.clock.runFor(500);
  await expect(page.locator('[data-reader-handoff], .project-reader')).toHaveCount(0);
  await open(page).click(); await start(); await page.clock.runFor(450);
  await expect(page.locator('[data-reader-handoff="running"]')).toHaveCount(0);
  await expect(page.locator('.case-heading h1')).toHaveCSS('transform','none');
  await page.locator('.case-back').click(); await open(page).click(); await start(); await page.clock.runFor(50);
  await page.locator('.case-media-chooser > summary').click();
  await page.locator('.case-media-chooser').getByRole('button',{name:'02 Discover jobs'}).click();
  await expect(page.locator('[data-reader-handoff]')).toHaveCount(0);
  await expect(page.locator('.case-media-title strong')).toHaveText('Discover jobs');
  await expect(page.locator('.case-heading h1')).toHaveCSS('transform','none');
});

test('direct reader, missing origin, queries and engineering hashes have stable destinations', async ({page})=>{
  await setup(page); await page.goto('/profile'); await page.goto('/projects/jobpilot-ai#engineering');
  await expect(page.locator('#engineering')).toBeInViewport();
  await expect(page.locator('.case-back')).toHaveAttribute('href','/projects');
  await page.locator('.case-back').click(); await expect(page).toHaveURL('/projects');
  await page.goto('/?view=collection&project=jobpilot-ai');
  await choices(page).nth(1).click();
  await open(page).click(); await page.reload(); // In-memory origin is unavailable.
  await page.locator('.case-back').click();
  await expect(page).toHaveURL('/?view=collection&project=jobpilot-ai');
  await expect(open(page)).toBeFocused();
  await expect(choices(page).nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase','active');
  await page.getByRole('link',{name:'Explore the engineering'}).click();
  await expect(page.locator('#jobpilot-engineering')).toBeInViewport();
  await open(page).scrollIntoViewIfNeeded();
  const originScroll = await page.evaluate(()=>scrollY);
  await open(page).click(); await page.goBack();
  await expect(open(page)).toBeFocused();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(originScroll,0);
});

test('modified activation opens an ordinary new tab without changing the source selection', async ({page,context})=>{
  await setup(page); await selected(page);
  const popup=context.waitForEvent('page');
  await open(page).click({modifiers:['ControlOrMeta']});
  const tab=await popup;
  await expect(tab).toHaveURL('/projects/jobpilot-ai');
  await expect(page).toHaveURL(/project=jobpilot-ai/);
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase','active');
  await tab.close();
});

test('slow project data keeps the existing loader and focus; leaving retires a late response', async ({page})=>{
  await setup(page);
  let release!:()=>void; const wait=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/projects/jobpilot-ai', async route=>{
    await wait;
    await route.fulfill({json:caseStudyProjects[0]});
  });
  // The assistant may warm the project query as soon as Collection selects it.
  // Delay that shared request before selection, rather than after it is cached.
  await selected(page);
  await open(page).click();
  await expect(page).toHaveURL('/projects/jobpilot-ai');
  await expect(page.locator('main [aria-busy="true"]')).toBeVisible();
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(page.locator('[data-reader-handoff]')).toHaveCount(0);
  await page.goBack(); await expect(open(page)).toBeFocused();
  release();
  await expect(page.locator('.project-reader, [data-reader-handoff]')).toHaveCount(0);
});

test('preview edits made after returning survive Forward and Back without a new opening', async ({page})=>{
  await setup(page); await page.emulateMedia({reducedMotion:'reduce'}); await selected(page);
  await open(page).click(); await readerReady(page,'Resume library and upload');
  await page.goBack();
  await choices(page).nth(1).click();
  const boundary = page.locator('.profile-boundary');
  await boundary.getByRole('button',{name:'Propose a change',exact:true}).click();
  await boundary.getByRole('button',{name:'Review the change',exact:true}).click();
  await boundary.getByRole('button',{name:'Change the saved profile during review.'}).click();
  await boundary.locator('summary').click();
  await page.goForward(); await readerReady(page,'Resume library and upload');
  await page.goBack();
  await expect(open(page)).toBeFocused();
  await expect(choices(page).nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(boundary).toHaveAttribute('data-stale','true');
  await expect(boundary.locator('details')).toHaveAttribute('data-expanded','true');
});
