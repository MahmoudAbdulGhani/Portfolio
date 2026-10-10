import { chromium, firefox, webkit, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const engine=process.argv[2]||'chromium';
const production=process.argv.includes('--production');
const base=production?'https://mahmoud-portfolio-omega.vercel.app':'http://127.0.0.1:5184';
const output=`docs/design/phase5/${production?'production-':''}interactions-${engine}`;
await mkdir(output,{recursive:true});
const records=production?{}:JSON.parse(await readFile('.motion-preview/phase3-public-content.json','utf8'));
if(production)records['/api/projects']=await fetch(base+'/api/projects').then(r=>r.json());
const originals=JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json','utf8')).records;
const browser=await ({chromium,firefox,webkit}[engine]).launch(engine==='chromium'?{channel:'chrome'}:{});
const findings=[];
try{
 for(const width of [1363,390]){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
  await page.route('**/api/**',r=>{const path=new URL(r.request().url()).pathname;const body=records[path]??records['/api/projects'].find(p=>path===`/api/projects/${p.slug}`);return body?r.fulfill({json:body}):production?r.continue():r.abort();});
  if(!production)for(const original of originals)await page.route(original.src,async r=>r.fulfill({contentType:'image/png',body:await readFile(original.file)}));
  for(const project of records['/api/projects'].filter(p=>!production||['jobpilot-ai','gamezone-arena'].includes(p.slug))){
   await page.goto(`${base}/projects/${project.slug}`);
   const frame=page.locator('.case-figure .screenshot-frame');
   await expect(frame).toHaveAttribute('data-image-state','ready');
   const trigger=page.locator('.case-figure').getByRole('button',{name:/Enlarge/});
   await trigger.click();
   const dialog=page.getByRole('dialog');
   await expect(dialog).toBeVisible();
   await expect(page.getByRole('button',{name:'Close gallery'})).toBeFocused();
   await page.keyboard.press('ArrowRight');
   await page.getByRole('button',{name:'Actual size',exact:true}).click();
   const region=dialog.getByRole('region');
   await region.focus();
   await page.keyboard.press('ArrowDown');
   const actual=await region.evaluate(e=>({scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,scrollTop:e.scrollTop}));
   const focusObservations=[];
   for(let tab=0;tab<12;tab++){
    await page.keyboard.press('Tab');
    const focus=await dialog.evaluate(e=>({contained:e.contains(document.activeElement),active:document.activeElement.outerHTML.slice(0,250),open:e.open}));
    focusObservations.push(focus);
    if(!focus.contained){await writeFile(`${output}/focus-before-fix.json`,JSON.stringify({width,slug:project.slug,tab,focus},null,2));await page.screenshot({path:`${output}/focus-before-fix.jpg`});}
    if(!production)expect(focus.contained).toBe(true);
   }
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   await page.screenshot({path:`${output}/${project.slug}-inspector-${width}.jpg`,quality:80});
   await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
   const chooser=page.locator('.case-media-chooser');
   await chooser.locator('summary').click();
   const buttons=chooser.locator('button');
   if(await buttons.count()>1)await buttons.nth(1).click();else await chooser.locator('summary').click();
   await expect(frame).toHaveAttribute('data-image-state','ready');
   for(const disclosure of await page.locator('.case-disclosure').all()){
     const summary=disclosure.locator('summary');await summary.click();await expect(summary).toHaveAttribute('aria-expanded','true');await summary.click();await expect(disclosure).not.toHaveAttribute('open');
   }
   const workflows=page.locator('.workflow-frames .screenshot-frame');
   const heights=[];
   for(const workflow of await workflows.all()){const before=(await workflow.boundingBox()).height;await workflow.scrollIntoViewIfNeeded();await expect(workflow).toHaveAttribute('data-image-state','ready');heights.push({before,after:(await workflow.boundingBox()).height});}
   findings.push({width,slug:project.slug,actual,focusObservations,focusContained:focusObservations.every(x=>x.contained),focusReturned:true,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),workflowHeights:heights});
   console.log(`${engine} ${width} ${project.slug}: inspector/selection/disclosures/workflows checked, axe ${axe.violations.length}`);
  }
  for(const path of ['/contact','/job-match']){
   await page.goto(`${base}${path}`);
   for(const viewport of [{width:320,height:568},{width:844,height:390},{width:390,height:390},{width:1280,height:936}]){
    await page.setViewportSize(viewport);
    const field=page.locator(path==='/contact'?'#contact-message':'#job-description');await field.focus();await field.scrollIntoViewIfNeeded();
    const geometry=await field.evaluate(e=>({rect:e.getBoundingClientRect().toJSON(),viewport:{width:innerWidth,height:innerHeight},overflow:document.documentElement.scrollWidth>innerWidth}));
    expect(geometry.overflow).toBe(false);
    await page.screenshot({path:`${output}/${path.slice(1)}-focused-${viewport.width}x${viewport.height}-${width}.jpg`,quality:80});
    findings.push({path,startWidth:width,viewport,geometry,focused:true,keyboard:'Reduced viewport simulation; no physical on-screen keyboard'});
   }
  }
  await context.close();
 }
}finally{await browser.close();}
await writeFile(`${output}/findings.json`,JSON.stringify({date:new Date().toISOString(),environment:production?'Actual production UI/live images; current public list intercepts detail counters; writes blocked. Bounded JobPilot/GameZone smoke. Emulated viewports, not physical device.':'Local compiled build; captured public records and actual assets; intercepted counters and blocked writes. Native reduced motion for keyboard/media review. Emulated sizes and viewport reduction are not physical keyboard or Safari observations.',engine,findings},null,2)+'\n');
