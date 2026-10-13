// Read-only review: frozen public records and original project media.
import {chromium,expect} from '@playwright/test';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
const phase=process.argv[2]??'after';
const mode=process.argv.includes('--normal')?'normal':process.argv.includes('--reduced')?'reduced':process.argv.includes('--fallback')?'fallback':'delayed';
const output=`docs/design/collection-readiness/${mode==='delayed'?phase:mode}`;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const findings=[];
try{
 for(const [width,height] of (phase==='before'?[[1440,900],[390,844]]:[[1440,900],[1440,650],[768,1024],[390,844],[320,844]])){
  const record=mode==='delayed'&&height!==650&&[1440,390].includes(width);
  const context=await browser.newContext({viewport:{width,height},reducedMotion:mode==='reduced'?'reduce':'no-preference',...(record?{recordVideo:{dir:output,size:{width,height}}}: {})});
  const page=await context.newPage(),errors=[],states=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/**',r=>r.fulfill({json:content[new URL(r.request().url()).pathname]??content['/api/projects'].find(p=>new URL(r.request().url()).pathname===`/api/projects/${p.slug}`)??[]}));
  await page.route('https://**',async r=>{try{await r.fulfill({contentType:'image/png',body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(r.request().url()).pathname)}`)});}catch{await r.abort();}});
  // Delay the initialization notification, not asset dimensions or UI clocks.
  // The real rig initializes; its ready signal is withheld by this review fixture.
  if(mode==='delayed')await page.route('**/MotionRig.tsx*',async r=>{
   const response=await r.fetch();
   const body=(await response.text()).replace('onReady(renderer);','setTimeout(() => { if (!cancelled) onReady(renderer); }, 4200);');
   await r.fulfill({response,body});
  });
  if(mode==='fallback')await page.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};
  });
  await page.addInitScript(()=>{
   window.readinessStates=[];
   new MutationObserver(()=>{
    const stage=document.querySelector('.stage');
    if(!stage)return;
    const state=stage.getAttribute('data-selection-state'),renderer=stage.getAttribute('data-motion-renderer');
    const list=window.readinessStates,previous=list.at(-1);
    if(previous?.state!==state||previous?.renderer!==renderer)list.push({at:performance.now(),state,renderer});
   }).observe(document,{subtree:true,attributes:true,attributeFilter:['data-selection-state','data-motion-renderer']});
  });
  await page.goto('http://127.0.0.1:5185/?view=collection');
  await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
  const started=await page.evaluate(()=>performance.now());
  if(mode==='delayed')await page.waitForTimeout(5100);
  else await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
  const state=await page.locator('.stage').getAttribute('data-selection-state');
  const openingRenderer=await page.locator('.stage').getAttribute('data-motion-renderer');
  const gpu=await page.locator('.motion-rig canvas').evaluateAll(canvases=>canvases.map(canvas=>{
   const gl=canvas.getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');
   return debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null;
  }));
  await page.screenshot({path:`${output}/${width}-${height}-delayed-ready.jpg`,quality:83});
  if(phase==='after')await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
  if(mode==='delayed')await page.waitForTimeout(1600);
  await page.screenshot({path:`${output}/${width}-${height}-final.jpg`,quality:83});
  const geometry=await page.locator('.selection-frame').evaluate(frame=>{
   const image=frame.querySelector('.project-image-current img'),r=image.getBoundingClientRect(),caption=frame.querySelector('.selection-detail').getBoundingClientRect();
   return {natural:[image.naturalWidth,image.naturalHeight],imageBottom:r.bottom,captionTop:caption.top,overflow:document.documentElement.scrollWidth>innerWidth,opacity:getComputedStyle(frame.querySelector('.product-surface')).opacity};
  });
  states.push(...await page.evaluate(()=>window.readinessStates));
  if(phase==='after'){
   expect(geometry.overflow).toBe(false);expect(geometry.captionTop).toBeGreaterThanOrEqual(geometry.imageBottom);expect(geometry.opacity).toBe('1');
   await page.getByRole('link',{name:'Open case study',exact:true}).click();
   await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
   await page.locator('.case-back').click();
   await expect(page.locator('.open-case')).toBeFocused();
   await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
   if(mode!=='delayed'){
    await page.getByRole('group',{name:'Preview workflow'}).getByRole('button').nth(1).click();
    await page.locator('.project-image-current img').evaluate(image=>image.decode());
    await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
    await expect(page.locator('.project-image-previous')).toHaveCount(0);
    await page.screenshot({path:`${output}/${width}-${height}-second-preview.jpg`,quality:83,fullPage:true});
    await page.locator('.open-case').click();
    await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
    await page.locator('.case-back').click();
    await expect(page.getByRole('group',{name:'Preview workflow'}).getByRole('button').nth(1)).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.open-case')).toBeFocused();
    await page.screenshot({path:`${output}/${width}-${height}-second-return.jpg`,quality:83,fullPage:true});
    for(const [name,slug] of [['Cedar Construction','construction-project-management-accounting-system'],['Lobby','lobby']]){
     await page.goto(`http://127.0.0.1:5185/?project=${slug}`);
     await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
     for(let index=0;index<2;index++){
      const choice=page.getByRole('group',{name:'Preview workflow'}).getByRole('button').nth(index);
      await choice.click();
      await expect(choice).toHaveAttribute('aria-pressed','true');
      await page.locator('.project-image-current img').evaluate(image=>image.decode());
      await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
      await expect(page.locator('.project-image-previous')).toHaveCount(0);
      const bounds=await page.locator('.selection-frame').evaluate(el=>({image:el.querySelector('.project-image-current img').getBoundingClientRect().bottom,caption:el.querySelector('.selection-detail').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth}));
      expect(bounds.caption).toBeGreaterThanOrEqual(bounds.image);expect(bounds.overflow).toBe(false);
      await page.screenshot({path:`${output}/${width}-${height}-${slug==='lobby'?'lobby':'cedar'}-${index}.jpg`,quality:83,fullPage:true});
      findings.push({width,height,project:name,index,bounds,errors:[...errors]});
     }
    }
   }
  }
  const renderer=await page.locator('.stage').getAttribute('data-motion-renderer');
  findings.push({width,height,started,stateAtObservation:state,states,geometry,openingRenderer,gpu,returnedRenderer:renderer,errors});
  const video=page.video();await context.close();
  if(record)await rename(await video.path(),`${output}/${width}-delayed-ready.webm`);
 }
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({phase,mode,baseline:'87dab71',condition:mode==='delayed'?'Controlled 4200ms delay of the initialization notification. Actual images and hardware WebGL; this is a browser fixture, not proof of the CI driver cause.':`${mode} opening and both selected-image journeys with actual assets.`,environment:'Windows Chrome, browser-emulated sizes; no physical devices.',findings},null,2)+'\n');
console.log(JSON.stringify(findings.map(r=>({width:r.width,state:r.stateAtObservation,errors:r.errors}))));
