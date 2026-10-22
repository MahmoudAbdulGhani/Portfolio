import { expect, test, type Page } from '@playwright/test';
const person = { name:'Mahmoud Hussein Abdul Ghani', title:'Full-Stack Software Engineer', photo:'/myphoto.jpeg', bio:'Profile', experience:[], socials:[], location:'Tripoli, Lebanon', languages:'Arabic and English' };
test.beforeEach(async ({page},info)=>{
  if(!/^(fresh audible|both policy)/.test(info.title))await page.addInitScript(()=>sessionStorage.setItem('profile-portrait-playback-v2',JSON.stringify({muted:true,paused:false})));
  await page.route('**/api/**',route=>route.fulfill(new URL(route.request().url()).pathname==='/api/cv.pdf'
    ? {contentType:'application/pdf',body:'%PDF-1.4\nCV fixture'} : {json:new URL(route.request().url()).pathname==='/api/profile'?person:[]}));
});
const ui=(p:Page)=>p.locator('.portrait-introduction');
const hear=(p:Page)=>p.getByRole('button',{name:'Enable sound',exact:true});
const pause=(p:Page)=>p.getByRole('button',{name:'Pause introduction',exact:true});
const resume=(p:Page)=>p.getByRole('button',{name:'Resume introduction',exact:true});
async function open(page:Page){await page.goto('/profile');await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state','ready');}
async function hidden(page:Page,value:boolean){await page.evaluate(value=>{Object.defineProperty(document,'hidden',{configurable:true,value});document.dispatchEvent(new Event('visibilitychange'));},value);}
// Deterministic failures/races use a media double. The responsive/cycle/speech
// tests below separately decode the actual delivered files in the browser.
async function fakeMedia(page:Page,opaque=false){await page.addInitScript(({opaque})=>{
  const entries: {media:HTMLMediaElement;resolve:()=>void}[]=[];
  const flags=new WeakMap<HTMLMediaElement,{paused:boolean;ended:boolean;time:number}>();
  const flag=(media:HTMLMediaElement)=>{if(!flags.has(media))flags.set(media,{paused:true,ended:false,time:0});return flags.get(media)!;};
  Object.assign(window,{portraitMedia:entries,portraitFlags:flag});
  HTMLMediaElement.prototype.play=function(){flag(this).paused=false;flag(this).ended=false;return new Promise<void>(resolve=>entries.push({media:this,resolve}));};
  HTMLMediaElement.prototype.pause=function(){const playing=!flag(this).paused;flag(this).paused=true;if(playing)queueMicrotask(()=>this.dispatchEvent(new Event('pause')));};
  HTMLMediaElement.prototype.load=function(){};
  for(const key of ['paused','ended'] as const)Object.defineProperty(HTMLMediaElement.prototype,key,{configurable:true,get(){return flag(this)[key];}});
  Object.defineProperty(HTMLMediaElement.prototype,'currentTime',{configurable:true,get(){return flag(this).time;},set(time){flag(this).time=time;}});
  Object.defineProperty(HTMLMediaElement.prototype,'readyState',{configurable:true,get:()=>4});
  for(const [key,value]of Object.entries({videoWidth:480,videoHeight:848}))Object.defineProperty(HTMLVideoElement.prototype,key,{configurable:true,get:()=>value});
  HTMLVideoElement.prototype.requestVideoFrameCallback=function(callback){return requestAnimationFrame(now=>callback(now,{mediaTime:this.currentTime} as VideoFrameCallbackMetadata));};
  HTMLVideoElement.prototype.cancelVideoFrameCallback=function(id){cancelAnimationFrame(id);};
  CanvasRenderingContext2D.prototype.drawImage=function(){};
  CanvasRenderingContext2D.prototype.getImageData=function(){return{data:new Uint8ClampedArray(64).fill(opaque?255:0)}as ImageData;};
},{opaque});}
async function event(page:Page,name:string,time?:number,index=-1){await page.evaluate(({name,time,index})=>{
  const w=window as unknown as {portraitMedia:{media:HTMLMediaElement;resolve:()=>void}[];portraitFlags:(m:HTMLMediaElement)=>{ended:boolean;paused:boolean;time:number}};
  const entry=w.portraitMedia[index<0?w.portraitMedia.length-1:index];
  if(name==='playing')w.portraitFlags(entry.media).paused=false;
  if(time!==undefined)entry.media.currentTime=time;
  if(name==='ended'){w.portraitFlags(entry.media).ended=true;w.portraitFlags(entry.media).paused=true;}
  entry.media.dispatchEvent(new Event(name));entry.resolve();
},{name,time,index});}
async function calls(page:Page){return page.evaluate(()=>(window as unknown as {portraitMedia:unknown[]}).portraitMedia.length);}

test('arrival, speech restart and full cycle boundaries never composite two facial poses',async({page})=>{
  test.setTimeout(35_000);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{
    const inspection={samples:0,overlaps:[] as number[][],gaps:0};Object.assign(window,{portraitComposites:inspection});
    const sample=()=>{const stage=document.querySelector('.standing-portrait-stage[data-state="ready"]');const still=stage?.querySelector('.standing-portrait-image'),media=stage?.querySelector('.standing-portrait-media');if(still&&media){const a=Number(getComputedStyle(still).opacity),b=Number(getComputedStyle(media).opacity);inspection.samples++;if(a>.01&&b>.01)inspection.overlaps.push([a,b]);if(a<.01&&b<.01)inspection.gaps++;}requestAnimationFrame(sample);};requestAnimationFrame(sample);
  });
  await open(page);await expect(ui(page)).toHaveAttribute('data-playback','looping');await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('download my CV',{timeout:14_000});
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('full-stack developer',{timeout:7000});
  await expect(page.locator('video')).toHaveJSProperty('muted',false);
  await pause(page).click();await resume(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  const result=await page.evaluate(()=>(window as unknown as {portraitComposites:{samples:number;overlaps:number[][];gaps:number}}).portraitComposites);
  expect(result.samples).toBeGreaterThan(60);expect(result.overlaps).toEqual([]);expect(result.gaps).toBe(0);
});

for(const [width,height] of [[320,640],[390,640],[430,640],[768,720],[1280,720],[1440,900]])test(`explicit hearing reveals the full portrait and captions at ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
  await open(page);await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('full-stack developer');
  const bounds=await page.evaluate(()=>{
    const main=document.querySelector('main')!.getBoundingClientRect();
    const caption=document.querySelector('.portrait-playback-captions')!.getBoundingClientRect();
    const footer=document.querySelector('.stage-footer')!.getBoundingClientRect();
    const stage=document.querySelector('.standing-portrait-stage')!.getBoundingClientRect();
    return {top:caption.top,bottom:caption.bottom,mainTop:main.top,mainBottom:main.bottom,footerTop:footer.top,stageTop:stage.top,stageBottom:stage.bottom,windowScroll:scrollY};
  });
  expect(bounds.top).toBeGreaterThanOrEqual(bounds.mainTop);
  expect(bounds.bottom).toBeLessThanOrEqual(Math.min(bounds.mainBottom,bounds.footerTop));
  expect(bounds.stageBottom).toBeGreaterThan(bounds.mainTop);
  expect(bounds.stageTop).toBeGreaterThanOrEqual(bounds.mainTop);
  expect(bounds.windowScroll).toBe(0);
  const scroll=await page.locator('main').evaluate(e=>e.scrollTop);
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('back-end systems',{timeout:10_000});
  expect(await page.locator('main').evaluate(e=>e.scrollTop)).toBe(scroll);
});

for(const width of [320,390,430,768,1440])test(`visible real portrait automatically loads only its selected muted encode at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1024});await page.emulateMedia({reducedMotion:'no-preference'});
  const requests:string[]=[];page.on('request',r=>{if(r.url().includes('/media/profile/'))requests.push(r.url());});
  await open(page);
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await expect(page.locator('video')).toHaveAttribute('playsinline','');
  const video=await page.locator('video').elementHandle();
  expect(await video!.evaluate(v=>({muted:(v as HTMLVideoElement).muted,rate:(v as HTMLVideoElement).playbackRate,alpha:(v as HTMLElement).dataset.alpha}))).toEqual({muted:true,rate:1,alpha:'verified'});
  expect(requests.length).toBeGreaterThan(0);expect(requests.every(url=>url.endsWith(`-${width<720?480:720}.webm`))).toBe(true);
  await expect(ui(page).locator('.portrait-playback-captions')).toHaveAttribute('aria-live','off');
  const geometry=()=>page.evaluate(()=>['.standing-portrait-stage','.profile-intro','.record-tabs','.portrait-playback-details'].map(s=>{const e=document.querySelector(s)as HTMLElement;return[e.offsetWidth,e.offsetHeight,e.offsetTop];}));
  const before=await geometry();if(width<720)expect(before[0][0]).toBe(width===320?180:width===390?190:200);
  await hear(page).press('Enter');await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('full-stack developer');
  expect(await video!.evaluate(v=>v===document.querySelector('video'))).toBe(true);
  expect(await geometry()).toEqual(before);
  await page.getByRole('button',{name:'Mute introduction',exact:true}).press('Enter');
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await expect(page.locator('video')).toHaveJSProperty('muted',true);
  await pause(page).press('Enter');await expect(ui(page)).toHaveAttribute('data-playback','paused');
  for(const button of await ui(page).getByRole('button').all()){
    await button.focus();const box=await button.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(await button.evaluate(b=>getComputedStyle(b).outlineStyle)).toBe('solid');
    const stage=await page.locator('.standing-portrait-stage').boundingBox();expect(box!.y).toBeGreaterThanOrEqual(stage!.y+stage!.height);
  }
  expect(await geometry()).toEqual(before);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.querySelector('main')!.scrollWidth>document.querySelector('main')!.clientWidth)).toBe(false);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).press('Enter');expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
});

