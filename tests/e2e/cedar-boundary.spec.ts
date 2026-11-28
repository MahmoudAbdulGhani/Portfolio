import {expect,test,type Page,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {caseStudyProjects} from '../fixtures/case-study-projects';
import {caseImage} from '../fixtures/case-image';
const slug='construction-project-management-accounting-system';
const region=(page:Page)=>page.getByRole('region',{name:'Cedar calculation and interpretation'});
async function fixtures(page:Page){
  await page.route('https://screens.example.test/**',async route=>route.fulfill({contentType:'image/png',body:await caseImage(route.request().url())}));
  await page.route('**/api/**',route=>{
    const path=new URL(route.request().url()).pathname;
    return route.fulfill({json:path==='/api/projects'?caseStudyProjects:path.startsWith('/api/projects/')?caseStudyProjects.find(p=>path===`/api/projects/${p.slug}`):path==='/api/profile'?{name:'Test owner',title:'Developer',socials:[],experience:[]}:[]});
  });
}
test.beforeEach(async({page})=>{await fixtures(page);});
test('calculated facts stay separate from interpretation; input change and explicit refresh make no writes',async({page})=>{
  const writes:string[]=[];page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());});
  await page.goto(`/?project=${slug}`);const demo=region(page);
  await expect(demo.locator('.cedar-total')).toHaveText('USD 80,000.00');
  await expect(demo.locator('.cedar-explanation')).toContainText('cannot change them');
  await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
  await expect(demo.locator('.cedar-total')).toHaveText('USD 80,000.00');
  await expect(demo.locator('.cedar-explanation')).toContainText('20.00%');
  await expect(demo.locator('[aria-current="step"]')).toContainText('Interpret');
  await demo.getByLabel('Average phase progress').selectOption('25');
  await expect(demo.locator('.cedar-total')).toHaveText('USD 160,000.00');
  await expect(demo.locator('.cedar-margin')).toContainText('-60.00%');
  await expect(demo.locator('.cedar-explanation')).toContainText('80,000.00');
  await expect(demo.locator('.cedar-interpretation-basis')).toHaveText('Outdated sample · 50% progress');
  await expect(demo.locator('.cedar-outdated-note')).toHaveText('Refresh to explain the figures at 25% progress.');
  await expect(demo.locator('[aria-current="step"]')).toContainText('Recalculate');
  await demo.getByRole('button',{name:'Refresh sample interpretation',exact:true}).click();
  await expect(demo.locator('.cedar-explanation')).toContainText('160,000.00');
  await expect(demo.locator('.cedar-total')).toHaveText('USD 160,000.00');
  await expect(demo.locator('.cedar-outdated-note')).toHaveCount(0);
  await expect(demo.getByRole('status')).toContainText('Calculated figures are unchanged');
  expect(writes).toEqual([]);
});
test('zero and full progress use the verified fallback and completion calculations',async({page})=>{
  await page.goto(`/?project=${slug}`);const demo=region(page);
  await demo.getByLabel('Average phase progress').selectOption('0');
  await expect(demo.locator('.cedar-total')).toHaveText('USD 40,000.00');
  await expect(demo.locator('.cedar-formula')).toContainText('no extrapolation');
  await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
  await expect(demo.locator('.cedar-explanation')).toContainText('not evidence');
  await demo.getByLabel('Average phase progress').selectOption('100');
  await expect(demo.locator('.cedar-total')).toHaveText('USD 40,000.00');
  await expect(demo.locator('.cedar-formula')).toContainText('1.00');
  await expect(demo.locator('.cedar-margin')).toContainText('60.00%');
});
test('rapid actions, Reset and closing retire obsolete transitions while controls stay responsive',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
  await page.getByRole('button',{name:'Explore Cedar Construction',exact:true}).click();
  await region(page).getByRole('button',{name:'Interpret the figures',exact:true}).click();
  await page.evaluate(()=>{
    const demo=document.querySelector('.cedar-boundary')!;
    const select=demo.querySelector('select')!;select.value='25';select.dispatchEvent(new Event('change',{bubbles:true}));
    [...demo.querySelectorAll('button')].find(b=>b.textContent==='Reset')!.click();
  });
  await expect(region(page)).toHaveAttribute('data-phase','inspect');
  await expect(region(page).getByLabel('Average phase progress')).toHaveValue('50');
  await expect(region(page).locator('.cedar-interpretation-basis')).toContainText('Prewritten sample');
  await page.waitForTimeout(600);
  await expect(region(page).locator('.cedar-interpretation')).toHaveCSS('opacity','1');
  await region(page).getByRole('button',{name:'Interpret the figures',exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Explore Cedar Construction',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Explore Cedar Construction',exact:true}).click();
  await expect(region(page)).toHaveAttribute('data-phase','inspect');
  await expect(page.getByRole('link',{name:'Open case study',exact:true})).toBeFocused();
});
test('engineering anchor focuses its visible heading, retains history depth, Back and reduced motion',async({page})=>{
  for(const reducedMotion of ['no-preference','reduce'] as const){
    await page.emulateMedia({reducedMotion});await page.goto('/');
    await page.getByRole('button',{name:'Explore Cedar Construction',exact:true}).click();
    await expect(page.getByRole('link',{name:'Open case study',exact:true})).toBeFocused();
    await page.keyboard.press('Tab');
    const link=page.getByRole('link',{name:'Explore the engineering',exact:true});
    await expect(link).toBeFocused();await expect(link).toHaveAttribute('href',`/?project=${slug}#cedar-engineering`);
    const length=await page.evaluate(()=>history.length);await page.keyboard.press('Enter');
    const heading=region(page).getByRole('heading',{name:'Calculation and interpretation',exact:true});
    await expect(heading).toBeFocused();await expect(heading).toBeInViewport({ratio:1});
    expect(await page.evaluate(()=>history.length)).toBe(length);
    expect(await heading.evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
    await page.goBack();await expect(page.getByRole('button',{name:'Explore Cedar Construction',exact:true})).toBeFocused();
  }
});
test('direct fragment and reader keep one demonstration and source/team attribution',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`/?project=${slug}#cedar-engineering`);
  await expect(region(page).getByRole('heading',{name:'Calculation and interpretation',exact:true})).toBeFocused();
  await page.getByRole('link',{name:'Open case study',exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/projects/${slug}$`));await expect(region(page)).toHaveCount(1);
  await expect(page.locator('.engineering-decisions summary').filter({hasText:'Calculate first, narrate second'})).toHaveCount(0);
  await region(page).locator('summary').click();
  await expect(region(page).locator('.disclosure-content')).toContainText('team’s implementation');
  await expect(region(page).locator('.disclosure-content')).toContainText('fictional USD amounts and prewritten explanations');
  await expect(region(page).locator('.disclosure-content')).toContainText('It makes no AI request or financial submission');
  await expect(region(page).getByRole('link',{name:'Calculation and narration'})).toHaveAttribute('href',/ab4aff541fb46b6c54831f16a4352657369c1063/);
  expect((await new AxeBuilder({page}).include('.cedar-boundary').analyze()).violations).toEqual([]);
});
test('keyboard operation and preference changes reveal the same states immediately',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`/?project=${slug}`);const demo=region(page);
  const input=demo.getByLabel('Average phase progress');await input.focus();await page.keyboard.press('ArrowDown');
  await expect(input).toHaveValue('75');await expect(demo.locator('.cedar-total')).toHaveText('USD 53,333.33');
  await page.keyboard.press('Tab');await expect(demo.getByRole('button',{name:'Interpret the figures',exact:true})).toBeFocused();
  await page.keyboard.press('Enter');await expect(demo).toHaveAttribute('data-phase','interpret');
  await expect(demo.locator('.cedar-interpretation')).toHaveCSS('opacity','1');
  await expect(demo.locator('.cedar-interpretation-guide')).toHaveCSS('opacity','1');
  await page.keyboard.press('Tab');await expect(demo.getByRole('button',{name:'Reset',exact:true})).toBeFocused();
  await page.keyboard.press('Space');await expect(input).toHaveValue('50');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(demo.locator('.cedar-interpretation')).toHaveCSS('opacity','1');
  expect((await new AxeBuilder({page}).include('.cedar-boundary').analyze()).violations).toEqual([]);
});
test('photographic fallback retains calculation, explanation and source disclosure',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){return type==='webgl2'?null:Reflect.apply(original,this,[type,...args]);} as typeof original;});
  await page.goto(`/?project=${slug}`);const demo=region(page);
  await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-renderer','fallback');
  await expect(demo.locator('.cedar-art')).toHaveAttribute('data-renderer','photographic-svg');
  await expect(demo.locator('image')).toHaveAttribute('href','/landscape/archive-sculpture.webp');
  await demo.getByLabel('Average phase progress').selectOption('25');
  await demo.getByRole('button',{name:'Refresh sample interpretation',exact:true}).click();
  await expect(demo.locator('.cedar-total')).toHaveText('USD 160,000.00');
  await demo.locator('summary').click();await expect(demo.locator('.disclosure-content')).toContainText('no AI request');
});
test('fixed artwork and settled emphasis have no perpetual updates',async({page})=>{
  await page.goto(`/?project=${slug}`);const demo=region(page);
  await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
  await expect(demo.locator('.cedar-interpretation-guide')).toHaveCSS('opacity','1');
  const count=await demo.locator('.cedar-art svg').evaluate(el=>new Promise<number>(resolve=>{let count=0;const observer=new MutationObserver(records=>{count+=records.length;});observer.observe(el,{attributes:true,subtree:true});setTimeout(()=>{observer.disconnect();resolve(count);},500);}));
  expect(count).toBe(0);await expect(demo.locator('image')).not.toHaveAttribute('transform');
});
for(const width of [1440,768,390,320])test(`Cedar figures, inputs and actions remain readable at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:width===1440?650:844});await page.goto(`/?project=${slug}`);
  await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();const demo=region(page);
  await expect(demo.getByRole('heading',{name:'Calculation and interpretation',exact:true})).toBeInViewport({ratio:1});
  await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();await demo.getByLabel('Average phase progress').selectOption('25');
  const bounds=await demo.evaluate(el=>({overflow:document.documentElement.scrollWidth>innerWidth||el.scrollWidth>el.clientWidth,background:getComputedStyle(el).backgroundColor,metadata:Math.min(...Array.from(el.querySelectorAll('.cedar-label,.cedar-unit,.cedar-interpretation-basis')).map(e=>parseFloat(getComputedStyle(e).fontSize))),copy:Math.min(...Array.from(el.querySelectorAll('.cedar-explanation,.cedar-formula,.cedar-outdated-note')).map(e=>parseFloat(getComputedStyle(e).fontSize))),box:Object.fromEntries(['.cedar-art','.cedar-contract-rail','.cedar-input-control','.cedar-interpretation'].map(sel=>[sel,el.querySelector(sel)!.getBoundingClientRect().toJSON()]))}));
  expect(bounds.overflow).toBe(false);expect(bounds.background).toBe('rgb(236, 235, 227)');expect(bounds.metadata).toBeGreaterThanOrEqual(12);expect(bounds.copy).toBeGreaterThanOrEqual(14);
  const art=bounds.box['.cedar-art'], rail=bounds.box['.cedar-contract-rail'], control=bounds.box['.cedar-input-control'], explanation=bounds.box['.cedar-interpretation'];
  expect(art.width).toBeGreaterThan(80);expect(rail.width).toBeGreaterThan(220);
  expect(art.bottom).toBeLessThanOrEqual(rail.top+1);
  if(width<720){
    expect(art.top).toBeGreaterThanOrEqual(control.bottom);
    expect(explanation.top).toBeGreaterThan(rail.bottom);
    expect(rail.bottom-control.bottom).toBeLessThan(420);
  }else if(width===1440)expect(rail.right).toBeLessThan(control.left);
});

