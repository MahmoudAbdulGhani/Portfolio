// Immutable approved review build versus normal adopted routes. Read-only
// public snapshot and archived genuine source bytes; no service mutations.
import {chromium,expect} from '@playwright/test';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const data=JSON.parse(await fs.readFile('.motion-preview/phase2-content.json','utf8')),servers=[],results=[];
const root='docs/design/featured-adoption';await fs.mkdir(root,{recursive:true});
for(const [folder,port] of [['.motion-preview/phase2-approved-dist',5260],['.motion-preview/featured-production-ci',5261]]){
  const dist=path.resolve(folder),app=express();app.use(express.static(dist));app.get('*',(_,r)=>r.sendFile(path.join(dist,'index.html')));
  const server=app.listen(port,'127.0.0.1');await new Promise(r=>server.once('listening',r));servers.push(server);
}
const unrelated=['/','/projects','/?project=jobpilot-ai','/projects/jobpilot-ai','/profile','/contact','/job-match',...data['/api/projects'].filter(p=>!['jobpilot-ai','lobby','construction-project-management-accounting-system'].includes(p.slug)).map(p=>`/projects/${p.slug}`)];
const browser=await chromium.launch({channel:'chrome'});
try{for(const [width,height] of [[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]]){
  const routes=[];
  for(const [kind,slug] of [['cedar','construction-project-management-accounting-system'],['lobby','lobby']])for(const place of ['preview','reader'])routes.push({kind,place,before:`/review/featured/${kind}/candidate${place==='reader'?'/reader':`?project=${slug}`}`,after:place==='reader'?`/projects/${slug}`:`/?project=${slug}`});
  if([390,1440].includes(width))routes.push(...unrelated.map(url=>({kind:'unrelated',place:url,before:url,after:url})));
  for(const route of routes){
    const pair=[];
    for(const [index,port] of [5260,5261].entries()){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
      await page.route('**/api/**',r=>{
        if(!['GET','HEAD'].includes(r.request().method()))throw Error('Read-only comparison');
        const p=new URL(r.request().url()).pathname;return r.fulfill({json:data[p]??data['/api/projects'].find(x=>p===`/api/projects/${x.slug}`)??[]});
      });
      await page.route(/^https:\/\//,async r=>{
        try{const body=await fs.readFile(`.motion-preview/phase3-public-media/${path.basename(new URL(r.request().url()).pathname)}`);return r.fulfill({contentType:'image/png',body});}catch{return r.continue();}
      });
      const address=index?route.after:route.before;await page.goto(`http://127.0.0.1:${port}${address}`);
      await page.evaluate(()=>document.fonts.ready);
      if(address.includes('?project=')){
        await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
        try{await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');}
        catch(error){console.log(JSON.stringify({address,index,images:await page.locator('.product-surface img').evaluateAll(nodes=>nodes.map(n=>({src:n.src,current:n.currentSrc,complete:n.complete,width:n.naturalWidth})))}));throw error;}
      }
      if(address.includes('/reader')||address.startsWith('/projects/'))await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state','ready');
      await page.evaluate(async()=>{await Promise.all([...document.images].filter(n=>{const b=n.getBoundingClientRect();return b.top<innerHeight&&b.bottom>0;}).map(n=>n.decode().catch(()=>{})));});
      await page.mouse.move(1,1);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const target=page.locator('main'),bytes=await page.screenshot();
      const geometry=await target.evaluate(el=>[...el.querySelectorAll('h1,h2,.selection-image-frame,.selection-project-links,.chapter-switch,.case-figure,.cedar-label,.lobby-label')].map(n=>{const b=n.getBoundingClientRect();return[n.textContent,...['x','y','width','height'].map(k=>Math.round(b[k]*100)/100)];}));
      // Direct-entry return-link text differs intentionally; full narrative copy
      // and all other controls remain compared, including hidden disclosures.
      let text=await target.innerText();if(route.place==='reader')text=text.replace(/^Collection\n/,'All projects\n');
      pair.push({text,geometry,pixels:crypto.createHash('sha256').update(bytes).digest('hex')});await page.close();
    }
    const row={width,height,...route,textIdentical:pair[0].text===pair[1].text,geometryIdentical:JSON.stringify(pair[0].geometry)===JSON.stringify(pair[1].geometry),pixelsIdentical:pair[0].pixels===pair[1].pixels};results.push(row);console.log(JSON.stringify(row));
    if(!row.textIdentical||!row.geometryIdentical)await fs.writeFile(`${root}/difference-${results.length}.json`,JSON.stringify(pair,null,2));
  }
}}finally{await browser.close();servers.forEach(s=>s.close());}
await fs.writeFile(`${root}/adoption-comparison.json`,JSON.stringify({method:'Immutable PR55 compiled review candidates vs normal adopted build; same archived public GET snapshot and genuine cached source bytes. Windows Chrome reduced-motion viewport emulation; not fresh CMS, fixture or physical-device verification. Direct-reader Collection/All projects return text is normalized only in comparison.',results},null,2));
if(results.some(r=>!r.textIdentical||!r.geometryIdentical))process.exitCode=1;
