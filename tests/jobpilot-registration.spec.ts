import { expect, test, type Page, type Locator } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { caseStudyProjects } from './fixtures/case-study-projects';
import { caseImage } from './fixtures/case-image';

const root='/review/jobpilot/';
const ordinary=process.env.JOBPILOT_TEST_PRODUCTION==='1';
const collection=ordinary?'/?project=jobpilot-ai':root+'registration?project=jobpilot-ai';
const reader=ordinary?'/projects/jobpilot-ai':root+'registration/reader';
const captureDir=process.env.JOBPILOT_CAPTURE_DIR;
async function fixture(page:Page) {
  await page.route('https://screens.example.test/**', async route=>route.fulfill({contentType:'image/png',body:await caseImage(route.request().url())}));
  await page.route('**/api/**',route=>{
    const p=new URL(route.request().url()).pathname;
    return route.fulfill({json:p==='/api/projects'?caseStudyProjects:p.startsWith('/api/projects/')?caseStudyProjects.find(x=>p===`/api/projects/${x.slug}`):p==='/api/profile'?{name:'Local sample',title:'Developer',socials:[],experience:[]}:[]});
  });
}
const boundary=(p:Page)=>p.getByRole('region',{name:'The profile save boundary',exact:true});
const press=(b:Locator,name:string)=>b.getByRole('button',{name,exact:true}).click();
const gap=(b:Locator)=>b.evaluate(el=>el.querySelector('.jp-register-stop')!.getBoundingClientRect().left-el.querySelector('.jp-register-tip')!.getBoundingClientRect().right);
const saved=(b:Locator)=>b.locator('.jp-register-saved dd');
const tag=(b:Locator)=>b.locator('[data-jobpilot-register]');

