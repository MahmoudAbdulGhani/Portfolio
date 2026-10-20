// Review capture only: run against a compiled build with read-only GET fixtures.
// --before captures c058 at PLAYWRIGHT_BASE_URL; otherwise captures this revision.
// FFmpeg is an external local tool, never a frontend dependency.
import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const folder='docs/design/profile-portrait-loop', temporary='.motion-preview/loop-capture';
const before=process.argv.includes('--before'), recordings=process.argv.includes('--record');
const base=process.env.PLAYWRIGHT_BASE_URL??`http://127.0.0.1:${before?5195:5194}`;
await mkdir(folder,{recursive:true});await mkdir(temporary,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}), findings=[];
try {
  for(const width of [320,390,430,768,1440]) {
    const page=await browser.newPage({viewport:{width,height:width===768?1024:900},reducedMotion:before?'reduce':'no-preference'});
    const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method());});
    await page.goto(`${base}/profile`);await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('.standing-portrait-figure')).toHaveAttribute('data-entrance','false');
    if(!before)await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','looping');
    const row={width,stage:await page.locator('.standing-portrait-stage').boundingBox(),errors,writes};
    await page.screenshot({path:`${folder}/${before?'before':'after'}-${width}.jpg`,quality:88});
    if(!before){
      const original=JSON.parse(await readFile(`${folder}/before.json`,'utf8')).find(r=>r.width===width);
      expect(row.stage).toEqual(original.stage);
      row.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.querySelector('main').scrollWidth>document.querySelector('main').clientWidth);
      expect(row.overflow).toBe(false);
      const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).press('Enter');
      const body=await readFile(await(await download).path());row.cv={bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')};expect(body.subarray(0,5).toString()).toBe('%PDF-');
      await page.getByRole('button',{name:'Hear introduction',exact:true}).press('Enter');
      await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','speaking');
      await expect(page.locator('.portrait-playback-captions')).toContainText('full-stack developer');
      await page.screenshot({path:`${folder}/speech-${width}.jpg`,quality:88});
      await page.getByRole('button',{name:'Mute introduction',exact:true}).click();
      expect(errors).toEqual([]);expect(writes).toEqual([]);
      if([390,1440].includes(width)){
        const left=await sharp(`${folder}/before-${width}.jpg`).metadata(),right=await sharp(`${folder}/after-${width}.jpg`).metadata();
        await sharp({create:{width:left.width+right.width,height:Math.max(left.height,right.height),channels:3,background:'#ecebe3'}}).composite([
          {input:`${folder}/before-${width}.jpg`,left:0,top:0},{input:`${folder}/after-${width}.jpg`,left:left.width,top:0},
        ]).jpeg({quality:90}).toFile(`${folder}/comparison-${width}.jpg`);
      }
    }
    findings.push(row);await page.close();
  }
  await writeFile(`${folder}/${before?'before':'validation'}.json`,JSON.stringify(findings,null,2)+'\n');
  if(recordings&&!before){
    if(!process.env.PROFILE_REVIEW_FFMPEG)throw new Error('Set PROFILE_REVIEW_FFMPEG to an external FFmpeg executable');
    for(const width of [390,1440]){
      const height=width===390?900:1024;
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'});
      const frames=[],writes=[],requests=[],errors=[];
      const directory=resolve(temporary,String(width));await mkdir(directory,{recursive:true});
      page.on('request',r=>{if(r.url().includes('/media/profile/'))requests.push(r.url().split('/').at(-1));if(!['GET','HEAD'].includes(r.method()))writes.push(r.method());});
      page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(()=>{
        window.loopReview={events:[],bridges:[],speechOrigin:null};
        new MutationObserver(()=>{
          const video=document.querySelector('video');if(!video||video.dataset.reviewObserved)return;video.dataset.reviewObserved='true';
          for(const name of ['playing','ended','pause'])video.addEventListener(name,()=>{
            const speech=document.querySelector('.portrait-introduction')?.querySelector('[aria-label="Mute introduction"]')!==null;
            const now=performance.timeOrigin+performance.now();
            window.loopReview.events.push({event:name,at:now/1000,time:video.currentTime,muted:video.muted,speech});
            if(name==='playing'&&speech&&window.loopReview.speechOrigin===null)window.loopReview.speechOrigin=now/1000-video.currentTime;
            if(name==='ended')void Promise.allSettled(document.querySelector('.standing-portrait-media').getAnimations().map(a=>a.finished)).then(()=>window.loopReview.bridges.push({image:getComputedStyle(document.querySelector('.standing-portrait-image')).opacity,media:getComputedStyle(document.querySelector('.standing-portrait-media')).opacity,at:(performance.timeOrigin+performance.now())/1000}));
          });
        }).observe(document,{subtree:true,childList:true});
      });
      // Sample actual screenshots: CDP screencast can omit compositor-only
      // opacity frames over a paused WebM. Preserve measured wall-clock timing.
      let recording=true;
      const capture=(async()=>{while(recording){
        const file=resolve(directory,`${String(frames.length).padStart(5,'0')}.jpg`),started=Date.now()/1000;
        await page.screenshot({path:file,type:'jpeg',quality:86});frames.push({file,at:(started+Date.now()/1000)/2});
        await new Promise(resolve=>setTimeout(resolve,20));
      }})();
      await page.goto(`${base}/profile`);await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','looping');
      const video=await page.locator('video').elementHandle();
      await page.waitForFunction(()=>window.loopReview.events.some(e=>e.event==='ended'),undefined,{timeout:15_000});
      await page.waitForFunction(()=>document.querySelector('video')?.currentTime>1&&document.querySelector('video')?.currentTime<3);
      await page.getByRole('button',{name:'Hear introduction',exact:true}).click();
      await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','speaking');
      await page.waitForFunction(()=>window.loopReview.events.filter(e=>e.event==='ended').length>=2,undefined,{timeout:15_000});
      await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','looping');
      await page.waitForFunction(()=>document.querySelector('video')?.currentTime>=2);
      recording=false;await capture;
      expect(await video.evaluate(v=>v===document.querySelector('video'))).toBe(true);
      expect(await video.evaluate(v=>v.muted)).toBe(true);expect(errors).toEqual([]);expect(writes).toEqual([]);
      const timeline=await page.evaluate(()=>window.loopReview),first=frames[0].at,last=frames.at(-1).at;
      const speechOffset=timeline.speechOrigin-first;expect(speechOffset).toBeGreaterThan(10);expect(speechOffset).toBeLessThan(20);
      const concat=resolve(directory,'frames.ffconcat');
      await writeFile(concat,'ffconcat version 1.0\n'+frames.map((f,i)=>`file '${f.file.replaceAll('\\','/')}'\noption framerate 1000\nduration ${Math.max(.001,(frames[i+1]?.at??last+.04)-f.at).toFixed(6)}`).join('\n')+`\nfile '${frames.at(-1).file.replaceAll('\\','/')}'\noption framerate 1000\n`);
      // Screenshots record only browser pixels. Mux the unchanged approved Opus source
      // at the measured speech origin; this is NOT a microphone/system capture.
      execFileSync(process.env.PROFILE_REVIEW_FFMPEG,['-y','-loglevel','error','-f','concat','-safe','0','-i',concat,'-itsoffset',speechOffset.toFixed(6),'-i',resolve(`public/media/profile/mahmoud-introduction-${width<720?480:720}.webm`),'-map','0:v:0','-map','1:a:0','-vf','fps=25','-c:v','libx264','-threads','2','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t',(last-first).toFixed(6),'-movflags','+faststart',resolve(folder,`arrival-loop-speech-${width}.mp4`)],{stdio:'pipe'});
      expect(timeline.bridges.map(({image,media})=>({image,media}))).toEqual([{image:'1',media:'0'},{image:'1',media:'0'}]);
      await writeFile(`${folder}/recording-${width}.json`,JSON.stringify({width,height,seconds:last-first,frames:frames.length,speechOffset,events:timeline.events.map(e=>({...e,at:e.at-first})),bridges:timeline.bridges.map(({at,...bridge})=>({...bridge,atEpochSeconds:at})),requests,errors,writes,sameVideoElement:true,capture:'Browser screenshot samples with measured wall-clock durations, encoded at 25fps; not a 25fps hardware screen capture.',audio:'Approved source Opus muxed at measured speech origin; not system audio capture.'},null,2)+'\n');
      console.log(`Recorded ${width}px: ${(last-first).toFixed(2)}s, voice begins ${speechOffset.toFixed(3)}s`);await page.close();
    }
  }
}finally{await browser.close();}
console.log(`${before?'Baseline':'Revision'}: ${findings.length} widths verified`);