test('three full native cycles reuse one element; audible cycles preserve the final sentence and stay audible',async({page})=>{
  test.setTimeout(65_000);
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect(ui(page)).toHaveAttribute('data-playback','looping');
  const video=await page.locator('video').elementHandle();
  await video!.evaluate(v=>{const review={portraitEnds:0,bridges:[] as string[][],latest:0};Object.assign(window,{loopReview:review});let previous=v.currentTime;const sample=()=>{review.latest=Math.max(review.latest,v.currentTime);if(previous-v.currentTime>5){review.portraitEnds++;review.bridges.push(['.standing-portrait-image','.standing-portrait-media'].map(s=>getComputedStyle(document.querySelector(s)!).opacity));}previous=v.currentTime;if(review.portraitEnds<3)requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  const liveMessage=await ui(page).getByRole('status').innerText();
  await page.waitForFunction(()=>(window as unknown as {loopReview:{portraitEnds:number}}).loopReview.portraitEnds>=3,undefined,{timeout:40_000});
  const result=await page.evaluate(()=>(window as unknown as {loopReview:{bridges:string[][];latest:number}}).loopReview);
  expect(result.bridges).toEqual([['0','1'],['0','1'],['0','1']]);expect(result.latest).toBeGreaterThan(11.96);
  expect(await video!.evaluate(v=>v===document.querySelector('video'))).toBe(true);expect(await ui(page).getByRole('status').innerText()).toBe(liveMessage);
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');expect(await page.locator('video').evaluate(v=>(v as HTMLVideoElement).currentTime)).toBeLessThan(1);
  for(let cycle=0;cycle<2;cycle++){
    await expect(ui(page).locator('.portrait-playback-captions')).toContainText('download my CV',{timeout:13_000});
    await expect(ui(page).locator('.portrait-playback-captions')).toContainText('full-stack developer',{timeout:7000});
    await expect(page.locator('video')).toHaveJSProperty('muted',false);await expect(page.locator('video')).toHaveJSProperty('loop',true);
  }
});

test('hidden arrival defers all media; return resumes muted but manual pause persists',async({page})=>{
  await fakeMedia(page);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});});
  await open(page);await expect(page.locator('video,audio')).toHaveCount(0);
  await hidden(page,false);await expect.poll(()=>calls(page)).toBe(1);await event(page,'playing');
  await hidden(page,true);await expect(page.locator('video')).toHaveJSProperty('paused',true);
  await hidden(page,false);await expect.poll(()=>calls(page)).toBe(2);await event(page,'playing');
  await pause(page).click();await hidden(page,true);await hidden(page,false);
  expect(await calls(page)).toBe(2);await expect(resume(page)).toBeVisible();
  await resume(page).click();await event(page,'playing');await expect(page.locator('video')).toHaveJSProperty('muted',true);
});

