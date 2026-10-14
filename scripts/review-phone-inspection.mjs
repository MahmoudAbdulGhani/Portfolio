// Frozen public GET records and actual assets only; no writes or provider calls.
import {chromium,expect} from '@playwright/test';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
const phase=process.argv[2]??'after',out=`docs/design/phone-opening-inspection/${phase}`;
const base=process.env.PHONE_REVIEW_BASE_URL??'http://127.0.0.1:5185';
await mkdir(out,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const browser=await chromium.launch({channel:'chrome'}),findings=[];
const bind=async page=>{
 await page.route('**/api/**',r=>r.fulfill({json:content[new URL(r.request().url()).pathname]??content['/api/projects'].find(p=>new URL(r.request().url()).pathname===`/api/projects/${p.slug}`)??[]}));
 await page.route('https://**',async r=>{try{await r.fulfill({contentType:'image/png',body:await readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(r.request().url()).pathname)}`)});}catch{await r.abort();}});
};
try{
for(const width of process.argv.includes('--recordings-only')?[]:[320,390,430,768,1440]){
 const context=await browser.newContext({viewport:{width,height:width===1440?900:936},reducedMotion:'reduce'}),page=await context.newPage();await bind(page);
 for(const project of content['/api/projects'].filter(p=>p.published&&p.showOnPortfolio!==false&&(!process.argv.includes('--portraits-only')||['construction-project-management-accounting-system','full-stack-user-management-system'].includes(p.slug)))){
  await page.goto(`${base}/projects/${project.slug}`);
  const frame=page.locator('.case-figure .screenshot-frame');await frame.scrollIntoViewIfNeeded();await expect(frame).toHaveAttribute('data-image-state','ready');
  await page.screenshot({path:`${out}/${width}-${project.slug}-reader.jpg`,fullPage:true,quality:77});
  const bounds=await page.evaluate(()=>({header:document.querySelector('.site-header').getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth,frame:document.querySelector('.case-figure .screenshot-frame').getBoundingClientRect().height}));
  await page.locator('.media-enlarge').click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state','ready');
  await page.screenshot({path:`${out}/${width}-${project.slug}-fit.jpg`,quality:80});
  await dialog.getByRole('button',{name:'Actual size',exact:true}).click();await dialog.locator('.project-image-current img').evaluate(image=>image.decode());await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state','ready');
  await page.screenshot({path:`${out}/${width}-${project.slug}-inspect.jpg`,quality:80});
  await page.keyboard.press('Escape');await expect(page.locator('.media-enlarge')).toBeFocused();findings.push({width,project:project.slug,...bounds});
  if(project.slug==='construction-project-management-accounting-system'||project.slug==='full-stack-user-management-system'){
   await page.locator('.case-media-chooser summary').click();await page.locator('.case-media-chooser button').nth(1).click();await expect(frame).toHaveAttribute('data-image-state','ready');
   await page.screenshot({path:`${out}/${width}-${project.slug}-portrait-reader.jpg`,quality:80});await page.locator('.media-enlarge').click();await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state','ready');
   await page.screenshot({path:`${out}/${width}-${project.slug}-portrait-fit.jpg`,quality:80});await dialog.getByRole('button',{name:'Actual size',exact:true}).click();await dialog.locator('.project-image-current img').evaluate(image=>image.decode());await expect(dialog.locator('.project-image-handoff')).toHaveAttribute('data-image-state','ready');await page.screenshot({path:`${out}/${width}-${project.slug}-portrait-inspect.jpg`,quality:80});await page.keyboard.press('Escape');
  }
  if(phase==='after'&&project.slug==='jobpilot-ai'){
   const demo=page.locator('.project-reader .profile-boundary');await demo.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${width}-boundary-rest.jpg`,quality:80});
   await demo.getByRole('button',{name:'Propose a change',exact:true}).click();await demo.getByRole('button',{name:'Review the change',exact:true}).click();await demo.getByRole('button',{name:'Change the saved profile during review.',exact:true}).click();await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();await page.screenshot({path:`${out}/${width}-boundary-stale.jpg`,quality:80});await demo.getByRole('button',{name:'Review again',exact:true}).click();await demo.getByRole('button',{name:'Accept reviewed change',exact:true}).click();await page.screenshot({path:`${out}/${width}-boundary-accepted.jpg`,quality:80});
  }
 }
 await context.close();
}
for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:width===1440?900:844},recordVideo:{dir:out,size:{width,height:width===1440?900:844}},reducedMotion:'no-preference'}),page=await context.newPage();await bind(page);
 let release;const pending=new Promise(r=>{release=r;});await page.route('**/710055a0-a275-4e6a-991d-4aaa23c6e549.png',async r=>{await pending;await r.fulfill({contentType:'image/png',body:await readFile('.motion-preview/phase3-public-media/710055a0-a275-4e6a-991d-4aaa23c6e549.png')});});
 await page.goto(`${base}/`,{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();await page.waitForTimeout(3500);await page.screenshot({path:`${out}/${width}-pending.jpg`,quality:82});release();await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');await page.waitForTimeout(350);
 await page.locator('.open-case').click();await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');await page.locator('.media-enlarge').click();await page.waitForTimeout(450);const dialog=page.getByRole('dialog');if(phase==='after'){await dialog.getByRole('button',{name:'Zoom in',exact:true}).click();await page.waitForTimeout(300);}await dialog.getByRole('button',{name:'Actual size',exact:true}).click();await expect(page.locator('.case-inspector .project-image-handoff')).toHaveAttribute('data-image-state','ready');await page.locator('.case-inspector-image').evaluate(el=>el.scrollTo(300,160));await page.waitForTimeout(550);await dialog.getByRole('button',{name:'Fit',exact:true}).click();await page.waitForTimeout(200);await dialog.getByRole('button',{name:'Close gallery',exact:true}).click();await expect(page.locator('.media-enlarge')).toBeFocused();await page.waitForTimeout(350);const video=page.video();await context.close();await rename(await video.path(),`${out}/${width}-opening-inspection.webm`);
}
}finally{await browser.close();}
if(findings.length)await writeFile(`${out}/${process.argv.includes('--portraits-only')?'portrait-findings':'findings'}.json`,JSON.stringify(findings,null,2));console.log(`${phase}: ${findings.length} reader reviews, fit/inspection views and two recordings`);
