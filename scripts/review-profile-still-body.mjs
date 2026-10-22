// Compiled build, frozen public GET fixtures, real Chrome decoding. No live writes.
import {chromium,expect} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
const folder='docs/design/profile-still-body',temporary='.motion-preview/still-body-capture',base=process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:5196';
await mkdir(folder,{recursive:true});await mkdir(temporary,{recursive:true});
const browser=await chromium.launch({channel:'chrome',ignoreDefaultArgs:['--autoplay-policy=no-user-gesture-required']});
const seed=()=>sessionStorage.setItem('profile-portrait-playback-v2',JSON.stringify({muted:true,paused:false}));
const state=p=>p.locator('.portrait-introduction');
const open=async p=>{await p.goto(base+'/profile');await p.evaluate(()=>document.fonts.ready);await expect(state(p)).toHaveAttribute('data-playback','looping');};
const geometry=()=>{
 const selectors=['.standing-portrait-stage','.standing-portrait-figure','.portrait-playback-controls','.portrait-playback-captions','main','.stage-footer','.profile-intro','.record-tabs'];
 return Object.fromEntries(selectors.map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}];}));
};
const inspect=()=>{
 const r=window.stillBodyReview={loops:0,samples:0,flashes:0,overlaps:0,gaps:0,maximumCallbacks:0,pending:0,playCalls:[],events:[],boundaries:[],errors:[]};
 const pending=new Set(),request=HTMLVideoElement.prototype.requestVideoFrameCallback,cancel=HTMLVideoElement.prototype.cancelVideoFrameCallback,play=HTMLMediaElement.prototype.play;
 HTMLVideoElement.prototype.requestVideoFrameCallback=function(cb){let id;id=request.call(this,(now,m)=>{pending.delete(id);r.pending=pending.size;cb(now,m);});pending.add(id);r.pending=pending.size;r.maximumCallbacks=Math.max(r.maximumCallbacks,pending.size);return id;};
 HTMLVideoElement.prototype.cancelVideoFrameCallback=function(id){pending.delete(id);r.pending=pending.size;return cancel.call(this,id);};
 HTMLMediaElement.prototype.play=function(){r.playCalls.push({at:Date.now()/1000,time:this.currentTime,muted:this.muted});return play.call(this);};
 for(const event of ['playing','waiting','pause','ended','error'])document.addEventListener(event,e=>{if(e.target instanceof HTMLMediaElement)r.events.push({event,at:Date.now()/1000,time:e.target.currentTime,muted:e.target.muted});},true);
 let previous=0,seen=false;
 const sample=()=>{const v=document.querySelector('video'),stage=document.querySelector('.standing-portrait-stage');if(v?.dataset.alpha==='verified'){
  const a=Number(getComputedStyle(stage.querySelector('.standing-portrait-image')).opacity),b=Number(getComputedStyle(stage.querySelector('.standing-portrait-media')).opacity);
  if(seen&&!v.paused){r.samples++;if(a>.01)r.flashes++;if(a>.01&&b>.01)r.overlaps++;if(a<.01&&b<.01)r.gaps++;}
  if(previous-v.currentTime>5){r.loops++;r.boundaries.push({time:v.currentTime,previous,still:a,video:b});}previous=v.currentTime;seen=stage.dataset.videoVisible==='true';
 }requestAnimationFrame(sample);};requestAnimationFrame(sample);
};
try{
 if(!process.argv.includes('--loops-only')&&!process.argv.includes('--recordings-only')){
  const fresh=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});await fresh.addInitScript(inspect);await fresh.goto(base+'/profile');await expect(state(fresh)).toHaveAttribute('data-playback',/^(speaking|looping)$/);
  const actual=await fresh.evaluate(()=>({chrome:navigator.userAgent,review:window.stillBodyReview,muted:document.querySelector('video').muted}));
  actual.policy='Fresh Chrome context; default Playwright autoplay-permission argument removed; no play-promise mock or browser policy override.';
  await writeFile(`${folder}/fresh-browser.json`,JSON.stringify(actual,null,2)+'\n');await fresh.close();
  const rows=[];
  for(const[width,height]of [[320,640],[390,640],[430,844],[768,900],[1440,900],[1280,720]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'});await page.addInitScript(seed);await open(page);
   const row={width,height,arrival:await page.evaluate(geometry)};await page.screenshot({path:`${folder}/after-${width}.jpg`,quality:90});
   const video=await page.locator('video').elementHandle();
   await page.getByRole('button',{name:'Enable sound',exact:true}).press('Enter');await expect(state(page)).toHaveAttribute('data-playback','speaking');await expect(page.locator('.portrait-playback-captions')).toContainText('full-stack developer');
   row.speech=await page.evaluate(geometry);row.recordText=await page.locator('.profile-record').innerText();row.background=await page.locator('.landscape').evaluate(e=>getComputedStyle(e).getPropertyValue('--paper'));
   await page.screenshot({path:`${folder}/speech-${width}.jpg`,quality:90});
   const b=row.speech;expect(b['.standing-portrait-stage'].y).toBeGreaterThanOrEqual(b.main.y);expect(b['.portrait-playback-captions'].bottom).toBeLessThanOrEqual(Math.min(b.main.bottom,b['.stage-footer'].y));expect(b['.portrait-playback-controls'].y).toBeGreaterThanOrEqual(b['.standing-portrait-stage'].bottom);
   if(width<720)expect(b['.standing-portrait-stage'].width).toBe(width===320?180:width===390?190:200);
   row.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.querySelector('main').scrollWidth>document.querySelector('main').clientWidth);expect(row.overflow).toBe(false);
   expect(await video.evaluate(v=>v===document.querySelector('video'))).toBe(true);
   const baseline=`docs/design/profile-portrait-buffering/speech-${width}.jpg`,metadata=await sharp(baseline).metadata();
   await sharp({create:{width:width*2,height:metadata.height,channels:3,background:'#f4f2e9'}}).composite([{input:baseline,left:0,top:0},{input:`${folder}/speech-${width}.jpg`,left:width,top:0}]).jpeg({quality:90}).toFile(`${folder}/comparison-${width}.jpg`);
   await page.getByRole('button',{name:'Mute introduction',exact:true}).click();const time=await video.evaluate(v=>v.currentTime);await expect(video).toBeTruthy();await expect(page.locator('video')).toHaveJSProperty('paused',false);expect(await video.evaluate(v=>v.currentTime)).toBeGreaterThanOrEqual(time);
   await page.getByRole('button',{name:'Pause introduction',exact:true}).click();
   await page.keyboard.press('Tab');for(const button of await page.locator('.portrait-playback-controls button').all()){await button.focus();const box=await button.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);expect(box.width).toBeGreaterThanOrEqual(44);expect(await button.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');}
   const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).press('Enter');row.cvBytes=(await readFile(await(await download).path())).length;expect(row.cvBytes).toBe(31205);
   await page.getByRole('tab',{name:'Capabilities',exact:true}).press('Enter');await expect(page.getByRole('tab',{name:'Capabilities',exact:true})).toHaveAttribute('aria-selected','true');
   rows.push(row);await page.close();
  }
  await writeFile(`${folder}/layouts.json`,JSON.stringify(rows,null,2)+'\n');console.log('Six layouts, caption clearance, actual CV, focus and records passed');
 }
 if(process.argv.includes('--loops')||process.argv.includes('--loops-only')||process.argv.includes('--recordings-only'))await Promise.all([390,1280].map(async width=>{
  const height=width===390?844:720,page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'}),requests=[],errors=[];
  await page.addInitScript(seed);await page.addInitScript(inspect);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/media/profile/'))requests.push(r.url().split('/').at(-1));});
  await open(page);const video=await page.locator('video').elementHandle();
  if(!process.argv.includes('--recordings-only'))await page.waitForFunction(()=>window.stillBodyReview.loops>=10,undefined,{timeout:130_000});
  const review=process.argv.includes('--recordings-only')?JSON.parse(await readFile(`${folder}/raw-ten-cycles-${width}.json`,'utf8')):await page.evaluate(()=>({...window.stillBodyReview,nativeCoverage:{duration:document.querySelector('video').duration,played:Array.from({length:document.querySelector('video').played.length},(_,i)=>[document.querySelector('video').played.start(i),document.querySelector('video').played.end(i)])}}));await writeFile(`${folder}/raw-ten-cycles-${width}.json`,JSON.stringify(review,null,2)+'\n');console.log(JSON.stringify({width,loops:review.loops,maximumCallbacks:review.maximumCallbacks,plays:review.playCalls.length,nativeCoverage:review.nativeCoverage}));expect(review.loops).toBe(10);expect(review.flashes).toBe(0);expect(review.overlaps).toBe(0);expect(review.gaps).toBe(0);expect(review.maximumCallbacks).toBe(1);expect(review.playCalls.length).toBe(1);expect(review.nativeCoverage.played.at(-1)[1]).toBeGreaterThanOrEqual(review.nativeCoverage.duration-.001);expect(errors).toEqual([]);
  expect(await video.evaluate(v=>v===document.querySelector('video'))).toBe(true);expect([...new Set(requests)]).toEqual([`mahmoud-introduction-${width<720?480:720}.webm`]);
  // Record a fresh arrival, automatic muted cycle, two complete explicit sound
  // cycles, Mute and Pause/Resume. Audio is muxed from the approved source at
  // measured play origins, not captured from the operating system.
  await page.reload();await expect(state(page)).toHaveAttribute('data-playback','looping');
  const directory=resolve(temporary,String(width));await mkdir(directory,{recursive:true});const frames=[];let recording=true;
  const capture=(async()=>{while(recording){const at=Date.now()/1000,file=resolve(directory,`${String(frames.length).padStart(5,'0')}.jpg`);await page.screenshot({path:file,type:'jpeg',quality:83});frames.push({at,file});await new Promise(r=>setTimeout(r,160));}})();
  await page.waitForFunction(()=>window.stillBodyReview.loops>=1,undefined,{timeout:15_000});
  await page.getByRole('button',{name:'Enable sound',exact:true}).press('Enter');await expect(state(page)).toHaveAttribute('data-playback','speaking');
  for(let i=0;i<2;i++){await expect(page.locator('.portrait-playback-captions')).toContainText('download my CV',{timeout:13_000});await expect(page.locator('.portrait-playback-captions')).toContainText('full-stack developer',{timeout:7000});}
  const speech=await page.evaluate(()=>window.stillBodyReview.events.find(e=>e.event==='playing'&&!e.muted));
  const muteAt=Date.now()/1000;await page.getByRole('button',{name:'Mute introduction',exact:true}).click();await page.getByRole('button',{name:'Pause introduction',exact:true}).click();await page.getByRole('button',{name:'Resume introduction',exact:true}).click();await expect(state(page)).toHaveAttribute('data-playback','looping');
  await page.waitForTimeout(800);recording=false;await capture;
  const concat=resolve(directory,'frames.ffconcat'),first=frames[0].at,last=frames.at(-1).at,offset=speech.at-speech.time-first;
  await writeFile(resolve(directory,'frames.json'),JSON.stringify(frames));await writeFile(concat,'ffconcat version 1.0\n'+frames.map((f,i)=>`file '${f.file.replaceAll('\\','/')}'\noption framerate 1000\nduration ${Math.max(.001,(frames[i+1]?.at??last+.04)-f.at).toFixed(6)}`).join('\n')+`\nfile '${frames.at(-1).file.replaceAll('\\','/')}'\noption framerate 1000\n`);
  const ff=process.env.PROFILE_REVIEW_FFMPEG??'.motion-preview/speaking-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
  execFileSync(ff,['-y','-v','error','-f','concat','-safe','0','-i',concat,'-itsoffset',offset.toFixed(6),'-stream_loop','-1','-i',resolve(`public/media/profile/mahmoud-introduction-${width<720?480:720}.webm`),'-filter_complex',`[1:a]atrim=duration=${(muteAt-speech.at+speech.time).toFixed(6)}[voice]`,'-map','0:v:0','-map','[voice]','-vf','fps=25','-c:v','libx264','-threads','2','-preset','fast','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t',(last-first).toFixed(6),'-movflags','+faststart',resolve(folder,`playback-${width}.mp4`)],{maxBuffer:1e6});
  await page.locator('header nav a[href="/projects"]').click();await expect(page.locator('video,audio')).toHaveCount(0);review.pendingAfterExit=await page.evaluate(()=>window.stillBodyReview.pending);expect(review.pendingAfterExit).toBe(0);
  await writeFile(`${folder}/ten-cycles-${width}.json`,JSON.stringify({width,height,requests,errors,...review,recording:{seconds:last-first,frames:frames.length,voiceOffset:offset,method:'Timestamped browser screenshots, source audio muxed at measured explicit audible play origin. Not system audio capture or independent listening.'}},null,2)+'\n');console.log(`${width}px: ten full native repeats, one play call and max one callback; two complete audible cycles and recording exported`);await page.close();
 }));
}finally{await browser.close();}
