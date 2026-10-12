// Actual original assets, frozen public GET records; no project/API writes.
import {chromium, expect} from '@playwright/test';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const phase=process.argv[2]??'after';
if(!['before','after'].includes(phase))throw new Error('Use before or after');
const mode=process.argv.includes('--fallback')?'fallback':process.argv.includes('--reduced')?'reduced':'normal';
const output=`docs/design/cedar-engineering/${mode==='normal'?phase:mode}`;
await mkdir(output,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const slug='construction-project-management-accounting-system';
const browser=await chromium.launch({channel:'chrome'}),findings=[];
try{
 for(const [width,height] of mode==='normal'?[[1440,900],[1440,650],[768,1024],[390,844],[320,844]]:[[1440,650],[390,844],[320,844]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:mode==='reduced'?'reduce':'no-preference',recordVideo:phase==='after'&&mode==='normal'&&[1440,390].includes(width)&&height!==650?{dir:'.motion-preview/cedar-video',size:{width,height}}:undefined});
  const page=await context.newPage(),errors=[],writes=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/**',route=>{
   const request=route.request(),url=new URL(request.url());
   if(!['GET','HEAD'].includes(request.method())){writes.push(url.pathname);return route.fulfill({status:403,json:{}});}
   return route.fulfill({json:content[url.pathname]??content['/api/projects'].find(p=>url.pathname===`/api/projects/${p.slug}`)??[]});
  });
  await page.route('https://**',async route=>{
   try{await route.fulfill({body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(route.request().url()).pathname)}`),contentType:'image/png'});}catch{await route.abort();}
  });
  if(mode==='fallback')await page.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};
  });
  await page.goto('http://127.0.0.1:5185/');
  await expect(page.getByRole('button',{name:'Explore Cedar Construction',exact:true})).toBeVisible();
  await page.screenshot({path:`${output}/${width}-${height}-collection.jpg`,quality:85});
  await page.getByRole('button',{name:'Explore Cedar Construction',exact:true}).click();
  // Camera setup waits for the finished opening, not a performance assertion.
  // Regression tests retain the existing deadlines independently.
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15000});
  await page.locator('.product-surface img').last().evaluate(img=>img.decode());
  await page.screenshot({path:`${output}/${width}-${height}-selected.jpg`,fullPage:true,quality:85});
  const record={width,height,mode,errors,writes,openingRenderer:await page.locator('.stage').getAttribute('data-motion-renderer')};
  if(record.openingRenderer==='webgl')record.gpu=await page.locator('.motion-rig canvas').evaluate(canvas=>{
   const gl=canvas.getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');
   return debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null;
  });
  if(phase==='after'){
   const demo=page.getByRole('region',{name:'Cedar calculation and interpretation'});
   await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();
   const heading=demo.getByRole('heading',{name:'Calculated facts support the interpretation.',exact:true});
   await expect(heading).toBeFocused();await expect(heading).toBeInViewport({ratio:1});
   record.destination=await heading.evaluate(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom}));
   await page.screenshot({path:`${output}/${width}-${height}-destination.jpg`,quality:85});
   const capture=async state=>{
    await heading.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(650);
    // Native document clipping paints the complete panel beyond the viewport.
    // Locator screenshots can leave unpainted bands under a clipped ancestor.
    const box=await demo.boundingBox(),scroll=await page.evaluate(()=>({x:scrollX,y:scrollY}));
    await page.screenshot({path:`${output}/${width}-${height}-${state}.jpg`,fullPage:true,clip:{x:box.x+scroll.x,y:box.y+scroll.y,width:box.width,height:box.height},quality:88});
   };
   await capture('figures');
   await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();await capture('interpretation');
   await demo.getByLabel('Average phase progress').selectOption('25');await capture('changed');
   await demo.getByRole('button',{name:'Refresh sample interpretation',exact:true}).click();await capture('refreshed');
   await demo.getByLabel('Average phase progress').selectOption('0');await capture('zero-progress');
   await demo.getByRole('button',{name:'Refresh sample interpretation',exact:true}).click();await capture('zero-explanation');
   await demo.getByRole('button',{name:'Reset',exact:true}).click();await capture('reset');
   record.layout=await demo.evaluate(el=>({overflow:document.documentElement.scrollWidth>innerWidth,artWidth:el.querySelector('.cedar-art').getBoundingClientRect().width,copy:el.innerText}));
  }
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Explore Cedar Construction',exact:true})).toBeFocused();
  const video=page.video();await context.close();if(video)await video.saveAs(`${output}/${width}-${height}-interaction.webm`);
  // Reader shares the exact component; capture heading and controls naturally.
  const reader=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await reader.route('**/api/**',route=>route.fulfill({json:content[new URL(route.request().url()).pathname]??content['/api/projects'].find(p=>new URL(route.request().url()).pathname===`/api/projects/${p.slug}`)??[]}));
  await reader.route('https://**',async route=>{try{await route.fulfill({body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(route.request().url()).pathname)}`),contentType:'image/png'});}catch{await route.abort();}});
  await reader.goto(`http://127.0.0.1:5185/projects/${slug}#engineering`);
  await reader.locator('#engineering').scrollIntoViewIfNeeded();
  if(phase==='before')await reader.locator('#engineering').screenshot({path:`${output}/${width}-${height}-reader.jpg`,quality:85});
  else{
   const demo=reader.locator('.cedar-boundary');
   for(const state of ['figures','interpretation','changed']){
    if(state==='interpretation')await demo.getByRole('button',{name:'Interpret the figures',exact:true}).click();
    if(state==='changed')await demo.getByLabel('Average phase progress').selectOption('25');
    await demo.getByRole('heading',{name:'Calculated facts support the interpretation.',exact:true}).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
    await reader.screenshot({path:`${output}/${width}-${height}-reader-${state}-heading.jpg`,quality:85});
    await demo.getByRole('button',{name:state==='changed'?'Refresh sample interpretation':'Interpret the figures',exact:true}).scrollIntoViewIfNeeded();
    await reader.screenshot({path:`${output}/${width}-${height}-reader-${state}-controls.jpg`,quality:85});
   }
   record.readerOverflow=await reader.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  }
  await reader.close();findings.push(record);
 }
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({phase,baseline:'2f2eb61ad0ca2c2cd3fe97b8711ac67a583185da',environment:'Windows Chrome with original assets and frozen public GET records. Normal opening: actual GPU; forced unavailable WebGL fallback. Tablet/phone viewports and reduced motion are browser emulation, not physical-device testing.',findings},null,2)+'\n');
if(findings.some(r=>r.errors.length||r.writes.length||r.layout?.overflow||r.readerOverflow))throw new Error('Review findings require attention');
