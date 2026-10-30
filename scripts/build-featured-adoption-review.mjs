import { chromium } from '@playwright/test';
import express from 'express';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const project=process.argv[2]??'cedar';
const root=`docs/design/featured-adoption/${project}`,temp=`.motion-preview/adoption-frames/${project}`;
const beforeLabel='Approved PR #55',afterLabel='Adopted normal routes';
const sizes=[[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]],steps={'preview-screen-2':'Second preview (complete tall image for Cedar)',preview:'Selected preview','demo-preview':'Preview demonstration',reader:'Reader opening','demo-reader':'Reader demonstration'};
await mkdir(`${root}/transitions`,{recursive:true});await mkdir(temp,{recursive:true});
const label=(text,width)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28"><rect width="100%" height="100%" fill="#ecebe3"/><text x="8" y="19" font-family="Arial,sans-serif" font-size="14" fill="#202629">${text}</text></svg>`);
for(const[width,height]of sizes)for(const step of Object.keys(steps)){
  await sharp({create:{width:width*2+16,height:height+36,channels:3,background:'#ecebe3'}}).composite([
    {input:label(beforeLabel,width),left:0,top:0},{input:label(afterLabel,width),left:width+16,top:0},
    {input:`${root}/approved/normal/${width}-${height}-${step}.jpg`,left:0,top:36},{input:`${root}/adopted/normal/${width}-${height}-${step}.jpg`,left:width+16,top:36},
  ]).jpeg({quality:89}).toFile(`${root}/comparison-${width}-${step}.jpg`);
}
const app=express();app.use(express.static(path.resolve(root)));app.get('/player',(_,res)=>res.send('<!doctype html><video muted controls playsinline></video>'));
const server=app.listen(5262,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const videos=[];
const videoMode=project==='cedar'?'prepared':'normal';
const browser=await chromium.launch({channel:'chrome'});
try{for(const phase of ['approved','adopted']){
  const findings=JSON.parse(await readFile(`${root}/${phase}/${videoMode}/findings.json`,'utf8'));
  for(const width of [390,1440]){
    const row=findings.findings.find(r=>r.width===width),opening=row.transition.find(f=>f.phase==='opening');
    if(!opening)throw Error(`${phase} ${width}: no observed opening`);
    const page=await browser.newPage();await page.goto('http://127.0.0.1:5262/player');
    await page.locator('video').evaluate(async(video,src)=>{video.src=src;await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=reject;});await video.play();},`/${phase}/${videoMode}/${width}-journey.webm`);
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
    videos.push({phase,width,videoMode,renderer:row.renderer,gpu:row.gpu,predecodedOriginals:Boolean(row.prepared),metadata,sheet,frames});await page.close();
  }
}}finally{await browser.close();server.close();}
await writeFile(`${root}/video-inspection.json`,JSON.stringify({method:'Native browser recordings decoded and briefly played in Chrome, then sampled through the opening; decoded source frames sampled at 25fps over the opening with lead-in/out. DOM phase timing supplies an approximate recording anchor; actual frame timestamps are listed. No staged screenshot animation, speed changes or audio muxing. Decoder counts are not a GPU benchmark or physical-device result.',videos},null,2));
const after=JSON.parse(await readFile(`${root}/adopted/normal/findings.json`,'utf8')),before=JSON.parse(await readFile(`${root}/approved/normal/findings.json`,'utf8'));
const intersects=(a,b)=>a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
const observe=row=>{
  const poses=row.transition.filter(f=>f.phase==='opening'&&f.subject),previous=before.findings.find(r=>r.width===row.width).transition.filter(f=>f.image).at(-1),last=row.transition.filter(f=>f.image).at(-1);
  return{width:row.width,renderer:row.renderer,gpu:row.gpu,samples:poses.length,beforeImageTop:previous?.image.top,afterImageTop:last?.image.top,uiIntersections:poses.filter(f=>['identity','actions','choices','back'].some(k=>intersects(f.rig,f[k]))).length,subjectOutsideCanvas:poses.filter(f=>f.subject.left<-.5||f.subject.top<-.5||f.subject.right>f.rig.width+.5||f.subject.bottom>f.rig.height+.5).length,minimumMargin:Math.min(...poses.flatMap(f=>[f.subject.left,f.subject.top,f.rig.width-f.subject.right,f.rig.height-f.subject.bottom]))};
};
const geometry=after.findings.map(observe);
const preparedGeometry=project==='cedar'?(JSON.parse(await readFile(`${root}/adopted/prepared/findings.json`,'utf8'))).findings.map(observe):[];
await writeFile(`${root}/geometry-summary.json`,JSON.stringify({method:'Observed conservative mesh-box projections and canvas/UI rectangles from actual-source local WebGL runs. Normal observations and controlled predecoded/focus-warmed Cedar observations are separate. Counts describe sampled poses, not GPU smoothness, physical-device performance or every possible future frame.',geometry,preparedGeometry},null,2));
if([...geometry,...preparedGeometry].some(r=>(r.renderer==='webgl'&&!r.samples)||r.uiIntersections||r.subjectOutsideCanvas))throw Error('Opening geometry review failed');
