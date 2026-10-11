// Read-only real-asset viewer checks, distinct from synthetic request fixtures.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root='docs/design/complete-case-media';
const projectFilter=process.argv.find(arg=>arg.startsWith('--project='))?.slice('--project='.length);
const content=JSON.parse(await readFile('.motion-preview/phase3-public-content.json','utf8'));
const originals=JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json','utf8')).records;
const browser=await chromium.launch({channel:'chrome'}), findings=[];
try {
 for(const width of [320,390,430,768,1024,1440]) {
  const page=await browser.newPage({viewport:{width,height:936},reducedMotion:'reduce'});
  await page.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
  await page.route('**/api/**',route=>{const path=new URL(route.request().url()).pathname;return route.fulfill({json:content[path]??content['/api/projects'].find(p=>path===`/api/projects/${p.slug}`)??[]});});
  for(const source of originals) await page.route(source.src,async route=>route.fulfill({body:await readFile(source.file),contentType:'image/png'}));
  for(const project of content['/api/projects']) {
   if(projectFilter&&project.slug!==projectFilter) continue;
   await page.goto(`http://127.0.0.1:5184/projects/${project.slug}`);
   const trigger=page.locator('.media-enlarge');await trigger.click();
   const dialog=page.locator('.case-inspector'), region=dialog.locator('.case-inspector-image');
   const choices=dialog.locator('.case-inspector-thumbs button');
   for(let index=0;index<await choices.count();index++) {
    await choices.nth(index).click();
    const modes=[];
    for(const mode of ['Fit width','Actual size','Fit']) {
     await dialog.getByRole('button',{name:mode,exact:true}).click();
     const image=region.locator('.project-image-current img');await image.evaluate(img=>img.decode());
     const geometry=await region.evaluate(el=>{el.scrollTo({left:el.scrollWidth,top:el.scrollHeight,behavior:'instant'});const img=el.querySelector('.project-image-current img');return {width:el.clientWidth,height:el.clientHeight,scrollWidth:el.scrollWidth,scrollHeight:el.scrollHeight,left:el.scrollLeft,top:el.scrollTop,src:img.getAttribute('src'),nativeWidth:img.naturalWidth,nativeHeight:img.naturalHeight,imageWidth:parseFloat(getComputedStyle(img).width),imageHeight:parseFloat(getComputedStyle(img).height)};});
     if(mode==='Fit') {assert.ok(geometry.scrollWidth<=geometry.width&&geometry.scrollHeight<=geometry.height,'Fit includes all boundaries');}
     else {
      if(geometry.scrollWidth>geometry.width) assert.ok(geometry.left>0,'Horizontal panning works');
      if(geometry.scrollHeight>geometry.height) assert.ok(geometry.top>0,'Vertical scrolling works');
      if(mode==='Actual size') {assert.equal(geometry.imageWidth,geometry.nativeWidth,'Actual size uses original width');assert.equal(geometry.imageHeight,geometry.nativeHeight,'Actual size uses original height');}
     }
     await region.focus();await page.keyboard.press('ArrowDown');
     modes.push({mode,...geometry});
     await region.evaluate(el=>el.scrollTo({left:0,top:0,behavior:'instant'}));
    }
    findings.push({slug:project.slug,width,index,modes});
   }
   await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
   assert.ok(await trigger.evaluate(el=>document.activeElement===el),'Close restores the trigger');
   console.log(`${width}px ${project.slug}: full-source Fit/width/actual and panning`);
  }
  await page.close();
 }
} finally {await browser.close();}
if(projectFilter) {
 const previous=JSON.parse(await readFile(`${root}/viewer-panning.json`,'utf8'));
 findings.push(...previous.findings.filter(record=>record.slug!==projectFilter));
}
await writeFile(`${root}/viewer-panning.json`,JSON.stringify({clientDate:'2026-10-11',environment:'Chrome browser emulation, real local assets and cached original remote PNG bytes, frozen GET records, writes blocked. Not physical-device evidence.',findings},null,2));
