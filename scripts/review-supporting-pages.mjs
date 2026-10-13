import{chromium,expect}from'@playwright/test';import{readFile,mkdir,writeFile}from'node:fs/promises';
import{sampleDescription,sampleMatch}from'../tests/fixtures/supporting-pages.mjs';
const phase=process.argv[2]??'after',reduced=process.argv.includes('--reduced'),root=`docs/design/supporting-pages/${reduced?'reduced':phase}`;
if(!['before','after'].includes(phase))throw Error('Use before or after');await mkdir(root,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8')),cv=await readFile('.motion-preview/public-cv.pdf'),base=process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:5190';
const browser=await chromium.launch({channel:'chrome'}),findings=[];
try{for(const width of [1440,1024,768,390,320]){
 const height=width===1440?900:width>=768?1024:844,page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'}),errors=[],mockWrites=[];let contactState='failure',releaseContact;
 await page.addInitScript(({sampleMatch})=>{
  const nativeFetch=window.fetch,encoder=new TextEncoder();let controller;
  const event=(name,data)=>controller.enqueue(encoder.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`));
  window.reviewMatchMode='stream';window.reviewMatchStatus=()=>event('status',{message:'Sample fixture: building the evidence report…'});
  window.reviewMatchComplete=()=>{event('result',{result:sampleMatch,cvToken:'local-fixture'});event('done',{});controller.close();};
  window.fetch=async(input,init)=>{
   if(new URL(String(input),location.href).pathname!=='/api/job-match')return nativeFetch(input,init);
   if(window.reviewMatchMode==='failure')return new Response(JSON.stringify({message:'Sample fixture: AI unavailable. Please try again.'}),{status:503,headers:{'Content-Type':'application/json'}});
   return new Response(new ReadableStream({start(c){controller=c;event('status',{message:'Sample fixture: checking portfolio evidence…'});if(window.reviewMatchMode==='success')window.reviewMatchComplete();}}),{headers:{'Content-Type':'text/event-stream'}});
  };
 },{sampleMatch});
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://**',r=>r.abort());
 await page.route('**/api/**',async route=>{const request=route.request(),p=new URL(request.url()).pathname;
  if(request.method()==='GET')return route.fulfill({json:content[p]??content['/api/projects'].find(x=>p===`/api/projects/${x.slug}`)??[]});
  mockWrites.push(p);if(p==='/api/messages'){if(contactState==='pending')await new Promise(resolve=>{releaseContact=resolve;});return contactState==='failure'?route.fulfill({status:503,json:{message:'Sample fixture: delivery unavailable.'}}):route.fulfill({status:201,json:{id:'local-fixture',createdAt:'2026-10-13T00:00:00Z'}});}
  if(p==='/api/job-match/tailored-cv')return route.fulfill({contentType:'application/pdf',body:cv});return route.fulfill({status:403,json:{}});
 });
 const record={width,height,reduced,errors,mockWrites,states:[],covers:[]};
 const go=async route=>{await page.goto(`${base}${route}`);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(320);};
 const capture=async name=>{await page.waitForTimeout(180);const main=page.locator('main#main-content');const metrics=await main.evaluate(e=>({height:e.scrollHeight,overflow:e.scrollWidth>e.clientWidth||document.documentElement.scrollWidth>innerWidth}));if(phase==='after')expect(metrics.overflow).toBe(false);await page.screenshot({path:`${root}/${width}-${name}-viewport.jpg`,quality:85});const fullHeight=await main.evaluate(e=>Math.ceil(e.scrollHeight+Math.max(0,e.getBoundingClientRect().top)+180));await page.setViewportSize({width,height:Math.max(height,fullHeight)});await main.evaluate(e=>{e.scrollTop=0;});await page.screenshot({path:`${root}/${width}-${name}-complete.jpg`,fullPage:true,quality:84});await page.setViewportSize({width,height});record.states.push({name,...metrics});};
 await go('/projects');await expect(page.locator('.work-entry')).toHaveCount(8);
 for(const entry of await page.locator('.work-entry').all()){await entry.scrollIntoViewIfNeeded();await expect(entry.locator('.work-preview')).toHaveAttribute('data-image-state','ready');record.covers.push(await entry.evaluate(e=>{const image=e.querySelector('img'),frame=e.querySelector('.work-preview').getBoundingClientRect();return{href:e.getAttribute('href'),title:e.querySelector('h2').textContent,type:e.querySelector('.work-caption p').textContent,number:e.querySelector('.work-caption .eyebrow')?.textContent,src:image.getAttribute('src'),natural:[image.naturalWidth,image.naturalHeight],frame:[frame.width,frame.height]};}));}
 await page.locator('main#main-content').evaluate(e=>{e.scrollTop=0;});await capture('projects-gallery');await page.getByRole('button',{name:'Index',exact:true}).click();await capture('projects-index');
 await go('/job-match');await capture('match-empty');await page.locator('#job-description').fill(sampleDescription);await page.getByRole('button',{name:'Check My Fit',exact:true}).click();await expect(page.getByRole('button',{name:'Analyzing role…'})).toBeVisible();await capture('match-loading');await page.evaluate(()=>window.reviewMatchStatus());await capture('match-streaming');await page.evaluate(()=>window.reviewMatchComplete());await expect(page.locator('.ai-report')).toBeVisible();await capture('match-completed');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download Tailored CV'}).click();const pdf=await download;record.cv={filename:pdf.suggestedFilename(),failure:await pdf.failure()};expect(record.cv.failure).toBeNull();
 await page.getByRole('button',{name:'Clear',exact:true}).click();await page.evaluate(()=>{window.reviewMatchMode='failure';});await page.locator('#job-description').fill(sampleDescription);await page.getByRole('button',{name:'Check My Fit',exact:true}).click();await expect(page.locator('#job-error')).toBeVisible();await capture('match-error');await page.evaluate(()=>{window.reviewMatchMode='success';});await page.getByRole('button',{name:phase==='after'?'Try again':'Check My Fit',exact:true}).click();await expect(page.locator('.ai-report')).toBeVisible();await capture('match-retry');
 await go('/contact');await capture('contact-empty');await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.locator('#contact-name')).toBeFocused();await capture('contact-validation');
 await page.locator('#contact-name').fill('Sample reviewer');await page.locator('#contact-email').fill('sample@example.com');await page.locator('#contact-subject').fill('Local fixture only');await page.locator('#contact-message').fill('Sample local review; this request is intercepted and never delivered.');await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.locator('.contact-form [role="alert"]')).toBeVisible();await capture('contact-failure');await expect(page.locator('#contact-message')).toHaveValue('Sample local review; this request is intercepted and never delivered.');
 contactState='pending';await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.getByRole('button',{name:'Sending…'})).toBeVisible();await capture('contact-pending');contactState='success';releaseContact();await expect(page.locator('.contact-success')).toBeFocused();await capture('contact-success');
 await page.close();findings.push(record);
}}finally{await browser.close();}
await writeFile(`${root}/findings.json`,JSON.stringify({phase,baseline:'366ce64369c2851854c130771336b6bf2e6dcae0',environment:'Actual public GET records and all eight accepted local covers. Windows Chrome; tablet/phone and reduced motion are browser emulation. Contact and AI responses are intercepted sample fixtures, not real delivery/provider evidence. Complete captures extend camera height.',findings},null,2)+'\n');if(findings.some(r=>r.errors.length))throw Error('Browser errors');
