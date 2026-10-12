// Actual current public records/portrait; local frozen GETs, no CMS writes.
import {chromium,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const phase=process.argv[2]??'after',reduced=process.argv.includes('--reduced');
if(!['before','after'].includes(phase))throw new Error('Use before or after');
const output=`docs/design/profile-record/${reduced?'reduced':phase}`;
await mkdir(output,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const cv=await readFile('.motion-preview/public-cv.pdf');
const base=process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:5190';
const browser=await chromium.launch({channel:'chrome'}),findings=[];
try{
 for(const [width,height]of [[1440,900],[1440,650],[768,1024],[390,844],[320,844]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'}),errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());});
  await page.route('**/api/**',route=>{const request=route.request(),p=new URL(request.url()).pathname;if(!['GET','HEAD'].includes(request.method()))return route.fulfill({status:403,json:{}});return p==='/api/cv.pdf'?route.fulfill({body:cv,contentType:'application/pdf'}):route.fulfill({json:content[p]??content['/api/projects'].find(x=>p===`/api/projects/${x.slug}`)??[]});});
  await page.route('https://**',async route=>{try{await route.fulfill({body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(route.request().url()).pathname)}`),contentType:'image/png'});}catch{await route.abort();}});
  await page.goto(`${base}/profile`);await expect(page.locator('.profile-record')).toBeVisible();await page.locator('.portrait-panel img').evaluate(el=>el.decode());await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
  const record={width,height,reduced,errors,writes,entries:[],tabs:[],professionalLinks:await page.locator('.panel-links a').evaluateAll(es=>es.map(e=>({label:e.textContent,url:e.getAttribute('href'),target:e.getAttribute('target')})))};
  const capture=async name=>{
   await page.waitForTimeout(260);
   await page.screenshot({path:`${output}/${width}-${height}-${name}-viewport.jpg`,quality:86});
   // A temporary camera-only height paints the entire scrollable record without
   // changing the inspected width, then restores the reviewed viewport.
   const metrics=await page.locator('.profile-page').evaluate(el=>({height:el.scrollHeight,top:el.getBoundingClientRect().top,overflow:el.scrollWidth>el.clientWidth||document.documentElement.scrollWidth>innerWidth}));
   if(phase==='after')expect(metrics.overflow).toBe(false);
   await page.setViewportSize({width,height:Math.max(height,Math.ceil(metrics.height+Math.max(0,metrics.top)+180))});
   await page.locator('.profile-page').evaluate(el=>{el.scrollTop=0;});
   await page.screenshot({path:`${output}/${width}-${height}-${name}-complete.jpg`,fullPage:true,quality:84});
   await page.setViewportSize({width,height});return metrics;
  };
  for(const [label,key]of [['Experience','experience'],['Education & training','education'],['Capabilities','capabilities']]){
   await page.locator('.record-tabs button').filter({hasText:label}).click();
   await page.locator('.profile-page').evaluate(el=>{el.scrollTop=0;});
   record.tabs.push({label,...await capture(key)});
   if(key==='experience'){
    const entries=page.locator('.experience-record details');
    for(let i=0;i<await entries.count();i++){
     const entry=entries.nth(i),summary=entry.locator('summary');
     if(await summary.getAttribute('aria-expanded')!=='true')await summary.click();
     await expect(summary).toHaveAttribute('aria-expanded','true');await page.waitForTimeout(260);
     const measurements=await entry.evaluate(el=>{const summary=el.querySelector('summary'),detail=el.querySelector('.record-detail');const bounds=summary.getBoundingClientRect();return{label:summary.innerText,body:detail.innerText,bodySize:parseFloat(getComputedStyle(detail.querySelector('p')??detail).fontSize),dates:[...summary.querySelectorAll('.record-date')].map(e=>({text:e.textContent,size:parseFloat(getComputedStyle(e).fontSize)})),summaryHeight:bounds.height,overflow:el.scrollWidth>el.clientWidth};});
     record.entries.push(measurements);
     await summary.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:`${output}/${width}-${height}-experience-${i}.jpg`,quality:86});
     await summary.click();await expect(summary).toHaveAttribute('aria-expanded','false');
    }
    await capture('experience-collapsed');
   }
   if(key==='education')record.education=await page.locator('.education-record').innerText();
   if(key==='capabilities')record.capabilities=await page.locator('.capability-record').evaluate(el=>({text:el.innerText,links:[...el.querySelectorAll('a')].map(a=>({text:a.textContent,url:a.getAttribute('href')})),competencies:[...el.querySelectorAll('[data-competency]')].map(e=>e.getAttribute('data-competency'))}));
  }
  await page.getByRole('button',{name:'Download CV',exact:true}).scrollIntoViewIfNeeded();const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).click();const file=await download;record.cv={filename:file.suggestedFilename(),failure:await file.failure(),sourceBytes:cv.length,signature:cv.subarray(0,5).toString()};
  expect(record.cv.failure).toBeNull();expect(record.cv.signature).toBe('%PDF-');
  await page.close();findings.push(record);
 }
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({phase,baseline:'bc957ee65f2e85ce8a07eafedc15475d10666e28',environment:'Windows Chrome with actual current public GET records, original portrait and published CV. Tablet/phone viewports and reduced motion are browser emulation, not physical-device testing. Complete captures temporarily extend camera height; viewport captures retain the stated height.',findings},null,2)+'\n');
if(findings.some(r=>r.errors.length||r.writes.length))throw new Error('Review reported errors or writes');
