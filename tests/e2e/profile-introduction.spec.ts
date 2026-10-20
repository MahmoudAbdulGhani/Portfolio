import { expect, test, type Page } from '@playwright/test';
const person = { name:'Mahmoud Hussein Abdul Ghani', title:'Full-Stack Software Engineer', photo:'/myphoto.jpeg', bio:'Profile', experience:[], socials:[], location:'Tripoli, Lebanon', languages:'Arabic and English' };
test.beforeEach(async ({page})=>{
  await page.route('**/api/**',route=>route.fulfill(new URL(route.request().url()).pathname==='/api/cv.pdf'
    ? {contentType:'application/pdf',body:'%PDF-1.4\nCV fixture'} : {json:new URL(route.request().url()).pathname==='/api/profile'?person:[]}));
});
const ui=(p:Page)=>p.locator('.portrait-introduction');
const hear=(p:Page)=>p.getByRole('button',{name:'Hear introduction',exact:true});
const pause=(p:Page)=>p.getByRole('button',{name:'Pause animation',exact:true});
const resume=(p:Page)=>p.getByRole('button',{name:'Resume animation',exact:true});
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
  HTMLMediaElement.prototype.pause=function(){flag(this).paused=true;queueMicrotask(()=>this.dispatchEvent(new Event('pause')));};
  HTMLMediaElement.prototype.load=function(){};
  for(const key of ['paused','ended'] as const)Object.defineProperty(HTMLMediaElement.prototype,key,{configurable:true,get(){return flag(this)[key];}});
  Object.defineProperty(HTMLMediaElement.prototype,'currentTime',{configurable:true,get(){return flag(this).time;},set(time){flag(this).time=time;}});
  Object.defineProperty(HTMLMediaElement.prototype,'readyState',{configurable:true,get:()=>4});
  for(const [key,value]of Object.entries({videoWidth:480,videoHeight:848}))Object.defineProperty(HTMLVideoElement.prototype,key,{configurable:true,get:()=>value});
  HTMLVideoElement.prototype.requestVideoFrameCallback=function(callback){queueMicrotask(()=>callback(0,{} as VideoFrameCallbackMetadata));return 1;};
  HTMLVideoElement.prototype.cancelVideoFrameCallback=function(){};
  CanvasRenderingContext2D.prototype.drawImage=function(){};
  CanvasRenderingContext2D.prototype.getImageData=function(){return{data:new Uint8ClampedArray(64).fill(opaque?255:0)}as ImageData;};
},{opaque});}
async function event(page:Page,name:string,time?:number,index=-1){await page.evaluate(({name,time,index})=>{
  const w=window as unknown as {portraitMedia:{media:HTMLMediaElement;resolve:()=>void}[];portraitFlags:(m:HTMLMediaElement)=>{ended:boolean;paused:boolean;time:number}};
  const entry=w.portraitMedia[index<0?w.portraitMedia.length-1:index];
  if(time!==undefined)entry.media.currentTime=time;
  if(name==='ended'){w.portraitFlags(entry.media).ended=true;w.portraitFlags(entry.media).paused=true;}
  entry.media.dispatchEvent(new Event(name));entry.resolve();
},{name,time,index});}
async function calls(page:Page){return page.evaluate(()=>(window as unknown as {portraitMedia:unknown[]}).portraitMedia.length);}

