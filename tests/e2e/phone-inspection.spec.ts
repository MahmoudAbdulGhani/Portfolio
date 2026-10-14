import {expect,test,type Page} from '@playwright/test';
import {caseStudyProjects} from '../fixtures/case-study-projects';
import {caseImage} from '../fixtures/case-image';
test.describe.configure({retries:0});
async function fixtures(page:Page){
 await page.route('https://screens.example.test/**',async r=>r.fulfill({contentType:'image/png',body:await caseImage(r.request().url())}));
 await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;return r.fulfill({json:p==='/api/projects'?caseStudyProjects:p.startsWith('/api/projects/')?caseStudyProjects.find(x=>p===`/api/projects/${x.slug}`):[]});});
}
test.beforeEach(async({page})=>fixtures(page));

test('slow first image leaves usable identity, loading feedback and a stable artwork after the independent opening',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 let release!:()=>void;const pending=new Promise<void>(r=>{release=r;});
 await page.route('https://screens.example.test/**710055a0*',async r=>{await pending;await r.fulfill({contentType:'image/png',body:await caseImage(r.request().url())});});
 await page.goto('/?project=jobpilot-ai',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.selection-caption h1')).toHaveText('JobPilot AI');await expect(page.locator('.open-case')).toBeFocused();
 await expect(page.locator('.screenshot-inspect-cue')).toHaveCount(0);
 await expect(page.getByText('Loading project preview…')).toBeVisible();
 await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
 const artwork=await page.evaluate(()=>{
  const rig=document.querySelector('.motion-rig'),core=document.querySelector('.jobpilot-object .object-core')!;
  return rig&&rig.querySelector('canvas')?Number(getComputedStyle(rig).opacity):Number(getComputedStyle(core).opacity);
 });expect(artwork).toBeGreaterThan(0.9);
 release();await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');await expect(page.getByText('Loading project preview…')).toHaveCount(0);
 await expect(page.locator('.project-image-handoff')).toHaveAttribute('data-image-state','ready');
 await expect(page.locator('.screenshot-inspect-cue')).toHaveCount(1);
});

test('one decode per candidate owns visibility; a pending decode cannot hide the held sculpture',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{
  const decode=HTMLImageElement.prototype.decode;let release!:()=>void;
  const pending=new Promise<void>(r=>{release=r;});
  Object.assign(window,{releasePhoneDecode:release,phoneDecodes:0});
  HTMLImageElement.prototype.decode=function(){if(!this.closest('.product-surface'))return decode.call(this);(window as unknown as {phoneDecodes:number}).phoneDecodes++;return pending.then(()=>decode.call(this));};
 });
 await page.goto('/?project=jobpilot-ai');await expect(page.locator('.project-image-handoff')).toHaveAttribute('data-image-state','loading');
 await expect(page.getByText('Loading project preview…')).toBeVisible();
 await expect(page.locator('.jobpilot-object .object-core')).toHaveCSS('opacity','1');
 expect(await page.evaluate(()=>(window as unknown as {phoneDecodes:number}).phoneDecodes)).toBe(1);
 await page.evaluate(()=>(window as unknown as {releasePhoneDecode:()=>void}).releasePhoneDecode());
 await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
 expect(await page.evaluate(()=>(window as unknown as {phoneDecodes:number}).phoneDecodes)).toBe(1);
});

test('settled invisible WebGL does not paint for engineering reflow or visibility events',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{const draw=WebGL2RenderingContext.prototype.drawElements;Object.assign(window,{phoneDraws:0});WebGL2RenderingContext.prototype.drawElements=function(...args:Parameters<typeof draw>){(window as unknown as {phoneDraws:number}).phoneDraws++;return draw.apply(this,args);};});
 await page.goto('/?project=jobpilot-ai');await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
 await expect(page.locator('.motion-rig')).toHaveCSS('opacity','0');
 const before=await page.evaluate(()=>(window as unknown as {phoneDraws:number}).phoneDraws);
 await page.evaluate(()=>{document.querySelector('.collection-boundary')!.setAttribute('style','padding-bottom:300px');document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForTimeout(200);
 expect(await page.evaluate(()=>(window as unknown as {phoneDraws:number}).phoneDraws)).toBe(before);
 if(await page.locator('.motion-rig canvas').count()){
  const height=await page.locator('.motion-rig').evaluate(el=>el.clientHeight),stageHeight=await page.locator('.stage').evaluate(el=>el.clientHeight);expect(height).toBeLessThan(stageHeight);
 }else await expect(page.locator('.stage')).toHaveAttribute('data-motion-renderer','fallback');
});

test('slow frames and an interrupted pending image cannot revive an obsolete JobPilot selection',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{const raf=requestAnimationFrame;window.requestAnimationFrame=callback=>raf(time=>setTimeout(()=>callback(time),80));});
 let release!:()=>void;const pending=new Promise<void>(r=>{release=r;});
 await page.route('https://screens.example.test/**710055a0*',async r=>{await pending;await r.fulfill({contentType:'image/png',body:await caseImage(r.request().url())});});
 await page.goto('/?project=jobpilot-ai',{waitUntil:'domcontentloaded'});await expect(page.locator('.open-case')).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','idle');
 await page.getByRole('button',{name:'Explore Cedar Construction',exact:true}).click();
 release();await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
 await expect(page.locator('.selection-caption h1')).toHaveText('Cedar Construction');await expect(page.locator('.motion-rig[data-rig="jobpilot"]')).toHaveCount(0);await expect(page.locator('.open-case')).toBeFocused();
});