async function markPercent(demo:Locator, marker:string){
  return demo.locator('.cedar-contract-rail').evaluate((rail,key)=>{
    const box=rail.getBoundingClientRect(), mark=rail.querySelector('[data-marker="'+key+'"]')!.getBoundingClientRect();
    return Math.round(100*(mark.x+mark.width/2-box.x)/box.width);
  },marker);
}
for(const [place,path] of [['Collection',`/?project=${slug}#cedar-engineering`],['reader',`/projects/${slug}#engineering`]]) {
  test(`contract mark keeps its scale and separates calculation from refresh in the ${place}`,async({page})=>{
    await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(path);
    const demo=region(page), select=demo.getByLabel('Average phase progress');
    await expect.poll(()=>markPercent(demo,'estimate')).toBe(40);
    await expect(demo.locator('[data-marker="explanation"]')).toHaveCount(0);
    await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
    await expect.poll(()=>markPercent(demo,'explanation')).toBe(40);
    const fixed=await demo.locator('[data-marker="contract"]').boundingBox();
    await select.selectOption('25');
    expect(await demo.getByRole('figure').ariaSnapshot()).toContain('USD 160,000.00');
    await expect(demo.locator('.cedar-contract-difference')).toHaveText('$60,000 over contract');
    await expect.poll(()=>markPercent(demo,'estimate')).toBe(80);
    expect(await markPercent(demo,'contract')).toBe(50);
    expect(await markPercent(demo,'explanation')).toBe(40);
    expect((await demo.locator('[data-marker="contract"]').boundingBox())!.x).toBeCloseTo(fixed!.x,0);
    await expect(demo.locator('.cedar-contract-key-then')).toHaveText('Explanation: $80,000 at 50%');
    await demo.getByRole('button',{name:'Refresh sample interpretation'}).click();
    await expect.poll(()=>markPercent(demo,'explanation')).toBe(80);
    expect(await markPercent(demo,'estimate')).toBe(80);
    await select.selectOption('75');await demo.getByRole('button',{name:'Reset',exact:true}).click();
    expect(await markPercent(demo,'estimate')).toBe(40);
    await expect(demo.locator('[data-marker="explanation"]')).toHaveCount(0);
  });
}
test('contract mark distinguishes invoiced-only from a 100% estimate under reduced motion and enlarged text',async({page})=>{
  await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(`/projects/${slug}`);const demo=region(page), select=demo.getByLabel('Average phase progress');
  await page.addStyleTag({content:'html { font-size: 200% !important; }'});
  await select.selectOption('0');
  await expect(demo.getByRole('figure',{name:'Invoiced cost to date'})).toBeVisible();
  await expect(demo.locator('.cedar-contract-difference')).toContainText('No forecast');
  expect(await markPercent(demo,'estimate')).toBe(20);
  await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
  await select.selectOption('100');
  await expect(demo.getByRole('figure',{name:'Calculated total-cost estimate'})).toBeVisible();
  await expect(demo).toHaveAttribute('data-outdated','true');
  await expect(demo.locator('.cedar-contract-key-then')).toHaveText('Explanation: $40,000 at 0%');
  expect(await markPercent(demo,'estimate')).toBe(20);
  await select.selectOption('25');expect(await markPercent(demo,'estimate')).toBe(80);
  expect(await demo.locator('.cedar-contract').evaluate(el=>({
    overflow:el.scrollWidth>el.clientWidth+1,
    continuous:el.getAnimations({subtree:true}).some(a=>a.playState==='running'),
  }))).toEqual({overflow:false,continuous:false});
});

