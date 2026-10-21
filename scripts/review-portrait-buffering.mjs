// Compiled /profile measurements with real decoding and a native cache/range
// server. API responses must be frozen GET fixtures, never a live write API.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const phase=process.argv[2]??'before',folder='docs/design/profile-portrait-buffering';
const base=process.env.PLAYWRIGHT_BASE_URL??`http://127.0.0.1:${process.argv.includes('--final')?5197:5196}`;
const extended=process.argv.includes('--extended');
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
const cases=[390,1280].flatMap(width=>(extended?[400]:[0,1500,400]).flatMap(kbps=>['whole-page','media-only'].map(scope=>({width,kbps,scope}))));
const inspect=()=>{
 const records={events:[],first:null,loops:0,overlaps:0,gaps:0,maxElements:0,frames:0,samples:[]};window.playbackMeasurement=records;
 const start=performance.now();let previous=0,revealed=false,lastSample=-1000;
 for(const name of ['loadstart','loadedmetadata','loadeddata','playing','waiting','stalled','pause','seeking','seeked','ended','error','progress'])document.addEventListener(name,event=>{
  const v=event.target;if(!(v instanceof HTMLMediaElement))return;
  records.events.push({at:Math.round(performance.now()-start),name,time:v.currentTime,ready:v.readyState,buffered:Array.from({length:v.buffered.length},(_,i)=>[v.buffered.start(i),v.buffered.end(i)]),muted:v.muted});
 },true);
 const sample=()=>{
  const v=document.querySelector('video'),stage=document.querySelector('.standing-portrait-stage'),ui=document.querySelector('.portrait-introduction');
  const at=performance.now()-start;
  if(v&&stage){
   const shown=stage.dataset.videoVisible==='true';
   if(shown&&records.first===null)records.first={at:Math.round(at),mediaTime:v.currentTime,alpha:v.dataset.alpha};
   if(previous-v.currentTime>5)records.loops++;previous=v.currentTime;
   if(shown)revealed=true;
   if(revealed){const a=Number(getComputedStyle(stage.querySelector('.standing-portrait-image')).opacity),b=Number(getComputedStyle(stage.querySelector('.standing-portrait-media')).opacity);if(a>.01&&b>.01)records.overlaps++;if(a<.01&&b<.01)records.gaps++;}
  }
  records.frames++;records.maxElements=Math.max(records.maxElements,document.querySelectorAll('video,audio').length);
  if(at-lastSample>=250){lastSample=at;records.samples.push({at:Math.round(at),state:ui?.dataset.playback,time:v?.currentTime,paused:v?.paused,muted:v?.muted,buffered:v?Array.from({length:v.buffered.length},(_,i)=>[v.buffered.start(i),v.buffered.end(i)]):[]});}
  requestAnimationFrame(sample);
 };requestAnimationFrame(sample);
};
let next=0;
async function worker(){while(next<cases.length){
 const item=cases[next++],{width,kbps,scope}=item;
 const context=await browser.newContext({viewport:{width,height:width===390?844:720},reducedMotion:scope==='media-only'?'reduce':'no-preference'});
 const page=await context.newPage(),session=await context.newCDPSession(page),requests=[],writes=[],errors=[];
 await page.addInitScript(inspect);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method());});
 await session.send('Network.enable');
 session.on('Network.requestWillBeSent',e=>requests.push({id:e.requestId,url:e.request.url.split('/').pop(),media:e.request.url.includes('/media/profile/'),type:e.type,at:e.timestamp,range:e.request.headers.Range??null}));
 session.on('Network.responseReceived',e=>{const row=requests.findLast(r=>r.id===e.requestId);if(row)Object.assign(row,{status:e.response.status,fromDiskCache:e.response.fromDiskCache,fromServiceWorker:e.response.fromServiceWorker,mime:e.response.mimeType});});
 session.on('Network.loadingFinished',e=>{const row=requests.findLast(r=>r.id===e.requestId);if(row)Object.assign(row,{bytes:e.encodedDataLength,end:e.timestamp});});
 session.on('Network.dataReceived',e=>{const row=requests.findLast(r=>r.id===e.requestId);if(row){row.dataBytes=(row.dataBytes??0)+e.dataLength;row.transferBytes=(row.transferBytes??0)+e.encodedDataLength;}});
 session.on('Network.loadingFailed',e=>{const row=requests.findLast(r=>r.id===e.requestId);if(row)Object.assign(row,{cancelled:e.canceled,error:e.errorText});});
 const network=async enabled=>session.send('Network.emulateNetworkConditions',{offline:false,latency:enabled&&kbps?150:0,downloadThroughput:enabled&&kbps?kbps*1000/8:-1,uploadThroughput:enabled&&kbps?kbps*1000/8:-1});
 try{for(const visit of ['cold','warm']){
  requests.length=0;
  await page.emulateMedia({reducedMotion:scope==='media-only'?'reduce':'no-preference'});
  await network(scope==='whole-page');
  const origin=Date.now();await page.goto(base+'/profile',{waitUntil:'domcontentloaded',timeout:90_000});
  let mediaStart=0;
  if(scope==='media-only'){
   await page.locator('.standing-portrait-image').evaluate(i=>i.decode());await page.evaluate(()=>document.fonts.ready);
   await network(true);mediaStart=await page.evaluate(()=>performance.now());await page.emulateMedia({reducedMotion:'no-preference'});
  }
  const duration=extended?(visit==='warm'?18_000:scope==='whole-page'?140_000:110_000):kbps===400?60_000:kbps===1500?35_000:18_000;
  await page.waitForTimeout(duration);
  const data=await page.evaluate(()=>({review:window.playbackMeasurement,network:navigator.connection?{downlink:navigator.connection.downlink,effectiveType:navigator.connection.effectiveType,saveData:navigator.connection.saveData}:null,stage:document.querySelector('.standing-portrait-stage')?.getBoundingClientRect().toJSON(),state:document.querySelector('.portrait-introduction')?.dataset.playback,overflow:document.documentElement.scrollWidth>innerWidth||document.querySelector('main')?.scrollWidth>document.querySelector('main')?.clientWidth}));
  const row={phase,...item,latencyMs:kbps?150:0,visit,mediaStart,observedMs:Date.now()-origin,...data,requests:[...requests],writes:[...writes],errors:[...errors]};
  await page.screenshot({path:`${folder}/${phase}-${width}-${kbps}-${scope}-${visit}.jpg`,quality:78});
  results.push(row);await writeFile(`${folder}/${phase}-network.json`,'[\n'+results.map(r=>JSON.stringify(r)).join(',\n')+'\n]\n');
  console.log(JSON.stringify({phase,...item,visit,firstMs:data.review.first?data.review.first.at-mediaStart:null,state:data.state,loops:data.review.loops,waiting:data.review.events.filter(e=>e.name==='waiting').map(e=>({at:e.at-mediaStart,time:e.time})),selected:[...new Set(requests.filter(r=>r.media).map(r=>r.url))],mediaRequests:requests.filter(r=>r.media).length,network:data.network}));
  await page.goto('about:blank');
 }}finally{await context.close();}
}}
try{await Promise.all([worker(),worker(),worker()]);}finally{await browser.close();}
