// Read-only public route audit. Local data uses captured records and real media.
import { chromium, firefox, webkit, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const mode = process.argv[2] || 'baseline';
const engine = process.argv[3] || 'chromium';
const production = mode === 'production';
const base = production ? 'https://mahmoud-portfolio-omega.vercel.app' : 'http://127.0.0.1:5184';
const output = `docs/design/phase5/${mode}-${engine}`;
await mkdir(output, {recursive:true});
const content = production ? {} : JSON.parse(await readFile('.motion-preview/phase3-public-content.json','utf8'));
if (production) for (const path of ['/api/projects','/api/profile','/api/site-content']) {
  const response = await fetch(base+path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  content[path] = await response.json();
}
const originals = JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json','utf8')).records;
const paths = ['/', '/projects', ...content['/api/projects'].map(p=>`/projects/${p.slug}`), '/profile','/contact','/job-match'];
const sizes = production ? [[1363,936],[390,844]] : [[1363,936],[1024,1366],[390,844],[320,844],[844,390],[640,468]];
const browser = await ({chromium,firefox,webkit}[engine]).launch(engine==='chromium'?{channel:'chrome'}:{});
const findings = [];
try {
  for (const [width,height] of sizes) {
    const context = await browser.newContext({viewport:{width,height}, reducedMotion:'reduce', ...(engine!=='firefox'?{hasTouch:width<=1024}:{}), recordVideo:width===390?{dir:'.motion-preview/phase5-videos',size:{width,height}}:undefined});
    const page = await context.newPage(), errors=[], writes=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=> ['GET','HEAD'].includes(route.request().method())?route.continue():(writes.push(new URL(route.request().url()).pathname),route.abort()));
    await page.route('**/api/**',route=> {
      const path = new URL(route.request().url()).pathname;
      const detail = content['/api/projects'].find(p=>path===`/api/projects/${p.slug}`);
      const body = production ? detail : (content[path]??detail);
      return body ? route.fulfill({json:body}) : production?route.continue():route.abort();
    });
    if (!production) for(const item of originals) await page.route(item.src,async route=>{
      const bytes = await readFile(item.file);
      if(createHash('sha256').update(bytes).digest('hex')!==item.sha256) throw new Error('Media hash changed');
      return route.fulfill({contentType:'image/png',body:bytes});
    });
    for (const path of paths) {
      const name = path==='/'?'collection':path.replaceAll('/','-').slice(1);
      const response = await page.goto(base+path,{waitUntil:'domcontentloaded'});
      await expect(page.locator('.landscape-route > main')).toBeVisible();
      await page.evaluate(()=>document.fonts.ready);
      if(path.startsWith('/projects/')) await expect(page.locator('.case-figure .screenshot-frame')).toHaveAttribute('data-image-state',/ready|error/);
      await page.screenshot({path:`${output}/${name}-${width}.jpg`,quality:80});
      const geometry = await page.evaluate(()=>({
        document:document.documentElement.scrollWidth<=innerWidth,
        main: (()=>{const el=document.querySelector('.landscape-route > main');return getComputedStyle(el).overflowX==='hidden'||el.scrollWidth<=el.clientWidth+1;})(),
        mainOverflowX:getComputedStyle(document.querySelector('.landscape-route > main')).overflowX,
        active:[...document.querySelectorAll('.site-header nav [aria-current]')].map(e=>e.textContent),
        headings:[...document.querySelectorAll('main h1')].map(e=>e.textContent),
        smallTargets:[...document.querySelectorAll('main button,.site-header a,.stage-footer button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.height<24||r.width<24);}).map(e=>({name:e.getAttribute('aria-label')||e.textContent,rect:e.getBoundingClientRect().toJSON()})),
      }));
      const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
      const row={path,width,height,status:response.status(),geometry,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))})),incomplete:axe.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
      findings.push(row);
      await writeFile(`${output}/findings.json`,JSON.stringify({date:new Date().toISOString(),environment:production?'Actual production UI and live public list/profile/site GETs; detail counters intercepted from current public list':'Local compiled build; frozen public GET snapshot and SHA-verified actual media; writes blocked',browser:engine,physicalDevice:false,screenReader:false,findings,errors,writes},null,2)+'\n');
      console.log(`${mode} ${engine} ${width} ${path}: overflow=${!geometry.document||!geometry.main}, axe=${row.violations.map(v=>v.id).join(',')}`);
    }
    if(width===390){const video=page.video();await context.close();await video.saveAs(`${output}/routes-390.webm`);}else await context.close();
  }
}finally{await browser.close();}
