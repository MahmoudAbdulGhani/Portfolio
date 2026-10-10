import { readFile,writeFile,stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { chromium } from '@playwright/test';
const root=path.resolve('docs/design/phase4');
const after=JSON.parse(await readFile(path.join(root,'after/findings.json'),'utf8'));
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fallback=`<section><h2>Controlled photographic fallback</h2><p>Unsupported WebGL is deliberately simulated. These recordings use actual media and do not establish hardware-GPU behavior.</p>${after.findings.filter(f=>[1363,390].includes(f.width)).map(f=>`<p><a href="fallback/${f.kind}-${f.width}.webm">${escape(f.kind)} ${f.width}px photographic handoff, return and interruption</a></p>`).join('')}</section>`;
const cards=after.findings.map(f=>`<section><h2>${escape(f.kind)} · ${f.width}px</h2><p>Actual ${escape(f.device.renderer)}. Opening/return; after video also includes interrupted opening and repeated Escape. Reserved frame ${f.geometry.width} × ${f.geometry.height}; caption gap ${f.geometry.captionGap}px. Idle draw delta ${f.idleDrawDelta}.</p><div class="pair">${['before','after'].map(phase=>`<figure><figcaption>${phase==='before'?'Approved 66bba23':'Phase 4'}</figcaption><video controls muted playsinline preload="metadata" src="${phase}/${f.kind}-${f.width}.webm"></video></figure>`).join('')}</div><p><a href="after/${f.kind}-${f.width}-sequence.jpg">After sequence frames</a> · <a href="before/${f.kind}-${f.width}-sequence.jpg">Before sequence frames</a></p></section>`).join('');
await writeFile(path.join(root,'review.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Phase 4 motion evidence</title><style>body{font:16px/1.6 system-ui;background:#ecebe3;color:#202629;margin:24px auto;padding:0 20px;max-width:1400px}h1{font-size:32px}section{border-top:1px solid #c8c6bc;padding:24px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}video{display:block;width:100%;max-height:650px;background:#ecebe3}a{color:#34483d}@media(max-width:600px){.pair{grid-template-columns:1fr}}</style><h1>Phase 4 motion evidence</h1><p>Before: approved 66bba23. After: local production build. All 12 pairs use the installed Chrome and actual Intel GPU, actual unchanged sculpture/project assets and frozen public GET records. API writes/counters blocked. Phone/tablet viewport emulation is not physical-device testing. These videos are distinct from synthetic regression fixtures, fallback tests and geometry checks.</p><p><a href="diagnosis/baseline-frame-stalls.json">Baseline clock diagnosis</a> · <a href="diagnosis/clock-fix-frame-stalls.json">Same timing after clock correction</a> · <a href="after/findings.json">After measurements</a> · <a href="effects-cost.json">Retained effect costs</a></p>${cards}${fallback}<section><h2>Supporting pages</h2>${[1363,1024,390,320].map(width=>`<p>${width}px: <a href="supporting-pages/pages-${width}.webm">Profile → Projects → JobPilot → GameZone → Contact → Job Match → reduced motion</a></p>`).join('')}<p><a href="supporting-pages/findings.json">Checks and data provenance</a></p></section>`);
if(!process.argv.includes('--frames')) process.exit(0);
const server=createServer(async(req,res)=>{
  try {
    const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));
    if(!target.startsWith(root+path.sep)||!['GET','HEAD'].includes(req.method)) {res.writeHead(403).end();return;}
    const file=await stat(target),range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    const type=target.endsWith('.webm')?'video/webm':'text/html';
    if(range){const start=Number(range[1]),end=range[2]?Number(range[2]):file.size-1;res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${file.size}`,'Content-Length':end-start+1});createReadStream(target,{start,end}).pipe(res);}
    else{res.writeHead(200,{'Content-Type':type,'Content-Length':file.size,'Accept-Ranges':'bytes'});createReadStream(target).pipe(res);}
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(5191,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome'});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  for(const phase of ['before','after']) for(const f of after.findings) {
    await page.goto('http://127.0.0.1:5191/review.html');
    await page.evaluate(async({phase,kind,width})=>{
      document.body.innerHTML='';document.body.style.cssText='margin:0;max-width:none;padding:0;background:#ecebe3';
      const video=document.createElement('video');video.muted=true;video.src=`${phase}/${kind}-${width}.webm`;
      await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=reject;});
      const cellWidth=width<500?200:320,cellHeight=Math.ceil(cellWidth*video.videoHeight/video.videoWidth)+30;
      const canvas=document.createElement('canvas');canvas.width=cellWidth*8;canvas.height=cellHeight*8;
      document.body.append(canvas);const ctx=canvas.getContext('2d');ctx.fillStyle='#ecebe3';ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let index=0;index<64;index++) {
        const time=Math.max(.01,video.duration*(index+.2)/64);
        await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});
        ctx.drawImage(video,index%8*cellWidth,Math.floor(index/8)*cellHeight,cellWidth,cellHeight-30);
        ctx.fillStyle='#202629';ctx.font='14px system-ui';ctx.fillText(`${phase} ${kind} ${width}px · ${time.toFixed(2)}s`,index%8*cellWidth+6,Math.floor(index/8)*cellHeight+cellHeight-9);
      }
    },{phase,kind:f.kind,width:f.width});
    await page.locator('canvas').screenshot({path:path.join(root,phase,`${f.kind}-${f.width}-sequence.jpg`),quality:85});
    console.log(`${phase} ${f.kind} ${f.width}px whole-video frames`);
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
