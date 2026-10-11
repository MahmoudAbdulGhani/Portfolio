// Actual assets and frozen public GET records. All writes are blocked.
import { chromium, expect } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const phase=process.argv[2]??'after';
if(!['before','after'].includes(phase))throw new Error('Use before or after');
const mode=process.argv.includes('--reduced')?'reduced':process.argv.includes('--fallback')?'fallback':'normal';
const output=`docs/design/jobpilot-boundary/presentation/${mode==='normal'?phase:mode}`;
await mkdir(output,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const browser=await chromium.launch({channel:'chrome'});
const findings=[];
try{
 for(const [width,height] of mode==='normal'?[[1440,900],[1440,650],[768,1024],[390,844],[320,844]]:[[1440,650],[390,844],[320,844]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:mode==='reduced'?'reduce':'no-preference',recordVideo:phase==='after'&&mode==='normal'&&[1440,390].includes(width)&&height!==650?{dir:'.motion-preview/jobpilot-presentation-video',size:{width,height}}:undefined});
  const page=await context.newPage(),errors=[],writes=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/**',route=>{
   const request=route.request(),url=new URL(request.url());
   if(!['GET','HEAD'].includes(request.method())){writes.push(url.pathname);return route.fulfill({status:403,json:{}});}
   const body=content[url.pathname]??content['/api/projects'].find(p=>url.pathname===`/api/projects/${p.slug}`)??[];
   return route.fulfill({json:body});
  });
  await page.route('https://**',async route=>{
   try{await route.fulfill({body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(route.request().url()).pathname)}`),contentType:'image/png'});}catch{await route.abort();}
  });
  if(mode==='fallback')await page.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};
  });
  await page.goto('http://127.0.0.1:5185/');
  await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeVisible();
  await page.screenshot({path:`${output}/${width}-${height}-collection.jpg`,quality:85});
  await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
  await page.locator('.product-surface img').last().evaluate(img=>img.decode());
  await page.screenshot({path:`${output}/${width}-${height}-selected.jpg`,fullPage:true,quality:85});
  const demo=page.getByRole('region',{name:'The profile save boundary'});
  const record={width,height,mode,errors,writes,openingRenderer:await page.locator('.stage').getAttribute('data-motion-renderer')};
  if(phase==='after'){
   await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();
   await expect(demo.getByRole('heading',{name:'The profile save boundary',exact:true})).toBeFocused();
   record.destination=await demo.getByRole('heading',{name:'The profile save boundary',exact:true}).evaluate(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom}));
   await page.screenshot({path:`${output}/${width}-${height}-destination.jpg`,quality:85});
  }
  const capture=async state=>{
   if(phase==='before')await demo.scrollIntoViewIfNeeded();
   else await demo.getByRole('heading',{name:'The profile save boundary',exact:true}).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
   await page.waitForTimeout(1000);
   await demo.screenshot({path:`${output}/${width}-${height}-${state}.jpg`,quality:88});
  };
  await capture('rest');
  await demo.getByRole('button',{name:'Propose a change',exact:true}).click();await capture('propose');
  await demo.getByRole('button',{name:'Review the change',exact:true}).click();await capture('review');
  await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();await capture('accept');
  await demo.getByRole('button',{name:'Reset',exact:true}).click();
  await demo.getByRole('button',{name:'Propose a change',exact:true}).click();
  await demo.getByRole('button',{name:'Review the change',exact:true}).click();
  await demo.getByRole('button',{name:'Change the saved profile during review.',exact:true}).click();await capture('changed');
  await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();await capture('stale');
  await demo.getByRole('button',{name:'Review again',exact:true}).click();
  await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();await capture('reviewed-again');
  record.layout=await demo.evaluate(el=>({width:el.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth,artWidth:el.querySelector('.boundary-art').getBoundingClientRect().width,copy:el.innerText}));
  if(record.openingRenderer==='webgl')record.gpu=await page.locator('.motion-rig canvas').evaluate(canvas=>{
   const gl=canvas.getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');
   return debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null;
  });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeFocused();
  const video=page.video();await context.close();if(video)await video.saveAs(`${output}/${width}-${height}-interaction.webm`);
  findings.push(record);
 }
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({phase,baseline:'4a501ad8ebb95bfa01e6d665ad89652cb6bbbff6',environment:'Installed Windows Chrome, frozen public GET records and cached original images. Intel GPU for normal opening; forced unavailable WebGL for fallback. Browser viewport emulation, not physical devices.',findings},null,2)+'\n');
