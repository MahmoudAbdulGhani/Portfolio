import {expect, test, type Page} from '@playwright/test';
import sharp from 'sharp';
import {caseStudyProjects} from '../fixtures/case-study-projects';
import {caseImage} from '../fixtures/case-image';

const cedar = 'construction-project-management-accounting-system';
const modes = ['normal', 'reduced', 'fallback'] as const;
const viewports = [[1440,900],[1440,650],[1363,936],[768,1024],[390,844],[320,844]];
async function fixtures(page: Page, mode: typeof modes[number]) {
  await page.emulateMedia({reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference'});
  if (mode === 'fallback') await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
      return type === 'webgl2' ? null : original.call(this, type, ...args);
    } as typeof original;
  });
  await page.route('https://screens.example.test/**', async route => route.fulfill({contentType:'image/png', body:await caseImage(route.request().url())}));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    // Match the two actual exposed Lobby choices, rather than its reader cover.
    const projects=caseStudyProjects.map(project=>project.slug==='lobby' ? {...project,screenshots:['/projects/lobby/friends.webp','/projects/lobby/audio-room.webp',...project.screenshots!]} : project);
    return route.fulfill({json: path === '/api/projects' ? projects : []});
  });
}
async function bounds(page: Page) {
  return page.locator('.selection-frame').evaluate(frame => {
    const imageFrame = frame.querySelector('.selection-image-frame')!.getBoundingClientRect();
    const caption = frame.querySelector('.selection-caption')!.getBoundingClientRect();
    const controls = frame.querySelector('.selection-actions')!.getBoundingClientRect();
    const selectors = frame.querySelector('.chapter-switch')!;
    const images = [...frame.querySelectorAll<HTMLImageElement>('.product-surface img')].map(image => {
      const box = image.getBoundingClientRect();
      return {width:box.width,height:box.height,bottom:box.bottom,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight};
    });
    return {imageFrameBottom:imageFrame.bottom,captionTop:caption.top,controlsTop:controls.top,images,
      selectorOverflow:selectors.scrollWidth > selectors.clientWidth,
      pageOverflow:document.documentElement.scrollWidth > innerWidth,
      inert:(frame.querySelector('.selection-detail') as HTMLElement).inert};
  });
}
async function completeLayout(page: Page) {
  const layout = await bounds(page);
  expect(layout.imageFrameBottom).toBeLessThanOrEqual(layout.captionTop - 23);
  expect(layout.inert).toBe(false);
  expect(layout.selectorOverflow).toBe(false);
  expect(layout.pageOverflow).toBe(false);
  for (const image of layout.images) {
    expect(image.bottom).toBeLessThanOrEqual(layout.captionTop);
    expect(image.bottom).toBeLessThanOrEqual(layout.controlsTop);
    if (image.naturalWidth) expect(Math.abs(image.height-image.width*image.naturalHeight/image.naturalWidth)).toBeLessThan(1);
  }
}
async function ready(page: Page) {
  await expect(page.locator('.project-image-handoff')).toHaveAttribute('data-image-state','ready');
  await page.locator('.project-image-current img').evaluate(image => (image as HTMLImageElement).decode());
  await expect(page.locator('.project-image-previous')).toHaveCount(0);
}

