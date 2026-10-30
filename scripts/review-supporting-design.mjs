// Read-only captures of the compiled index and supporting readers.
import { chromium, expect } from '@playwright/test';
import express from 'express';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
const arg = key => process.argv.find(v => v.startsWith(`--${key}=`))?.slice(key.length + 3);
const phase = arg('phase') ?? 'before', root = path.resolve(arg('dist') ?? '.motion-preview/supporting-before-dist');
export const slugs = ['gamezone-arena','unihub','full-stack-user-management-system','medicare-hub','home-services'];
const folder = `docs/design/supporting-phase2/${phase}`;
await mkdir(folder,{recursive:true});
const snapshot = '.motion-preview/supporting-content.json';
if (process.argv.includes('--refresh')) {
  const content = Object.fromEntries(await Promise.all(['profile','projects','site-content','skills','technologies','education','certifications'].map(async key => {
    const response = await fetch(`https://mahmoud-portfolio-omega.vercel.app/api/${key}`);
    if (!response.ok) throw Error(`Public GET ${key}: ${response.status}`);
    return [`/api/${key}`,await response.json()];
  })));
  await writeFile(snapshot,JSON.stringify(content));
}
const data = JSON.parse(await readFile(snapshot,'utf8'));
const app = express(); app.use(express.static(root)); app.get('*',(_,res) => res.sendFile(path.join(root,'index.html')));
const server = app.listen(5250,'127.0.0.1'); await new Promise(r => server.once('listening',r));
const browser = await chromium.launch({channel:'chrome'});
const findings = [];
try {
  for (const [width,height] of [[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]].filter(([w])=>!arg('widths')||arg('widths').split(',').includes(String(w)))) {
    const recording = [390,1440].includes(width);
    const context = await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',...(recording?{recordVideo:{dir:folder,size:{width,height}}}:{})});
    const page = await context.newPage(), errors = [], captures = [], selections = [];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/**',r=>{
      if (r.request().method()!=='GET') throw Error('Read-only review');
      const key = new URL(r.request().url()).pathname;
      return r.fulfill({json:data[key]??data['/api/projects'].find(p=>key===`/api/projects/${p.slug}`)??[]});
    });
    const base = ['before','normal'].includes(phase)?'/projects':`/review/supporting/${phase==='baseline'?'baseline':'candidate'}`;
    const capture = async (name, fullPage=false) => {
      await page.evaluate(()=>document.fonts.ready);
      await page.locator('.screenshot-frame[data-image-state="ready"]').evaluateAll(nodes=>Promise.all(nodes.flatMap(node=>node.getAnimations({subtree:true})).filter(animation=>animation.effect?.getComputedTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>{}))));
      await page.mouse.move(1,1);
      await page.screenshot({path:`${folder}/${width}-${name}.jpg`,quality:85,fullPage});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      captures.push(name); console.log(`${phase} ${width} ${name}`);
    };
    console.log(`Opening ${phase} ${width}`);
    await page.goto(`http://127.0.0.1:5250${base}`,{waitUntil:'domcontentloaded'});
    await expect(page.locator('.work-entry')).toHaveCount(8);
    for (const frame of await page.locator('.work-preview').all()) {
      await frame.scrollIntoViewIfNeeded();
      await expect(frame).toHaveAttribute('data-image-state','ready');
    }
    await page.evaluate(()=>{ scrollTo({top:0,behavior:'instant'}); document.getElementById('main-content')?.scrollTo({top:0,behavior:'instant'}); });
    await capture('index'); await capture('index-full',true);
    await page.locator('.work-entry').first().evaluate(el=>{
      const main=el.closest('main'),offset=el.getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom-20;
      if(getComputedStyle(main).overflowY==='auto') main.scrollTop+=offset; else scrollBy({top:offset,behavior:'instant'});
    });
    await capture('index-card');
    for (const slug of slugs) {
      const link = page.locator(`.work-entry[href$="/${slug}"]`);
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page.locator('.case-heading h1')).toBeVisible();
      await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
      await page.waitForTimeout(250);
      await capture(slug);
      await page.locator('.case-narrative').evaluate(el=>{
        const main=el.closest('main'),offset=el.getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom-24;
        if(getComputedStyle(main).overflowY==='auto') main.scrollTop+=offset; else scrollBy({top:offset,behavior:'instant'});
      });
      for (const frame of await page.locator('.case-narrative > :first-child .screenshot-frame').all()) {
        if (!await frame.isVisible()) continue;
        await frame.scrollIntoViewIfNeeded();await expect(frame).toHaveAttribute('data-image-state','ready');
      }
      await page.locator('.case-narrative').evaluate(el=>{
        const main=el.closest('main'),offset=el.getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom-24;
        if(getComputedStyle(main).overflowY==='auto') main.scrollTop+=offset; else scrollBy({top:offset,behavior:'instant'});
      });
      await capture(`${slug}-reading`);
      if (phase === 'candidate') {
        const decision=page.locator('.engineering-decisions summary').first();await decision.click();
        await decision.scrollIntoViewIfNeeded();await capture(`${slug}-decision`);
        if ([390,1440].includes(width)) {
          const choices=page.locator('.case-media-chooser button');
          for(let i=0;i<await choices.count();i++) {
            await page.locator('.case-media-chooser summary').click();await choices.nth(i).click();
            await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
            await expect(page.locator('.case-figure .screenshot-previous')).toHaveCount(0);
            selections.push({slug,index:i,source:await page.locator('.case-figure').getAttribute('data-source'),image:await page.locator('.case-figure .screenshot-button img').evaluate(image=>({url:image.currentSrc,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,width:image.getBoundingClientRect().width,height:image.getBoundingClientRect().height}))});
            await page.locator('.case-screen-tools').evaluate(el=>scrollBy({top:el.getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom-20,behavior:'instant'}));
            await capture(`${slug}-image-${i+1}`);
            if (slug==='home-services' || slug==='full-stack-user-management-system') {
              await page.locator('.case-figure .screenshot-frame').evaluate(el=>scrollBy({top:el.getBoundingClientRect().bottom-document.querySelector('.stage-footer').getBoundingClientRect().top+20,behavior:'instant'}));
              await capture(`${slug}-image-${i+1}-bottom`);
            }
          }
          const trigger=page.locator('.case-screen-tools > button');await trigger.click();
          await capture(`${slug}-gallery`);await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
        }
        await page.locator('.case-end').scrollIntoViewIfNeeded();await capture(`${slug}-end`);
      }
      await page.locator('.case-back').click();
      await expect(page.locator('.work-entry')).toHaveCount(8);
    }
    const video = page.video(); await context.close();
    if (recording) await rename(await video.path(),`${folder}/${width}-journey.webm`);
    findings.push({width,height,captures,selections,errors});
  }
  await writeFile(`${folder}/findings.json`,JSON.stringify({phase,root,source:'Read-only public API snapshot; genuine existing local project assets; compiled Chrome, deviceScaleFactor 1. Viewport emulation, not physical devices.',findings},null,2));
  if (findings.some(f=>f.errors.length)) throw Error('Browser errors');
} finally { await browser.close(); await new Promise(r=>server.close(r)); }
