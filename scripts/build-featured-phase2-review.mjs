import { chromium } from '@playwright/test';
import express from 'express';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const project=process.argv[2]??'cedar';
const root=`docs/design/featured-phase2/${project}`,temp=`.motion-preview/phase2-frames/${project}`;
const beforeLabel='Before (PR #53)',afterLabel='Phase 2 review candidate';
const sizes=[[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]],steps={preview:'Selected preview','demo-preview':'Preview demonstration',reader:'Reader opening','demo-reader':'Reader demonstration'};
await mkdir(`${root}/transitions`,{recursive:true});await mkdir(temp,{recursive:true});
const label=(text,width)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28"><rect width="100%" height="100%" fill="#ecebe3"/><text x="8" y="19" font-family="Arial,sans-serif" font-size="14" fill="#202629">${text}</text></svg>`);
for(const[width,height]of sizes)for(const step of Object.keys(steps)){
  await sharp({create:{width:width*2+16,height:height+36,channels:3,background:'#ecebe3'}}).composite([
    {input:label(beforeLabel,width),left:0,top:0},{input:label(afterLabel,width),left:width+16,top:0},
    {input:`${root}/before/normal/${width}-${height}-${step}.jpg`,left:0,top:36},{input:`${root}/candidate/normal/${width}-${height}-${step}.jpg`,left:width+16,top:36},
  ]).jpeg({quality:89}).toFile(`${root}/comparison-${width}-${step}.jpg`);
}
const app=express();app.use(express.static(path.resolve(root)));app.get('/player',(_,res)=>res.send('<!doctype html><video muted controls playsinline></video>'));
const server=app.listen(5244,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const videos=[];
const browser=await chromium.launch({channel:'chrome'});
try{for(const phase of ['before','candidate']){
  const findings=JSON.parse(await readFile(`${root}/${phase}/normal/findings.json`,'utf8'));
  for(const width of [390,1440]){
    const row=findings.findings.find(r=>r.width===width),opening=row.transition.find(f=>f.phase==='opening');
    if(!opening)throw Error(`${phase} ${width}: no observed opening`);
    const page=await browser.newPage();await page.goto('http://127.0.0.1:5244/player');
    await page.locator('video').evaluate(async(video,src)=>{video.src=src;await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=reject;});await video.play();},`/${phase}/normal/${width}-journey.webm`);
    await page.waitForTimeout(1200);
    await page.locator('video').evaluate(v=>v.pause());
    const metadata=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,decodedFrames:v.getVideoPlaybackQuality().totalVideoFrames,droppedFrames:v.getVideoPlaybackQuality().droppedVideoFrames}));
    const start=Math.max(0,opening.time/1000-.25),frames=[],layers=[],thumbWidth=width===390?156:320,thumbHeight=Math.round(thumbWidth*metadata.height/metadata.width);
    for(let i=0;i<40;i++){
      const time=Math.min(metadata.duration-.02,start+i/25);
      const data=await page.locator('video').evaluate(async(video,time)=>{
        video.pause();if(Math.abs(video.currentTime-time)>.0001)await new Promise(resolve=>{video.addEventListener('seeked',resolve,{once:true});video.currentTime=time;});
        const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);return canvas.toDataURL('image/png').split(',')[1];
      },time);
      const buffer=Buffer.from(data,'base64'),file=`${temp}/${phase}-${width}-${i}.png`;await writeFile(file,buffer);
      const x=(i%8)*thumbWidth,y=Math.floor(i/8)*(thumbHeight+28);
      layers.push({input:label(`${time.toFixed(2)}s`,thumbWidth),left:x,top:y},{input:await sharp(buffer).resize({width:thumbWidth}).toBuffer(),left:x,top:y+28});
      let key;
      if(i%6===0){key=`transitions/${phase}-${width}-${i}.jpg`;await sharp(buffer).jpeg({quality:90}).toFile(`${root}/${key}`);}
      frames.push({time,key});
    }
    const sheet=`transitions/${phase}-${width}-opening-sheet.jpg`;
    await sharp({create:{width:thumbWidth*8,height:(thumbHeight+28)*5,channels:3,background:'#ecebe3'}}).composite(layers).jpeg({quality:89}).toFile(`${root}/${sheet}`);
    videos.push({phase,width,metadata,sheet,frames});await page.close();
  }
}}finally{await browser.close();server.close();}
await writeFile(`${root}/video-inspection.json`,JSON.stringify({method:'Native browser recordings decoded and briefly played in Chrome, then sampled through the opening; decoded source frames sampled at 25fps over the opening with lead-in/out. DOM phase timing supplies an approximate recording anchor; actual frame timestamps are listed. No staged screenshot animation, speed changes or audio muxing. Decoder counts are not a GPU benchmark or physical-device result.',videos},null,2));
const after=JSON.parse(await readFile(`${root}/candidate/normal/findings.json`,'utf8')),before=JSON.parse(await readFile(`${root}/before/normal/findings.json`,'utf8'));
const intersects=(a,b)=>a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
const geometry=after.findings.map(row=>{
  const poses=row.transition.filter(f=>f.phase==='opening'&&f.subject),previous=before.findings.find(r=>r.width===row.width).transition.filter(f=>f.image).at(-1),last=row.transition.filter(f=>f.image).at(-1);
  return{width:row.width,renderer:row.renderer,gpu:row.gpu,samples:poses.length,beforeImageTop:previous?.image.top,afterImageTop:last?.image.top,uiIntersections:poses.filter(f=>['identity','actions','choices','back'].some(k=>intersects(f.rig,f[k]))).length,subjectOutsideCanvas:poses.filter(f=>f.subject.left<-.5||f.subject.top<-.5||f.subject.right>f.rig.width+.5||f.subject.bottom>f.rig.height+.5).length,minimumMargin:Math.min(...poses.flatMap(f=>[f.subject.left,f.subject.top,f.rig.width-f.subject.right,f.rig.height-f.subject.bottom]))};
});
await writeFile(`${root}/geometry-summary.json`,JSON.stringify({method:'Observed conservative mesh-box projections and canvas/UI rectangles from the actual-source local WebGL run. Counts describe sampled poses, not GPU smoothness, physical-device performance or every possible future frame.',geometry},null,2));
if(geometry.some(r=>!r.samples||r.uiIntersections||r.subjectOutsideCanvas))throw Error('Opening geometry review failed');
const pair=(mode,w,h,step)=>`<div class="pair">${['before','candidate'].map(phase=>`<figure><figcaption>${phase==='before'?'PR #53 immediate before':'Refined candidate'}</figcaption><a href="${phase}/${mode}/${w}-${h}-${step}.jpg"><img loading="lazy" src="${phase}/${mode}/${w}-${h}-${step}.jpg" alt="${phase}, ${steps[step]}, ${w} by ${h}, ${mode}"></a></figure>`).join('')}</div>`;
await writeFile(`${root}/index.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Cedar and Lobby Phase 2 · ${project}</title><style>body{font:16px/1.6 system-ui;margin:32px auto;padding:0 24px;max-width:1480px;color:#202629;background:#ecebe3}h1{font-size:36px;line-height:1.2;font-weight:500}h2{font-size:26px;font-weight:500}a{color:#34483d}nav{display:flex;flex-wrap:wrap;gap:12px 24px;margin-block:24px}nav a{padding:10px 0}section{border-top:1px solid #c8c6bc;padding-top:24px;margin-top:40px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-bottom:32px}figure{margin:0;min-width:0}figcaption{font-size:14px;margin:8px 0}img,video{display:block;width:100%;height:auto}select{font:inherit;min-height:44px;padding:8px}video{background:#202629;max-height:760px}@media(max-width:680px){.pair{grid-template-columns:1fr}}</style><h1>Cedar and Lobby Phase 2 · ${project}</h1><p>Shared approved hierarchy; original project geometry and engineering interaction. Complete source images, local fictional demonstrations and native return continuity. Immediate before: PR #53 / c4f18c7. Normal production routes retain their accepted design.</p><nav aria-label="Review links"><a href="/review/featured/${project}/candidate">Working candidate</a><a href="/review/featured/${project}/baseline">PR #53 before</a><a href="../index.html">Both projects</a><a href="../review-report.md">Methods and findings</a><a href="../comparison.zip" download data-zip>Download offline review</a></nav><p>Interactive entries require the compiled review build or Vercel Preview. Existing protection may require Vercel sign-in. Noindex is not access protection. Extract the ZIP to view these images and recordings offline.</p><p>Windows Chrome viewport emulation, not physical phones. The normal local runs identify Intel UHD / ANGLE WebGL; reduced motion and forced photographic fallback are separately labelled. Stills, fixture tests and sampled bounds do not establish GPU smoothness.</p><label for="size">Viewport </label><select id="size">${sizes.map(([w,h])=>`<option value="${w}-${h}"${w===390?' selected':''}>${w} x ${h}</option>`).join('')}</select>${sizes.map(([w,h])=>`<section data-size="${w}-${h}"><h2>${w} x ${h}</h2>${Object.keys(steps).map(step=>`<h3>${steps[step]}</h3>${pair('normal',w,h,step)}<a href="comparison-${w}-${step}.jpg">Combined before/after image</a>`).join('')}</section>`).join('')}<section><h2>Opening recordings and transition frames</h2><p>Native browser video includes opening, screen change, reader entry, the project-specific rejection/outdated state, explicit recovery, Reset and return. Download links remain available on touch screens. Opening sheets sample the actual decoded recording, with lead-in/out around the DOM phase anchor.</p>${[390,1440].map(w=>`<h3>${w}px</h3><div class="pair">${['before','candidate'].map(phase=>`<figure><figcaption>${phase==='before'?'PR #53 before':'Refined candidate'}</figcaption><video controls playsinline preload="metadata" src="${phase}/normal/${w}-journey.webm"></video><nav><a href="${phase}/normal/${w}-journey.webm" download>Download recording</a><a href="transitions/${phase}-${w}-opening-sheet.jpg">All opening samples</a></nav><nav>${[0,6,12,18,24,30,36].map(i=>`<a href="transitions/${phase}-${w}-${i}.jpg">Frame ${i+1}</a>`).join('')}</nav></figure>`).join('')}</div>`).join('')}<a href="video-inspection.json">Recording methods</a> · <a href="geometry-summary.json">Observed geometry</a></section>${['reduced','fallback'].map(mode=>`<section><h2>${mode==='reduced'?'Reduced motion':'Forced photographic fallback'}</h2><p>${mode==='reduced'?'Reduced-motion preference emulated, no required spatial choreography.':'WebGL context creation denied deliberately; these are not WebGL captures.'}</p>${[[390,844],[1440,900]].map(([w,h])=>`<h3>${w}px preview</h3>${pair(mode,w,h,'preview')}<h3>${w}px reader demonstration</h3>${pair(mode,w,h,'demo-reader')}`).join('')}</section>`).join('')}<script>const select=document.getElementById('size');function show(){document.querySelectorAll('[data-size]').forEach(s=>s.hidden=s.dataset.size!==select.value)}select.addEventListener('change',show);show();if(location.protocol==='file:')document.querySelector('[data-zip]').hidden=true</script></html>`);
console.log(JSON.stringify({pairs:sizes.length*Object.keys(steps).length,videos:videos.map(({phase,width,metadata})=>({phase,width,...metadata})),geometry}));
