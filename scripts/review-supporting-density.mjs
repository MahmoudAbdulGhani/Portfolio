// Matched PR57/candidate captures from compiled builds and genuine media.
import { chromium, expect } from '@playwright/test';
import express from 'express';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const option=key=>process.argv.find(v=>v.startsWith(`--${key}=`))?.slice(key.length+3);
const phase=option('phase')??'before';
const root=path.resolve(option('dist')??'.motion-preview/supporting-density-before-dist');
const folder=`docs/design/supporting-density/${phase}`;await mkdir(folder,{recursive:true});
const data=JSON.parse(await readFile('.motion-preview/supporting-content.json','utf8'));
const slugs=['gamezone-arena','unihub','full-stack-user-management-system','medicare-hub','home-services'];
const app=express();app.use(express.static(root));app.get('*',(_,r)=>r.sendFile(path.join(root,'index.html')));
const server=app.listen(5260,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const browser=await chromium.launch({channel:'chrome'}),findings=[];
try {
  for(const [width,height] of [[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]].filter(([w])=>!option('widths')||option('widths').split(',').includes(String(w)))) {
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/**',r=>{
      if(r.request().method()!=='GET')throw Error('Read-only capture');
      const key=new URL(r.request().url()).pathname;
      return r.fulfill({json:data[key]??data['/api/projects'].find(p=>key===`/api/projects/${p.slug}`)??[]});
    });
    const base=`/review/supporting/${option('variant')??'candidate'}`;
    const settle=async()=>{
      await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.stage-footer button').first()).toBeVisible();
      await page.mouse.move(1,1);await page.locator('#main-content').evaluate(async node=>{
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        await Promise.all(node.getAnimations({subtree:true}).filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));
      });
    };
    const capture=async name=>{
      await settle();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      expect(await page.locator('#main-content').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
      await page.screenshot({path:`${folder}/${width}-${name}.jpg`,quality:86});console.log(`${phase} ${width} ${name}`);
    };
    await page.goto(`http://127.0.0.1:5260${base}`,{waitUntil:'domcontentloaded'});await expect(page.locator('.work-entry')).toHaveCount(8);
    for(const frame of await page.locator('.work-preview').all()){await frame.scrollIntoViewIfNeeded();await expect(frame).toHaveAttribute('data-image-state','ready');}
    await page.evaluate(()=>{scrollTo(0,0);document.getElementById('main-content').scrollTo(0,0);});await settle();
    const index=await page.evaluate(()=>({firstCoverTop:document.querySelector('.work-preview').getBoundingClientRect().top,cards:[...document.querySelectorAll('.work-entry')].map(el=>({slug:el.getAttribute('data-project-slug'),height:el.getBoundingClientRect().height,category:el.querySelector('.work-category')?.textContent,summary:el.querySelector('.work-description')?.textContent}))}));
    await capture('index');
    for(const [slug,name] of [['jobpilot-ai','card'],['full-stack-user-management-system','card-users']]) {
      await page.locator(`[data-project-slug="${slug}"]`).evaluate(el=>scrollBy({top:el.getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom-20,behavior:'instant'}));await capture(name);
    }
    if(phase==='after'&&[320,390].includes(width)) {
      await page.locator('#main-content :is(h1,h2,h3,p,a,button,summary,.eyebrow)').evaluateAll(nodes=>{
        const sizes=nodes.map(el=>parseFloat(getComputedStyle(el).fontSize));nodes.forEach((el,i)=>el.style.fontSize=`${sizes[i]*2}px`);
      });
      await page.evaluate(()=>scrollTo(0,0));await capture('index-text-200');
    }
    const readers=[];
    for(const slug of slugs) {
      await page.goto(`http://127.0.0.1:5260${base}/projects/${slug}`,{waitUntil:'domcontentloaded'});
      await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');await settle();
      const measure=await page.evaluate(()=>{
        const box=selector=>{const el=document.querySelector(selector);return el?{top:el.getBoundingClientRect().top,height:el.getBoundingClientRect().height,text:el.textContent.trim()}:null;};
        const img=document.querySelector('.case-figure .screenshot-button img');
        return {imageTop:document.querySelector('.case-figure .screenshot-frame').getBoundingClientRect().top,heading:box('.case-heading h1'),role:box('.case-role'),program:box('.case-program'),summary:box('.case-purpose'),actions:box('.case-actions'),controls:box('.case-media-nav'),columns:getComputedStyle(document.querySelector('.supporting-opening')).gridTemplateColumns,image:{src:img.currentSrc,width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight},bodySize:getComputedStyle(document.querySelector('.case-purpose')).fontSize};
      });
      readers.push({slug,...measure});await capture(slug);
      if(phase==='after'&&[320,390].includes(width)) {
        await page.locator('#main-content :is(h1,h2,h3,p,a,button,summary,.eyebrow)').evaluateAll(nodes=>{
          const sizes=nodes.map(el=>parseFloat(getComputedStyle(el).fontSize));nodes.forEach((el,i)=>el.style.fontSize=`${sizes[i]*2}px`);
        });
        await capture(`${slug}-text-200`);
      }
    }
    findings.push({width,height,index,readers,errors});await context.close();
  }
  await writeFile(`${folder}/measurements.json`,JSON.stringify({phase,root,method:'Compiled installed Windows Chrome, reduced motion for settled matching, 1 CSS pixel per raster pixel. Archived public GET data; genuine unchanged media; not physical-device testing.',findings},null,2));
  if(findings.some(f=>f.errors.length))throw Error('Browser errors');
}finally {await browser.close();await new Promise(r=>server.close(r));}