test('zoom controls and touch pinch/pan inspect the original, Fit resets, Escape restores screenshot focus',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/projects/jobpilot-ai');const trigger=page.locator('.case-figure .screenshot-button');await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
 await expect(page.locator('.case-figure .screenshot-inspect-cue')).toHaveText('Tap to inspect');
 await trigger.focus();await page.keyboard.press('Enter');const dialog=page.getByRole('dialog'),region=dialog.locator('.case-inspector-image');
 await dialog.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(region).toHaveClass(/is-zoom/);
 await expect(region.locator('.project-image-current img')).not.toHaveAttribute('srcset');
 await dialog.getByRole('button',{name:'Actual size',exact:true}).click();
 await region.evaluate(el=>{
  const box=el.getBoundingClientRect();const send=(type:string,id:number,x:number,y:number)=>el.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:id,pointerType:'touch',clientX:box.left+x,clientY:box.top+y}));
  // Synthetic PointerEvents exercise handler ownership and cancellation.
  const capture=el.setPointerCapture;el.setPointerCapture=()=>{};send('pointerdown',1,100,100);send('pointerdown',2,180,100);send('pointermove',2,260,100);send('pointerup',1,100,100);send('pointerup',2,260,100);el.setPointerCapture=capture;
 });
 await expect(region).toHaveClass(/is-zoom/);
 expect(await region.locator('.case-inspection-canvas').evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(1900);
 await region.evaluate(el=>{
  const capture=el.setPointerCapture;el.setPointerCapture=()=>{};const box=el.getBoundingClientRect();
  const send=(type:string,x:number)=>el.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:3,pointerType:'touch',clientX:box.left+x,clientY:box.top+100}));send('pointerdown',200);send('pointermove',80);send('pointerup',80);el.setPointerCapture=capture;
 });
 expect(await region.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
 await dialog.getByRole('button',{name:'Fit',exact:true}).click();await expect(region).toHaveClass(/is-fit/);expect(await region.evaluate(el=>el.scrollLeft)).toBe(0);
 await page.keyboard.press('Escape');await expect(trigger).toBeFocused();expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
});

test('native Chromium touch pinch and drag stay inside inspection without scaling or scrolling the page',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/projects/jobpilot-ai');await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');await page.locator('.media-enlarge').click();
 const region=page.locator('.case-inspector-image'),box=(await region.boundingBox())!;
 const session=await page.context().newCDPSession(page);await session.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 const before=await page.locator('.project-reader').evaluate(el=>el.scrollTop);
 const touches=(distance:number)=>[{id:1,x:box.x+box.width/2-distance/2,y:box.y+box.height/2},{id:2,x:box.x+box.width/2+distance/2,y:box.y+box.height/2}];
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches(70)});
 for(const distance of [90,110,140,180,220])await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches(distance)});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(region).toHaveClass(/is-zoom/);
 await page.getByRole('dialog').getByRole('button',{name:'Actual size',exact:true}).click();
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:3,x:box.x+220,y:box.y+100}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:3,x:box.x+90,y:box.y+60}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 expect(await region.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
 expect(await page.locator('.project-reader').evaluate(el=>el.scrollTop)).toBe(before);
 expect(await page.evaluate(()=>visualViewport?.scale)).toBe(1);
 await page.keyboard.press('Escape');await expect(page.locator('.media-enlarge')).toBeFocused();await session.detach();
});

test('inspection requests only the selected remote original and switching resets zoom without escaping modal focus',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const requested=new Set<string>();page.on('request',r=>{if(r.url().includes('screens.example.test'))requested.add(r.url());});
 await page.goto('/projects/jobpilot-ai');await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
 const before=new Set(requested);await page.locator('.media-enlarge').click();await expect(page.getByRole('dialog')).toBeVisible();
 expect([...requested].filter(url=>!before.has(url))).toEqual([]);
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Zoom in',exact:true}).click();await dialog.getByRole('button',{name:'Next screenshot',exact:true}).click();
 await expect(dialog.locator('.case-inspector-image')).toHaveClass(/is-fit/);await expect(dialog.getByRole('button',{name:'Fit',exact:true})).toHaveAttribute('aria-pressed','true');
 await dialog.getByRole('button',{name:'Close gallery',exact:true}).focus();await page.keyboard.press('Tab');expect(await page.evaluate(()=>Boolean(document.activeElement?.closest('dialog')))).toBe(true);
 await page.keyboard.press('Escape');await expect(page.locator('.media-enlarge')).toBeFocused();
});

test('Collection screenshot inspection returns focus without consuming the selection Escape or JobPilot handoff context',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?project=jobpilot-ai');
 const image=page.locator('.product-surface');await expect(image).toBeEnabled();await image.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(image).toBeFocused();
 await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
 await page.locator('.chapter-switch button').nth(1).click();await expect(image).toBeEnabled();await page.locator('.open-case').click();await page.goBack();
 await expect(page.locator('.chapter-switch button').nth(1)).toHaveAttribute('aria-pressed','true');await expect(page.locator('.open-case')).toBeFocused();
});