for(const [width,height] of [[320,720],[390,844],[430,844],[768,1024],[1280,720],[1440,900]]) {
  test(`Saved city and printed gap follow the real revision at ${width}`,async({page})=>{
    await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await fixture(page);
    await page.goto(collection+'#jobpilot-engineering');
    const b=boundary(page);await expect(tag(b)).toHaveAttribute('data-jobpilot-register','rest');await expect(saved(b)).toContainText('Beirut');
    const go=b.getByRole('button',{name:'Propose a change',exact:true});await go.focus();await page.keyboard.press('Enter');
    await expect(tag(b)).toHaveAttribute('data-jobpilot-register','propose'); const first=await gap(b);
    await press(b,'Review the change');const reviewed=await gap(b);expect(first).toBeGreaterThan(reviewed);expect(reviewed).toBeGreaterThan(1);
    await expect(saved(b)).toContainText('Beirut');await expect(b.locator('.jp-register-proposal dd')).toContainText('Tripoli');
    await press(b,'Simulate another edit');expect(await gap(b)).toBeGreaterThan(reviewed);
    await expect(saved(b)).toContainText('Byblos');await expect(saved(b)).toContainText('Revision 2');
    await press(b,'Accept reviewed change');await expect(tag(b)).toHaveAttribute('data-jobpilot-register','blocked');expect(await gap(b)).toBeGreaterThan(reviewed);
    await expect(saved(b)).toContainText('Byblos');await press(b,'Review again');await press(b,'Accept reviewed change');
    await expect(saved(b)).toContainText('Tripoli');await expect(saved(b)).toContainText('Revision 3');expect(Math.abs(await gap(b))).toBeLessThan(.75);
    await expect(b.locator('.jp-register-tip')).toHaveCSS('transition-duration','0s');
    const overflow=await b.evaluate(el=>el.scrollWidth>el.clientWidth+1 || document.documentElement.scrollWidth>innerWidth+1);
    expect(overflow).toBe(false);
    const boxes=await b.locator('.jp-register-values strong').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left+.5);
    await press(b,'Reset');await expect(saved(b)).toContainText('Beirut');await expect(b.locator('.jp-register-tip')).toHaveCSS('opacity','0');
  });
}
test('Direct reader, indexing, keyboard controls and interruption',async({page})=>{
  await page.setViewportSize({width:390,height:844});await fixture(page);await page.goto(reader+'#engineering');
  const b=boundary(page);
  await expect(tag(b)).toHaveAttribute('data-jobpilot-register','rest');await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',ordinary?'index, follow':'noindex, nofollow');
  await press(b,'Propose a change');await press(b,'Review the change');await press(b,'Accept reviewed change');
  await press(b,'Reset');await expect(saved(b)).toContainText('Beirut');await expect(b.locator('.jp-register-tip')).toHaveCSS('opacity','0');
  await page.addStyleTag({content:'html { font-size: 200% !important; }'});
  await press(b,'Propose a change');await expect(b.getByText('Tripoli',{exact:true})).toBeVisible();
  expect(await b.locator('.jp-register-sheet').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
  const reset=b.getByRole('button',{name:'Reset',exact:true});await reset.focus();await page.keyboard.press('Enter');await expect(tag(b)).toHaveAttribute('data-jobpilot-register','rest');
});
test('Workflow choice and focus survive a case-study round trip',async({page})=>{
  await fixture(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(collection);
  const choices=page.getByRole('group',{name:'Preview workflow'}).getByRole('button');await choices.nth(1).click();const text=await choices.nth(1).innerText();
  const open=page.getByRole('link',{name:'Open case study',exact:true});await open.focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(reader);await expect(page.locator('.case-media-title strong')).toHaveText(text);
  await expect(tag(boundary(page))).toHaveAttribute('data-jobpilot-register','rest');await page.goBack();
  await expect(open).toBeFocused();await expect(choices.nth(1)).toHaveAttribute('aria-pressed','true');
});
if (ordinary) test('Motion reaches the saved rule only after a fresh acceptance on both public routes',async({page})=>{
  await fixture(page);await page.emulateMedia({reducedMotion:'no-preference'});
  for(const url of [collection+'#jobpilot-engineering',reader+'#engineering']){
    await page.goto(url);const b=boundary(page);
    await press(b,'Propose a change');await press(b,'Review the change');
    await expect(b.locator('.jp-register-tip')).toHaveCSS('transition-duration','0.23s, 0.12s');
    await expect.poll(()=>gap(b)).toBeCloseTo(10,0);
    await press(b,'Simulate another edit');await press(b,'Accept reviewed change');
    await expect.poll(()=>gap(b)).toBeCloseTo(28,0);await expect(saved(b)).toContainText('Byblos');
    await press(b,'Review again');await press(b,'Accept reviewed change');
    await expect.poll(()=>gap(b)).toBeCloseTo(0,0);await expect(saved(b)).toContainText('Tripoli');
  }
});

if (ordinary) test('Other featured readers retain their own demonstrations',async({page})=>{
  await fixture(page);
  for(const [slug,anchor] of [['construction-project-management-accounting-system','cedar'],['lobby','lobby']]){
    await page.goto('/projects/'+slug);
    await expect(page.locator('.'+anchor+'-boundary')).toHaveCount(1);
    await expect(page.locator('[data-jobpilot-register]')).toHaveCount(0);
  }
});

if (!ordinary) test('Comparison opens each real version; old versions retain their presentation',async({page})=>{
  await fixture(page);await page.goto('/review/jobpilot-registration/index.html');
  const versions=page.locator('ol a');await expect(versions).toHaveCount(3);
  for(const [i,variant] of ['candidate','motion','registration'].entries()){
    await expect(versions.nth(i)).toHaveAttribute('href',root+variant+'?project=jobpilot-ai#jobpilot-engineering');
    await versions.nth(i).click();const b=boundary(page);await expect(b).toBeVisible();
    await expect(b.locator('[data-jobpilot-register]')).toHaveCount(i===2?1:0);await expect(b.locator('.boundary-progress')).toHaveCount(i===2?0:1);
    await page.goBack();
  }
});

if (!ordinary) for(const [width,height] of [[390,844],[1440,900]])test(`Three matched views in motion at ${width}`, async({browser,baseURL})=>{
  test.setTimeout(90_000);
  if(captureDir)await mkdir(captureDir,{recursive:true});
  for(const variant of ['candidate','motion','registration']){
    const context=await browser.newContext({baseURL,viewport:{width,height},reducedMotion:'no-preference',
      ...(captureDir?{recordVideo:{dir:path.join(captureDir,'temporary'),size:{width,height}}}:{})});
    try{
      const page=await context.newPage();await fixture(page);await page.goto(root+variant+'/reader#engineering');const b=boundary(page);await b.scrollIntoViewIfNeeded();await expect(b).toBeVisible();
      await page.evaluate(()=>document.fonts.ready);
      // Pauses set viewing pace only for the exported film; assertions wait on measured UI state.
      const hold=(ms:number)=>captureDir?new Promise<void>(done=>setTimeout(done,ms)):Promise.resolve();
      const capture=async(state:string)=>{if(captureDir){await b.screenshot({path:path.join(captureDir,variant+'-'+width+'-'+state+'.png'),animations:'allow'});}};
      await hold(650);await press(b,'Propose a change');await hold(850);await press(b,'Review the change');
      if(variant==='registration')await expect.poll(()=>gap(b)).toBeCloseTo(10,0);
      await capture('review');await hold(1550);await press(b,variant==='registration'?'Simulate another edit':'Change the saved profile during review.');
      await hold(880);await press(b,'Accept reviewed change');await expect(b.getByRole('button',{name:'Review again',exact:true})).toBeVisible();await capture('blocked');await hold(1350);
      await press(b,'Review again');await hold(800);await press(b,'Accept reviewed change');await expect(b).toHaveAttribute('data-phase','accept');
      if(variant==='registration')await expect.poll(()=>gap(b)).toBeCloseTo(0,0);
      await capture('accepted');await hold(1100);const video=page.video();await context.close();if(captureDir&&video)await video.saveAs(path.join(captureDir,variant+'-'+width+'.webm'));
    }finally{await context.close();}
  }
});
