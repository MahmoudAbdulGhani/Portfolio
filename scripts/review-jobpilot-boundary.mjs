// Actual unchanged artwork and cached public screenshot originals; no API writes.
import { chromium, expect } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const phase = process.argv[2] ?? 'after';
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after');
const output = `docs/design/jobpilot-boundary/${phase}`;
await mkdir(output, { recursive: true });
const content = JSON.parse(await readFile('.motion-preview/public-content.json', 'utf8'));
const findings = [];
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const [width, height] of [[1440,900],[1440,650],[768,1024],[390,844],[320,844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'no-preference',
      recordVideo: phase === 'after' && [1440,390].includes(width) && height !== 650 ? { dir: '.motion-preview/jobpilot-video', size: {width,height} } : undefined });
    const page = await context.newPage();
    const errors = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', route => {
      const request = route.request(), url = new URL(request.url());
      if (!['GET','HEAD'].includes(request.method())) { writes.push(url.pathname); return route.fulfill({json:{},status:403}); }
      const body = content[url.pathname] ?? content['/api/projects'].find(p => url.pathname === `/api/projects/${p.slug}`) ?? [];
      return route.fulfill({json:body});
    });
    await page.route('https://**', async route => {
      const name = path.basename(new URL(route.request().url()).pathname);
      try { const body = await readFile(`.motion-preview/phase3-public-media/${name}`); await route.fulfill({body,contentType:'image/png'}); }
      catch { await route.abort(); }
    });
    await page.goto('http://127.0.0.1:5185/');
    await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeVisible();
    await page.screenshot({path:`${output}/${width}-${height}-collection.jpg`,quality:85});
    await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
    await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
    await page.locator('.product-surface img').last().evaluate(img=>img.decode());
    await page.screenshot({path:`${output}/${width}-${height}-selected.jpg`,fullPage:true,quality:85});
    const record = {width,height,errors,writes,openingRenderer:await page.locator('.stage').getAttribute('data-motion-renderer')};
    if (phase === 'after') {
      const demo = page.getByRole('region',{name:'The profile save boundary'});
      const capture = async name => {
        await demo.scrollIntoViewIfNeeded();
        await page.waitForTimeout(900);
        await demo.screenshot({path:`${output}/${width}-${height}-${name}.jpg`,quality:88});
      };
      await capture('rest');
      await demo.getByRole('button',{name:'Propose a change',exact:true}).click();
      await capture('propose');
      await demo.getByRole('button',{name:'Review the change',exact:true}).click();
      await capture('review');
      await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
      await capture('accept');
      await demo.getByRole('button',{name:'Reset',exact:true}).click();
      await demo.getByRole('button',{name:'Propose a change',exact:true}).click();
      await demo.getByRole('button',{name:'Review the change',exact:true}).click();
      await demo.getByRole('button',{name:'Change the saved profile during review.',exact:true}).click();
      await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
      await capture('stale');
      await demo.getByRole('button',{name:'Review again',exact:true}).click();
      await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
      await capture('reviewed-again');
      record.demoRenderer = await demo.locator('.boundary-art').getAttribute('data-renderer');
      if(record.openingRenderer==='webgl') record.gpu = await page.locator('.motion-rig canvas').evaluate(canvas=>{
        const gl=canvas.getContext('webgl2'), debug=gl.getExtension('WEBGL_debug_renderer_info');
        return debug ? {vendor:gl.getParameter(debug.UNMASKED_VENDOR_WEBGL),renderer:gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)} : null;
      });
      record.layout = await demo.evaluate(el=>({width:el.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth,copy:el.innerText}));
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeFocused();
    }
    const video = page.video();
    await context.close();
    if(video) await video.saveAs(`${output}/${width}-${height}-interaction.webm`);
    findings.push(record);
  }
} finally { await browser.close(); }
await writeFile(`${output}/findings.json`,JSON.stringify({phase,baseline:'2c00c354d7b6c727f26efb4fdaaabce4f9212588',environment:'Installed Windows Chrome; actual artwork/GPU and cached original screenshots, frozen public GET records. Browser viewport emulation, not physical devices. Writes blocked.',findings},null,2)+'\n');
