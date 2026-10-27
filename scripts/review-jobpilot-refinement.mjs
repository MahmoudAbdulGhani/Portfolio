// Compiled, read-only comparison against PR #51. Native video and sampled DOM
// geometry are separate evidence; neither fixtures nor stills prove GPU timing.
import { chromium, expect } from '@playwright/test';
import express from 'express';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
const option=key=>process.argv.find(arg=>arg.startsWith(`--${key}=`))?.slice(key.length+3);
const phase=process.argv[2]??'before', mode=option('mode')??'normal';
const folder=`docs/design/jobpilot-phase1-refinement/${phase}/${mode}`;
await mkdir(folder,{recursive:true});
const snapshot='.motion-preview/jobpilot-refinement-content.json';
if(process.argv.includes('--refresh')){
  const data=Object.fromEntries(await Promise.all(['profile','projects','site-content','skills','technologies','education','certifications'].map(async key=>{
    const response=await fetch(`https://mahmoud-portfolio-omega.vercel.app/api/${key}`);if(!response.ok)throw Error(`Public GET ${key}: ${response.status}`);return[`/api/${key}`,await response.json()];
  })));
  await writeFile(snapshot,JSON.stringify(data));
}
const data=JSON.parse(await readFile(snapshot,'utf8')),root=path.resolve(option('dist')??'dist'),port=Number(option('port')??5212);
const app=express();app.use(express.static(root));app.get('*',(_,res)=>res.sendFile(path.join(root,'index.html')));
const server=app.listen(port,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{for(const[width,height]of(mode==='normal'?[[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]]:[[390,844],[1440,900]])){
  const recording=mode==='normal'&&[390,1440].includes(width);
  const context=await browser.newContext({viewport:{width,height},reducedMotion:mode==='reduced'?'reduce':'no-preference',...(recording?{recordVideo:{dir:folder,size:{width,height}}}:{})});
  const page=await context.newPage(),errors=[],writes=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;if(!['GET','HEAD'].includes(r.request().method())){writes.push(p);return r.fulfill({status:403,json:{message:'Read-only review'}});}return r.fulfill({json:data[p]??data['/api/projects'].find(project=>p===`/api/projects/${project.slug}`)??[]});});
  if(mode==='fallback')await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:get.call(this,type,...args);};});
  await page.addInitScript(()=>{
    window.refinementFrames=[];
    const sample=()=>{const stage=document.querySelector('.stage'),phase=stage?.getAttribute('data-motion-phase');
      if(['selecting','opening'].includes(phase)&&window.refinementFrames.length<240){const box=selector=>document.querySelector(selector)?.getBoundingClientRect().toJSON();const rig=stage.querySelector('.motion-rig');window.refinementFrames.push({time:performance.now(),phase,rig:box('.motion-rig'),subject:rig?.dataset.subjectBounds?JSON.parse(rig.dataset.subjectBounds):null,image:box('.selection-image-frame'),identity:box('.selection-caption'),actions:box('.selection-project-links'),choices:box('.chapter-switch'),back:box('.back-collection'),progress:stage.getAttribute('data-motion-progress')});}requestAnimationFrame(sample);};requestAnimationFrame(sample);
  });
  const capture=async step=>{await page.mouse.move(1,1);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:`${folder}/${width}-${height}-${step}.jpg`,quality:85});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);};
  const hold=async()=>{if(recording)await page.waitForTimeout(500);};
  await page.goto(`http://127.0.0.1:${port}${option('entry')??'/review/jobpilot/candidate'}`);
  await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);await page.locator('.object-core').evaluateAll(nodes=>Promise.all(nodes.map(n=>n.decode())));await hold();
  await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
  await page.mouse.move(1,1);
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15_000});
  await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');await capture('preview');await hold();
  const renderer=await page.locator('.stage').getAttribute('data-motion-renderer');
  const gpu=renderer==='webgl'?await page.locator('.motion-rig canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl2'),debug=gl?.getExtension('WEBGL_debug_renderer_info');return debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null;}):null;
  const transition=await page.evaluate(()=>window.refinementFrames);
  await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();await expect(page.locator('#jobpilot-engineering')).toBeInViewport({ratio:1});await capture('demo-preview');
  const choices=page.getByRole('group',{name:'Preview workflow'}).getByRole('button');await choices.nth(1).click();
  await expect(page.locator('.project-image-previous')).toHaveCount(0);const open=page.getByRole('link',{name:'Open case study',exact:true});await open.click();
  await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');await expect(page.locator('[data-reader-handoff="running"]')).toHaveCount(0);
  const boundary=page.getByRole('region',{name:'The profile save boundary'});
  await boundary.evaluate(el=>{const target=el.closest('#engineering')??el,header=document.querySelector('.site-header').getBoundingClientRect();scrollBy({top:target.getBoundingClientRect().top-header.bottom-24,behavior:'instant'});});
  await capture('demo-reader');await hold();
  await boundary.getByRole('button',{name:'Propose a change',exact:true}).click();await boundary.getByRole('button',{name:'Review the change',exact:true}).click();await boundary.getByRole('button',{name:'Change the saved profile during review.',exact:true}).click();await boundary.getByRole('button',{name:'Accept reviewed change',exact:true}).click();await expect(boundary).toHaveAttribute('data-stale','true');
  await boundary.getByRole('button',{name:'Review again',exact:true}).click();await boundary.getByRole('button',{name:'Accept reviewed change',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','accept');await hold();await boundary.getByRole('button',{name:'Reset',exact:true}).click();
  await page.locator('.case-back').click();await expect(open).toBeFocused();await expect(choices.nth(1)).toHaveAttribute('aria-pressed','true');await hold();
  const video=page.video();await context.close();if(recording)await rename(await video.path(),`${folder}/${width}-opening-journey.webm`);
  results.push({width,height,renderer,gpu,errors,writes,transition});
}}finally{await browser.close();server.close();}
await writeFile(`${folder}/findings.json`,JSON.stringify({phase,mode,source:'PR #51 / a7b9c800d63f337b79ec7d6904ece544938732bf immediate before; original PR #50 remains separate.',method:'Compiled Windows Chrome with frozen fresh public GET data and original images; native video. Viewports are emulation, GPU strings identify WebGL separately from forced fallback. DOM/canvas bounds do not establish GPU smoothness.',results},null,2));
if(results.some(r=>r.errors.length||r.writes.length))throw Error('Capture errors or attempted writes');console.log(JSON.stringify({phase,mode,viewports:results.length,renderers:results.map(({width,renderer,gpu})=>({width,renderer,gpu}))}));
