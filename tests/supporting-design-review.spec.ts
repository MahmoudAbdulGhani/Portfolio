import { test, expect, type Page } from '@playwright/test';
import { caseStudyProjects } from './fixtures/case-study-projects';
import { caseImage } from './fixtures/case-image';
import { projectDisplayName } from '../shared/content-integrity';
import { detailScreens, isRegistrationExcerpt } from '../src/lib/project-detail-screens';

const slugs = ['gamezone-arena','unihub','full-stack-user-management-system','medicare-hub','home-services'];
const sizes = [[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]];
const index = '/review/supporting/candidate';
async function fixtures(page: Page) {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('https://screens.example.test/**',async r=>r.fulfill({contentType:'image/png',body:await caseImage(r.request().url())}));
  await page.route('**/api/**',r=>{
    const path = new URL(r.request().url()).pathname;
    return r.fulfill({json:path==='/api/projects'?caseStudyProjects:path.startsWith('/api/projects/')?caseStudyProjects.find(p=>path===`/api/projects/${p.slug}`):path==='/api/profile'?{name:'Test owner',title:'Developer',socials:[],experience:[]}:[]});
  });
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('#main-content').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
}
for (const [width,height] of sizes) {
  test(`index hierarchy, covers, links and touch information at ${width}`,async({page})=>{
    await fixtures(page); await page.setViewportSize({width,height}); await page.goto(index);
    await expect(page.locator('.work-entry')).toHaveCount(8);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',/noindex/);
    await expect(page.locator('.work-description')).toHaveCount(8);
    const cards=page.locator('.work-entry');
    expect(await page.locator('.work-number').evaluateAll(nodes=>nodes.map(n=>n.textContent?.trim()).filter(Boolean))).toEqual(['01','03','02']);
    for (const card of await cards.all()) {
      const cover=card.locator('.work-preview'); const box=await cover.boundingBox();
      expect(box!.width/box!.height).toBeCloseTo(1.6,2);
      await expect(card.locator('.work-open')).toContainText('Open case study');
      await expect(card).toHaveAccessibleName(/Open .+ case study/);
    }
    await noOverflow(page);
    await page.getByRole('button',{name:'Index',exact:true}).click();
    await expect(page.locator('.work-preview')).toHaveCount(0); await noOverflow(page);
    await page.getByRole('searchbox').fill('unihub');
    await expect(cards).toHaveCount(1);
    await page.reload(); await expect(cards).toHaveCount(1);
    await expect(page.getByRole('button',{name:'Index',exact:true})).toHaveAttribute('aria-pressed','true');
  });
  for(const slug of slugs) test(`${slug}: complete sources, viewer and reading order at ${width}`,async({page})=>{
    const project=caseStudyProjects.find(p=>p.slug===slug)!;
    await fixtures(page); await page.setViewportSize({width,height});
    await page.goto(`${index}/projects/${slug}`);
    await expect(page.locator('h1')).toHaveText(projectDisplayName(project));
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.profile-boundary,.cedar-boundary,.lobby-boundary,.jobpilot-object-detail')).toHaveCount(0);
    await expect(page.locator('.case-narrative > :first-child')).toHaveAttribute('id',slug==='unihub'?'contribution':'workflow');
    if(slug==='home-services') {
      await expect(page.locator('.story-credit')).toHaveCount(1);
      await expect(page.locator('.case-heading .story-credit')).toContainText('supplied');
    }
    const chooser=page.locator('.case-media-chooser'), choices=chooser.locator('button');
    const count=await choices.count(); expect(count).toBe(detailScreens(project).length);
    for(let i=0;i<count;i++) {
      await chooser.locator('summary').click(); await choices.nth(i).click();
      await expect(chooser.locator('summary')).toBeFocused();
      await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
      const source=await page.locator('.case-figure').getAttribute('data-source');
      expect(isRegistrationExcerpt(source!)).toBe(false);
      await noOverflow(page);
    }
    const enlarge=page.locator('.case-screen-tools > button');
    await enlarge.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape');
    await expect(enlarge).toBeFocused();
    const source=await page.locator('.case-figure').getAttribute('data-source');
    await page.reload(); await expect(page.locator('.case-figure')).toHaveAttribute('data-source',source!);
    const decision=page.locator('.engineering-decisions summary').first();
    await decision.focus(); await page.keyboard.press('Enter');
    await expect(decision.locator('..')).toHaveAttribute('open','');
    await page.locator('.case-end').scrollIntoViewIfNeeded();
    const end=await page.locator('.case-end').boundingBox(),footer=await page.locator('.stage-footer').boundingBox();
    expect(end!.y + end!.height).toBeLessThanOrEqual(footer!.y);
    await noOverflow(page);
  });
}
test('index return restores filter, mode, scroll and focus; native Forward restores image',async({page})=>{
  await fixtures(page); await page.setViewportSize({width:390,height:844}); await page.goto(index);
  await page.getByRole('button',{name:'Index',exact:true}).click();
  await page.getByRole('searchbox').fill('TypeScript');
  const card=page.locator('[data-project-slug="unihub"]'); await card.scrollIntoViewIfNeeded();
  const top=await card.evaluate(el=>el.getBoundingClientRect().top);
  await card.focus(); await page.keyboard.press('Enter');
  const chooser=page.locator('.case-media-chooser');await chooser.locator('summary').click();await chooser.getByRole('button').nth(1).click();
  const source=await page.locator('.case-figure').getAttribute('data-source');
  await page.locator('.case-back').click();
  await expect(card).toBeFocused(); await expect(page.getByRole('searchbox')).toHaveValue('TypeScript');
  await expect(page.getByRole('button',{name:'Index',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await card.evaluate(el=>el.getBoundingClientRect().top)).toBeCloseTo(top,0);
  await page.goForward();await expect(page.locator('.case-figure')).toHaveAttribute('data-source',source!);
  await page.goBack();await expect(card).toBeFocused();
  await card.click();await page.locator('.case-end').getByRole('link',{name:'All projects',exact:true}).click();
  await expect(card).toBeFocused();await expect(page.getByRole('searchbox')).toHaveValue('TypeScript');
});
test('baseline and normal routes retain their current presentation',async({page})=>{
  await fixtures(page);
  for(const route of ['/projects','/review/supporting/baseline']) {
    await page.goto(route);await expect(page.locator('.work-entry')).toHaveCount(8);
    await expect(page.locator('.supporting-design-candidate,.work-description')).toHaveCount(0);
  }
  for(const slug of slugs) {
    await page.goto(`/projects/${slug}`);await expect(page.locator('.supporting-opening')).toHaveCount(0);
    await page.goto(`/review/supporting/baseline/projects/${slug}`);await expect(page.locator('.supporting-opening')).toHaveCount(0);
  }
  for(const slug of ['jobpilot-ai','construction-project-management-accounting-system','lobby']) {
    await page.goto(`/projects/${slug}`);await expect(page.locator('.jobpilot-design-refined,.featured-design-refined')).toHaveCount(1);
    await expect(page.locator('.supporting-design-candidate')).toHaveCount(0);
  }
});
test('late and failed image retain geometry, usable chooser and fallback',async({page})=>{
  await fixtures(page);await page.setViewportSize({width:390,height:844});
  let release!:()=>void;const pending=new Promise<void>(r=>release=r);
  await page.route(/\/user-management-registration(?:-\d+w)?\.(webp|avif)$/,async r=>{await pending;await r.abort();});
  await page.goto(`${index}/projects/full-stack-user-management-system`);
  const frame=page.locator('.case-figure .screenshot-frame');
  await expect(frame).toHaveAttribute('data-image-state','loading'); const box=await frame.boundingBox();
  release();await expect(frame).toHaveAttribute('data-image-state','failed');
  const after=await frame.boundingBox();expect(after!.height).toBeCloseTo(box!.height,0);
  await expect(frame.getByRole('button',{name:/retry/i})).toBeVisible();
  await page.locator('.case-media-chooser summary').click();await page.locator('.case-media-chooser button').nth(1).click();
  await expect(frame).toHaveAttribute('data-image-state','ready'); await noOverflow(page);
});
test('enlarged text reflows and reduced motion removes decorative arrow movement',async({page})=>{
  await fixtures(page);await page.setViewportSize({width:320,height:844});await page.goto(index);
  const card=page.locator('.work-entry').first();await card.focus();
  expect(await card.locator('.work-open svg').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  for(const path of [index,...slugs.map(slug=>`${index}/projects/${slug}`)]) {
    await page.goto(path);await expect(page.locator('h1')).toBeVisible();
    await page.locator('#main-content :is(h1,h2,h3,p,a,button,summary,.eyebrow)').evaluateAll(nodes=>{
      const sizes=nodes.map(node=>parseFloat(getComputedStyle(node).fontSize));
      nodes.forEach((node,i)=>(node as HTMLElement).style.fontSize=`${sizes[i]*2}px`);
    });
    await noOverflow(page);
  }
});
test('comparison is compiled HTML with its build identity and downloadable evidence',async({request})=>{
  const response=await request.get('/review/supporting-comparison/index.html');
  expect(response.status()).toBe(200);expect(await response.text()).toContain('Supporting projects · Phase 2 review');
  expect(await response.text()).not.toContain('<div id="root">');
  const build=await request.get('/review/supporting-comparison/build.json');
  expect((await build.json()).review).toBe(true);
  const archive=await request.get('/review/supporting-comparison/evidence.zip');
  expect(archive.status()).toBe(200);expect((await archive.body()).subarray(0,2).toString()).toBe('PK');
});
