// Native browser recordings, not a slideshow. Read-only archived public data.
import { chromium, expect } from '@playwright/test';
import express from 'express';
import path from 'node:path';
import { readFile, rename } from 'node:fs/promises';
const root=path.resolve('.motion-preview/supporting-design-ci');
const data=JSON.parse(await readFile('.motion-preview/supporting-content.json','utf8'));
const folder='docs/design/supporting-phase2/candidate';
const app=express();app.use(express.static(root));app.get('*',(_,r)=>r.sendFile(path.join(root,'index.html')));
const server=app.listen(5252,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const browser=await chromium.launch({channel:'chrome'});
try {
  for(const [width,height,slug,query] of [[390,844,'gamezone-arena','GameZone'],[1440,900,'home-services','Home Services']]) {
    const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:folder,size:{width,height}}});
    const page=await context.newPage();
    await page.route('**/api/**',r=>{
      if(r.request().method()!=='GET')throw Error('Read-only recording');
      const key=new URL(r.request().url()).pathname;
      return r.fulfill({json:data[key]??data['/api/projects'].find(p=>key===`/api/projects/${p.slug}`)??[]});
    });
    await page.goto('http://127.0.0.1:5252/review/supporting/candidate',{waitUntil:'domcontentloaded'});
    await expect(page.locator('.work-entry')).toHaveCount(8);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);
    await page.getByRole('searchbox').fill(query);await page.waitForTimeout(500);
    const card=page.locator(`[data-project-slug="${slug}"]`);await card.focus();await page.keyboard.press('Enter');
    await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');await page.waitForTimeout(900);
    await page.locator('.case-media-chooser summary').click();await page.locator('.case-media-chooser button').nth(1).click();
    await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');await page.waitForTimeout(600);
    await page.locator('.case-screen-tools > button').click();await page.waitForTimeout(800);await page.keyboard.press('Escape');
    await page.locator('.case-narrative').evaluate(el=>scrollBy({top:el.getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom-24,behavior:'instant'}));
    await page.waitForTimeout(900);await page.locator('.case-back').click();await expect(card).toBeFocused();await page.waitForTimeout(800);
    const video=page.video();await context.close();await rename(await video.path(),`${folder}/${width}-journey-short.webm`);
    console.log(`${width}: native index → ${slug} → image choice → gallery → reading → filtered index/focus`);
  }
} finally {await browser.close();await new Promise(r=>server.close(r));}