test('a genuinely offscreen arrival waits for intersection before creating media',async({page})=>{
  await fakeMedia(page);await page.setViewportSize({width:390,height:600});await page.emulateMedia({reducedMotion:'no-preference'});
  let release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/review-assets/profile-original-hands.webp',async route=>{await gate;await route.continue();});
  await page.goto('/profile',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state','loading');
  await page.locator('.record-tabs').evaluate(e=>e.scrollIntoView());release();
  await expect(page.locator('.standing-portrait-stage')).toHaveAttribute('data-state','ready');
  await expect(page.locator('.standing-portrait-figure')).toHaveAttribute('data-entrance','false');
  await expect(page.locator('video,audio')).toHaveCount(0);
  await page.locator('main').evaluate(e=>{e.scrollTop=0;});await expect.poll(()=>calls(page)).toBe(1);await event(page,'playing');
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
});

test('offscreen playback suspends sound and video, then respects the explicit sound preference',async({page})=>{
  await fakeMedia(page);await page.setViewportSize({width:390,height:600});await page.emulateMedia({reducedMotion:'no-preference'});await open(page);
  await expect.poll(()=>calls(page)).toBe(1);await event(page,'playing');await hear(page).click();await event(page,'playing',1);
  await page.locator('.record-tabs').evaluate(e=>e.scrollIntoView());await expect(page.locator('video')).toHaveJSProperty('muted',true);await expect(page.locator('video')).toHaveJSProperty('paused',true);
  await page.locator('main').evaluate(e=>{e.scrollTop=0;});await expect.poll(()=>calls(page)).toBe(3);await event(page,'playing');
  await expect(ui(page)).toHaveAttribute('data-playback','speaking');await expect(page.locator('video')).toHaveJSProperty('muted',false);
});

test('reduced motion starts still; explicit audio plays once, can mute and pause, and never loops',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});const urls:string[]=[];page.on('request',r=>{if(r.url().includes('/media/profile/'))urls.push(r.url());});
  await open(page);await expect(page.locator('video,audio')).toHaveCount(0);expect(urls).toEqual([]);
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');await expect(page.locator('video')).toHaveCount(0);await expect(page.locator('audio')).toHaveJSProperty('loop',false);
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('full-stack developer');
  await pause(page).click();await page.getByRole('button',{name:'Mute introduction',exact:true}).click();await expect(page.locator('audio')).toHaveJSProperty('paused',true);await expect(resume(page)).toBeVisible();
  await resume(page).click();await expect(page.locator('audio')).toHaveJSProperty('paused',false);
  await page.locator('.portrait-transcript summary').press('Enter');await expect(ui(page).locator('details p')).toContainText('dependable back-end systems.');
});

