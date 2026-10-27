import {expect,test,type Page} from '@playwright/test';
import {caseStudyProjects} from '../fixtures/case-study-projects';
import {caseImage} from '../fixtures/case-image';

// Reliability checks never use retries to mask a missed readiness transition.
test.describe.configure({retries:0});
async function fixtures(page:Page){
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.route('https://screens.example.test/**',async r=>r.fulfill({contentType:'image/png',body:await caseImage(r.request().url())}));
  await page.route('**/api/**',r=>{
    const path=new URL(r.request().url()).pathname;
    return r.fulfill({json:path==='/api/projects'?caseStudyProjects:path.startsWith('/api/projects/')?caseStudyProjects.find(p=>path===`/api/projects/${p.slug}`):[]});
  });
}
test.beforeEach(async({page})=>fixtures(page));

test('the first scene paint belongs to the running opening clock, including a cold long paint',async({page})=>{
  await page.addInitScript(()=>{
    let target:WebGLFramebuffer|null=null,stalled=false;
    const bind=WebGL2RenderingContext.prototype.bindFramebuffer;
    const draw=WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.bindFramebuffer=function(kind:number,framebuffer:WebGLFramebuffer|null){
      if(kind===this.FRAMEBUFFER||kind===this.DRAW_FRAMEBUFFER)target=framebuffer;
      return bind.call(this,kind,framebuffer);
    };
    WebGL2RenderingContext.prototype.drawElements=function(...args:Parameters<typeof draw>){
      const canvas=this.canvas;
      if(!stalled&&target===null&&canvas instanceof HTMLCanvasElement&&canvas.closest('.motion-rig')){
        stalled=true;
        (window as unknown as {firstScenePaintPhase:string|null}).firstScenePaintPhase=document.querySelector('.stage')?.getAttribute('data-motion-phase')??null;
        // Controlled first default-framebuffer draw; environment/shadow passes
        // use their own framebuffer. No claim about a physical GPU's speed.
        const until=performance.now()+1100;
        while(performance.now()<until){/* cold paint */}
      }
      return draw.apply(this,args);
    } as typeof draw;
  });
  await page.goto('/?project=jobpilot-ai');
  await expect(stage(page)).toHaveAttribute('data-selection-state','settled');
  await expect(stage(page)).toHaveAttribute('data-motion-renderer','webgl');
  expect(await page.evaluate(()=>(window as unknown as {firstScenePaintPhase:string|null}).firstScenePaintPhase)).toBe('opening');
  await expect(page.locator('.open-case')).toBeFocused();
});
const stage=(page:Page)=>page.locator('.stage');
async function recovered(page:Page){
  await expect(stage(page)).toHaveAttribute('data-selection-state','settled');
  await expect(stage(page)).toHaveAttribute('data-motion-renderer','fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(await page.locator('.selection-detail').evaluate(el=>(el as HTMLElement).inert)).toBe(false);
  await expect(page.locator('.product-surface')).toHaveCSS('opacity','1');
}
async function holdEngine(page:Page){
  let release!:()=>void;
  const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/motion-rig.ts*',async r=>{await pending;await r.continue();});
  return release;
}

test('an unresolved engine is retired into usable photographic content and its late import cannot revive it',async({page})=>{
  const release=await holdEngine(page);
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.open-case')).toBeFocused();
  await expect(stage(page)).toHaveAttribute('data-motion-phase','selecting');
  await recovered(page);
  await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
  release();
  await page.waitForTimeout(300);
  await recovered(page);
  await page.locator('.open-case').click();
  await expect(page).toHaveURL(/projects\/jobpilot-ai$/);
  await page.goBack();
  await expect(stage(page)).toHaveAttribute('data-selection-state','settled');
  await expect(page.locator('.open-case')).toBeFocused();
});

test('an initialized rig with a missing ready notification is disposed before a late notification',async({page})=>{
  await page.addInitScript(()=>{
    (window as unknown as {rigCanvases:number}).rigCanvases=0;
    new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes){
        if(node instanceof HTMLCanvasElement)(window as unknown as {rigCanvases:number}).rigCanvases++;
      }
    }).observe(document,{subtree:true,childList:true});
  });
  await page.route('**/MotionRig.tsx*',async r=>{
    const response=await r.fetch(),body=(await response.text()).replace('onReady(renderer);','setTimeout(() => { if (!cancelled) onReady(renderer); }, 4200);');
    expect(body).not.toBe(await response.text());
    await r.fulfill({response,body});
  });
  await page.goto('/?project=jobpilot-ai');
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {rigCanvases:number}).rigCanvases)).toBeGreaterThanOrEqual(1);
  await recovered(page);
  await page.waitForTimeout(2100);
  await recovered(page);
});

test('a synchronous late initialization is rejected before it starts an obsolete opening clock',async({page})=>{
  await page.route('**/MotionRig.tsx*',async r=>{
    const response=await r.fetch(),body=(await response.text()).replace('onReady(renderer);','const lateUntil = performance.now() + 2800; while (performance.now() < lateUntil) {} onReady(renderer);');
    expect(body).not.toBe(await response.text());
    await r.fulfill({response,body});
  });
  await page.goto('/?project=jobpilot-ai');
  await recovered(page);
  await expect(page.locator('.open-case')).toBeFocused();
});

