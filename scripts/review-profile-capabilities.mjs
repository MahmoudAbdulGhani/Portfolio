import {chromium,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const phase=process.argv[2]??'after',reduced=process.argv.includes('--reduced');
if(!['before','after'].includes(phase))throw Error('Use before or after');
const root=`docs/design/profile-capabilities/${reduced?'reduced':phase}`;
await mkdir(root,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const base=process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:5190';
const browser=await chromium.launch({channel:'chrome'}),findings=[];
try{
 for(const width of [1440,768,390,320]){
  const height=width===768?1024:width===1440?900:844;
  const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'}),errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());});
  await page.route('**/api/**',route=>{const request=route.request(),p=new URL(request.url()).pathname;return !['GET','HEAD'].includes(request.method())?route.fulfill({status:403,json:{}}):route.fulfill({json:content[p]??content['/api/projects'].find(x=>p===`/api/projects/${x.slug}`)??[]});});
  await page.route('https://**',route=>route.abort());
  await page.goto(`${base}/profile`);await page.getByRole('tab',{name:'Capabilities'}).click();
  await page.locator('.portrait-panel img').evaluate(el=>el.decode());await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
  const panel=page.getByRole('tabpanel',{name:'Capabilities'});
  const metrics=async()=>panel.evaluate(el=>({panelHeight:el.getBoundingClientRect().height,links:[...el.querySelectorAll('a')].map(a=>({label:a.innerText,href:a.getAttribute('href')})),competencies:[...el.querySelectorAll('[data-competency]')].map(e=>({key:e.getAttribute('data-competency'),text:e.querySelector('span').innerText,detail:e.querySelector('.competency-detail')?.innerText??'',evidence:[...e.querySelectorAll('a')].map(a=>a.getAttribute('href')),size:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight)})),overflow:document.documentElement.scrollWidth>innerWidth||document.querySelector('.profile-page').scrollWidth>document.querySelector('.profile-page').clientWidth}));
  const record={width,height,reduced,errors,writes,collapsed:await metrics(),references:await panel.locator('[data-evidence-project]').evaluateAll(es=>es.map(e=>({slug:e.getAttribute('data-evidence-project'),href:e.querySelector('a').getAttribute('href'),scope:e.querySelector('.profile-evidence-scope').innerText,associations:e.querySelector('.profile-evidence-associations').innerText})))};
  await panel.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:`${root}/${width}-inventory.jpg`,quality:86});
  if(phase==='after'){
   await page.getByRole('heading',{name:'Engineering evidence',exact:true}).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(180);await page.screenshot({path:`${root}/${width}-evidence.jpg`,quality:86});
   const summary=page.locator('.profile-additional-evidence summary');
   if(await summary.count()){
    await summary.focus();await page.keyboard.press('Enter');await expect(summary).toHaveAttribute('aria-expanded','true');await page.waitForTimeout(260);record.expanded=await metrics();
    record.references=await panel.locator('[data-evidence-project]').evaluateAll(es=>es.map(e=>({slug:e.getAttribute('data-evidence-project'),href:e.querySelector('a').getAttribute('href'),scope:e.querySelector('.profile-evidence-scope').innerText,associations:e.querySelector('.profile-evidence-associations').innerText})));
    await summary.scrollIntoViewIfNeeded();await page.screenshot({path:`${root}/${width}-additional.jpg`,quality:86});
   }
   record.destinations=[];
   for(const href of [...new Set(record.collapsed.links.map(l=>l.href))]){
    if(!await panel.locator(`a[href="${href}"]`).isVisible()){await page.locator('.profile-additional-evidence summary').click();}
    await panel.locator(`a[href="${href}"]`).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`));
    await expect(page.locator('#engineering')).toBeInViewport();record.destinations.push({href,heading:await page.locator('#engineering').innerText()});
    await page.goto(`${base}/profile`);await page.getByRole('tab',{name:'Capabilities'}).click();
   }
  }
  // Extend only the camera height to paint the entire inner scrolling record.
  if(phase==='after'){const summary=page.locator('.profile-additional-evidence summary');if(await summary.count()&&await summary.getAttribute('aria-expanded')!=='true'){await summary.click();await page.waitForTimeout(260);}}
  const main=page.locator('.profile-page'),fullHeight=await main.evaluate(e=>Math.ceil(e.scrollHeight+Math.max(0,e.getBoundingClientRect().top)+180));
  await page.setViewportSize({width,height:Math.max(height,fullHeight)});await main.evaluate(el=>{el.scrollTop=0;});await page.screenshot({path:`${root}/${width}-complete.jpg`,fullPage:true,quality:85});
  expect(record.collapsed.overflow).toBe(false);if(record.expanded)expect(record.expanded.overflow).toBe(false);
  findings.push(record);await page.close();
 }
}finally{await browser.close();}
await writeFile(`${root}/findings.json`,JSON.stringify({phase,baseline:'983c8b781a219fe11cde92deed1d030dcde37bd6',environment:'Windows Chrome, actual current public GET records and original portrait. Phone/tablet and reduced motion are browser emulation, not physical-device testing. Complete screenshots extend camera height.',findings},null,2)+'\n');
if(findings.some(r=>r.errors.length||r.writes.length))throw Error('Browser errors or API writes');
