import { test, expect, type Page } from '@playwright/test';
import { caseStudyProjects } from './fixtures/case-study-projects';
import { caseImage } from './fixtures/case-image';
test.describe.configure({retries:0});
const production=process.env.FEATURED_TEST_PRODUCTION==='1';
const collection=(kind:string,variant='candidate')=>production?'/':`/review/featured/${kind}/${variant}`;
const reader=(entry:{kind:string;slug:string})=>production?`/projects/${entry.slug}`:`/review/featured/${entry.kind}/candidate/reader`;
const entries = [
  {kind:'cedar',slug:'construction-project-management-accounting-system',name:'Cedar Construction',number:'03'},
  {kind:'lobby',slug:'lobby',name:'Lobby',number:'02'},
];
async function fixtures(page:Page,reduced=true) {
  await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
  await page.route('https://screens.example.test/**',async r => r.fulfill({contentType:'image/png',body:await caseImage(r.request().url())}));
  await page.route('**/api/**',r => {
    const p=new URL(r.request().url()).pathname;
    return r.fulfill({json:p==='/api/projects'?caseStudyProjects:p.startsWith('/api/projects/')?caseStudyProjects.find(project=>p===`/api/projects/${project.slug}`):p==='/api/profile'?{name:'Review fixture',title:'Developer',socials:[],experience:[]}:[]});
  });
}
const open=(page:Page)=>page.getByRole('link',{name:'Open case study',exact:true});
const choices=(page:Page)=>page.getByRole('group',{name:'Preview workflow'}).getByRole('button');
async function selected(page:Page,entry:typeof entries[number],variant='candidate') {
  await page.goto(collection(entry.kind,variant));
  await page.getByRole('button',{name:`Explore ${entry.name}`,exact:true}).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
  await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
}
async function natural(page:Page,selector:string) {
  const error=await page.locator(selector).evaluate(async node=>{const image=node as HTMLImageElement;await image.decode();const b=image.getBoundingClientRect();return Math.abs(b.height-b.width*image.naturalHeight/image.naturalWidth);});
  expect(error).toBeLessThan(1);
}
for(const entry of entries) {
  for(const [width,height] of [[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]]) test(`${entry.kind} candidate complete journey and layout ${width}x${height}`,async({page})=>{
    await page.setViewportSize({width,height});await fixtures(page);await selected(page,entry);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.selection-project-number')).toHaveText(entry.number);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',production?'index, follow':'noindex, nofollow');
    await natural(page,'.product-surface .project-image-current img');
    const geometry=await page.locator('.selection-frame').evaluate(el=>{
      const box=(s:string)=>el.querySelector(s)!.getBoundingClientRect().toJSON();
      const controls=[...el.querySelectorAll('a,button')];
      return {identity:box('.selection-detail'),image:box('.selection-image-frame'),choices:box('.chapter-switch'),actions:box('.selection-project-links'),title:box('h1'),header:document.querySelector('.site-header')!.getBoundingClientRect().toJSON(),actionIndex:controls.indexOf(el.querySelector('.open-case')!),choiceIndex:controls.indexOf(el.querySelector('.chapter-switch button:last-child')!),overflow:document.documentElement.scrollWidth>innerWidth};
    });
    expect(geometry.overflow).toBe(false);expect(geometry.title.top).toBeGreaterThanOrEqual(geometry.header.bottom);
    if(width<960){expect(geometry.identity.bottom).toBeLessThan(geometry.image.top);expect(geometry.image.bottom).toBeLessThan(geometry.choices.top);expect(geometry.choices.bottom).toBeLessThan(geometry.actions.top);expect(geometry.actionIndex).toBeGreaterThan(geometry.choiceIndex);}
    else expect(geometry.identity.right).toBeLessThan(geometry.image.left);
    const boundary=page.locator(`.${entry.kind}-boundary`);
    await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();
    await expect(page.locator(`#${entry.kind}-engineering`)).toBeFocused();
    if(entry.kind==='cedar'){
      await boundary.getByRole('button',{name:'Interpret the figures',exact:true}).click();
      await boundary.getByLabel('Average phase progress').selectOption('75');
      await expect(boundary).toHaveAttribute('data-outdated','true');
    }else{
      await boundary.getByRole('button',{name:'Try to enter the call',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','denied');
      await boundary.getByLabel('Fictional participant',{exact:true}).selectOption('rowan');
      await boundary.getByRole('button',{name:'Join with the invitation',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','rejected');
    }
    await choices(page).nth(1).click();await expect(page.locator('.project-image-previous')).toHaveCount(0);
    const src=await page.locator('.product-surface .project-image-current img').getAttribute('src');
    await open(page).focus();const sourceY=await page.evaluate(()=>scrollY);await page.keyboard.press('Enter');
    await expect(page.locator('.case-heading h1')).toHaveText(entry.name);await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator(`.${entry.kind}-boundary`)).toHaveCount(1);
    await expect(page.locator('.case-figure img')).toHaveAttribute('src',src!);
    await natural(page,'.case-figure img');
    const order=await boundary.evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('#workflow')!)&Node.DOCUMENT_POSITION_FOLLOWING));expect(order).toBe(true);
    await expect(boundary.locator('h2')).toHaveCount(1);
    if(entry.kind==='cedar'){
      await expect(boundary.getByLabel('Average phase progress')).toHaveValue('75');await expect(boundary).toHaveAttribute('data-outdated','true');
      await boundary.getByRole('button',{name:'Refresh sample interpretation',exact:true}).click();await expect(boundary).toHaveAttribute('data-outdated','false');
      await boundary.getByLabel('Average phase progress').selectOption('25');
    }else{
      await expect(boundary).toHaveAttribute('data-phase','rejected');await boundary.getByLabel('Fictional participant',{exact:true}).selectOption('mira');
      await boundary.getByRole('button',{name:'Join with the invitation',exact:true}).click();await boundary.getByRole('button',{name:'Try to enter the call',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','allowed');
    }
    await page.getByRole('button',{name:'Enlarge',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Enlarge',exact:true})).toBeFocused();
    await page.locator('.case-back').click();await expect(open(page)).toBeFocused();await expect(choices(page).nth(1)).toHaveAttribute('aria-pressed','true');
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(sourceY,0);
    if(entry.kind==='cedar')await expect(boundary.getByLabel('Average phase progress')).toHaveValue('25');else await expect(boundary).toHaveAttribute('data-phase','allowed');
    await boundary.getByRole('button',{name:'Reset',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','inspect');
    await boundary.getByRole('button',{name:'Reset',exact:true}).focus();
    const clearance=await boundary.getByRole('button',{name:'Reset',exact:true}).evaluate(el=>({bottom:el.getBoundingClientRect().bottom,footer:document.querySelector('.stage-footer')!.getBoundingClientRect().top}));expect(clearance.bottom).toBeLessThanOrEqual(clearance.footer);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
  test(`${entry.kind} direct reader refresh and native history retain image identity`,async({page})=>{
    await fixtures(page);await page.goto(reader(entry));await expect(page.locator('h1')).toHaveText(entry.name);
    await page.reload();await expect(page.locator('h1')).toHaveText(entry.name);
    if(production){await expect(page.locator('.case-back')).toHaveAttribute('href','/projects');await page.locator('.case-back').click();await expect(page).toHaveURL('/projects');await selected(page,entry);}
    else{await page.locator('.case-back').click();await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');}
    await choices(page).nth(1).click();await open(page).click();const src=await page.locator('.case-figure img').getAttribute('src');
    await page.reload();await expect(page.locator('.case-figure img')).toHaveAttribute('src',src!);
    await page.goBack();await expect(choices(page).nth(1)).toHaveAttribute('aria-pressed','true');await expect(open(page)).toBeFocused();
    await page.goForward();await expect(page.locator('h1')).toHaveText(entry.name);
  });
  test(`${entry.kind} explicit baseline remains historical; ordinary route adopts the approved presentation`,async({page})=>{
    test.skip(production,'Historical baselines exist only in an explicit review build');
    await fixtures(page);await selected(page,entry,'baseline');await expect(page.locator('.featured-design-candidate')).toHaveCount(0);await expect(page.locator('.jobpilot-selected-product')).toHaveCount(0);
    const originalHeading=entry.kind==='cedar'?'Calculated facts support the interpretation.':'A connection becomes access only when the rules allow it.';
    await expect(page.locator(`.${entry.kind}-title`)).toHaveText(originalHeading);
    await open(page).click();await expect(page.locator('.case-heading h1')).toHaveText(entry.name);await page.locator('.case-back').click();await expect(page).toHaveURL(new RegExp(`/review/featured/${entry.kind}/baseline\\?project=`));
    await page.goto(`/?project=${entry.slug}`);await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');await expect(page.locator('.featured-design-candidate')).toHaveCount(1);await expect(page.locator('.jobpilot-selected-product')).toHaveCount(1);
    await expect(page.locator(`.${entry.kind}-title`)).toHaveText(entry.kind==='cedar'?'Calculation and interpretation':'Invitation to call access');
    await open(page).click();await expect(page.locator('.case-heading h1')).toHaveText(entry.name);await expect(page.locator('.featured-design-candidate')).toHaveCount(1);
  });
  test(`${entry.kind} opening remains inside the product through its own articulation`,async({page})=>{
    await fixtures(page,false);await page.setViewportSize({width:1440,height:900});
    await page.addInitScript(()=>{Object.assign(window,{phase2Samples:0,phase2Cuts:0});const sample=()=>{const rig=document.querySelector<HTMLElement>('.motion-rig');if(rig?.dataset.subjectBounds){const b=JSON.parse(rig.dataset.subjectBounds);const w=window as typeof window&{phase2Samples:number;phase2Cuts:number};w.phase2Samples++;if(b.left<-.5||b.top<-.5||b.right>rig.clientWidth+.5||b.bottom>rig.clientHeight+.5)w.phase2Cuts++;}requestAnimationFrame(sample);};requestAnimationFrame(sample);});
    await selected(page,entry);await expect(page.locator('.stage')).toHaveAttribute('data-motion-framing','product');
    // CI may use software WebGL or photographic fallback. Hardware review is
    // separately captured; require measured bounds whenever a renderer exists.
    if(await page.locator('.stage').getAttribute('data-motion-renderer')==='webgl'){
      const samples=await page.evaluate(()=>({samples:(window as unknown as {phase2Samples:number}).phase2Samples,cuts:(window as unknown as {phase2Cuts:number}).phase2Cuts}));expect(samples.samples).toBeGreaterThan(0);expect(samples.cuts).toBe(0);
    }
  });
  for(const failure of [false,true])test(`${entry.kind} ${failure?'failed':'delayed'} image keeps navigation and honest fallback`,async({page})=>{
    await fixtures(page);let release!:()=>void;const pending=new Promise<void>(r=>{release=r;});
    const project=caseStudyProjects.find(p=>p.slug===entry.slug)!;
    await page.route('**/*',async r=>{
      if(![project.coverImage,...project.screenshots].includes(r.request().url().startsWith('https://screens.example.test/')?r.request().url():new URL(r.request().url()).pathname))return r.fallback();
      if(failure)return r.abort('failed');await pending;return r.fallback();
    });
    await page.goto(`${collection(entry.kind)}?project=${entry.slug}`);
    await expect(open(page)).toBeVisible();await open(page).focus();await page.keyboard.press('Enter');await expect(page.locator('.case-heading h1')).toHaveText(entry.name);release();
  });
  test(`${entry.kind} unavailable WebGL and reduced motion keep image and keyboard return`,async({page})=>{
    await fixtures(page,false);await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){return /^webgl/.test(type)?null:get.apply(this,[type,...args] as Parameters<typeof get>);} as typeof get;});
    await selected(page,entry);await expect(page.locator('.stage')).toHaveAttribute('data-motion-renderer','fallback');await natural(page,'.product-surface .project-image-current img');
    await page.emulateMedia({reducedMotion:'reduce'});await open(page).focus();await page.keyboard.press('Enter');await expect(page.locator('[data-reader-handoff="running"]')).toHaveCount(0);
    await page.locator('.case-back').click();await expect(open(page)).toBeFocused();
  });
  test(`${entry.kind} late image after an interrupted selection cannot restore a retired scene`,async({page})=>{
    await fixtures(page,false);let release!:()=>void;const pending=new Promise<void>(r=>{release=r;});
    const image=caseStudyProjects.find(p=>p.slug===entry.slug)!.coverImage;
    await page.route('**/*',async r=>{if((r.request().url().startsWith('https://screens.example.test/')?r.request().url():new URL(r.request().url()).pathname)!==image)return r.fallback();await pending;return r.fallback();});
    await page.goto(`${collection(entry.kind)}?project=${entry.slug}`);await expect(open(page)).toBeVisible();
    await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Projects',exact:true}).click();release();
    await expect(page.locator('h1')).toBeVisible();await expect(page.locator('.stage.is-expanded,.motion-rig')).toHaveCount(0);
    await page.goBack();await expect(open(page)).toBeVisible();await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
    await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
  });
}
test('review comparison is compiled and normal JobPilot remains approved',async({page,request})=>{
  test.skip(production,'Review comparison assets are excluded from normal builds');
  const response=await request.get('/review/featured-comparison/index.html');expect(response.status()).toBe(200);expect(await response.text()).toContain('Cedar and Lobby');
  const demos=await request.get('/review/featured-demo-introductions/index.html');expect(demos.status()).toBe(200);expect(await demos.text()).toContain('Demonstration introductions');
  await fixtures(page);await page.goto('/?project=jobpilot-ai');await expect(page.locator('.jobpilot-design-refined')).toHaveCount(1);await expect(page.locator('.featured-design-candidate')).toHaveCount(0);
  await expect(page.locator('.selection-caption')).toContainText('Review before saving');
});

test('normal build excludes historical review routes while keeping approved featured defaults',async({page})=>{
  test.skip(!production,'Normal-build exclusion is checked against its compiled output');
  await fixtures(page);
  await page.goto('/review/featured/cedar/candidate');
  await expect(page.getByRole('heading',{name:'This page wandered off.',exact:true})).toBeVisible();
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.jobpilot-design-refined')).toHaveCount(1);
  await expect(page.locator('.featured-design-candidate')).toHaveCount(0);
  await expect(page.locator('.selection-caption')).toContainText('Review before saving');
});

for(const entry of entries)for(const place of ['preview','reader'])for(const [width,height]of [[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]])test(`${entry.kind} ${place} compact introduction reflows at ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width,height});await fixtures(page);
  await page.goto(place==='reader'?reader(entry):`${collection(entry.kind)}?project=${entry.slug}`);
  const boundary=page.locator(`.${entry.kind}-boundary`),heading=boundary.locator(`.${entry.kind}-title`);
  await expect(heading).toHaveText(entry.kind==='cedar'?'Calculation and interpretation':'Invitation to call access');
  await expect(boundary.locator(`.${entry.kind}-label`)).toHaveText(entry.kind==='cedar'?'Sample USD figures · local demo':'Sample participants · local demo');
  const inspect=async()=>boundary.evaluate((el,kind)=>{
    const progress=el.querySelector(`.${kind}-progress`)!;
    const items=[...progress.children].map(node=>{const b=node.getBoundingClientRect();return{top:b.top,bottom:b.bottom,width:b.width,clipped:node.scrollWidth>node.clientWidth+1};});
    const label=getComputedStyle(el.querySelector(`.${kind}-label`)!);
    return{items,current:progress.querySelectorAll('[aria-current="step"]').length,overflow:document.documentElement.scrollWidth>innerWidth||el.scrollWidth>el.clientWidth+1,heading:parseFloat(getComputedStyle(el.querySelector(`.${kind}-title`)!).fontSize),label:parseFloat(label.fontSize),line:parseFloat(label.lineHeight),body:parseFloat(getComputedStyle(el.querySelector(kind==='cedar'?'.cedar-cost-basis':'.lobby-explanation')!).fontSize),control:parseFloat(getComputedStyle(el.querySelector('select')!).fontSize)};
  },entry.kind);
  const check=async()=>{
    const m=await inspect(),[a,b,c]=m.items;
    const row=Math.abs(a.top-b.top)<1&&Math.abs(b.top-c.top)<1;
    const column=a.bottom<=b.top&&b.bottom<=c.top;
    expect(row||column).toBe(true);expect(m.items.some(i=>i.clipped)).toBe(false);expect(m.overflow).toBe(false);expect(m.current).toBe(1);
    if(row)expect(Math.max(...m.items.map(i=>i.width))-Math.min(...m.items.map(i=>i.width))).toBeLessThan(1);
    return m;
  };
  const standard=await check();expect(standard.label).toBeGreaterThanOrEqual(12);expect(standard.label).toBeLessThanOrEqual(13);expect(standard.line).toBeGreaterThanOrEqual(standard.label*1.5);expect(standard.body).toBeGreaterThanOrEqual(14);expect(standard.control).toBeGreaterThanOrEqual(14);
  if(width<720){expect(standard.heading).toBeGreaterThanOrEqual(26);expect(standard.heading).toBeLessThanOrEqual(28);}
  if([320,390,430,768].includes(width)){
    await boundary.evaluate(el=>{const nodes=[el,...el.querySelectorAll<HTMLElement>('*')];const sizes=nodes.map(node=>({node,size:parseFloat(getComputedStyle(node).fontSize)*2,line:parseFloat(getComputedStyle(node).lineHeight)*2}));for(const{node,size,line}of sizes){node.style.fontSize=`${size}px`;if(Number.isFinite(line))node.style.lineHeight=`${line}px`;}});
    await check();await boundary.locator('select').focus();
    const clearance=await boundary.locator('select').evaluate(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom,header:document.querySelector('.site-header')!.getBoundingClientRect().bottom,footer:document.querySelector('.stage-footer')!.getBoundingClientRect().top}));
    expect(clearance.top).toBeGreaterThanOrEqual(clearance.header);expect(clearance.bottom).toBeLessThanOrEqual(clearance.footer);
  }
});
