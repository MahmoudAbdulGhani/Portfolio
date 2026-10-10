// Genuine Chromium tab zoom through the documented tabs API; isolated profile.
import { chromium, expect } from '@playwright/test';
import { readFile,writeFile,mkdir,mkdtemp,rm } from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
const output='docs/design/phase5/zoom';await mkdir(output,{recursive:true});
const directory=await mkdtemp(join(tmpdir(),'portfolio-zoom-'));
const extension=join(directory,'extension');await mkdir(extension);
await writeFile(join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Isolated portfolio zoom check',version:'1.0',permissions:['tabs'],host_permissions:['http://127.0.0.1/*'],background:{service_worker:'worker.js'}}));
await writeFile(join(extension,'worker.js'),'chrome.runtime.onInstalled.addListener(() => {});');
let context;const findings=[];
try{
 context=await chromium.launchPersistentContext(join(directory,'profile'),{channel:'chromium',headless:true,viewport:{width:1280,height:936},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 const worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker');
 const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});
 const records=JSON.parse(await readFile('.motion-preview/phase3-public-content.json','utf8'));
 await page.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
 await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;const body=records[p]??records['/api/projects'].find(x=>p===`/api/projects/${x.slug}`);return body?r.fulfill({json:body}):r.abort();});
 const originals=JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json','utf8')).records;
 for(const o of originals)await page.route(o.src,async r=>r.fulfill({contentType:'image/png',body:await readFile(o.file)}));
 await page.goto('http://127.0.0.1:5184/profile');
 for(const zoom of [2,4]){
  const actualZoom=await worker.evaluate(async factor=>{const tabs=await chrome.tabs.query({url:'http://127.0.0.1/*'});const tab=tabs.at(-1);await chrome.tabs.setZoom(tab.id,factor);return chrome.tabs.getZoom(tab.id);},zoom);
  expect(actualZoom).toBeCloseTo(zoom,12);
  for(const path of ['/', '/projects',...records['/api/projects'].map(p=>`/projects/${p.slug}`),'/profile','/contact','/job-match']){
   await page.goto('http://127.0.0.1:5184'+path);await expect(page.locator('.landscape-route > main')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
   const geometry=await page.evaluate(()=>({innerWidth,innerHeight,dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,mainWidth:document.querySelector('main').clientWidth}));
   expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.innerWidth);
   await page.screenshot({path:`${output}/${path==='/'?'collection':path.slice(1).replaceAll('/','-')}-${zoom*100}.jpg`,quality:80});
   findings.push({path,actualZoom,geometry});console.log(`Browser zoom ${zoom*100}% ${path}: ${geometry.innerWidth}px CSS, no page overflow`);
  }
 }
}finally{
 await context?.close();
 if(resolve(directory).startsWith(resolve(tmpdir())+sep+'portfolio-zoom-'))await rm(directory,{recursive:true,force:true});
}
await writeFile(`${output}/findings.json`,JSON.stringify({date:new Date().toISOString(),environment:'Bundled Chromium, real 200% and 400% tab zoom verified by chrome.tabs.getZoom; isolated temporary extension/profile removed afterward; real assets, captured public records, native reduced motion, no writes. This is browser reflow coverage, not physical mobile or GPU-motion evidence.',reference:'https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom',findings},null,2)+'\n');
