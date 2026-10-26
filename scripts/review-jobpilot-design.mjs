// Read-only public snapshots and actual project images; interaction data stays
// local to the existing demo. Browser video is recorded directly, never muxed.
import { chromium, expect } from '@playwright/test';
import express from 'express';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
const phase = process.argv[2] ?? 'baseline';
const mode = process.argv.includes('--reduced') ? 'reduced' : process.argv.includes('--fallback') ? 'fallback' : 'normal';
const option = key => process.argv.find(arg => arg.startsWith(`--${key}=`))?.slice(key.length + 3);
const folder = `docs/design/jobpilot-design-journey/${phase}/${mode}`;
await mkdir(folder, { recursive: true });
const snapshot = '.motion-preview/jobpilot-design-content.json';
let content;
if (process.argv.includes('--refresh')) {
  content = Object.fromEntries(await Promise.all(['profile','projects','site-content','skills','technologies','education','certifications'].map(async key => {
    const response = await fetch(`https://mahmoud-portfolio-omega.vercel.app/api/${key}`);
    if (!response.ok) throw Error(`Public GET ${key}: ${response.status}`);
    return [`/api/${key}`, await response.json()];
  })));
  await writeFile(snapshot, JSON.stringify(content));
} else content = JSON.parse(await readFile(snapshot, 'utf8'));
const dist = path.resolve(option('dist') ?? 'dist'), app = express();
app.use(express.static(dist)); app.get('*', (_req,res) => res.sendFile(path.join(dist,'index.html')));
const port = Number(option('port') ?? 5199);
const server = app.listen(port,'127.0.0.1'); await new Promise(resolve => server.once('listening',resolve));
const entry = option('entry') ?? '/', browser = await chromium.launch({channel:'chrome'}), findings = [];
try {
  const sizes=mode==='normal'?[[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]]:[[390,844],[1440,900]];
  for (const [width,height] of sizes.filter(([width])=>!option('widths')||option('widths').split(',').includes(String(width)))) {
    const recording = mode === 'normal' && [390,1440].includes(width);
    const pause=async(ms=600)=>{if(recording)await page.waitForTimeout(ms);};
    const context = await browser.newContext({viewport:{width,height},reducedMotion:mode==='reduced'?'reduce':'no-preference',...(recording?{recordVideo:{dir:folder,size:{width,height}}}:{})});
    const page = await context.newPage(), errors = [], writes = [];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/api/**',route=>{
      const request=route.request(), url=new URL(request.url());
      if(!['GET','HEAD'].includes(request.method())){writes.push(url.pathname);return route.fulfill({status:403,json:{message:'Read-only design review'}});}
      return route.fulfill({json:content[url.pathname]??content['/api/projects'].find(p=>url.pathname===`/api/projects/${p.slug}`)??[]});
    });
    if(mode==='fallback')await page.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};
    });
    const captures=[];
    const capture=async step=>{
      await page.evaluate(()=>document.fonts.ready);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const file=`${width}-${height}-${step}.jpg`;
      await page.screenshot({path:`${folder}/${file}`,quality:82});
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      expect(overflow).toBe(false);
      captures.push({step,file,overflow,scroll:await page.evaluate(()=>scrollY)});
    };
    await page.goto(`http://127.0.0.1:${port}${entry}`);
    await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeVisible();
    await page.locator('.object-core').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    if(mode==='normal')await capture('collection');
    await pause(400);
    await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
    await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15_000});
    await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
    const renderer=await page.locator('.stage').getAttribute('data-motion-renderer');
    const gpu=renderer==='webgl'?await page.locator('.motion-rig canvas').evaluate(canvas=>{
      const gl=canvas.getContext('webgl2'),debug=gl?.getExtension('WEBGL_debug_renderer_info');
      return debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null;
    }):null;
    await page.evaluate(()=>scrollTo(0,0)); await capture('preview');
    await pause();
    await page.getByRole('group',{name:'Preview workflow'}).getByRole('button').nth(1).click();
    await page.locator('.selection-image-frame .project-image-current img').evaluate(image=>image.decode());
    await expect(page.locator('.project-image-previous')).toHaveCount(0);
    await pause(400);
    const open=page.getByRole('link',{name:'Open case study',exact:true});await open.scrollIntoViewIfNeeded();
    const sourceScroll=await page.evaluate(()=>scrollY);await open.click();
    await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
    await expect(page.locator('[data-reader-handoff="running"]')).toHaveCount(0);
    await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
    await capture('reader');
    await pause();
    const boundary=page.getByRole('region',{name:'The profile save boundary'});
    await boundary.evaluate(el=>{
      const target=el.closest('#engineering')??el;
      const reader=el.closest('.project-reader'), header=document.querySelector('.site-header').getBoundingClientRect();
      const offset=target.getBoundingClientRect().top-Math.max(0,header.bottom)-24;
      if(reader&&getComputedStyle(reader).overflowY==='auto')reader.scrollTop+=offset;
      else scrollBy({top:offset,behavior:'instant'});
    });
    await capture('decision');
    await pause();
    await boundary.getByRole('button',{name:'Propose a change',exact:true}).click();
    await pause(500);
    await boundary.getByRole('button',{name:'Review the change',exact:true}).click();
    await pause(500);
    await boundary.getByRole('button',{name:'Change the saved profile during review.',exact:true}).click();
    await pause(500);
    await boundary.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
    await expect(boundary).toHaveAttribute('data-stale','true');
    if(mode==='normal')await capture('stale');
    await pause();
    await boundary.getByRole('button',{name:'Review again',exact:true}).click();
    await pause(400);
    await boundary.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
    await expect(boundary).toHaveAttribute('data-phase','accept');await capture('engineering');
    await pause();
    await boundary.getByRole('button',{name:'Reset',exact:true}).click();
    await pause(400);
    await page.locator('.case-back').click();
    await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
    await expect(page.locator('.open-case')).toBeFocused();
    const selectedIndex=await page.getByRole('group',{name:'Preview workflow'}).getByRole('button').evaluateAll(buttons=>buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true'));
    expect(selectedIndex).toBe(1);
    const returnedScroll=await page.evaluate(()=>scrollY);
    if(mode==='normal')await capture('return');
    await pause();
    findings.push({width,height,renderer,gpu,selectedIndex,sourceScroll,returnedScroll,captures,errors,writes});
    const video=page.video();await context.close();if(recording)await rename(await video.path(),`${folder}/${width}-journey.webm`);
  }
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(`${folder}/findings.json`,JSON.stringify({phase,mode,entry,baseline:'f7baa57a57e589c4171c94eb9f6f54f931a822c6',method:'Current-run Windows Chrome capture from compiled app and frozen fresh public GET data with original images. Phone/tablet widths are emulation. The GPU string identifies actual WebGL; forced fallback is explicitly separate. Videos directly record browser frames. No backend writes or synthetic screenshot assets.',findings},null,2));
if(findings.some(r=>r.errors.length||r.writes.length))throw Error('Review has page errors or attempted writes');
console.log(JSON.stringify({phase,mode,samples:findings.length,renderers:findings.map(f=>({width:f.width,renderer:f.renderer,gpu:f.gpu}))}));