test('contract drawing moves through the reference without moving the last explanation',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(`/projects/${slug}#engineering`);
  const demo=region(page);await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
  const travel=await demo.evaluate(el=>{
    const rail=el.querySelector('.cedar-contract-rail')!, select=el.querySelector('select')!;
    const center=(key:string)=>{const a=rail.getBoundingClientRect(),b=rail.querySelector('[data-marker="'+key+'"]')!.getBoundingClientRect();return (b.x+b.width/2-a.x)/a.width;};
    select.value='25';select.dispatchEvent(new Event('change',{bubbles:true}));
    return new Promise<{percent:number, fixed:number, last:number, duration:number}>(resolve=>{
      requestAnimationFrame(()=>{
        const carrier=rail.querySelector('[data-marker="estimate"]')!.parentElement!;
        carrier.getBoundingClientRect();
        const motion=carrier.getAnimations().find(a=>a instanceof CSSTransition);
        const duration=Number(motion?.effect?.getComputedTiming().duration??0);
        if(motion){motion.pause();motion.currentTime=duration/3;}
        const sample={percent:center('estimate'),fixed:center('contract'),last:center('explanation'),duration};
        motion?.play();resolve(sample);
      });
    });
  });
  expect(travel.duration).toBeGreaterThan(0);expect(travel.percent).toBeGreaterThan(.4);expect(travel.percent).toBeLessThan(.8);
  expect(travel.fixed).toBeCloseTo(.5,2);expect(travel.last).toBeCloseTo(.4,2);
  await expect.poll(()=>markPercent(demo,'estimate')).toBe(80);
});
