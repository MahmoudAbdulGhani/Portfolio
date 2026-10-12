import {expect,test,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {caseStudyProjects} from '../fixtures/case-study-projects';
import {caseImage} from '../fixtures/case-image';
const region=(page:Page)=>page.getByRole('region',{name:'Lobby connection and access'});
test.beforeEach(async({page})=>{
  await page.route('https://screens.example.test/**',async route=>route.fulfill({contentType:'image/png',body:await caseImage(route.request().url())}));
  await page.route('**/api/**',route=>{const path=new URL(route.request().url()).pathname;return route.fulfill({json:path==='/api/projects'?caseStudyProjects:path.startsWith('/api/projects/')?caseStudyProjects.find(p=>path===`/api/projects/${p.slug}`):path==='/api/profile'?{name:'Test owner',title:'Developer',socials:[],experience:[]}:[]});});
});
test('invitation, membership and explicit call attempt remain distinct; rejected requests do not change membership',async({page})=>{
  const writes:string[]=[],sockets:string[]=[];page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());});page.on('websocket',s=>sockets.push(s.url()));
  await page.goto('/?project=lobby');const demo=region(page);
  await expect(demo.locator('.lobby-membership')).toHaveText('Invited · not a member');
  await demo.getByRole('button',{name:'Try to enter the call',exact:true}).click();
  await expect(demo).toHaveAttribute('data-phase','denied');await expect(demo.locator('.lobby-membership')).toHaveText('Invited · not a member');
  await expect(demo.locator('.lobby-invariant')).toContainText('No membership or room-content changes');
  await expect(demo.getByRole('status')).toContainText('call access denied');
  await demo.getByRole('button',{name:'Join with the invitation',exact:true}).click();await expect(demo).toHaveAttribute('data-phase','joined');
  await expect(demo.locator('.lobby-membership')).toHaveText('Active member');await expect(demo.locator('[aria-current="step"]')).toContainText('Join');
  await expect(demo.locator('.lobby-art')).toHaveAttribute('data-access','unresolved');
  await demo.getByRole('button',{name:'Try to enter the call',exact:true}).click();await expect(demo).toHaveAttribute('data-phase','allowed');
  await expect(demo.locator('.lobby-art')).toHaveAttribute('data-access','allowed');await expect(demo.locator('[aria-current="step"]')).toContainText('Try access');
  await expect(demo.locator('.lobby-connection-bridge')).toHaveCSS('visibility','visible');
  await demo.getByLabel('Fictional participant').selectOption('rowan');await demo.getByRole('button',{name:'Join with the invitation',exact:true}).click();
  await expect(demo).toHaveAttribute('data-phase','rejected');await expect(demo.locator('.lobby-explanation')).toContainText('does not override the block');
  await expect(demo.locator('.lobby-membership')).toHaveText('Blocked · not a member');
  await demo.getByRole('button',{name:'Try to enter the call',exact:true}).click();await expect(demo).toHaveAttribute('data-phase','denied');
  await demo.getByLabel('Fictional participant').selectOption('mira');await expect(demo.locator('.lobby-membership')).toHaveText('Active member');
  await demo.getByRole('button',{name:'Reset',exact:true}).click();await expect(demo.locator('.lobby-membership')).toHaveText('Invited · not a member');
  expect(writes).toEqual([]);expect(sockets).toEqual([]);
});
test('rapid actions, Reset and closing cancel obsolete guide emphasis without gating controls',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');await page.getByRole('button',{name:'Explore Lobby',exact:true}).click();
  await region(page).getByRole('button',{name:'Join with the invitation',exact:true}).click();
  await page.evaluate(()=>{const d=document.querySelector('.lobby-boundary')!;const b=[...d.querySelectorAll('button')];b.find(x=>x.textContent==='Try to enter the call')!.click();b.find(x=>x.textContent==='Reset')!.click();});
  await expect(region(page)).toHaveAttribute('data-phase','inspect');await page.waitForTimeout(500);
  await expect(region(page).locator('.lobby-result')).toHaveCSS('opacity','1');await expect(region(page).locator('.lobby-connection')).toHaveCSS('opacity','0.45');
  await expect(region(page).locator('.lobby-connection-bridge')).toHaveCSS('visibility','hidden');
  await region(page).getByRole('button',{name:'Join with the invitation',exact:true}).click();await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Explore Lobby',exact:true})).toBeFocused();await page.getByRole('button',{name:'Explore Lobby',exact:true}).click();
  await expect(region(page)).toHaveAttribute('data-phase','inspect');await expect(page.getByRole('link',{name:'Open case study',exact:true})).toBeFocused();
});
test('engineering navigation reaches a focused visible heading and Back retains the original history',async({page})=>{
  for(const reducedMotion of ['no-preference','reduce'] as const){
    await page.emulateMedia({reducedMotion});await page.goto('/');await page.getByRole('button',{name:'Explore Lobby',exact:true}).click();
    await expect(page.getByRole('link',{name:'Open case study',exact:true})).toBeFocused();await page.keyboard.press('Tab');
    await expect(page.getByRole('link',{name:'Explore the engineering',exact:true})).toBeFocused();const length=await page.evaluate(()=>history.length);await page.keyboard.press('Enter');
    await expect(page.locator('#lobby-engineering')).toBeFocused();await expect(page.locator('#lobby-engineering')).toBeInViewport({ratio:1});expect(await page.evaluate(()=>history.length)).toBe(length);
    expect(await page.locator('#lobby-engineering').evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
    await page.goBack();await expect(page.getByRole('button',{name:'Explore Lobby',exact:true})).toBeFocused();
  }
});
test('reader replaces the related static explanation once and preserves source and team limits',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?project=lobby#lobby-engineering');await expect(page.locator('#lobby-engineering')).toBeFocused();
  await page.getByRole('link',{name:'Open case study',exact:true}).click();await expect(page).toHaveURL(/\/projects\/lobby$/);const demo=region(page);await expect(demo).toHaveCount(1);
  await expect(page.locator('.engineering-decisions summary').filter({hasText:'Separate room data from live media'})).toHaveCount(0);
  await demo.locator('summary').click();await expect(demo.locator('.disclosure-content')).toContainText('not individual authorship');
  await expect(demo.locator('.disclosure-content')).toContainText('does not check room status or expiry');await expect(demo.locator('.disclosure-content')).toContainText('were not executed');
  await expect(demo.getByRole('link',{name:'Invitation and membership rules'})).toHaveAttribute('href',/2c8b1d3948b799acfe76d2559723aace143a1f52/);
  expect((await new AxeBuilder({page}).include('.lobby-boundary').analyze()).violations).toEqual([]);
});
test('keyboard and preference changes communicate states without motion or color alone',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?project=lobby');const demo=region(page);
  await demo.getByRole('button',{name:'Try to enter the call',exact:true}).focus();await page.keyboard.press('Enter');await expect(demo.getByRole('status')).toContainText('denied');
  await page.keyboard.press('Tab');await expect(demo.getByRole('button',{name:'Join with the invitation',exact:true})).toBeFocused();await page.keyboard.press('Space');await expect(demo.locator('.lobby-membership')).toHaveText('Active member');
  await page.keyboard.press('Shift+Tab');await page.keyboard.press('Enter');await expect(demo.getByRole('status')).toContainText('permitted');
  await expect(demo.locator('.lobby-connection')).toHaveCSS('opacity','1');await expect(demo.locator('.lobby-connection-bridge')).toHaveCSS('visibility','visible');
  await page.emulateMedia({reducedMotion:'no-preference'});await demo.getByRole('button',{name:'Reset',exact:true}).click();await page.emulateMedia({reducedMotion:'reduce'});
  await expect(demo.locator('.lobby-result')).toHaveCSS('opacity','1');await expect(demo.locator('.lobby-connection-bridge')).toHaveCSS('visibility','hidden');
  expect((await new AxeBuilder({page}).include('.lobby-boundary').analyze()).violations).toEqual([]);
});
test('photographic fallback keeps all checks, controls and disclosure; no perpetual motion',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){return type==='webgl2'?null:Reflect.apply(original,this,[type,...args]);} as typeof original;});
  await page.goto('/?project=lobby');const demo=region(page);await demo.getByRole('button',{name:'Join with the invitation',exact:true}).click();await demo.getByRole('button',{name:'Try to enter the call',exact:true}).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-renderer','fallback');await expect(demo.locator('image')).toHaveAttribute('href','/landscape/lobby-sculpture.webp');await expect(demo.locator('image')).not.toHaveAttribute('transform');
  await expect(demo.locator('.lobby-connection')).toHaveCSS('opacity','1');
  const mutations=await demo.locator('.lobby-art svg').evaluate(el=>new Promise<number>(resolve=>{let n=0;const o=new MutationObserver(r=>{n+=r.length;});o.observe(el,{attributes:true,subtree:true});setTimeout(()=>{o.disconnect();resolve(n);},400);}));expect(mutations).toBe(0);
  await demo.getByLabel('Fictional participant').selectOption('rowan');await demo.getByRole('button',{name:'Join with the invitation',exact:true}).click();await expect(demo).toHaveAttribute('data-phase','rejected');await demo.locator('summary').click();await expect(demo.locator('.disclosure-content')).toContainText('no invitations');
});
for(const [width,height] of [[1440,900],[1440,650],[1363,936],[768,1024],[390,844],[320,844]])test(`all states remain readable and touch controls usable at ${width}×${height}`,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/?project=lobby');await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();const demo=region(page);
  await expect(page.locator('#lobby-engineering')).toBeInViewport({ratio:1});
  for(const action of ['Try to enter the call','Join with the invitation','Try to enter the call','Reset']){
    await demo.getByRole('button',{name:action,exact:true}).click();
    const b=await demo.evaluate(el=>({overflow:el.scrollWidth>el.clientWidth||document.documentElement.scrollWidth>innerWidth,copy:parseFloat(getComputedStyle(el.querySelector('.lobby-explanation')!).fontSize),metadata:parseFloat(getComputedStyle(el.querySelector('.lobby-label')!).fontSize),art:el.querySelector('.lobby-art')!.getBoundingClientRect(),content:el.querySelector('.lobby-content')!.getBoundingClientRect(),touch:[...el.querySelectorAll('button,select')].map(e=>e.getBoundingClientRect().height)}));
    expect(b.overflow).toBe(false);expect(b.copy).toBeGreaterThanOrEqual(14);expect(b.metadata).toBeGreaterThanOrEqual(12);expect(Math.min(...b.touch)).toBeGreaterThanOrEqual(44);if(width<680)expect(b.art.y).toBeGreaterThanOrEqual(b.content.bottom);
  }
});
