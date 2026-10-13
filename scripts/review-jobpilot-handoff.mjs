// Frozen public GET records and original media; never submits application writes.
import { chromium, expect } from '@playwright/test';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
const phase = process.argv[2] ?? 'after';
const mode = process.argv.includes('--reduced') ? 'reduced' : process.argv.includes('--fallback') ? 'fallback' : 'normal';
const poseReview = process.argv.includes('--poses');
const output = `docs/design/jobpilot-handoff/${mode === 'normal' ? phase : mode}`;
await mkdir(output, { recursive: true });
const content = JSON.parse(await readFile('.motion-preview/public-content.json', 'utf8'));
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5190';
const browser = await chromium.launch({ channel: 'chrome' }), findings = [];
try {
  for (const [width, height] of (poseReview ? [[1440,900],[390,844]] : [[1440,900],[1440,650],[1024,1024],[768,1024],[390,844],[320,844]])) {
    const recording = !poseReview && phase === 'after' && mode === 'normal' && [1440,390].includes(width) && height !== 650;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference', ...(recording ? {recordVideo:{dir:output,size:{width,height}}} : {}) });
    const page = await context.newPage(), errors = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', route => {
      const req = route.request(), url = new URL(req.url());
      if (!['GET','HEAD'].includes(req.method())) { writes.push(url.pathname); return route.fulfill({status:403,json:{}}); }
      return route.fulfill({ json: content[url.pathname] ?? content['/api/projects'].find(p => url.pathname === `/api/projects/${p.slug}`) ?? [] });
    });
    await page.route('https://**', async route => {
      try { await route.fulfill({body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(route.request().url()).pathname)}`),contentType:'image/png'}); }
      catch { await route.abort(); }
    });
    if (mode === 'fallback') await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type,...args) { return type === 'webgl2' ? null : original.call(this,type,...args); };
    });
    await page.goto(`${base}/?view=collection`);
    await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
    try { await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15000}); }
    catch(error) {
      await page.screenshot({path:`${output}/${width}-${height}-opening-failure.jpg`,quality:83});
      const diagnostic=await page.evaluate(()=>({images:[...document.images].map(i=>({path:new URL(i.src).pathname,complete:i.complete,natural:[i.naturalWidth,i.naturalHeight]})),rig:document.querySelector('.motion-rig')?.outerHTML,phase:document.querySelector('.stage')?.getAttribute('data-motion-phase')}));
      await writeFile(`${output}/${width}-${height}-opening-failure.json`,JSON.stringify({errors,writes,diagnostic},null,2)+'\n');
      throw error;
    }
    const renderer = await page.locator('.stage').getAttribute('data-motion-renderer');
    const gpu = renderer === 'webgl' ? await page.locator('.motion-rig canvas').evaluate(canvas => {
      const gl=canvas.getContext('webgl2'), debug=gl.getExtension('WEBGL_debug_renderer_info');
      return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null;
    }) : null;
    for(let index=0;index<(poseReview ? 1 : 2);index++) {
      const choice=page.getByRole('group',{name:'Preview workflow'}).getByRole('button').nth(index);
      await choice.click();
      const label=await choice.innerText();
      await page.locator('.project-image-current img').evaluate(image=>image.decode());
      await expect(page.locator('.project-image-previous')).toHaveCount(0);
      await page.evaluate(()=>{scrollTo(0,0);return document.fonts.ready;});
      await page.screenshot({path:`${output}/${width}-${height}-${index}-preview.jpg`,quality:83,fullPage:true});
      const open=page.getByRole('link',{name:'Open case study',exact:true});
      await open.scrollIntoViewIfNeeded();
      const scroll=await page.evaluate(()=>scrollY);
      const poses = process.argv.includes('--poses') && mode === 'normal' && index === 0 && [1440,390].includes(width) && height !== 650;
      if (poses) { await page.clock.install(); await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100)); }
      await open.click();
      await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
      if (poses) {
        for (const [elapsed, step] of [[80,80],[110,190],[110,300],[150,450]]) {
          await page.clock.runFor(elapsed);
          await page.screenshot({path:`${output}/${width}-${height}-pose-${step}.jpg`,quality:83});
        }
        await page.clock.resume();
      }
      await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
      if(phase==='after') await expect(page.locator('[data-reader-handoff="running"]')).toHaveCount(0);
      await page.screenshot({path:`${output}/${width}-${height}-${index}-reader.jpg`,quality:83});
      const reader=await page.locator('.case-figure').evaluate(figure=>{
        const img=figure.querySelector('.screenshot-button img'), r=img.getBoundingClientRect(), c=figure.querySelector('figcaption').getBoundingClientRect();
        return {src:img.src,natural:[img.naturalWidth,img.naturalHeight],width:r.width,height:r.height,captionGap:c.top-r.bottom,overflow:document.documentElement.scrollWidth>innerWidth};
      });
      await page.locator('.case-figure').scrollIntoViewIfNeeded();
      await page.screenshot({path:`${output}/${width}-${height}-${index}-reader-image.jpg`,quality:83});
      await page.locator('.case-back').click();
      await expect(page.locator('.selection-detail h1')).toHaveText('JobPilot AI');
      await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15000});
      await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
      await page.screenshot({path:`${output}/${width}-${height}-${index}-return.jpg`,quality:83});
      const returned=await page.getByRole('group',{name:'Preview workflow'}).getByRole('button').evaluateAll(buttons=>buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true'));
      findings.push({width,height,index,label,renderer,gpu,scroll,returnedScroll:await page.evaluate(()=>scrollY),returned,focus:await page.locator('.open-case').evaluate(el=>el===document.activeElement),reader,errors:[...errors],writes:[...writes]});
      if(phase==='after') { expect(returned).toBe(index); expect(reader.captionGap).toBeGreaterThanOrEqual(0); expect(reader.overflow).toBe(false); }
    }
    const video = page.video();
    await context.close();
    if(recording) await rename(await video.path(), `${output}/${width}-open-return.webm`);
  }
} finally { await browser.close(); }
await writeFile(`${output}/${poseReview ? 'pose-findings' : 'findings'}.json`,JSON.stringify({phase,mode,baseline:'a3a4b2e8247e0fce5cab6089c9771932e7bdbdbe',environment:'Windows Chrome; real published media with frozen public GET data. Responsive sizes and unavailable-WebGL are browser emulation, not physical-device tests.',findings},null,2)+'\n');
if(findings.some(r=>r.errors.length||r.writes.length)) throw Error('Review contains errors or application writes');
