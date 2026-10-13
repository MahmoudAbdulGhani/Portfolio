import {chromium,expect} from '@playwright/test';
import {readFile,writeFile,mkdir,rename,readdir} from 'node:fs/promises';
import path from 'node:path';
const phase=process.argv[2],base=phase==='before'?'http://127.0.0.1:5186':'http://127.0.0.1:5185';
const output=`docs/design/collection-readiness/${phase}-cold-paint`;
await mkdir(output,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const browser=await chromium.launch({channel:'chrome'}),findings=[];
const variants=(await readdir('public/projects/complete')).filter(file=>file.startsWith('710055a0-a275-4e6a-991d-4aaa23c6e549')).map(file=>'/projects/complete/'+file);
try{
 for(const [width,height] of [[1440,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:output,size:{width,height}}}),page=await context.newPage();
  await page.route('**/api/**',r=>r.fulfill({json:content[new URL(r.request().url()).pathname]??content['/api/projects'].find(p=>new URL(r.request().url()).pathname===`/api/projects/${p.slug}`)??[]}));
  await page.route('https://**',async r=>{try{await r.fulfill({contentType:'image/png',body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(r.request().url()).pathname)}`)});}catch{await r.abort();}});
  await page.addInitScript(()=>{
   window.coldPaint=[];let target=null,stalled=false;
   document.addEventListener('click',event=>{if(event.target.closest('[data-project="jobpilot"]'))window.selectionClickedAt=performance.now();},true);
   const bind=WebGL2RenderingContext.prototype.bindFramebuffer,draw=WebGL2RenderingContext.prototype.drawElements;
   WebGL2RenderingContext.prototype.bindFramebuffer=function(kind,framebuffer){if(kind===this.FRAMEBUFFER||kind===this.DRAW_FRAMEBUFFER)target=framebuffer;return bind.call(this,kind,framebuffer);};
   WebGL2RenderingContext.prototype.drawElements=function(...args){
    if(!stalled&&target===null&&this.canvas instanceof HTMLCanvasElement&&this.canvas.closest('.motion-rig')){
     stalled=true;window.coldPaint.push({event:'paint-start',at:performance.now(),phase:document.querySelector('.stage')?.getAttribute('data-motion-phase')});
     const until=window.selectionClickedAt+4400;while(performance.now()<until){}
     window.coldPaint.push({event:'paint-end',at:performance.now()});
    }return draw.apply(this,args);
   };
   new MutationObserver(()=>{const stage=document.querySelector('.stage');if(stage?.getAttribute('data-selection-state')==='settled'&&!window.coldPaint.some(e=>e.event==='settled'))window.coldPaint.push({event:'settled',at:performance.now()});}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-selection-state']});
  });
  await page.goto(base+'/?view=collection');
  // Isolate the first scene paint from network/decode latency, identically
  // before/after. These remain the unchanged actual image files.
  await page.evaluate(async paths=>{
    await Promise.all(paths.map(async src=>{const image=new Image();image.src=src;await image.decode();}));
    await import('/src/components/landscape/motion-rig.ts');
  },variants);
  await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))));
  await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
  const started=Date.now(),clickedAt=await page.evaluate(()=>performance.now());let assertionPassed=true;
  try{await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');}catch{assertionPassed=false;}
  const observed=await page.locator('.stage').getAttribute('data-selection-state');
  await page.screenshot({path:`${output}/${width}-deadline.jpg`,quality:83});
  await page.waitForTimeout(1300);
  const timings=await page.evaluate(()=>window.coldPaint);
  const renderer=await page.locator('.stage').getAttribute('data-motion-renderer');
  await page.screenshot({path:`${output}/${width}-final.jpg`,quality:83});
  if(phase==='after'){expect(assertionPassed).toBe(true);expect(renderer).toBe('webgl');expect(timings[0].phase).toBe('opening');}
  findings.push({width,height,clickedAt,assertionPassed,observed,assertionDeadlineMs:5000,elapsed:Date.now()-started,renderer,timings});
  const video=page.video();await context.close();await rename(await video.path(),`${output}/${width}-cold-paint.webm`);
 }
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({phase,baseline:'87dab71',condition:'The first default-framebuffer scene draw is withheld until 4400ms after the intentional selection click, identically before/after. Original actual images and a warm module import, hardware WebGL. Controlled CPU blocking fixture, not a physical GPU performance measurement.',findings},null,2)+'\n');
console.log(JSON.stringify(findings));