test('fresh audible policy rejection immediately falls back muted, then only Enable sound unmutes',async({page})=>{
  await page.addInitScript(()=>{
    sessionStorage.removeItem('profile-portrait-playback-v2');const play=HTMLMediaElement.prototype.play;Object.assign(window,{attempts:[] as boolean[]});let enabled=false;
    document.addEventListener('click',e=>{if((e.target as Element).closest('[aria-label="Enable sound"]'))enabled=true;},true);
    HTMLMediaElement.prototype.play=function(){(window as unknown as {attempts:boolean[]}).attempts.push(this.muted);return this.muted||enabled?play.call(this):Promise.reject(new DOMException('Blocked','NotAllowedError'));};
  });
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect(ui(page)).toHaveAttribute('data-playback','looping');
  expect(await page.evaluate(()=>(window as unknown as {attempts:boolean[]}).attempts)).toEqual([false,true]);
  await page.getByRole('tab',{name:'Capabilities',exact:true}).click();await hidden(page,true);await hidden(page,false);await expect(ui(page)).toHaveAttribute('data-playback','looping');await expect(page.locator('video')).toHaveJSProperty('muted',true);
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
});

test('both policy attempts blocked retain still with working explicit Play and no visibility retries',async({page})=>{
  await page.addInitScript(()=>{sessionStorage.removeItem('profile-portrait-playback-v2');const play=HTMLMediaElement.prototype.play;Object.assign(window,{attempts:0});let enabled=false;document.addEventListener('click',e=>{if((e.target as Element).closest('[aria-label="Play introduction"]'))enabled=true;},true);HTMLMediaElement.prototype.play=function(){(window as unknown as {attempts:number}).attempts++;return enabled?play.call(this):Promise.reject(new DOMException('Blocked','NotAllowedError'));};});
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect(ui(page)).toHaveAttribute('data-playback','blocked');
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('opacity','1');await hidden(page,true);await hidden(page,false);
  expect(await page.evaluate(()=>(window as unknown as {attempts:number}).attempts)).toBe(2);
  await page.getByRole('button',{name:'Play introduction',exact:true}).click();await expect(ui(page)).toHaveAttribute('data-playback','looping');
});

