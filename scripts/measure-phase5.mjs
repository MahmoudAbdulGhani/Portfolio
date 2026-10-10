// Lab navigation samples: HTTP cold/warm, not real-user field data or phone GPUs.
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const output='docs/design/phase5/performance';
await mkdir(output,{recursive:true});
const content=JSON.parse(await readFile('.motion-preview/phase3-public-content.json','utf8'));
const browser=await chromium.launch({channel:'chrome'}),findings=[];
try{
  for(const environment of ['local','production']) for(const path of ['/','/projects/jobpilot-ai']) for(let sample=1;sample<=3;sample++){
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    if(environment==='local') await context.addInitScript(records=>{
      const original=fetch;
      window.fetch=(input,init)=>{
        const path=new URL(String(input),location.origin).pathname;
        const record=records[path]??records['/api/projects'].find(p=>path===`/api/projects/${p.slug}`);
        return record?Promise.resolve(new Response(JSON.stringify(record),{headers:{'Content-Type':'application/json'}})):original(input,init);
      };
    },content);
    const page=await context.newPage();
    await page.addInitScript(()=>{
      window.__phase5={lcp:0,shifts:[],longTasks:[]};
      new PerformanceObserver(list=>{window.__phase5.lcp=list.getEntries().at(-1).startTime;}).observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver(list=>window.__phase5.shifts.push(...list.getEntries().filter(e=>!e.hadRecentInput).map(e=>({start:e.startTime,value:e.value})))).observe({type:'layout-shift',buffered:true});
      new PerformanceObserver(list=>window.__phase5.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
    });
    const cdp=await context.newCDPSession(page);
    await cdp.send('Network.enable');
    for(const cache of ['cold','warm']){
      const transfers=[];
      const onFinish=e=>transfers.push(e.encodedDataLength);
      cdp.on('Network.loadingFinished',onFinish);
      await page.goto((environment==='local'?'http://127.0.0.1:5184':'https://mahmoud-portfolio-omega.vercel.app')+path,{waitUntil:'domcontentloaded'});
      await page.waitForTimeout(4000);
      const metrics=await page.evaluate(()=>({
        ...window.__phase5,
        navigation:performance.getEntriesByType('navigation')[0].toJSON(),
        paints:performance.getEntriesByType('paint').map(e=>e.toJSON()),
        resources:performance.getEntriesByType('resource').map(e=>({url:e.name,type:e.initiatorType,duration:e.duration,transfer:e.transferSize,encoded:e.encodedBodySize,decoded:e.decodedBodySize})),
        images:[...document.images].filter(e=>e.getBoundingClientRect().width>0).map(e=>({source:e.currentSrc,width:e.naturalWidth,ready:e.complete&&e.naturalWidth>0,slot:e.getBoundingClientRect().width})),
      }));
      cdp.off('Network.loadingFinished',onFinish);
      findings.push({environment,path,sample,cache,networkBytes:transfers.reduce((a,b)=>a+b,0),metrics});
      console.log(`${environment} ${path} ${sample} ${cache}: LCP ${Math.round(metrics.lcp)}ms, shifts ${metrics.shifts.reduce((a,b)=>a+b.value,0).toFixed(4)}, bytes ${transfers.reduce((a,b)=>a+b,0)}`);
    }
    await context.close();
  }
}finally{await browser.close();}
await writeFile(`${output}/navigation.json`,JSON.stringify({date:new Date().toISOString(),environment:'Windows Intel desktop Chrome, 390px emulation, unthrottled. Three cold-context samples per route/environment; each followed by warm same-context navigation. GPU/OS caches are not reset. Local API fetches use captured records and do not measure server latency. Images and compiled assets use real HTTP; production requests are ordinary bounded navigations, with no stress or submissions. Four-second observation; lab LCP/CLS samples are not INP/field data.',findings},null,2)+'\n');