for (const mode of modes) {
  for (const [slug,title] of [['jobpilot-ai','JobPilot AI'],[cedar,'Cedar Construction'],['lobby','Lobby']]) {
    test(`${title}: both complete previews and selectors follow the image at every reviewed size (${mode})`, async ({page}) => {
      await fixtures(page,mode);
      await page.goto(`/?project=${slug}`);
      // Source/GPU boot is separate from the existing finite-motion deadline tests.
      await expect(page.locator('.stage')).toHaveAttribute('data-selection-state','settled',{timeout:15000});
      const choices=page.getByRole('group',{name:'Preview workflow'}).getByRole('button');
      await expect(choices).toHaveCount(2);
      for (const [width,height] of viewports) {
        await page.setViewportSize({width,height});
        for (let i=0;i<2;i++) {
          await choices.nth(i).focus(); await page.keyboard.press('Enter');
          await expect(choices.nth(i)).toHaveAttribute('aria-pressed','true');
          await ready(page); await completeLayout(page);
          const actionWidth=(await page.getByRole('link',{name:'Open case study',exact:true}).boundingBox())!.width;
          if (width >= 720) expect(actionWidth).toBeLessThan(260);
          await expect(choices.nth(i)).toBeFocused();
          expect(await choices.nth(i).evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
        }
      }
      {
        await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();
        const heading=page.locator(slug === cedar ? '#cedar-engineering' : slug === 'lobby' ? '#lobby-engineering' : '#jobpilot-engineering');
        await expect(heading).toBeFocused(); await expect(heading).toBeInViewport({ratio:1});
      }
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button',{name:`Explore ${title}`,exact:true})).toBeFocused();
    });
  }

  test(`landscape-to-portrait loading and rapid switching reserve both retained images (${mode})`, async ({page}) => {
    await fixtures(page,mode);
    let release!: () => void;
    const pending=new Promise<void>(resolve => {release=resolve;});
    await page.route('**/b5279347-d2cd-41a6-ac25-84b2cbf7fe71.png', async route => {
      await pending; await route.fulfill({contentType:'image/png',body:await caseImage(route.request().url())});
    });
    await page.goto(`/?project=${cedar}`);
    await ready(page);
    const choices=page.locator('.chapter-switch button');
    await choices.nth(1).click();
    await expect(page.locator('.project-image-handoff')).toHaveAttribute('data-image-state','loading');
    await expect(page.locator('.project-image-previous')).toHaveCount(1);
    // Metadata reserves the tall capture before its request completes.
    const reserved=await page.locator('.selection-image-frame').boundingBox();
    expect(reserved!.height/reserved!.width).toBeCloseTo(2333/1920,3);
    await completeLayout(page);
    await page.evaluate(() => {
      const choices=document.querySelectorAll<HTMLButtonElement>('.chapter-switch button');
      choices[0].click(); choices[1].click(); choices[0].click();
    });
    await ready(page); release();
    await expect(choices.nth(0)).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.project-image-current img')).toHaveAttribute('src',/425768da/);
    await completeLayout(page);
    await choices.nth(1).click(); await ready(page); await completeLayout(page);
    // A tall previous image must remain above the caption while it fades to wide.
    await choices.nth(0).click(); await completeLayout(page); await ready(page); await completeLayout(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Explore Cedar Construction',exact:true})).toBeFocused();
  });
}

test('a failed wide request retains the complete tall image above caption, controls and engineering', async ({page}) => {
  await fixtures(page,'normal');
  // Start with the tall capture so the failing replacement was never decoded
  // into the browser's image cache on an earlier chapter.
  await page.route('**/api/projects',route => route.fulfill({json:caseStudyProjects.map(project => project.slug === cedar ? {...project,screenshots:[project.screenshots![1],project.screenshots![0]]} : project)}));
  await page.route('**/425768da-66d4-4088-b725-3199711f8784.png',route => route.abort());
  await page.goto(`/?project=${cedar}`); await ready(page);
  const choices=page.locator('.chapter-switch button');
  await choices.nth(1).click();
  await expect(page.locator('.project-image-handoff')).toHaveAttribute('data-image-state','failed');
  await expect(page.locator('.project-image-previous')).toHaveCount(1);
  await completeLayout(page);
  const reserved=await page.locator('.selection-image-frame').boundingBox();
  expect(reserved!.height).toBeGreaterThanOrEqual(reserved!.width*2333/1920);
  const notice=page.locator('.selection-image-frame').getByRole('status');
  await expect(notice).toContainText('Preview unavailable');
  expect((await notice.boundingBox())!.y+(await notice.boundingBox())!.height).toBeLessThanOrEqual((await page.locator('.project-image-previous img').boundingBox())!.y);
  await page.getByRole('link',{name:'Explore the engineering',exact:true}).click();
  await expect(page.locator('#cedar-engineering')).toBeFocused();
  await expect(page.locator('#cedar-engineering')).toBeInViewport({ratio:1});
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Explore Cedar Construction',exact:true})).toBeFocused();
});

test('decoded dimensions replace estimated geometry for an unfamiliar tall source', async ({page}) => {
  await fixtures(page,'reduced');
  const source='/unfamiliar-tall-preview.png';
  let release!: () => void;
  const pending=new Promise<void>(resolve => {release=resolve;});
  await page.route('**/api/projects',route => route.fulfill({json:caseStudyProjects.map(project => project.slug === cedar ? {...project,screenshots:[source,...project.screenshots!]} : project)}));
  await page.route(`**${source}`,async route => {
    await pending;
    await route.fulfill({contentType:'image/png',body:await sharp({create:{width:900,height:2100,channels:3,background:'#dce0d5'}}).png().toBuffer()});
  });
  await page.goto(`/?project=${cedar}`,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.project-image-handoff')).toHaveAttribute('data-image-state','loading');
  await completeLayout(page);
  await expect(page.getByRole('link',{name:'Open case study',exact:true})).toBeFocused();
  release(); await ready(page); await completeLayout(page);
  const reserved=await page.locator('.selection-image-frame').boundingBox();
  expect(reserved!.height/reserved!.width).toBeCloseTo(2100/900,3);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Explore Cedar Construction',exact:true})).toBeFocused();
});
