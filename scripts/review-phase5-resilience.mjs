// Controlled failures/throttling are local only. Real media is retained.
import {chromium,expect} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const output='docs/design/phase5/resilience';await mkdir(output,{recursive:true});
const records=JSON.parse(await readFile('.motion-preview/phase3-public-content.json','utf8'));
const originals=JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json','utf8')).records;
const browser=await chromium.launch({channel:'chrome'}),findings=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
 const page=await context.newPage();
 await page.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
 await page.route('**/api/**',r=>{const path=new URL(r.request().url()).pathname;const body=records[path]??records['/api/projects'].find(p=>path===`/api/projects/${p.slug}`);return body?r.fulfill({json:body}):r.abort();});
 for(const o of originals)await page.route(o.src,async r=>r.fulfill({contentType:'image/png',body:await readFile(o.file)}));
 for(const slug of ['jobpilot-ai','gamezone-arena']){
  await page.goto(`http://127.0.0.1:5184/projects/${slug}`);
  await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
  const last=page.locator('.workflow-frames .screenshot-frame').last();
  const waiting=await last.locator('img').count()===0;
  const before=(await last.boundingBox()).height;
  await page.waitForTimeout(16_000);
  if(waiting){await expect(last.locator('img')).toHaveCount(0);await expect(last).toHaveAttribute('data-image-state','loading');}
  await expect(page.getByText('This image is unavailable.')).toHaveCount(0);
  await last.scrollIntoViewIfNeeded();await expect(last).toHaveAttribute('data-image-state','ready');
  expect((await last.boundingBox()).height).toBeCloseTo(before,1);
  await page.screenshot({path:`${output}/${slug}-after-16s.jpg`,quality:85});
  findings.push({slug,waitMs:16000,waitingOffscreen:waiting,heightBefore:before,heightAfter:(await last.boundingBox()).height,status:'ready on eligibility'});
 }
 await context.close();
 const slow=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});const slowPage=await slow.newPage();
 // Fetch-only local snapshot retains real HTTP requests for compiled/media assets.
 await slow.addInitScript(records=>{const original=fetch;window.fetch=(input,init)=>{const path=new URL(String(input),location.origin).pathname;return records[path]?Promise.resolve(new Response(JSON.stringify(records[path]),{headers:{'Content-Type':'application/json'}})):original(input,init);};},records);
 const cdp=await slow.newCDPSession(slowPage);await cdp.send('Network.enable');
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1_600_000/8,uploadThroughput:750_000/8});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await slowPage.goto('http://127.0.0.1:5184/',{waitUntil:'domcontentloaded'});
 const target=slowPage.getByRole('button',{name:'Explore JobPilot AI',exact:true});await expect(target).toBeVisible();
 await target.tap();
 await expect(slowPage.getByRole('link',{name:'Open case study',exact:true})).toBeFocused();
 await expect(slowPage.locator('.stage')).toHaveAttribute('data-content-state','ready');
 await slowPage.screenshot({path:`${output}/slow-network-content-ready.jpg`,quality:85});
 const state=await slowPage.locator('.stage').evaluate(e=>({content:e.dataset.contentState,motion:e.dataset.motionPhase,renderer:e.querySelector('.motion-rig')?.getAttribute('data-renderer')}));
 await slowPage.keyboard.press('Escape');await expect(target).toBeFocused();
 await expect(slowPage.locator('canvas')).toHaveCount(0);
 findings.push({scenario:'Local 150ms latency / 1.6Mbps down / CPU 4x, real compiled assets and HTTP media. Selection content is ready independently of delayed decoration; immediate interruption restores focus.',state,focusReturned:true});
 await slow.close();
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({date:new Date().toISOString(),environment:'Local compiled build. Real assets/record snapshot; controlled throttling on local only, not production services. Intel desktop renderer, phone viewport emulation, not a physical-phone performance claim.',findings},null,2)+'\n');
