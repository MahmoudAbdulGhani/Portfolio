import { expect,test,type Page } from '@playwright/test';
import { caseStudyProjects } from './fixtures/case-study-projects';
import { caseImage,sourceRequest } from './fixtures/case-image';
import { caseStudyFor } from '../shared/case-study-runtime';
import { detailScreens } from '../src/lib/project-detail-screens';

test.describe.configure({retries:0});
const production=process.env.JOBPILOT_TEST_PRODUCTION==='1';
const entry=production?'/':'/review/jobpilot/candidate', reader=production?'/projects/jobpilot-ai':entry+'/reader', baseline='/review/jobpilot/baseline';
const open=(page:Page)=>page.getByRole('link',{name:'Open case study',exact:true});
const choices=(page:Page)=>page.getByRole('group',{name:'Preview workflow'}).getByRole('button');
async function fixtures(page:Page,reduced=true){
  await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
  await page.route('https://screens.example.test/**',async route=>route.fulfill({contentType:'image/png',body:await caseImage(route.request().url())}));
  await page.route('**/api/**',route=>{
    const p=new URL(route.request().url()).pathname;
    return route.fulfill({json:p==='/api/projects'?caseStudyProjects:p.startsWith('/api/projects/')?caseStudyProjects.find(project=>p===`/api/projects/${project.slug}`):p==='/api/profile'?{name:'Review fixture',title:'Developer',socials:[],experience:[]}:[]});
  });
}
async function selected(page:Page,address=entry){
  await page.goto(address);await page.getByRole('button',{name:'Explore JobPilot AI',exact:true}).click();
  await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled');
  await expect(page.locator('.product-surface')).toHaveAttribute('data-image-ready','true');
}
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
async function naturalImage(page:Page,selector:string){
  await page.locator(selector).evaluate(image=>(image as HTMLImageElement).decode());
  const error=await page.locator(selector).evaluate(node=>{const image=node as HTMLImageElement,box=image.getBoundingClientRect();return Math.abs(box.height-box.width*image.naturalHeight/image.naturalWidth);});
  expect(error).toBeLessThan(1);
}
for(const [width,height] of [[320,844],[390,844],[430,844],[768,1024],[1280,720],[1440,900]])test(`candidate identity, complete images, early decision and return at ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width,height});await fixtures(page);await selected(page);
  await expect(page.locator('main h1')).toHaveCount(1);await expect(page.locator('.selection-caption')).toContainText('Review before saving');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',production?'index, follow':'noindex, nofollow');
  const identity=await page.locator('.selection-caption').evaluate(el=>{
    const a=el.querySelector('h1')!.getBoundingClientRect(),b=el.querySelector('.jobpilot-object-detail')!.getBoundingClientRect();
    return {overlap:a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top,first:el.closest('.selection-detail')!.compareDocumentPosition(document.querySelector('.selection-image-frame')!)&Node.DOCUMENT_POSITION_FOLLOWING};
  });
  expect(identity.overlap).toBe(false);expect(identity.first).toBeTruthy();await noOverflow(page);
  const composition=await page.locator('.selection-frame').evaluate(el=>{
    const box=(selector:string)=>el.querySelector(selector)!.getBoundingClientRect().toJSON();
    const controls=[...el.querySelectorAll('a,button')];
    return{identity:box('.selection-detail'),image:box('.selection-image-frame'),actions:box('.selection-project-links'),choices:box('.chapter-switch'),back:box('.back-collection'),cue:box('.screenshot-inspect-cue'),label:box('.jobpilot-screen-selection > .eyebrow'),actionIndex:controls.findIndex(node=>node.matches('.open-case')),choiceIndex:controls.indexOf(el.querySelector('.chapter-switch button:last-child')!)};
  });
  if(width<960){
    expect(composition.identity.bottom).toBeLessThan(composition.image.top);
    expect(composition.image.bottom).toBeLessThan(composition.choices.top);
    expect(composition.choices.bottom).toBeLessThan(composition.actions.top);
    expect(composition.back.bottom).toBeLessThan(composition.image.top);
    expect(composition.cue.bottom).toBeLessThanOrEqual(composition.label.top-3);
    expect(composition.actionIndex).toBeGreaterThan(composition.choiceIndex);
  }else{
    expect(composition.identity.right+24).toBeLessThanOrEqual(composition.image.left);
    expect(composition.actions.right+24).toBeLessThanOrEqual(composition.image.left);
  }
  for(const selector of ['.lobby-object','.cedar-object'])await expect(page.locator(selector)).toHaveCSS('opacity','0');
  await naturalImage(page,'.selection-image-frame .project-image-current img');
  await choices(page).nth(1).click();const label=await choices(page).nth(1).innerText();
  await open(page).focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(reader);await expect(page.locator('.case-media-title strong')).toHaveText(label);
  await expect(page.locator('main h1')).toHaveCount(1);await naturalImage(page,'.case-figure .screenshot-button img');
  await expect(page.locator('.profile-boundary')).toHaveCount(1);
  await expect(page.locator('#engineering').getByRole('heading')).toHaveCount(1);
  await expect(page.locator('#engineering').getByRole('heading',{level:2})).toHaveText('The profile save boundary');
  await expect(page.locator('#engineering .boundary-label')).toHaveText('Sample data · local demo');
  expect(await page.locator('#engineering').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('#workflow')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const boundary=page.locator('.profile-boundary');
  await boundary.getByRole('button',{name:'Propose a change',exact:true}).click();
  await boundary.getByRole('button',{name:'Review the change',exact:true}).click();
  await boundary.getByRole('button',{name:'Change the saved profile during review.'}).click();
  await boundary.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
  await expect(boundary).toHaveAttribute('data-stale','true');await expect(boundary.getByRole('button',{name:'Review again',exact:true})).toBeVisible();
  await boundary.getByRole('button',{name:'Review again',exact:true}).click();await boundary.getByRole('button',{name:'Accept reviewed change',exact:true}).click();
  await expect(boundary).toHaveAttribute('data-phase','accept');
  const reset=boundary.getByRole('button',{name:'Reset',exact:true});await reset.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(reset).toBeFocused();
  const clearance=await reset.evaluate(el=>{const b=el.getBoundingClientRect();return{top:b.top,bottom:b.bottom,header:document.querySelector('.site-header')!.getBoundingClientRect().bottom,footer:document.querySelector('.stage-footer')!.getBoundingClientRect().top};});
  expect(clearance.top).toBeGreaterThanOrEqual(clearance.header);expect(clearance.bottom).toBeLessThanOrEqual(clearance.footer);
  await page.locator('.case-back').click();await expect(open(page)).toBeFocused();await expect(choices(page).nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.profile-boundary')).toHaveAttribute('data-phase','accept');await expect(page.locator('canvas')).toHaveCount(0);await noOverflow(page);
  await page.locator('.back-collection').click();await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeFocused();
});

test('historical baseline stays separate from adopted ordinary routes and review metadata is isolated',async({page})=>{
  test.skip(production,'Historical variants are intentionally absent from the normal build.');
  await fixtures(page);await selected(page,baseline);
  await expect(page.locator('.jobpilot-design-candidate')).toHaveCount(0);await expect(page.locator('.selection-caption p')).toHaveText('AI career workspace');
  await expect(page.locator('.lobby-object')).toHaveCSS('opacity','0.12');
  await open(page).click();await expect(page).toHaveURL(baseline+'/reader');
  expect(await page.locator('#workflow').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('#engineering')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await page.goto('/?project=jobpilot-ai');await expect(page.locator('.selection-caption p')).toHaveText('Review before saving');
  await expect(page.locator('.jobpilot-design-refined')).toHaveCount(1);
  await expect(page.locator('[data-design-review]')).toHaveCount(0);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  await expect(page.locator('a[href="/review/jobpilot/candidate"]')).toHaveCount(0);
});

test('PR51 immediate before remains separate from the PR50 baseline and refined candidate',async({page})=>{
  test.skip(production,'Historical variants are intentionally absent from the normal build.');
  await page.setViewportSize({width:390,height:844});await fixtures(page);await selected(page,'/review/jobpilot/before');
  await expect(page.locator('.jobpilot-design-candidate')).toHaveCount(1);await expect(page.locator('.jobpilot-design-refined')).toHaveCount(0);
  const before=await page.locator('.selection-image-frame').boundingBox();
  await expect(page.locator('.stage')).not.toHaveAttribute('data-motion-framing','product');
  expect(await page.locator('.selection-project-links').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('.selection-image-frame')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await open(page).click();await expect(page.locator('#engineering').getByRole('heading')).toHaveCount(2);
  await selected(page);const after=await page.locator('.selection-image-frame').boundingBox();expect(before!.y-after!.y).toBeGreaterThan(140);
});

test('opening layers stay inside the product area and clear readable controls in the available renderer',async({page})=>{
  await page.setViewportSize({width:390,height:844});await fixtures(page,false);
  await page.addInitScript(()=>{
    const state=window as unknown as {framingSamples:number;framingViolations:string[];meshSamples:number};state.framingSamples=0;state.meshSamples=0;state.framingViolations=[];
    const sample=()=>{
      const stage=document.querySelector('.stage'),phase=stage?.getAttribute('data-motion-phase');
      if(stage&&['selecting','opening'].includes(phase??'')){
        const frame=stage.querySelector('.selection-image-frame')?.getBoundingClientRect(),rig=stage.querySelector<HTMLElement>('.motion-rig');
        if(frame){
          if(phase==='selecting'&&getComputedStyle(stage.querySelector('.selection-image-frame')!).backgroundColor!=='rgba(0, 0, 0, 0)')state.framingViolations.push('opaque matte during preparation');
          for(const node of [rig,stage.querySelector<HTMLElement>('.jobpilot-object')]){
            if(!node||Number(getComputedStyle(node).opacity)<.02)continue;
            const box=node.getBoundingClientRect();state.framingSamples++;
            if(box.left<frame.left-1||box.right>frame.right+1||box.top<frame.top-1||box.bottom>frame.bottom+1)state.framingViolations.push('layer outside product frame');
            for(const selector of ['.selection-caption','.selection-project-links','.chapter-switch','.back-collection']){
              const control=stage.querySelector(selector)?.getBoundingClientRect();
              if(control&&box.left<control.right&&box.right>control.left&&box.top<control.bottom&&box.bottom>control.top)state.framingViolations.push(`layer crosses ${selector}`);
            }
          }
          if(rig?.dataset.subjectBounds){const bounds=JSON.parse(rig.dataset.subjectBounds);state.meshSamples++;if(bounds.left<-.5||bounds.top<-.5||bounds.right>rig.clientWidth+.5||bounds.bottom>rig.clientHeight+.5)state.framingViolations.push('measured mesh cut by canvas');}
        }
      }
      requestAnimationFrame(sample);
    };requestAnimationFrame(sample);
  });
  await selected(page);const samples=await page.evaluate(()=>{const s=window as unknown as {framingSamples:number;framingViolations:string[];meshSamples:number};return{framingSamples:s.framingSamples,framingViolations:s.framingViolations,meshSamples:s.meshSamples};});
  expect(samples.framingSamples).toBeGreaterThan(0);expect(samples.framingViolations).toEqual([]);
  if(await page.locator('.stage').getAttribute('data-motion-renderer')==='webgl')expect(samples.meshSamples).toBeGreaterThan(0);
});

test('a delayed or failed product keeps the framed photograph available and navigation usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});await fixtures(page);let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route(sourceRequest('710055a0-a275-4e6a-991d-4aaa23c6e549.png'),async route=>{await pending;await route.abort();});
  await page.goto(entry+'?project=jobpilot-ai',{waitUntil:'domcontentloaded'});
  const frame=page.locator('.selection-image-frame'),photo=page.locator('.jobpilot-object .object-core');
  await expect(open(page)).toBeVisible();await expect(frame).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await expect(photo).toHaveCSS('opacity','1');release();
  await expect(page.locator('.stage')).toHaveAttribute('data-preview-state','failed');await expect(frame).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await expect(photo).toBeVisible();await open(page).focus();await page.keyboard.press('Enter');await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
});

test('the original workflow, contribution, source disclosures and all complete gallery images remain available',async({page})=>{
  await fixtures(page);await page.goto(reader);
  const study=caseStudyFor(caseStudyProjects.find(p=>p.slug==='jobpilot-ai')!)!;
  await page.locator('.jobpilot-secondary-workflow summary').click();
  for(const step of study.workflow)await expect(page.locator('#workflow')).toContainText(step.title);
  await page.locator('.jobpilot-context summary').click();await expect(page.locator('#overview')).toContainText(study.summary);await expect(page.locator('#overview')).toContainText(study.problem);
  await page.locator('.story-contribution summary').click();await expect(page.locator('#contribution')).toContainText('My part in the work.');
  await page.locator('.case-gallery-disclosure > summary').click();await expect(page.locator('.reader-gallery figure')).toHaveCount(detailScreens(caseStudyProjects.find(p=>p.slug==='jobpilot-ai')!).length);
  const trigger=page.locator('.case-media-nav').getByRole('button',{name:/Enlarge/});await trigger.click();
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  for(const name of ['Fit width','Actual size','Fit'])await dialog.getByRole('button',{name,exact:true}).click();
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
});

test('reduced motion and photographic fallback retain the same hierarchy and usable actions',async({page})=>{
  await fixtures(page,false);await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:get.call(this,type,...args);} as typeof get;});
  await selected(page);await expect(page.locator('.stage')).toHaveAttribute('data-motion-renderer','fallback');
  await expect(page.locator('.selection-caption')).toContainText('Review before saving');await noOverflow(page);
  await page.emulateMedia({reducedMotion:'reduce'});await open(page).click();
  await expect(page.locator('[data-reader-handoff],canvas')).toHaveCount(0);
  await expect.poll(()=>page.locator('main').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
});

test('workflow captions precede images on narrow layouts and remain beside complete figures on desktop',async({page})=>{
  await fixtures(page);await page.goto(reader);
  await page.locator('.jobpilot-secondary-workflow summary').click();
  const figures=page.locator('#workflow .workflow-frames figure');await expect(figures).toHaveCount(3);
  for(const width of [320,390,430,768,1280,1440]){
    await page.setViewportSize({width,height:900});
    const layouts=await figures.evaluateAll(nodes=>nodes.map(node=>{
      const caption=node.querySelector('figcaption')!.getBoundingClientRect(),image=node.querySelector('.workflow-details')!.getBoundingClientRect();
      return{caption:{top:caption.top,bottom:caption.bottom,left:caption.left,right:caption.right},image:{top:image.top,bottom:image.bottom,left:image.left,right:image.right}};
    }));
    for(const {caption,image}of layouts){
      if(width<960)expect(image.top-caption.bottom).toBeGreaterThanOrEqual(17);
      else expect(Math.max(image.left-caption.right,caption.left-image.right)).toBeGreaterThanOrEqual(20);
    }
    await noOverflow(page);
  }
});

test('a visible image joins articulation before it settles and unselected objects finish fully recessed',async({page})=>{
  await fixtures(page,false);await page.addInitScript(()=>{
    const native=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:native.call(this,type,...args);} as typeof native;
    const state=window as unknown as {imageDuringOpening:boolean};state.imageDuringOpening=false;
    const sample=()=>{const stage=document.querySelector('.stage'),surface=stage?.querySelector('.product-surface'),image=surface?.querySelector('img'),current=surface?.querySelector('.project-image-current');if(stage?.getAttribute('data-motion-phase')==='opening'&&surface&&image&&current&&Number(getComputedStyle(surface).opacity)>.05&&getComputedStyle(image).visibility==='visible'&&Number(getComputedStyle(current).opacity)>.95)state.imageDuringOpening=true;requestAnimationFrame(sample);};requestAnimationFrame(sample);
  });
  await selected(page);expect(await page.evaluate(()=>(window as unknown as {imageDuringOpening:boolean}).imageDuringOpening)).toBe(true);
  await expect(page.locator('.lobby-object')).toHaveCSS('opacity','0');
});

test('interrupted handoff and a late image cannot reopen a retired scene or lose native Back focus',async({page})=>{
  await fixtures(page,false);let release!:()=>void;const wait=new Promise<void>(resolve=>{release=resolve;});
  await page.route(sourceRequest('710055a0-a275-4e6a-991d-4aaa23c6e549.png'),async route=>{await wait;await route.abort();});
  await page.goto(entry+'?project=jobpilot-ai',{waitUntil:'domcontentloaded'});
  await open(page).click();await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
  await page.evaluate(()=>history.back());await expect(open(page)).toBeFocused();release();
  await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase','active');await expect(page.locator('canvas,[data-reader-handoff]')).toHaveCount(0);
  await page.locator('.back-collection').click();await expect(page.getByRole('button',{name:'Explore JobPilot AI',exact:true})).toBeFocused();
});

test('loading and failure keep the complete image reserve stable; footer and assistant stay keyboard accessible',async({page})=>{
  await fixtures(page);let release!:()=>void;const wait=new Promise<void>(resolve=>{release=resolve;});
  await page.route(sourceRequest('710055a0-a275-4e6a-991d-4aaa23c6e549.png'),async route=>{await wait;await route.abort();});
  await page.goto(reader,{waitUntil:'domcontentloaded'});await expect(page.locator('.case-heading h1')).toBeVisible();
  const frame=page.locator('.case-figure .screenshot-frame'),before=await frame.boundingBox();release();
  await expect(frame).toHaveAttribute('data-image-state','failed');const after=await frame.boundingBox();
  expect(Math.abs(before!.width-after!.width)).toBeLessThan(1);expect(Math.abs(before!.height-after!.height)).toBeLessThan(1);
  await page.locator('#engineering').scrollIntoViewIfNeeded();
  const assistant=page.getByRole('button',{name:/Ask Portfolio AI/});await expect(assistant).toBeInViewport();await assistant.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('JobPilot AI');await page.keyboard.press('Escape');await expect(assistant).toBeFocused();await noOverflow(page);
});

test('compiled comparison is real HTML with review metadata rather than the SPA not-found route',async({request})=>{
  test.skip(production,'Review-only comparison artifacts are excluded from the normal build.');
  const response=await request.get('/review/jobpilot-comparison/index.html');expect(response.status()).toBe(200);expect(await response.text()).toContain('JobPilot design journey');
  const metadata=await request.get('/review/jobpilot-comparison/build.json');expect((await metadata.json()).candidate).toBe(entry);
  expect((await metadata.json()).before).toBe('/review/jobpilot/before');
  const refinement=await request.get('/review/jobpilot-refinement/index.html');expect(refinement.status()).toBe(200);expect(await refinement.text()).toContain('JobPilot Phase 1 refinement');
  for(const phase of ['baseline','candidate'])for(const mode of ['normal','reduced','fallback']){
    const image=await request.get(`/review/jobpilot-comparison/${phase}/${mode}/390-844-preview.jpg`);
    expect(image.status()).toBe(200);expect(image.headers()['content-type']).toContain('image/jpeg');
    const refinedImage=await request.get(`/review/jobpilot-refinement/after/${mode}/390-844-preview.jpg`);
    expect(refinedImage.status()).toBe(200);expect(refinedImage.headers()['content-type']).toContain('image/jpeg');
  }
  for(const phase of ['baseline','candidate']){
    const workflow=await request.get(`/review/jobpilot-comparison/${phase}/normal/390-844-workflow-detail.jpg`);
    expect(workflow.status()).toBe(200);expect(workflow.headers()['content-type']).toContain('image/jpeg');
  }
});

test('a return to an engineering hash restores the source scroll instead of replaying the hash jump',async({page})=>{
  await page.setViewportSize({width:390,height:844});await fixtures(page);await selected(page);
  await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();
  await expect(page.locator('#jobpilot-engineering')).toBeFocused();
  // Focus can settle before the route owner's next animation-frame scroll.
  // Observe the completed hash jump before capturing its return position.
  await expect(page.locator('#jobpilot-engineering')).toBeInViewport({ratio:1});
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0);
  const position=await page.evaluate(()=>scrollY);expect(position).toBeGreaterThan(0);
  // Activate without scrolling the source; this isolates the restoration
  // contract from the browser's ordinary pointer-target auto-scroll.
  await open(page).evaluate(link=>(link as HTMLAnchorElement).click());
  await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');await page.locator('.case-back').click();
  await expect(open(page)).toBeFocused();await expect(page).toHaveURL(production?/\/\?project=jobpilot-ai#jobpilot-engineering$/:/candidate\?project=jobpilot-ai#jobpilot-engineering$/);
  await expect.poll(()=>page.evaluate(saved=>Math.abs(scrollY-Math.min(saved,document.scrollingElement!.scrollHeight-innerHeight)),position)).toBeLessThan(.5);
});

test('normal compiled routes refresh, retain native history and exclude review entries',async({page,request})=>{
  test.skip(!production,'Normal-build adoption is verified independently from the opt-in review build.');
  await fixtures(page);await page.goto(reader);
  await page.goto(reader+'/');await expect(page.locator('.jobpilot-design-refined')).toHaveCount(1);
  await page.goto(reader);
  await expect(page.locator('.jobpilot-design-refined')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/\/projects\/jobpilot-ai$/);
  await page.reload();await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
  await selected(page);await choices(page).nth(1).click();const label=await choices(page).nth(1).innerText();
  await open(page).click();await expect(page.locator('.case-media-title strong')).toHaveText(label);
  await page.goBack();await expect(open(page)).toBeFocused();await expect(choices(page).nth(1)).toHaveAttribute('aria-pressed','true');
  await page.goForward();await expect(page.locator('.case-media-title strong')).toHaveText(label);
  await page.reload();await expect(page.locator('.case-heading h1')).toHaveText('JobPilot AI');
  await expect(page.locator('.case-media-title strong')).toHaveText(label);
  for(const address of ['/review/jobpilot/candidate','/review/jobpilot/before','/review/jobpilot/baseline']){
    await page.goto(address);await expect(page.getByRole('heading',{name:'This page wandered off.'})).toBeVisible();
    await expect(page.locator('.stage,.project-reader')).toHaveCount(0);
  }
  const artifact=await request.get('/review/jobpilot-refinement/index.html');
  expect(await artifact.text()).not.toContain('JobPilot Phase 1 refinement');
});
