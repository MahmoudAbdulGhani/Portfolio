// Matched compiled review-only demo captures. Public source snapshot/real
// images are separate from synthetic regression fixtures; no backend writes.
import { chromium, expect } from '@playwright/test';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
const option=key=>process.argv.find(a=>a.startsWith(`--${key}=`))?.slice(key.length+3);
const phase=option('phase')??'before',root=path.resolve(option('dist')??'.motion-preview/demo54-before-dist');
const output=`docs/design/featured-demo-introductions/${phase}`;
const snapshot='.motion-preview/phase2-content.json';
const data=JSON.parse(await fs.readFile(snapshot,'utf8'));
const remote=new Map();
for(const p of data['/api/projects'].filter(p=>p.slug.startsWith('construction-')))for(const url of [p.coverImage,...p.screenshots].filter(x=>x.startsWith('https://'))){
  const response=await fetch(url);if(!response.ok)throw Error(`Source GET ${response.status}`);
  remote.set(url,{body:Buffer.from(await response.arrayBuffer()),contentType:response.headers.get('content-type')??'image/png'});
}
const app=express();app.use(express.static(root));app.get('*',(_,res)=>res.sendFile(path.join(root,'index.html')));
const server=app.listen(Number(option('port')??5250),'127.0.0.1');await new Promise(r=>server.once('listening',r));
const browser=await chromium.launch({channel:'chrome'}),results=[];
const sizes=[[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]];
try{for(const kind of ['cedar','lobby'])for(const place of ['preview','reader']){
  const folder=`${output}/${kind}/${place}`;await fs.mkdir(folder,{recursive:true});
  for(const [width,height]of sizes){
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],writes=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://**',r=>remote.has(r.request().url())?r.fulfill(remote.get(r.request().url())):r.continue());
    await page.route('**/api/**',r=>{
      const p=new URL(r.request().url()).pathname;
      if(!['GET','HEAD'].includes(r.request().method())){writes.push(p);return r.fulfill({status:403,json:{message:'Read-only review'}});}
      return r.fulfill({json:data[p]??data['/api/projects'].find(project=>p===`/api/projects/${project.slug}`)??[]});
    });
    const slug=kind==='cedar'?'construction-project-management-accounting-system':'lobby';
    await page.goto(`http://127.0.0.1:${server.address().port}/review/featured/${kind}/candidate${place==='reader'?'/reader':`?project=${slug}#${kind}-engineering`}`);
    const boundary=page.locator(`.${kind}-boundary`);await expect(boundary).toBeVisible();await page.evaluate(()=>document.fonts.ready);
    if(place==='preview')await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
    const scroll=async(target=boundary)=>target.evaluate(el=>{const header=document.querySelector('.site-header').getBoundingClientRect();scrollBy({top:el.getBoundingClientRect().top-header.bottom-24,behavior:'instant'});});
    const capture=async(state,scale=1)=>{
      await scroll(['initial','text-200'].includes(state)?boundary:boundary.locator(kind==='cedar'?'.cedar-interpretation':'.lobby-result'));await page.mouse.move(1,1);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const file=`${width}-${height}-${state}.jpg`;await page.screenshot({path:`${folder}/${file}`,quality:85});
      const metrics=await boundary.evaluate((el,kind)=>{
        const box=s=>el.querySelector(s).getBoundingClientRect().toJSON();
        const title=el.querySelector(`.${kind}-title`),label=el.querySelector(`.${kind}-label`),progress=el.querySelector(`.${kind}-progress`),items=[...progress.children];
        return {title:box(`.${kind}-title`),label:box(`.${kind}-label`),progress:box(`.${kind}-progress`),steps:items.map(n=>({text:n.textContent,box:n.getBoundingClientRect().toJSON(),current:n.getAttribute('aria-current'),overflow:n.scrollWidth>n.clientWidth})),first:box(kind==='cedar'?'.cedar-inputs':'.lobby-participant-control'),control:box('select'),labelFont:getComputedStyle(label).fontSize,labelLine:getComputedStyle(label).lineHeight,headingFont:getComputedStyle(title).fontSize,bodyFont:getComputedStyle(el.querySelector(kind==='cedar'?'.cedar-cost-basis':'.lobby-explanation')).fontSize,controlFont:getComputedStyle(el.querySelector('select')).fontSize,pageOverflow:document.documentElement.scrollWidth>innerWidth,footer:document.querySelector('.stage-footer').getBoundingClientRect().toJSON()};
      },kind);
      results.push({kind,place,width,height,state,scale,file:`${kind}/${place}/${file}`,metrics,errors:[...errors],writes:[...writes]});
      expect(metrics.pageOverflow).toBe(false);console.log(`${phase} ${kind} ${place} ${width} ${state}`);
    };
    await capture('initial');
    if([390,1440].includes(width)){
      if(kind==='cedar'){
        await boundary.getByRole('button',{name:'Interpret the figures',exact:true}).click();await capture('active');
        await boundary.getByLabel('Average phase progress').selectOption('75');await expect(boundary).toHaveAttribute('data-outdated','true');await capture('outdated');
        await boundary.getByRole('button',{name:'Refresh sample interpretation',exact:true}).click();await expect(boundary).toHaveAttribute('data-outdated','false');await capture('refreshed');
      }else{
        await boundary.getByRole('button',{name:'Try to enter the call',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','denied');await capture('denied');
        await boundary.getByLabel('Fictional participant',{exact:true}).selectOption('rowan');await boundary.getByRole('button',{name:'Join with the invitation',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','rejected');await capture('rejected');
        await boundary.getByLabel('Fictional participant',{exact:true}).selectOption('mira');await boundary.getByRole('button',{name:'Join with the invitation',exact:true}).click();await capture('active');
        await boundary.getByRole('button',{name:'Try to enter the call',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','allowed');await capture('allowed');
      }
      await boundary.getByRole('button',{name:'Reset',exact:true}).click();await expect(boundary).toHaveAttribute('data-phase','inspect');
    }
    if([320,390,430,768].includes(width)){
      // Explicit 200% text-only emulation: snapshot computed sizes first so
      // child inheritance cannot multiply the increase. Layout/padding remain.
      await boundary.evaluate(root=>{const nodes=[root,...root.querySelectorAll('*')];const styles=nodes.map(el=>({el,size:parseFloat(getComputedStyle(el).fontSize)*2,line:parseFloat(getComputedStyle(el).lineHeight)*2}));for(const {el,size,line}of styles){el.style.fontSize=`${size}px`;if(Number.isFinite(line))el.style.lineHeight=`${line}px`;}});
      await capture('text-200',2);
    }
    await context.close();
  }
}}finally{await browser.close();server.close();}
await fs.writeFile(`${output}/findings.json`,JSON.stringify({phase,source:root,snapshot:'Same archived read-only public GET snapshot used for PR54; original source bytes, no content write.',method:'Windows Chrome compiled build, reduced-motion to compare settled typography. Initial/enlarged captures align the demo header; active/error/completed captures align the actual interpretation/result. Text enlargement explicitly doubles demo text sizes/line heights without scaling layout; site header/footer remain at normal size. Not whole-site text enlargement, physical-device or actual browser zoom testing.',results},null,2));
if(results.some(r=>r.errors.length||r.writes.length))throw Error('Page errors or attempted writes');