test('opaque decoded alpha never appears; the same hearing action uses MP3 without a mode selector',async({page})=>{
  await fakeMedia(page,true);await page.emulateMedia({reducedMotion:'no-preference'});await open(page);expect(await calls(page)).toBe(0);
  await expect(ui(page)).toHaveAttribute('data-playback','error');await expect(page.locator('video,audio')).toHaveCount(0);await expect(page.locator('.standing-portrait-image')).toHaveCSS('opacity','1');
  await hear(page).click();await event(page,'playing');await expect(page.locator('audio')).toHaveCount(1);await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(ui(page).getByRole('button')).toHaveCount(2);
});

test('failed audio is retired and only an explicit hearing action creates a fresh attempt',async({page})=>{
  await fakeMedia(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  await hear(page).click();await event(page,'error');await expect(page.locator('audio')).toHaveCount(0);
  await hidden(page,true);await hidden(page,false);expect(await calls(page)).toBe(1);
  await page.getByRole('button',{name:'Play introduction',exact:true}).click();await event(page,'playing',1);await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await hidden(page,true);await hidden(page,false);await expect(page.locator('audio')).toHaveJSProperty('paused',true);
  await expect(page.locator('audio')).toHaveJSProperty('muted',true);expect(await calls(page)).toBe(2);
});

test('real video-request failures fall back to explicit MP3 and keep CV usable',async({page})=>{
  await page.route('**/media/profile/*.webm',r=>r.abort());await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect(ui(page)).toHaveAttribute('data-playback','error');
  await expect(page.locator('video,audio')).toHaveCount(0);await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(page.locator('audio')).toHaveAttribute('src','/media/profile/mahmoud-introduction.mp3');
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).press('Enter');expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
});

