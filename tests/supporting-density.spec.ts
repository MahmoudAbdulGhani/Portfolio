import {test,expect,type Page} from '@playwright/test';
import {caseStudyProjects} from './fixtures/case-study-projects';
import {caseImage} from './fixtures/case-image';
import {caseStudyFor} from '../shared/case-study-runtime';
const slugs=['gamezone-arena','unihub','full-stack-user-management-system','medicare-hub','home-services'];
const projects=caseStudyProjects.map(p=>({...p,program:'Recorded program'}));
async function fixtures(page:Page) {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('https://screens.example.test/**',async r=>r.fulfill({contentType:'image/png',body:await caseImage(r.request().url())}));
  await page.route('**/api/**',r=>{
    const path=new URL(r.request().url()).pathname;
    return r.fulfill({json:path==='/api/projects'?projects:path.startsWith('/api/projects/')?projects.find(p=>path===`/api/projects/${p.slug}`):path==='/api/profile'?{name:'Test owner',title:'Developer',socials:[],experience:[]}:[]});
  });
}
async function ready(page:Page) {
  await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
  await page.evaluate(()=>document.fonts.ready);
}
async function opening(page:Page) {
  return page.evaluate(()=>({top:document.querySelector('.case-figure .screenshot-frame')!.getBoundingClientRect().top,heading:document.querySelector('h1')!.textContent,summary:document.querySelector('.case-purpose')!.textContent,role:document.querySelector('.case-role')?.textContent,program:document.querySelector('.case-program')?.textContent,columns:getComputedStyle(document.querySelector('.supporting-opening')!).gridTemplateColumns}));
}
async function readyCards(page:Page) {
  await expect(page.locator('.work-entry')).toHaveCount(8);
  for(const frame of await page.locator('.work-preview').all()) {
    await frame.scrollIntoViewIfNeeded();await expect(frame).toHaveAttribute('data-image-state','ready');
  }
}
for(const width of [320,390,430]) test(`phone hierarchy is denser without dropping details at ${width}`,async({page})=>{
  await fixtures(page);await page.setViewportSize({width,height:844});
  for(const slug of slugs) {
    await page.goto(`/review/supporting/before/projects/${slug}`);await ready(page);const before=await opening(page);
    await page.goto(`/review/supporting/candidate/projects/${slug}`);await ready(page);const after=await opening(page);
    expect(after.top).toBeLessThan(before.top); // Relative improvement, no absolute above-the-fold target.
    expect(after.heading).toBe(before.heading);expect(after.role).toBe(before.role);expect(after.program).toBe(before.program);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.locator('.case-purpose').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    const context=page.locator('.jobpilot-context');await context.locator('summary').click();
    const study=caseStudyFor(projects.find(p=>p.slug===slug)!)!;
    if(slug==='home-services') {
      await expect(page.locator('.story-credit')).toHaveCount(1);
      await expect(context).toContainText('frontend presentation and navigation');
    } else await expect(context).toContainText(study.summary);
    if(slug==='full-stack-user-management-system')await expect(context).toContainText('Full-Stack User Management System');
    expect(await page.locator('#main-content').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  }
  await page.goto('/review/supporting/candidate');await expect(page.locator('.work-entry')).toHaveCount(8);
  const heights=await page.locator('.work-entry').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().height));
  for(const category of await page.locator('.work-category').all()) {
    expect(await category.evaluate(el=>el.getBoundingClientRect().height/parseFloat(getComputedStyle(el).lineHeight))).toBeLessThanOrEqual(2);
  }
  for(const summary of await page.locator('.work-description').all())expect((await summary.textContent())!.match(/\.(?:\s|$)/g)).toHaveLength(1);
  await page.goto('/review/supporting/before');await expect(page.locator('.work-entry')).toHaveCount(8);
  const oldHeights=await page.locator('.work-entry').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().height));
  expect(heights.reduce((a,b)=>a+b,0)).toBeLessThan(oldHeights.reduce((a,b)=>a+b,0));
});
for(const [width,height] of [[768,1024],[1280,720],[1440,900]]) test(`PR57 wide hierarchy remains intact at ${width}`,async({page})=>{
  await fixtures(page);await page.setViewportSize({width,height});
  for(const slug of slugs) {
    await page.goto(`/review/supporting/before/projects/${slug}`);await ready(page);const before=await opening(page);
    await page.goto(`/review/supporting/candidate/projects/${slug}`);await ready(page);const after=await opening(page);
    expect(after).toEqual(before);await expect(page.locator('.case-metadata')).toHaveCount(0);
    expect(after.summary?.trim()).toBe(caseStudyFor(projects.find(p=>p.slug===slug)!)!.summary);
  }
  await page.goto('/review/supporting/before');await readyCards(page);
  const before=await page.locator('.work-entry').allTextContents();
  await page.goto('/review/supporting/candidate');await readyCards(page);
  expect(await page.locator('.work-entry').allTextContents()).toEqual(before);
});
test('responsive copy preserves selected image/disclosure and leaves normal routes unchanged',async({page})=>{
  await fixtures(page);await page.setViewportSize({width:390,height:844});
  await page.goto('/review/supporting/candidate/projects/full-stack-user-management-system');await ready(page);
  await page.locator('.case-media-chooser summary').click();await page.locator('.case-media-chooser button').nth(1).click();await ready(page);
  const src=await page.locator('.case-figure').getAttribute('data-source');
  const details=page.locator('.jobpilot-context');await details.locator('summary').click();
  const short=await page.locator('.case-purpose').textContent();await page.setViewportSize({width:768,height:1024});
  await expect(page.locator('.case-metadata')).toHaveCount(0);await expect(details).toHaveAttribute('open','');
  await expect(page.locator('.case-figure')).toHaveAttribute('data-source',src!);
  await page.setViewportSize({width:390,height:844});await expect(page.locator('.case-purpose')).toHaveText(short!);
  await expect(page.locator('.case-metadata')).toHaveCount(1);await expect(details).toHaveAttribute('open','');
  await page.goto('/projects/full-stack-user-management-system');await ready(page);
  await expect(page.locator('.supporting-design-compact,.case-metadata')).toHaveCount(0);
  await expect(page.locator('.case-purpose')).toHaveText(caseStudyFor(projects.find(p=>p.slug==='full-stack-user-management-system')!)!.summary);
});
test('density comparison is compiled review HTML with PR57 measurements and offline evidence',async({request})=>{
  const response=await request.get('/review/supporting-density/index.html');expect(response.status()).toBe(200);
  expect(await response.text()).toContain('Supporting projects · mobile density review');expect(await response.text()).not.toContain('<div id="root">');
  const measurements=await request.get('/review/supporting-density/comparison.json');expect((await measurements.json()).base).toBe('2259443875cb498a6115302eaf701bb947cef535');
  const zip=await request.get('/review/supporting-density/evidence.zip');expect(zip.status()).toBe(200);expect((await zip.body()).subarray(0,2).toString()).toBe('PK');
});
test('enlarged text leaves focused reader controls clear of the fixed header and footer',async({page})=>{
  await fixtures(page);await page.setViewportSize({width:320,height:844});
  for(const slug of slugs) {
    await page.goto(`/review/supporting/candidate/projects/${slug}`);await ready(page);
    await page.locator('#main-content :is(h1,h2,h3,p,a,button,summary,.eyebrow)').evaluateAll(nodes=>{
      const sizes=nodes.map(el=>parseFloat(getComputedStyle(el).fontSize));nodes.forEach((el,i)=>(el as HTMLElement).style.fontSize=`${sizes[i]*2}px`);
    });
    for(const control of await page.locator('.case-actions a,.case-media-chooser > summary,.case-screen-tools > button,.case-end > a').all()) {
      await control.focus();await expect(control).toBeFocused();
      const bounds=await control.boundingBox(),header=await page.locator('.site-header').boundingBox(),footer=await page.locator('.stage-footer').boundingBox();
      expect(bounds!.y).toBeGreaterThanOrEqual(header!.y+header!.height);
      expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(footer!.y);
    }
    expect(await page.locator('#main-content').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  }
});
