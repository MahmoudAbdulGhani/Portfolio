import{chromium,expect}from'@playwright/test';import{readFile}from'node:fs/promises';import{sampleDescription,sampleMatch}from'../tests/fixtures/supporting-pages.mjs';
const mode=process.argv.includes('--reduced')?'reduced':'after',content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8')),browser=await chromium.launch({channel:'chrome'});
try{for(const width of [1440,1024,768,390,320]){
 const page=await browser.newPage({viewport:{width,height:width>=768?900:844},reducedMotion:mode==='reduced'?'reduce':'no-preference'});
 await page.route('https://**',r=>r.abort());await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;if(p==='/api/job-match')return r.fulfill({contentType:'text/event-stream',body:`event: result\ndata: ${JSON.stringify({result:sampleMatch})}\n\n`});return r.request().method()==='GET'?r.fulfill({json:content[p]??[]}):r.fulfill({status:403,json:{}});});
 await page.goto('http://127.0.0.1:5190/job-match');await page.locator('#job-description').fill(sampleDescription);await page.getByRole('button',{name:'Check My Fit'}).click();await expect(page.locator('.match-project-evidence')).toHaveCount(3);
 for(const img of await page.locator('.match-project-cover img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}
 await page.locator('.ai-report-section').filter({has:page.getByRole('heading',{name:'Supporting project evidence',exact:true})}).evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(180);
 await page.screenshot({path:`docs/design/supporting-pages/${mode}/${width}-match-evidence.jpg`,quality:86});await page.close();
}}finally{await browser.close();}