test('unsupported codecs never start voice automatically; the same hearing action uses MP3',async({page})=>{
  await page.addInitScript(()=>{HTMLVideoElement.prototype.canPlayType=()=>'';});
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect(ui(page)).toHaveAttribute('data-playback','error');
  await expect(page.locator('video,audio')).toHaveCount(0);await expect(page.getByRole('button',{name:'Play introduction',exact:true})).toBeEnabled();
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');await expect(page.locator('audio')).toHaveCount(1);
});

test('real failed audio requests retain stable layout, hearing focus and CV/record access',async({page})=>{
  await page.route('**/media/profile/*.mp3',r=>r.abort());await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  const geometry=()=>page.evaluate(()=>['.standing-portrait-stage','.portrait-playback-details','.profile-intro','.record-tabs'].map(s=>{const e=document.querySelector(s)as HTMLElement;return[e.offsetWidth,e.offsetHeight,e.offsetTop];}));
  const before=await geometry();await hear(page).press('Enter');await expect(ui(page)).toHaveAttribute('data-playback','error');
  await expect(page.getByRole('button',{name:'Mute introduction',exact:true})).toBeFocused();await expect(page.locator('video,audio')).toHaveCount(0);expect(await geometry()).toEqual(before);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).press('Enter');expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
  await page.getByRole('tab',{name:'Capabilities',exact:true}).click();await expect(page.getByRole('tab',{name:'Capabilities',exact:true})).toHaveAttribute('aria-selected','true');
});

test('CV and Profile record controls remain independent during active automatic playback',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1024});await open(page);
  await expect(ui(page)).toHaveAttribute('data-playback','looping');const video=await page.locator('video').elementHandle();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).press('Enter');expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
  await page.getByRole('tab',{name:'Capabilities',exact:true}).click();await expect(page.getByRole('tab',{name:'Capabilities',exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('tabpanel',{name:'Capabilities',exact:true})).toHaveJSProperty('hidden',false);
  await expect(ui(page)).toHaveAttribute('data-playback','looping');expect(await video!.evaluate(v=>v===document.querySelector('video'))).toBe(true);
});

test('buffering watchdog is canceled by pause; failed/slow playback never retries continuously',async({page})=>{
  await fakeMedia(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page);await page.clock.install();await page.emulateMedia({reducedMotion:'no-preference'});
  await expect.poll(()=>calls(page)).toBe(1);await pause(page).click();await page.clock.fastForward(15_001);await expect(resume(page)).toBeVisible();
  await resume(page).click();await event(page,'playing');await event(page,'waiting');await expect(ui(page)).toHaveAttribute('data-playback','loading');
  await event(page,'playing');await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await event(page,'waiting');await page.clock.fastForward(15_001);await expect(ui(page)).toHaveAttribute('data-playback','error');
  await hidden(page,true);await hidden(page,false);expect(await calls(page)).toBe(2);
});

