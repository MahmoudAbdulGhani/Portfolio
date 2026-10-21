// Read-only compiled Profile review; external FFmpeg is only for evidence export.
// --before: PR41 at :5195. Default: refinement at :5194. --loops: ten real
// repeats per resolution and representative recordings of the last cut/speech.
import {chromium,expect} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const before=process.argv.includes('--before'),loops=process.argv.includes('--loops');
const folder='docs/design/profile-portrait-refinement',temporary='.motion-preview/refinement-capture';
const base=process.env.PLAYWRIGHT_BASE_URL??`http://127.0.0.1:${before?5195:5194}`;
const sizes=[[320,640],[390,640],[430,844],[768,900],[1440,900],[1280,720]];
const fixtureRoot=process.env.PROFILE_REVIEW_FIXTURES??'.motion-preview';
const content=JSON.parse(await readFile(`${fixtureRoot}/public-content.json`,'utf8')),cv=await readFile(`${fixtureRoot}/public-cv.pdf`);
const fixtures=page=>page.route('**/api/**',route=>{
  const path=new URL(route.request().url()).pathname;
  return route.fulfill(path==='/api/cv.pdf'?{contentType:'application/pdf',body:cv}:{json:content[path]??content['/api/projects'].find(p=>path===`/api/projects/${p.slug}`)??[]});
});
await mkdir(folder,{recursive:true});await mkdir(temporary,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),findings=[];
const bounds=()=>{
  const selectors=['.standing-portrait-stage','.standing-portrait-figure','.portrait-playback-controls','.portrait-playback-captions','main','header','.stage-footer','.profile-intro','.record-tabs'];
  return Object.fromEntries(selectors.map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}];}));
};
try{
  for(const[width,height]of(process.argv.includes('--loops-only')?[]:sizes)){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'}),errors=[],writes=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method());});
    await fixtures(page);await page.goto(`${base}/profile`);await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','looping');
    const row={width,height,arrival:await page.evaluate(bounds),recordText:await page.locator('.profile-record').innerText()};
    await page.screenshot({path:`${folder}/${before?'before':'after'}-${width}.jpg`,quality:88});
    await page.getByRole('button',{name:'Hear introduction',exact:true}).press('Enter');
    await expect(page.locator('.portrait-playback-captions')).toContainText('full-stack developer');
    row.speech=await page.evaluate(bounds);
    await page.screenshot({path:`${folder}/${before?'before-speech':'speech'}-${width}.jpg`,quality:88});
    if(!before){
      const b=row.speech,stage=b['.standing-portrait-stage'],figure=b['.standing-portrait-figure'],caption=b['.portrait-playback-captions'],controls=b['.portrait-playback-controls'],main=b.main;
      expect(stage.y).toBeGreaterThanOrEqual(main.y);expect(stage.bottom).toBeLessThanOrEqual(main.bottom);
      expect(caption.bottom).toBeLessThanOrEqual(Math.min(main.bottom,b['.stage-footer'].y));expect(controls.y).toBeGreaterThanOrEqual(stage.bottom);
      expect(Math.abs(figure.width/figure.height-960/1696)).toBeLessThan(.0001);
      if(width<720)expect(stage.width).toBe(width===320?180:width===390?190:200);
      row.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.querySelector('main').scrollWidth>document.querySelector('main').clientWidth);expect(row.overflow).toBe(false);
      const old=JSON.parse(await readFile(`${folder}/before.json`,'utf8')).find(r=>r.width===width);expect(row.recordText).toBe(old.recordText);
      const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).press('Enter');const bytes=await readFile(await(await download).path());expect(bytes.subarray(0,5).toString()).toBe('%PDF-');row.cv={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
      for(const b of await page.locator('.portrait-playback-controls button').all()){await b.focus();const box=await b.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);expect(box.width).toBeGreaterThanOrEqual(44);expect(await b.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');}
      await page.getByRole('tab',{name:'Capabilities',exact:true}).press('Enter');await expect(page.getByRole('tab',{name:'Capabilities',exact:true})).toHaveAttribute('aria-selected','true');
      const a=await sharp(`${folder}/before-speech-${width}.jpg`).metadata();await sharp({create:{width:width*2,height:a.height,channels:3,background:'#ecebe3'}}).composite([{input:`${folder}/before-speech-${width}.jpg`,left:0,top:0},{input:`${folder}/speech-${width}.jpg`,left:width,top:0}]).jpeg({quality:88}).toFile(`${folder}/comparison-${width}.jpg`);
    }
    row.errors=errors;row.writes=writes;expect(errors).toEqual([]);expect(writes).toEqual([]);findings.push(row);await page.close();
  }
  if(findings.length)await writeFile(`${folder}/${before?'before':'validation'}.json`,JSON.stringify(findings,null,2)+'\n');
  if(loops&&!before){
    if(!process.env.PROFILE_REVIEW_FFMPEG)throw Error('Set PROFILE_REVIEW_FFMPEG to an external FFmpeg executable');
    for(const[width,height]of(process.argv.includes('--phone-only')?[[390,844]]:[[390,844],[1280,720]])){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'}),requests=[],errors=[],writes=[];
      page.on('request',r=>{if(r.url().includes('/media/profile/'))requests.push(r.url().split('/').at(-1));if(!['GET','HEAD'].includes(r.method()))writes.push(r.method());});page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(()=>{
        const review=window.refinementReview={loops:0,samples:0,flashes:0,overlaps:0,gaps:0,maxPendingFrames:0,pendingFrames:0,scheduledFrames:0,canceledFrames:0,presentedFrames:0,cuts:[],events:[],speechOrigin:null,alpha:[]};
        const pending=new Map(),request=HTMLVideoElement.prototype.requestVideoFrameCallback,cancel=HTMLVideoElement.prototype.cancelVideoFrameCallback;
        HTMLVideoElement.prototype.requestVideoFrameCallback=function(cb){let id;id=request.call(this,(now,metadata)=>{pending.delete(id);review.pendingFrames=pending.size;review.presentedFrames++;cb(now,metadata);});pending.set(id,true);review.scheduledFrames++;review.pendingFrames=pending.size;review.maxPendingFrames=Math.max(review.maxPendingFrames,pending.size);return id;};
        HTMLVideoElement.prototype.cancelVideoFrameCallback=function(id){pending.delete(id);review.pendingFrames=pending.size;review.canceledFrames++;return cancel.call(this,id);};
        new MutationObserver(()=>{
          const v=document.querySelector('video');if(!v||v.dataset.reviewObserved)return;v.dataset.reviewObserved='true';
          for(const event of ['playing','ended','pause'])v.addEventListener(event,()=>{const speech=!!document.querySelector('[aria-label="Mute introduction"]'),at=(performance.timeOrigin+performance.now())/1000;review.events.push({event,at,time:v.currentTime,speech,muted:v.muted});if(event==='playing'&&speech&&review.speechOrigin===null)review.speechOrigin=at-v.currentTime;});
        }).observe(document,{subtree:true,childList:true});
        let previous=0,seen=false;const sample=()=>{
          const v=document.querySelector('video'),still=document.querySelector('.standing-portrait-image'),media=document.querySelector('.standing-portrait-media');
          if(v?.dataset.alpha==='verified'&&still&&media){
            const a=Number(getComputedStyle(still).opacity),b=Number(getComputedStyle(media).opacity),speech=!!document.querySelector('[aria-label="Mute introduction"]');
            if(!speech&&seen&&review.loops<10){review.samples++;if(a>.01)review.flashes++;if(a>.01&&b>.01)review.overlaps++;if(a<.01&&b<.01)review.gaps++;}
            if(!speech&&previous-v.currentTime>5&&review.loops<10){review.loops++;review.cuts.push({at:(performance.timeOrigin+performance.now())/1000,time:v.currentTime,still:a,video:b});const c=document.createElement('canvas');c.width=c.height=4;const ctx=c.getContext('2d');ctx.drawImage(v,0,0,4,4,0,0,4,4);review.alpha.push([...ctx.getImageData(0,0,4,4).data].filter((_,i)=>i%4===3));}
            previous=v.currentTime;seen=true;
          }requestAnimationFrame(sample);
        };requestAnimationFrame(sample);
      });
      await fixtures(page);await page.goto(`${base}/profile`);await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','looping');
      const video=await page.locator('video').elementHandle();
      await page.waitForFunction(()=>window.refinementReview.loops>=9,undefined,{timeout:115_000});
      const directory=resolve(temporary,String(width));await mkdir(directory,{recursive:true});const frames=[];let recording=true;
      const capture=(async()=>{while(recording){const file=resolve(directory,`${String(frames.length).padStart(5,'0')}.jpg`),start=Date.now()/1000;await page.screenshot({path:file,type:'jpeg',quality:86});frames.push({file,at:(start+Date.now()/1000)/2});await new Promise(r=>setTimeout(r,30));}})();
      await page.waitForFunction(()=>window.refinementReview.loops>=10,undefined,{timeout:15_000});
      await page.waitForFunction(()=>document.querySelector('video')?.currentTime>=1&&document.querySelector('video')?.currentTime<3);
      await page.getByRole('button',{name:'Hear introduction',exact:true}).press('Enter');await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','speaking');
      expect(await video.evaluate(v=>v.currentTime)).toBeLessThan(1);
      await expect(page.locator('.portrait-playback-captions')).toContainText('download my CV',{timeout:11_000});
      await expect(page.getByRole('button',{name:'Hear introduction',exact:true})).toBeVisible({timeout:5000});await expect(page.locator('.portrait-introduction')).toHaveAttribute('data-playback','looping');
      await page.waitForFunction(()=>document.querySelector('video')?.currentTime>=2);recording=false;await capture;
      const review=await page.evaluate(()=>window.refinementReview);expect(review.loops).toBe(10);expect(review.samples).toBeGreaterThan(1000);expect(review.flashes).toBe(0);expect(review.overlaps).toBe(0);expect(review.gaps).toBe(0);expect(review.maxPendingFrames).toBe(1);expect(review.alpha.flat().every(a=>a<16)).toBe(true);
      expect(await video.evaluate(v=>v===document.querySelector('video'))).toBe(true);expect(await video.evaluate(v=>v.muted)).toBe(true);expect([...new Set(requests)]).toEqual([`mahmoud-introduction-${width<720?480:720}.webm`]);expect(errors).toEqual([]);expect(writes).toEqual([]);
      await page.locator('header nav a[href="/projects"]').click();await expect(page.locator('.profile-page')).toHaveCount(0);review.pendingAfterExit=await page.evaluate(()=>window.refinementReview.pendingFrames);expect(review.pendingAfterExit).toBe(0);
      const first=frames[0].at,last=frames.at(-1).at,offset=review.speechOrigin-first,concat=resolve(directory,'frames.ffconcat');
      await writeFile(concat,'ffconcat version 1.0\n'+frames.map((f,i)=>`file '${f.file.replaceAll('\\','/')}'\noption framerate 1000\nduration ${Math.max(.001,(frames[i+1]?.at??last+.04)-f.at).toFixed(6)}`).join('\n')+`\nfile '${frames.at(-1).file.replaceAll('\\','/')}'\noption framerate 1000\n`);
      execFileSync(process.env.PROFILE_REVIEW_FFMPEG,['-y','-loglevel','error','-f','concat','-safe','0','-i',concat,'-itsoffset',offset.toFixed(6),'-i',resolve(`public/media/profile/mahmoud-introduction-${width<720?480:720}.webm`),'-map','0:v:0','-map','1:a:0','-vf','fps=25','-c:v','libx264','-threads','2','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t',(last-first).toFixed(6),'-movflags','+faststart',resolve(folder,`playback-${width}.mp4`)],{stdio:'pipe'});
      await writeFile(`${folder}/ten-cycles-${width}.json`,JSON.stringify({width,height,requests,errors,writes,...review,recording:{seconds:last-first,frames:frames.length,speechOffset:offset,firstFrameEpoch:first,capture:'Sampled browser screenshots at measured wall-clock timing; encoded 25fps is not hardware capture rate.',audio:'Approved audio muxed at measured speech origin; not system audio or an independent audition.'}},null,2)+'\n');
      console.log(`${width}px: ten actual repeats; ${review.samples} visual samples; max ${review.maxPendingFrames} frame callback; ${frames.length} recording frames`);await page.close();
    }
  }
}finally{await browser.close();}
console.log(`${before?'Baseline':'Refinement'}: ${findings.length} compiled layouts captured`);
