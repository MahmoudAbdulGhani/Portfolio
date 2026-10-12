// Actual assets and frozen public GET records. No application writes.
import {chromium, expect} from '@playwright/test';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const phase=process.argv[2]??'after';
if(!['before','after'].includes(phase))throw new Error('Use before or after');
const mode=process.argv.includes('--fallback')?'fallback':process.argv.includes('--reduced')?'reduced':'normal';
const output=`${process.env.REVIEW_OUTPUT_ROOT??'docs/design/collection-preview'}/${mode==='normal'?phase:mode}`;
await mkdir(output,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const baseUrl=process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:5185';
const browser=await chromium.launch({channel:'chrome'}),findings=[];
const projects=[['jobpilot','JobPilot AI'],['cedar','Cedar Construction'],['lobby','Lobby']];
try{
 for(const [width,height] of [[1440,900],[1440,650],[1363,936],[768,1024],[390,844],[320,844]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:mode==='reduced'?'reduce':'no-preference'});
  const page=await context.newPage(),errors=[],writes=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/**',route=>{
   const request=route.request(),url=new URL(request.url());
   if(!['GET','HEAD'].includes(request.method())){writes.push(url.pathname);return route.fulfill({status:403,json:{}});}
   return route.fulfill({json:content[url.pathname]??[]});
  });
  await page.route('https://**',async route=>{
   try{await route.fulfill({body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(route.request().url()).pathname)}`),contentType:'image/png'});}catch{await route.abort();}
  });
  if(mode==='fallback')await page.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};
  });
  for(const [kind,title] of projects){
   await page.goto(`${baseUrl}/`);
   await page.getByRole('button',{name:`Explore ${title}`,exact:true}).click();
   await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15000});
   const renderer=await page.locator('.stage').getAttribute('data-motion-renderer');
   const gpu=renderer==='webgl'?await page.locator('.motion-rig canvas').evaluate(canvas=>{
    const gl=canvas.getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');
    return debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null;
   }):null;
   const choices=page.getByRole('group',{name:'Preview workflow'}).getByRole('button');
   for(let i=0;i<await choices.count();i++){
    await choices.nth(i).click();
    await page.locator('.project-image-current img').evaluate(img=>img.decode());
    await expect(page.locator('.project-image-previous')).toHaveCount(0);
    // A camera waits for the final paint; interaction tests exercise controls
    // during transitions separately and keep their existing deadlines.
    await expect(page.locator('.project-image-current')).toHaveCSS('opacity','1');
    await expect(page.locator('.product-surface')).toHaveCSS('opacity','1');
    await page.evaluate(()=>{scrollTo(0,0);return document.fonts.ready;});
    await page.screenshot({path:`${output}/${width}-${height}-${kind}-${i}.jpg`,quality:85,fullPage:true});
    const geometry=await page.locator('.selection-frame').evaluate(frame=>{
     const rect=selector=>{const r=frame.querySelector(selector).getBoundingClientRect();return {top:r.top+scrollY,bottom:r.bottom+scrollY,width:r.width,height:r.height};};
     const image=frame.querySelector('.project-image-current img');
     const selectors=frame.querySelector('.chapter-switch');
     return {image:rect('.project-image-current img'),frame:rect('.selection-image-frame'),caption:rect('.selection-caption'),controls:rect('.selection-actions'),natural:{width:image.naturalWidth,height:image.naturalHeight},selectors:{width:selectors.clientWidth,scrollWidth:selectors.scrollWidth},horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
    });
    findings.push({width,height,kind,selection:i,label:await choices.nth(i).innerText(),mode,renderer,gpu,...geometry,errors:[...errors],writes:[...writes]});
    if(phase==='after'){
     expect(geometry.image.bottom).toBeLessThanOrEqual(geometry.caption.top);
     expect(geometry.image.bottom).toBeLessThanOrEqual(geometry.controls.top);
     // Responsive rasters can round a generated height by a source pixel.
     expect(Math.abs(geometry.image.height-geometry.image.width*geometry.natural.height/geometry.natural.width)).toBeLessThan(1);
     expect(geometry.horizontalOverflow).toBe(false);
     expect(geometry.selectors.scrollWidth).toBeLessThanOrEqual(geometry.selectors.width);
    }
   }
   await page.keyboard.press('Escape');
   await expect(page.getByRole('button',{name:`Explore ${title}`,exact:true})).toBeFocused();
  }
  await context.close();
 }
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({phase,baseline:'03eccaa5cac93818ed7cb7eedc85a2631887c9ce',environment:'Windows Chrome, original assets and frozen public GET records; GPU strings recorded when WebGL is available. Tablet/phone sizes, reduced motion and unavailable-WebGL fallback are browser emulation, not physical-device tests.',findings},null,2)+'\n');
if(findings.some(r=>r.errors.length||r.writes.length))throw new Error('Review findings require attention');
