import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/**',route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/assistant') return route.fulfill({json:{answer:'Fixture response.'}});
    return route.fulfill({json:path==='/api/profile'?{id:'qa',name:'QA Owner',title:'Engineer',email:'qa@example.com',phone:'',experience:[],socials:[],professionalSummary:'Fixture summary.'}:[]});
  });
});

test('Contact never exposes an unnamed email link during a delayed profile read',async({page})=>{
  let release!:()=>void;
  const held=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/profile',async route=>{await held;await route.fulfill({json:{id:'qa',name:'QA Owner',email:'qa@example.com',phone:'',experience:[],socials:[]}});});
  await page.goto('/contact');
  await expect(page.locator('#contact-name')).toBeEditable();
  await expect(page.locator('a[href="mailto:"]')).toHaveCount(0);
  expect((await new AxeBuilder({page}).withRules(['link-name']).analyze()).violations).toEqual([]);
  release();
  await expect(page.locator('.link-inline')).toHaveAccessibleName('qa@example.com');
});

test('streaming announcements stay separate from partial and historical answer text',async({page})=>{
  await page.addInitScript(()=>{
    const original=window.fetch;
    let stream:ReadableStreamDefaultController<Uint8Array>;
    const encoder=new TextEncoder();
    Object.assign(window,{qaChunk:(chunk:string)=>stream.enqueue(encoder.encode(`data: ${JSON.stringify({chunk})}\n\n`)),qaDone:()=>{stream.enqueue(encoder.encode('data: {"done":true}\n\n'));stream.close();}});
    window.fetch=async(input,init)=>String(input).includes('/assistant')?new Response(new ReadableStream({start(controller){stream=controller;init?.signal?.addEventListener('abort',()=>controller.error(new DOMException('Stopped','AbortError')));}}),{headers:{'Content-Type':'text/event-stream'}}):original(input,init);
  });
  await page.goto('/profile');
  await page.getByRole('button',{name:'Ask Portfolio AI',exact:true}).click();
  const status=page.locator('.assistant-drawer > [role="status"]');
  const send=async()=>{await page.locator('#assistant-question').fill('Fixture question about portfolio evidence.');await page.getByRole('button',{name:'Send question'}).click();await expect(status).toHaveText('Reading the portfolio evidence…');};
  await send();
  for(const chunk of ['First ','answer\n\n','with spaces.']) {
    await page.evaluate(value=>(window as unknown as {qaChunk:(s:string)=>void}).qaChunk(value),chunk);
    await expect(status).toHaveText('Reading the portfolio evidence…');
  }
  await expect(page.locator('.assistant-messages')).not.toHaveAttribute('aria-live');
  await expect(page.locator('.assistant-messages [role="status"]')).toHaveCount(0);
  await page.evaluate(()=>(window as unknown as {qaDone:()=>void}).qaDone());
  await expect(status).toHaveText('Response ready. Read the answer in the conversation.');
  await expect(page.locator('.assistant-message.assistant')).toContainText('with spaces.');
  await send();
  await page.getByRole('button',{name:'Stop generation'}).click();
  await expect(status).toHaveText('Generation stopped.');
  await expect(page.locator('.assistant-message.assistant').first()).toContainText('First answer');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Ask Portfolio AI',exact:true})).toBeFocused();
});

test('keyboard skip link, form errors and reflow retain usable controls',async({page})=>{
  await page.goto('/contact');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.landscape-route > main')).toBeFocused();
  await page.getByRole('button',{name:'Send message',exact:true}).click();
  await expect(page.locator('#contact-name')).toBeFocused();
  await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#contact-name')).toHaveAttribute('aria-describedby','name-error');
  await page.setViewportSize({width:320,height:568});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
});

test('inspector wraps forward and reverse focus without losing Escape or return focus',async({page})=>{
  const project={id:'lobby',slug:'lobby',name:'Lobby',type:'Fixture',description:'Fixture project.',overview:'Fixture overview.',stack:[],team:[],contributions:[],features:[],screenshots:['/projects/lobby/guest-access.webp','/projects/lobby/friends.webp'],coverImage:'/projects/lobby/cover.webp'};
  await page.route('**/api/projects/lobby',r=>r.fulfill({json:project}));
  await page.goto('/projects/lobby');
  const trigger=page.locator('.case-figure').getByRole('button',{name:/Enlarge/});
  await trigger.click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button',{name:'Next screenshot',exact:true}).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('region',{name:'Image title and evidence note',exact:true})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button',{name:'Next screenshot',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('assistant keeps the 55-second deadline and recovers through explicit retry',async({page})=>{
  await page.route('**/api/assistant',()=>new Promise(()=>{}));
  await page.goto('/profile');
  await page.getByRole('button',{name:'Ask Portfolio AI',exact:true}).click();
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.locator('#assistant-question').fill('Fixture request that deliberately does not respond.');
  await page.getByRole('button',{name:'Send question'}).click();
  const status=page.locator('.assistant-drawer > [role="status"]');
  await page.clock.fastForward(54_999);
  await expect(status).toHaveText('Reading the portfolio evidence…');
  await page.clock.fastForward(1);
  await expect(status).toHaveText('The assistant took too long to respond. Please try again.');
  await page.route('**/api/assistant',r=>r.fulfill({json:{answer:'Successful fixture retry.'}}));
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(status).toHaveText('Response ready. Read the answer in the conversation.');
  await expect(page.locator('.assistant-message.assistant').last()).toContainText('Successful fixture retry.');
});
