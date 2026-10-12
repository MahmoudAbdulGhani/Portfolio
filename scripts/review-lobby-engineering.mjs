// Original assets and a frozen public GET snapshot. No Lobby backend or sockets.
import {chromium,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const phase=process.argv[2]??'after',mode=process.argv.includes('--reduced')?'reduced':process.argv.includes('--fallback')?'fallback':'normal';
if(!['before','after'].includes(phase))throw new Error('Use before or after');
const output=`docs/design/lobby-engineering/${mode==='normal'?phase:mode}`;
await mkdir(output,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const base=process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:5190';
const browser=await chromium.launch({channel:'chrome'}),findings=[];
async function fixture(page){
 await page.route('**/api/**',route=>{const r=route.request(),p=new URL(r.url()).pathname;if(!['GET','HEAD'].includes(r.method()))throw new Error('Unexpected write');return route.fulfill({json:content[p]??content['/api/projects'].find(x=>p===`/api/projects/${x.slug}`)??[]});});
 await page.route('https://**',async route=>{try{await route.fulfill({body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(route.request().url()).pathname)}`),contentType:'image/png'});}catch{await route.abort();}});
}
try{
 for(const [width,height]of [[1440,900],[1440,650],[1363,936],[768,1024],[390,844],[320,844]]){
  const recording=phase==='after'&&mode==='normal'&&((width===1440&&height===900)||width===390);
  const context=await browser.newContext({viewport:{width,height},reducedMotion:mode==='reduced'?'reduce':'no-preference',recordVideo:recording?{dir:'.motion-preview/lobby-video',size:{width,height}}:undefined});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await fixture(page);
  if(mode==='fallback')await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};});
  await page.goto(`${base}/`);await page.getByRole('button',{name:'Explore Lobby',exact:true}).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15000});
  const renderer=await page.locator('.stage').getAttribute('data-motion-renderer');
  const gpu=renderer==='webgl'?await page.locator('.motion-rig canvas').evaluate(c=>{const gl=c.getContext('webgl2'),d=gl.getExtension('WEBGL_debug_renderer_info');return d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):null;}):null;
  const choices=page.getByRole('group',{name:'Preview workflow'}).getByRole('button');
  for(let choice=0;choice<2;choice++){
   await choices.nth(choice).click();await page.locator('.project-image-current img').evaluate(img=>img.decode());await expect(page.locator('.project-image-previous')).toHaveCount(0);await expect(page.locator('.project-image-current')).toHaveCSS('opacity','1');await expect(page.locator('.product-surface')).toHaveCSS('opacity','1');
   await page.evaluate(()=>{scrollTo(0,0);return document.fonts.ready;});
   await page.screenshot({path:`${output}/${width}-${height}-${choice}-selected.jpg`,fullPage:true,quality:82});
   const geometry=await page.locator('.selection-frame').evaluate(el=>{const image=el.querySelector('.project-image-current img'),a=image.getBoundingClientRect(),b=el.querySelector('.selection-caption').getBoundingClientRect(),c=el.querySelector('.selection-actions').getBoundingClientRect();return{imageBottom:a.bottom,captionTop:b.top,controlsTop:c.top,proportionError:Math.abs(a.height-a.width*image.naturalHeight/image.naturalWidth),overflow:document.documentElement.scrollWidth>innerWidth};});
   expect(geometry.imageBottom).toBeLessThanOrEqual(geometry.captionTop);expect(geometry.imageBottom).toBeLessThanOrEqual(geometry.controlsTop);expect(geometry.proportionError).toBeLessThan(1);expect(geometry.overflow).toBe(false);
   const record={width,height,choice,mode,renderer,gpu,geometry,errors};
   if(phase==='after'){
    const demo=page.locator('.lobby-boundary'),heading=demo.locator('.lobby-title');
    await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();await expect(heading).toBeFocused();await expect(heading).toBeInViewport({ratio:1});
    await demo.getByRole('button',{name:'Reset',exact:true}).click();
    const capture=async state=>{
     if(recording){await demo.locator('.lobby-result').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(1100);}
     await heading.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(550);
     const box=await demo.boundingBox(),scroll=await page.evaluate(()=>({x:scrollX,y:scrollY}));
     await page.screenshot({path:`${output}/${width}-${height}-${choice}-${state}.jpg`,fullPage:true,clip:{x:box.x+scroll.x,y:box.y+scroll.y,width:box.width,height:box.height},quality:85});
     const overflow=await demo.evaluate(el=>el.scrollWidth>el.clientWidth||document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false);
    };
    await capture('inspect');
    await demo.getByRole('button',{name:'Try to enter the call',exact:true}).click();await capture('denied');
    await demo.getByRole('button',{name:'Join with the invitation',exact:true}).click();await capture('joined');
    await demo.getByRole('button',{name:'Try to enter the call',exact:true}).click();await capture('allowed');
    await demo.getByLabel('Fictional participant').selectOption('rowan');await capture('blocked-participant');
    await demo.getByRole('button',{name:'Join with the invitation',exact:true}).click();await capture('rejected');
    await demo.getByRole('button',{name:'Try to enter the call',exact:true}).click();await capture('blocked-call');
    await demo.getByRole('button',{name:'Reset',exact:true}).click();await capture('reset');
    record.destination=await heading.evaluate(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom}));
   }
   findings.push(record);
  }
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Explore Lobby',exact:true})).toBeFocused();
  const video=page.video();await context.close();if(video)await video.saveAs(`${output}/${width}-${height}-interaction.webm`);
  const reader=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await fixture(reader);await reader.goto(`${base}/projects/lobby#engineering`);
  await reader.locator('#engineering').scrollIntoViewIfNeeded();
  if(phase==='before')await reader.screenshot({path:`${output}/${width}-${height}-reader.jpg`,quality:82});
  else{
   const demo=reader.locator('.lobby-boundary');
   for(const state of ['inspect','denied','joined','allowed','rejected']){
    if(state==='denied'||state==='allowed')await demo.getByRole('button',{name:'Try to enter the call',exact:true}).click();
    if(state==='joined')await demo.getByRole('button',{name:'Join with the invitation',exact:true}).click();
    if(state==='rejected'){await demo.getByLabel('Fictional participant').selectOption('rowan');await demo.getByRole('button',{name:'Join with the invitation',exact:true}).click();}
    await demo.locator('.lobby-title').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await reader.screenshot({path:`${output}/${width}-${height}-reader-${state}-heading.jpg`,quality:82});
    await demo.getByRole('button',{name:'Try to enter the call',exact:true}).scrollIntoViewIfNeeded();await reader.screenshot({path:`${output}/${width}-${height}-reader-${state}-controls.jpg`,quality:82});
   }
  }
  await reader.close();
 }
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({phase,baseline:'76f7575d858feab4b4640d6650f150abce0812ee',environment:'Windows Chrome. GPU strings identify actual WebGL; phone/tablet viewports, reduced motion and unavailable-WebGL fallback are browser emulation. No physical device testing.',findings},null,2)+'\n');
if(findings.some(r=>r.errors.length))throw new Error('Browser errors require review');
