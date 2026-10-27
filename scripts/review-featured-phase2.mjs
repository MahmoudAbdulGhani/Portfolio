// Compiled, read-only Cedar/Lobby comparison. Native browser recordings are
// separate from sampled framing bounds; emulation is not a device test.
import { chromium, expect } from '@playwright/test';
import express from 'express';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
const option = key => process.argv.find(arg => arg.startsWith(`--${key}=`))?.slice(key.length + 3);
const phase = option('phase') ?? 'before', mode = option('mode') ?? 'normal';
const root = path.resolve(option('dist') ?? '.motion-preview/phase2-before-dist');
const snapshot = '.motion-preview/phase2-content.json';
if (process.argv.includes('--refresh')) {
  const data = Object.fromEntries(await Promise.all(['profile','projects','site-content','skills','technologies','education','certifications'].map(async key => {
    const response = await fetch(`https://mahmoud-portfolio-omega.vercel.app/api/${key}`);
    if (!response.ok) throw Error(`Public GET ${key}: ${response.status}`);
    return [`/api/${key}`, await response.json()];
  })));
  await writeFile(snapshot, JSON.stringify(data));
}
const data = JSON.parse(await readFile(snapshot,'utf8'));
// Cache exact public source bytes, not replacements. This avoids an external
// image request hanging mid-capture while leaving source identity unchanged.
const remoteImages = new Map();
for (const p of data['/api/projects'].filter(p => p.slug === 'construction-project-management-accounting-system')) {
  for (const url of [p.coverImage,...(p.screenshots ?? [])].filter(url => url?.startsWith('https://'))) {
    const response = await fetch(url); if (!response.ok) throw Error(`Source image ${response.status}`);
    remoteImages.set(url,{body:Buffer.from(await response.arrayBuffer()),contentType:response.headers.get('content-type') ?? 'image/png'});
  }
}
const app = express(); app.use(express.static(root)); app.get('*',(_,res) => res.sendFile(path.join(root,'index.html')));
const server = app.listen(Number(option('port') ?? 5240),'127.0.0.1'); await new Promise(r => server.once('listening',r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({channel:'chrome'});
try {
  for (const [kind,slug,name] of [['cedar','construction-project-management-accounting-system','Cedar Construction'],['lobby','lobby','Lobby']].filter(([kind]) => !option('project') || kind === option('project'))) {
    const folder = `docs/design/featured-phase2/${kind}/${phase}/${mode}`; await mkdir(folder,{recursive:true});
    const findings = [];
    for (const [width,height] of (mode === 'normal' ? [[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]] : [[390,844],[1440,900]]).filter(([w]) => !option('widths') || option('widths').split(',').includes(String(w)))) {
      const recording = mode === 'normal' && [390,1440].includes(width);
      const context = await browser.newContext({viewport:{width,height},reducedMotion:mode === 'reduced' ? 'reduce':'no-preference',...(recording ? {recordVideo:{dir:folder,size:{width,height}}}:{})});
      const page = await context.newPage(), errors = [], writes = [], captures = [];
      page.on('pageerror',e => errors.push(e.message));
      await page.route('https://**',r => {
        const image = remoteImages.get(r.request().url());
        return image ? r.fulfill(image) : r.continue();
      });
      await page.route('**/api/**',r => {
        const p = new URL(r.request().url()).pathname;
        if (!['GET','HEAD'].includes(r.request().method())) { writes.push(p); return r.fulfill({status:403,json:{message:'Read-only review'}}); }
        return r.fulfill({json:data[p] ?? data['/api/projects'].find(project => p === `/api/projects/${project.slug}`) ?? []});
      });
      if (mode === 'fallback') await page.addInitScript(() => {
        const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type,...args) { return /^webgl/.test(type) ? null : get.call(this,type,...args); };
      });
      await page.addInitScript(() => {
        window.phase2Frames = [];
        const sample = () => {
          const stage = document.querySelector('.stage'), phase = stage?.dataset.motionPhase;
          if (['selecting','opening'].includes(phase) && window.phase2Frames.length < 240) {
            const box = s => document.querySelector(s)?.getBoundingClientRect().toJSON(), rig = stage.querySelector('.motion-rig');
            window.phase2Frames.push({time:performance.now(),phase,rig:box('.motion-rig'),subject:rig?.dataset.subjectBounds ? JSON.parse(rig.dataset.subjectBounds):null,image:box('.selection-image-frame'),identity:box('.selection-caption'),actions:box('.selection-project-links'),choices:box('.chapter-switch'),back:box('.back-collection')});
          }
          requestAnimationFrame(sample);
        }; requestAnimationFrame(sample);
      });
      const capture = async step => {
        await page.mouse.move(1,1); await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const file = `${width}-${height}-${step}.jpg`; await page.screenshot({path:`${folder}/${file}`,quality:84});
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        captures.push({step,file});
        console.log(`${kind} ${phase} ${mode} ${width} ${step}`);
      };
      const scrollTo = async element => element.evaluate(el => {
        const main = el.closest('.project-reader'), offset = el.getBoundingClientRect().top - document.querySelector('.site-header').getBoundingClientRect().bottom - 24;
        if (main && getComputedStyle(main).overflowY === 'auto') main.scrollTop += offset;
        else scrollBy({top:offset,behavior:'instant'});
      });
      const pause = async () => { if (recording) await page.waitForTimeout(550); };
      const entry = phase === 'before' ? '/' : `/review/featured/${kind}/candidate`;
      await page.goto(origin + entry);
      await expect(page.getByRole('button',{name:`Explore ${name}`,exact:true})).toBeVisible();
      await page.evaluate(() => document.fonts.ready); await page.locator('.object-core').evaluateAll(nodes => Promise.all(nodes.map(n => n.decode()))); await pause();
      await page.getByRole('button',{name:`Explore ${name}`,exact:true}).click();
      await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15_000});
      await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
      await capture('preview'); await pause();
      const renderer = await page.locator('.stage').getAttribute('data-motion-renderer');
      const gpu = renderer === 'webgl' ? await page.locator('.motion-rig canvas').evaluate(c => { const gl=c.getContext('webgl2'),d=gl?.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL):null; }):null;
      const transition = await page.evaluate(() => window.phase2Frames);
      await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();
      await expect(page.locator(`#${kind}-engineering`)).toBeFocused(); await scrollTo(page.locator(`.${kind}-boundary`)); await capture('demo-preview');
      const choices = page.getByRole('group',{name:'Preview workflow'}).getByRole('button'); await choices.nth(1).click();
      await page.locator('.selection-image-frame').scrollIntoViewIfNeeded();
      await page.locator('.project-image-current img').evaluate(image => image.decode());
      await expect(page.locator('.project-image-previous')).toHaveCount(0);
      const chosen = await page.locator('.product-surface img').getAttribute('src');
      await page.getByRole('link',{name:'Open case study',exact:true}).click();
      await expect(page.locator('.case-heading h1')).toHaveText(name);
      await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
      await expect(page.locator('[data-reader-handoff="running"]')).toHaveCount(0); await page.waitForTimeout(500);
      await capture('reader'); await pause();
      const boundary = page.locator(`.${kind}-boundary`); await scrollTo(boundary); await capture('demo-reader'); await pause();
      if (kind === 'cedar') {
        await boundary.getByRole('button',{name:'Interpret the figures',exact:true}).click();
        await boundary.getByLabel('Average phase progress').selectOption('75');
        await expect(boundary).toHaveAttribute('data-outdated','true'); await capture('outdated'); await pause();
        await boundary.getByRole('button',{name:'Refresh sample interpretation',exact:true}).click();
      } else {
        await boundary.getByRole('button',{name:'Try to enter the call',exact:true}).click();
        await expect(boundary).toHaveAttribute('data-phase','denied');
        await boundary.getByLabel('Fictional participant', {exact:true}).selectOption('rowan');
        await boundary.getByRole('button',{name:'Join with the invitation',exact:true}).click();
        await expect(boundary).toHaveAttribute('data-phase','rejected'); await capture('rejected'); await pause();
        await boundary.getByLabel('Fictional participant', {exact:true}).selectOption('mira');
        await boundary.getByRole('button',{name:'Join with the invitation',exact:true}).click();
        await boundary.getByRole('button',{name:'Try to enter the call',exact:true}).click();
        await expect(boundary).toHaveAttribute('data-phase','allowed');
      }
      await capture('result'); await pause(); await boundary.getByRole('button',{name:'Reset',exact:true}).click(); await pause();
      await page.locator('.case-back').click(); await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled'); await pause();
      const selectedIndex = await choices.evaluateAll(nodes => nodes.findIndex(n => n.getAttribute('aria-pressed') === 'true'));
      if (phase === 'candidate') { expect(selectedIndex).toBe(1); await expect(page.locator('.open-case')).toBeFocused(); }
      await capture('return');
      const video = page.video(); await context.close(); if (recording) await rename(await video.path(),`${folder}/${width}-journey.webm`);
      findings.push({width,height,renderer,gpu,transition,chosen,selectedIndex,captures,errors,writes});
    }
    await writeFile(`${folder}/findings.json`,JSON.stringify({phase,mode,root,source:'PR #53 / c4f18c73a0184e8304327afcf80c22279b0f1bca immediate before; same fresh read-only snapshot and genuine assets.',method:'Compiled Windows Chrome. Native browser video; phone/tablet viewport emulation, separately identified WebGL or forced fallback. Local fictional demos only.',findings},null,2));
    if (findings.some(f => f.errors.length || f.writes.length)) throw Error('Capture errors or attempted writes');
    console.log(JSON.stringify({kind,phase,mode,widths:findings.map(f => f.width)}));
  }
} finally { await browser.close(); await new Promise(r => server.close(r)); }