test('pending decorative and preview assets cannot strand navigation or overlap the following content',async({page})=>{
  let release!:()=>void;
  const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/landscape/*sculpture.webp',async r=>{await pending;await r.continue();});
  await page.route('https://screens.example.test/**',async r=>{await pending;await r.abort();});
  await page.goto('/?project=construction-project-management-accounting-system');
  await expect(page.locator('.open-case')).toBeFocused();
  await recovered(page);
  await expect(page.getByText('Loading project preview…')).toBeVisible();
  release();
  await expect(page.getByText('Preview unavailable. Open the case study for project details.')).toBeVisible();
  await recovered(page);
  const boxes=await page.locator('.selection-frame').evaluate(el=>({bottom:el.querySelector('.selection-image-frame')!.getBoundingClientRect().bottom,caption:el.querySelector('.selection-detail')!.getBoundingClientRect().top}));
  expect(boxes.caption).toBeGreaterThanOrEqual(boxes.bottom);
  await page.locator('.open-case').click();
  await expect(page).toHaveURL(/projects\/construction-project-management-accounting-system$/);
});

test('interruption retires the previous selection before the shared import resolves',async({page})=>{
  const release=await holdEngine(page);
  await page.goto('/');
  await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
  await expect(stage(page)).toHaveAttribute('data-motion-phase','selecting');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Explore Cedar Construction',exact:true}).click();
  release();
  await expect(stage(page)).toHaveAttribute('data-selection-state','settled');
  await expect(page.locator('.selection-detail h1')).toHaveText('Cedar Construction');
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-rig','cedar');
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.waitForTimeout(1000);
  await expect(page.locator('.motion-rig')).toHaveAttribute('data-rig','cedar');
});

test('a hidden pending tab returns with usable content and no obsolete renderer',async({page})=>{
  const release=await holdEngine(page);
  await page.goto('/?project=jobpilot-ai');
  await expect(stage(page)).toHaveAttribute('data-motion-phase','selecting');
  // Controlled visibility signal, not a claim of physical tab/device testing.
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await recovered(page);
  release();
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(300);
  await recovered(page);
  await page.locator('.explore-engineering').click();
  await expect(page.locator('#jobpilot-engineering')).toBeFocused();
  await expect(page.locator('#jobpilot-engineering')).toBeInViewport({ratio:1});
});

test('hidden-tab interruption of an opening cancels its clock and reveals the final photographic pose',async({page})=>{
  await page.addInitScript(()=>{
    let interrupted=false;
    new MutationObserver(()=>{
      if(interrupted||document.querySelector('.stage')?.getAttribute('data-selection-state')!=='opening')return;
      interrupted=true;
      Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
      document.dispatchEvent(new Event('visibilitychange'));
    }).observe(document,{subtree:true,attributes:true,attributeFilter:['data-selection-state']});
  });
  await page.goto('/?project=lobby');
  await recovered(page);
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(1100);
  await recovered(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Explore Lobby',exact:true})).toBeFocused();
});

test('native page freezing resumes into photographic recovery without an overdue initialization',async({page})=>{
  const release=await holdEngine(page);
  await page.goto('/?project=jobpilot-ai');
  await expect(stage(page)).toHaveAttribute('data-motion-phase','selecting');
  const session=await page.context().newCDPSession(page);
  try{
    await session.send('Page.setWebLifecycleState',{state:'frozen'});
    // Node remains live while native browser timers/frames are suspended.
    await new Promise(resolve=>setTimeout(resolve,2700));
  }finally{await session.send('Page.setWebLifecycleState',{state:'active'});}
  await recovered(page);
  release();
  await expect(page.locator('.open-case')).toBeFocused();
});

test('unavailable WebGL and reduced motion finish without waiting on decorative initialization',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){return type==='webgl2'?null:Reflect.apply(original,this,[type,...args]);} as typeof original;
  });
  await page.goto('/?project=jobpilot-ai');
  await expect(stage(page)).toHaveAttribute('data-selection-state','settled');
  await expect(stage(page)).toHaveAttribute('data-motion-renderer','fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?project=lobby');
  await expect(stage(page)).toHaveAttribute('data-selection-state','settled');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.open-case')).toBeFocused();
});

test('a render exception during articulation disposes the rig and completes the photographic handoff',async({page})=>{
  await page.addInitScript(()=>{
    const draw=WebGL2RenderingContext.prototype.drawElements;
    let failed=false;
    WebGL2RenderingContext.prototype.drawElements=function(...args:Parameters<typeof draw>){
      if(!failed&&document.querySelector('.stage')?.getAttribute('data-selection-state')==='opening'){
        failed=true;
        throw new Error('Controlled render failure');
      }
      return draw.apply(this,args);
    } as typeof draw;
  });
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/?project=lobby');
  await expect(stage(page)).toHaveAttribute('data-selection-state','settled');
  await expect(stage(page)).toHaveAttribute('data-motion-renderer','fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.product-surface')).toHaveCSS('opacity','1');
  expect(errors).toEqual([]);
  await page.locator('.open-case').click();
  await expect(page).toHaveURL(/projects\/lobby$/);
});

test('rapid reader Back restores JobPilot reading focus even when the destination never commits',async({page})=>{
  await page.goto('/projects/jobpilot-ai');
  await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
  for(let attempt=0;attempt<3;attempt++){
    await page.locator('.next-project').focus();
    await page.evaluate(()=>{
      document.querySelector<HTMLAnchorElement>('.next-project')!.click();
      history.back();
    });
    await expect(page).toHaveURL(/projects\/jobpilot-ai$/);
    await expect(page.locator('.project-reader#main-content')).toBeFocused();
  }
});

test('a superseded decode cannot mark the loaded replacement of a connected image as failed',async({page})=>{
  await page.addInitScript(()=>{
    const decode=HTMLImageElement.prototype.decode;
    const rejections:Array<()=>void>=[];
    let next=false;
    (window as unknown as {replaceCandidate:()=>void}).replaceCandidate=()=>{
      next=true;
      document.querySelector('.project-image-current img')!.dispatchEvent(new Event('load'));
      rejections.forEach(reject=>reject());
    };
    HTMLImageElement.prototype.decode=function(){
      if(!this.closest('.project-image-current'))return decode.call(this);
      if(!Object.getOwnPropertyDescriptor(this,'currentSrc')){
        const original=this.currentSrc||this.src;
        Object.defineProperty(this,'currentSrc',{configurable:true,get:()=>next?original+'?candidate=next':original});
      }
      if(next)return decode.call(this);
      return new Promise<void>((_resolve,reject)=>rejections.push(()=>reject(new Error('retired candidate decode'))));
    };
  });
  await page.goto('/?project=jobpilot-ai');
  // Readiness now follows decoding. Replace the held first candidate before
  // awaiting readiness; every original final assertion/deadline stays intact.
  await expect(page.locator('.project-image-handoff')).toHaveAttribute('data-image-state','loading');
  await page.evaluate(()=>(window as unknown as {replaceCandidate:()=>void}).replaceCandidate());
  await expect(page.locator('.project-image-handoff')).toHaveAttribute('data-image-state','ready');
  await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
  await expect(page.getByText('Preview unavailable. Open the case study for project details.')).toHaveCount(0);
  await expect(stage(page)).toHaveAttribute('data-selection-state','settled');
});

test('scroll from a retiring preview cannot overwrite its captured return position after history moves',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?project=jobpilot-ai');
  await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
  const open=page.locator('.open-case');
  await open.scrollIntoViewIfNeeded();
  // The compact approved layout can fit a tall tablet. Expand real content
  // so this regression genuinely exercises a nonzero source scroll.
  await page.locator('.boundary-disclosure summary').evaluate(el=>(el as HTMLElement).click());
  await expect(page.locator('.boundary-disclosure')).toHaveAttribute('data-expanded','true');
  await expect.poll(()=>page.evaluate(()=>document.scrollingElement!.scrollHeight-innerHeight)).toBeGreaterThan(80);
  await page.evaluate(()=>scrollTo(0,80));
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0);
  await open.evaluate(link=>link.addEventListener('click',()=>{
    (window as unknown as {returnSourcePosition:number}).returnSourcePosition=scrollY;
  },{capture:true,once:true}));
  await page.evaluate(()=>{
    document.addEventListener('click',()=>{
      if(location.pathname!=='/projects/jobpilot-ai'||!document.querySelector('.stage'))return;
      // React has not retired the preview, but history belongs to the reader.
      // Simulate its outgoing document's clamp, before a new route commits.
      scrollTo(0,0);
      document.dispatchEvent(new Event('scroll'));
      (window as unknown as {retiringScrollDelivered:boolean}).retiringScrollDelivered=true;
    },{once:true});
  });
  // Retain the intentional source scroll; pointer auto-scroll to the approved
  // higher CTA would otherwise replace the position this regression exercises.
  await open.evaluate(link=>(link as HTMLAnchorElement).click());
  const position=await page.evaluate(()=>(window as unknown as {returnSourcePosition:number}).returnSourcePosition);
  expect(position).toBeGreaterThan(0);
  await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
  expect(await page.evaluate(()=>(window as unknown as {retiringScrollDelivered:boolean}).retiringScrollDelivered)).toBe(true);
  await page.locator('.case-back').click();
  await expect(page.locator('.open-case')).toBeFocused();
  await expect(page.locator('.boundary-disclosure')).toHaveAttribute('data-expanded','true');
  await expect.poll(()=>page.evaluate(saved=>{
    const root=document.scrollingElement!;
    return Math.abs(scrollY-Math.min(saved,root.scrollHeight-root.clientHeight));
  },position)).toBeLessThan(0.5);
});