test('native readiness gates silent startup and refill, while advancing data refreshes only the 15s inactivity deadline',async({page})=>{
  await fakeMedia(page);
  await page.addInitScript(()=>{
    const buffer={ready:3,end:0};Object.assign(window,{refillBuffer:buffer});
    Object.defineProperty(HTMLMediaElement.prototype,'readyState',{configurable:true,get:()=>buffer.ready});
    Object.defineProperty(HTMLMediaElement.prototype,'buffered',{configurable:true,get:()=>({length:buffer.end?1:0,end:()=>buffer.end})});
  });
  await page.emulateMedia({reducedMotion:'reduce'});await open(page);await page.clock.install();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(page.locator('video')).toHaveCount(1);expect(await calls(page)).toBe(0);
  await expect(ui(page)).toHaveAttribute('data-playback','loading');
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('opacity','1');
  await page.clock.fastForward(14_000);
  await page.evaluate(()=>{const b=(window as unknown as {refillBuffer:{ready:number;end:number}}).refillBuffer;b.end=2;document.querySelector('video')!.dispatchEvent(new Event('progress'));});
  await page.clock.fastForward(14_000);await expect(ui(page)).toHaveAttribute('data-playback','loading');
  await page.evaluate(()=>{(window as unknown as {refillBuffer:{ready:number}}).refillBuffer.ready=4;document.querySelector('video')!.dispatchEvent(new Event('canplaythrough'));});
  await expect.poll(()=>calls(page)).toBe(1);await event(page,'playing');
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await page.evaluate(()=>{(window as unknown as {refillBuffer:{ready:number}}).refillBuffer.ready=3;document.querySelector('video')!.dispatchEvent(new Event('waiting'));});
  await expect(ui(page)).toHaveAttribute('data-playback','loading');
  await expect(page.locator('video')).toHaveJSProperty('paused',true);
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('opacity','0');
  await page.clock.fastForward(14_000);
  await page.locator('video').evaluate(v=>v.dispatchEvent(new Event('progress'))); // Same range: no refresh.
  await page.clock.fastForward(1_001);await expect(ui(page)).toHaveAttribute('data-playback','error');
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('opacity','1');
  await expect(hear(page)).toBeEnabled();await expect(page.locator('video')).toHaveCount(0);
});

test('late promises/events after mute, reduced motion or unmount cannot revive audible playback',async({page})=>{
  await fakeMedia(page);await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect.poll(()=>calls(page)).toBe(1);
  await hear(page).click();await page.getByRole('button',{name:'Mute introduction',exact:true}).click();await event(page,'playing',1,1);
  await expect(page.locator('video')).toHaveJSProperty('muted',true);
  await hear(page).click();await page.emulateMedia({reducedMotion:'reduce'});await event(page,'playing',2);
  await expect(page.locator('video')).toHaveJSProperty('muted',true);await expect(page.locator('video')).toHaveJSProperty('paused',true);
  await page.locator('header nav a[href="/projects"]').click();await expect(page.locator('.profile-page')).toHaveCount(0);await event(page,'playing');
  await expect(page.locator('video,audio')).toHaveCount(0);await page.goBack();await expect(page.getByRole('button',{name:'Play introduction',exact:true})).toBeVisible();await expect(page.locator('video,audio')).toHaveCount(0);
});

test('muted and audible captions stay synchronized without recurring screen-reader announcements',async({page})=>{
  await fakeMedia(page);await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect.poll(()=>calls(page)).toBe(1);await event(page,'playing');
  await expect(ui(page).locator('.portrait-playback-captions')).toHaveAttribute('aria-live','off');const before=await ui(page).getByRole('status').innerText();
  for(let cycle=0;cycle<10;cycle++)for(const [time,text]of [[.25,''],[.26,'Hi, I am Mahmoud, a full-stack developer.'],[4.08,''],[4.66,'I build clear interfaces and dependable back-end systems.'],[8.1,''],[8.76,'Explore my projects, or download my CV.'],[11.68,'']]as const){await event(page,'timeupdate',time);await expect(ui(page).locator('.portrait-playback-captions')).toHaveText(text);}
  expect(await calls(page)).toBe(1);expect(await ui(page).getByRole('status').innerText()).toBe(before);
});

test('session pause and mute survive leaving Profile; sound does not override an explicit pause',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await pause(page).click();await hear(page).click();await expect(resume(page)).toBeVisible();await expect(page.locator('video')).toHaveJSProperty('paused',true);
  await page.locator('header nav a[href="/projects"]').click();await expect(page.locator('video,audio')).toHaveCount(0);await page.goBack();
  await expect(resume(page)).toBeVisible();await expect(page.getByRole('button',{name:'Mute introduction',exact:true})).toBeVisible();await expect(page.locator('video,audio')).toHaveCount(0);
  await resume(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
});
