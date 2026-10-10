// Paired diagnostic CSS overrides measure retained effects; product CSS is never changed.
import { chromium, expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const content = JSON.parse(await readFile('.motion-preview/phase3-public-content.json','utf8'));
const originals = JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json','utf8')).records;
const browser = await chromium.launch({channel:'chrome'}), records = [];
const metrics = async session=>Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(metric=>[metric.name,metric.value]));
const delta = (before,after)=>Object.fromEntries(['TaskDuration','LayoutDuration','RecalcStyleDuration'].map(name=>[`${name}Ms`,(after[name]-before[name])*1000]));
try {
  for (const width of [1363,390]) {
    const page = await browser.newPage({viewport:{width,height:width===390?844:936}, reducedMotion:'no-preference'});
    await page.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
    await page.route('**/api/**',route=>{
      const path = new URL(route.request().url()).pathname;
      const body = content[path]??content['/api/projects'].find(project=>path===`/api/projects/${project.slug}`);
      return route.request().method()==='GET'&&body!==undefined?route.fulfill({json:body}):route.abort();
    });
    for (const original of originals) await page.route(original.src, async route=> {
      const bytes=await readFile(original.file);
      if(createHash('sha256').update(bytes).digest('hex')!==original.sha256) throw new Error('Media hash mismatch');
      return route.fulfill({contentType:'image/png',body:bytes});
    });
    const session = await page.context().newCDPSession(page); await session.send('Performance.enable');
    await page.addInitScript(()=>{
      window.__probeFrames=[]; let previous=performance.now();
      const frame=now=>{ window.__probeFrames.push({time:now,gap:now-previous,phase:document.querySelector('.stage')?.dataset.motionPhase,viewer:document.querySelector('dialog[open]')?.dataset.viewerState});previous=now;requestAnimationFrame(frame); }; requestAnimationFrame(frame);
    });
    // Warm-up is explicitly excluded; alternation reduces ordering/cache bias.
    for (let repetition=-1;repetition<6;repetition++) {
      let override;
      const effects=repetition<0||repetition%2===0;
      await page.goto('http://127.0.0.1:5184/'); await page.evaluate(()=>document.fonts.ready);
      if (!effects) override=await page.addStyleTag({content:'.landscape .object,.landscape .motion-rig,.landscape .product-surface {filter:none!important;box-shadow:none!important} dialog.case-inspector::backdrop{backdrop-filter:none!important}'});
      await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
      await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase','opening');
      const before=await metrics(session);
      await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase','active');
      const after=await metrics(session);
      const device=await page.locator('canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');return debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null;});
      const gaps=await page.evaluate(()=>window.__probeFrames.filter(frame=>frame.phase==='opening').map(frame=>frame.gap));
      const draws = delta(before,after);
      await page.keyboard.press('Escape'); await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeFocused();
      await page.goto('http://127.0.0.1:5184/projects/lobby');
      if (!effects) override=await page.addStyleTag({content:'dialog.case-inspector::backdrop{backdrop-filter:none!important}'});
      await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
      const viewerBefore=await metrics(session);
      await page.locator('.media-enlarge').click(); await expect(page.locator('dialog.case-inspector')).toHaveAttribute('data-viewer-state','active');
      await page.keyboard.press('Escape'); await expect(page.locator('dialog.case-inspector')).toHaveCount(0);
      const viewerAfter=await metrics(session);
      const disclosure=page.locator('.engineering-decisions details').first();
      const layoutBefore=await metrics(session);
      await disclosure.locator('summary').click(); await page.waitForTimeout(240);
      await disclosure.locator('summary').click(); await page.waitForTimeout(240);
      const layoutAfter=await metrics(session);
      if(repetition>=0) records.push({width,repetition,effects,device,opening:draws,openingFrameGaps:gaps,inspector:delta(viewerBefore,viewerAfter),disclosure:delta(layoutBefore,layoutAfter)});
      await override?.evaluate(el=>el.remove());
      console.log(`${width}px diagnostic ${repetition}: effects ${effects}`);
    }
    await page.close();
  }
} finally {await browser.close();}
await writeFile('docs/design/phase4/effects-cost.json',JSON.stringify({date:new Date().toISOString(),method:'Chrome CDP Performance counters; three alternating pairs per viewport after excluded warm-up; actual local JobPilot mesh and Lobby images/public GET snapshot, no video/screenshot work during measured intervals. Effects disabled only with temporary diagnostic CSS. Metrics are browser main-thread CPU, not GPU timer-query timings. Existing static shadows and blur are not animated.',limitations:'One Intel Windows device; finite sample, automation overhead and shader caches; mobile viewport emulation is not a phone GPU. No Safari or physical phone performance claim.',records},null,2)+'\n');