test('arrival, speech restart and cycle boundaries never composite two facial poses',async({page})=>{
  test.setTimeout(35_000);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{
    const inspection={samples:0,overlaps:[] as number[][],gaps:0};
    Object.assign(window,{portraitComposites:inspection});
    const sample=()=>{
      const stage=document.querySelector('.standing-portrait-stage[data-state="ready"]');
      const still=stage?.querySelector('.standing-portrait-image');
      const media=stage?.querySelector('.standing-portrait-media');
      if(still&&media){
        const a=Number(getComputedStyle(still).opacity),b=Number(getComputedStyle(media).opacity);
        inspection.samples++;
        if(a>0.01&&b>0.01)inspection.overlaps.push([a,b]);
        if(a<0.01&&b<0.01)inspection.gaps++;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await open(page);await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(hear(page)).toBeVisible({timeout:15_000});
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await pause(page).click();await resume(page).click();
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
  const result=await page.evaluate(()=>(window as unknown as {portraitComposites:{samples:number;overlaps:number[][];gaps:number}}).portraitComposites);
  expect(result.samples).toBeGreaterThan(60);
  expect(result.overlaps).toEqual([]);
  expect(result.gaps).toBe(0);
});

for(const width of [320,390,430])test(`explicit hearing reveals complete captions above the footer at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:640});await page.emulateMedia({reducedMotion:'no-preference'});
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
  await expect(ui(page).locator('.portrait-playback-captions')).toHaveText('');
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

test('three real consecutive cycles reuse one muted element; speech completes once then returns to looping',async({page})=>{
  test.setTimeout(65_000); // Three 12s cycles plus one complete spoken take.
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page);
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
  const video=await page.locator('video').elementHandle();
  await video!.evaluate(v=>{const review={portraitEnds:0,bridges:[] as string[][]};Object.assign(window,{loopReview:review});v.addEventListener('ended',()=>{review.portraitEnds++;void Promise.allSettled(document.querySelector('.standing-portrait-media')!.getAnimations().map(a=>a.finished)).then(()=>review.bridges.push(['.standing-portrait-image','.standing-portrait-media'].map(s=>getComputedStyle(document.querySelector(s)!).opacity)));});});
  const liveMessage=await ui(page).getByRole('status').innerText();
  await page.waitForFunction(()=>{const review=(window as unknown as {loopReview:{portraitEnds:number;bridges:string[][]}}).loopReview;const video=document.querySelector('video')!;return review.portraitEnds>=3&&review.bridges.length>=3&&!video.paused&&video.currentTime<1;},undefined,{timeout:40_000});
  expect(await page.evaluate(()=>(window as unknown as {loopReview:{bridges:string[][]}}).loopReview.bridges)).toEqual([['1','0'],['1','0'],['1','0']]);
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await expect(page.locator('video')).toHaveJSProperty('muted',true);
  expect(await video!.evaluate(v=>v===document.querySelector('video'))).toBe(true);
  expect(await ui(page).getByRole('status').innerText()).toBe(liveMessage);
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(page.locator('video')).toHaveJSProperty('muted',false);
  expect(await page.locator('video').evaluate(v=>(v as HTMLVideoElement).currentTime)).toBeLessThan(1);
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('dependable back-end systems',{timeout:10_000});
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('download my CV',{timeout:7000});
  await expect(hear(page)).toBeVisible({timeout:7000});
  await expect(page.locator('video')).toHaveJSProperty('muted',true);
  await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await expect(ui(page).locator('.portrait-playback-captions')).toHaveText('');
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

test('offscreen playback suspends speech, returns muted and never resumes voice automatically',async({page})=>{
  await fakeMedia(page);await page.setViewportSize({width:390,height:600});await page.emulateMedia({reducedMotion:'no-preference'});await open(page);
  await expect.poll(()=>calls(page)).toBe(1);await event(page,'playing');
  await hear(page).click();await event(page,'playing',1);await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await page.locator('.record-tabs').evaluate(e=>e.scrollIntoView());await expect(page.locator('video')).toHaveJSProperty('muted',true);
  await expect(hear(page)).toHaveCount(1);
  await page.locator('main').evaluate(e=>{e.scrollTop=0;});await expect.poll(()=>calls(page)).toBe(3);await event(page,'playing');
  await expect(ui(page)).toHaveAttribute('data-playback','looping');await expect(page.locator('video')).toHaveJSProperty('muted',true);
});

test('reduced motion uses still plus explicit real audio; manual animation pause also keeps a still during speech',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});const urls:string[]=[];page.on('request',r=>{if(r.url().includes('/media/profile/'))urls.push(r.url());});
  await open(page);await expect(page.locator('video,audio')).toHaveCount(0);expect(urls).toEqual([]);
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');await expect(page.locator('audio')).toHaveCount(1);await expect(page.locator('video')).toHaveCount(0);
  await expect(ui(page).locator('.portrait-playback-captions')).toContainText('full-stack developer');
  await page.getByRole('button',{name:'Mute introduction',exact:true}).click();await expect(page.locator('audio')).toHaveJSProperty('muted',true);
  await page.emulateMedia({reducedMotion:'no-preference'});await expect(ui(page)).toHaveAttribute('data-playback','looping');
  await pause(page).click();await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(page.locator('video')).toHaveJSProperty('paused',true);await expect(page.locator('.standing-portrait-image')).toHaveCSS('opacity','1');
  await page.getByRole('button',{name:'Mute introduction',exact:true}).click();await expect(resume(page)).toBeVisible();
  await page.locator('.portrait-transcript summary').press('Enter');await expect(ui(page).locator('details p')).toContainText('dependable back-end systems.');
});

test('blocked autoplay attempts once, retains still, and only retries on an explicit Resume',async({page})=>{
  await page.addInitScript(()=>{Object.assign(window,{attempts:0});HTMLMediaElement.prototype.play=function(){(window as unknown as {attempts:number}).attempts++;return Promise.reject(new DOMException('Blocked','NotAllowedError'));};});
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect(ui(page)).toHaveAttribute('data-playback','blocked');
  await expect(page.locator('.standing-portrait-image')).toHaveCSS('opacity','1');
  await hidden(page,true);await hidden(page,false);expect(await page.evaluate(()=>(window as unknown as {attempts:number}).attempts)).toBe(1);
  await resume(page).click();await expect(ui(page)).toHaveAttribute('data-playback','blocked');expect(await page.evaluate(()=>(window as unknown as {attempts:number}).attempts)).toBe(2);
});

test('opaque decoded alpha never appears; the same hearing action uses MP3 without a mode selector',async({page})=>{
  await fakeMedia(page,true);await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect.poll(()=>calls(page)).toBe(1);await event(page,'playing');
  await expect(ui(page)).toHaveAttribute('data-playback','error');await expect(page.locator('video,audio')).toHaveCount(0);await expect(page.locator('.standing-portrait-image')).toHaveCSS('opacity','1');
  await hear(page).click();await event(page,'playing');await expect(page.locator('audio')).toHaveCount(1);await expect(ui(page)).toHaveAttribute('data-playback','speaking');
  await expect(ui(page).getByRole('button')).toHaveCount(2);
});

test('failed audio is retired and only an explicit hearing action creates a fresh attempt',async({page})=>{
  await fakeMedia(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  await hear(page).click();await event(page,'error');await expect(page.locator('audio')).toHaveCount(0);
  await hidden(page,true);await hidden(page,false);expect(await calls(page)).toBe(1);
  await hear(page).click();await event(page,'playing',1);await expect(ui(page)).toHaveAttribute('data-playback','speaking');
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
  await expect(page.locator('video,audio')).toHaveCount(0);await expect(pause(page)).toHaveAttribute('aria-disabled','true');
  await hear(page).click();await expect(ui(page)).toHaveAttribute('data-playback','speaking');await expect(page.locator('audio')).toHaveCount(1);
});

test('real failed audio requests retain stable layout, hearing focus and CV/record access',async({page})=>{
  await page.route('**/media/profile/*.mp3',r=>r.abort());await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  const geometry=()=>page.evaluate(()=>['.standing-portrait-stage','.portrait-playback-details','.profile-intro','.record-tabs'].map(s=>{const e=document.querySelector(s)as HTMLElement;return[e.offsetWidth,e.offsetHeight,e.offsetTop];}));
  const before=await geometry();await hear(page).press('Enter');await expect(ui(page)).toHaveAttribute('data-playback','error');
  await expect(hear(page)).toBeFocused();await expect(page.locator('video,audio')).toHaveCount(0);expect(await geometry()).toEqual(before);
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

test('late promises/events after mute, reduced motion or unmount cannot revive audible playback',async({page})=>{
  await fakeMedia(page);await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect.poll(()=>calls(page)).toBe(1);
  await hear(page).click();await page.getByRole('button',{name:'Mute introduction',exact:true}).click();await event(page,'playing',1,1);
  await expect(page.locator('video')).toHaveJSProperty('muted',true);
  await hear(page).click();await page.emulateMedia({reducedMotion:'reduce'});await event(page,'playing',2);
  await expect(page.locator('video')).toHaveJSProperty('muted',true);await expect(page.locator('video')).toHaveJSProperty('paused',true);
  await page.locator('header nav a[href="/projects"]').click();await expect(page.locator('.profile-page')).toHaveCount(0);await event(page,'playing');
  await expect(page.locator('video,audio')).toHaveCount(0);await page.goBack();await expect(hear(page)).toBeVisible();await expect(page.locator('video,audio')).toHaveCount(0);
});

test('only speech produces captions and status announcements do not repeat for visual cycles',async({page})=>{
  await fakeMedia(page);await page.emulateMedia({reducedMotion:'no-preference'});await open(page);await expect.poll(()=>calls(page)).toBe(1);await event(page,'playing');
  await event(page,'timeupdate',1);await expect(ui(page).locator('.portrait-playback-captions')).toHaveText('');
  const before=await ui(page).getByRole('status').innerText();await event(page,'ended',12);await expect.poll(()=>calls(page)).toBe(2);await event(page,'playing',0);
  expect(await ui(page).getByRole('status').innerText()).toBe(before);
  await hear(page).click();await event(page,'playing');
  for(const [time,text]of [[.25,''],[.26,'Hi, I am Mahmoud, a full-stack developer.'],[4.08,''],[4.66,'I build clear interfaces and dependable back-end systems.'],[8.1,''],[8.76,'Explore my projects, or download my CV.'],[11.68,'']]as const){await event(page,'timeupdate',time);await expect(ui(page).locator('.portrait-playback-captions')).toHaveText(text);}
});
