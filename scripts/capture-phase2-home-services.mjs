import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await page.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
try {
  await page.goto('https://home-services-coral.vercel.app/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('header button').waitFor({state:'visible'});
  await page.evaluate(()=>document.fonts.ready);
  const menu=page.locator('header button');
  await menu.focus();await page.keyboard.press('Enter');
  await page.locator('aside').waitFor();
  await page.waitForFunction(()=>Math.abs(document.querySelector('aside').getBoundingClientRect().right-innerWidth)<2);
  const bytes=await page.screenshot();
  await mkdir('docs/design/phase2/media',{recursive:true});
  await writeFile('docs/design/phase2/media/home-services-mobile-menu-original.png',bytes);
  await mkdir('public/projects/phase2',{recursive:true});
  await sharp(bytes).webp({lossless:true}).toFile('public/projects/phase2/home-services-mobile-menu.webp');
  await page.locator('aside button').click();
  await page.waitForFunction(()=>document.querySelector('aside').getBoundingClientRect().left>=innerWidth-2);
  await mkdir('docs/design/phase2',{recursive:true});
  await writeFile('docs/design/phase2/home-services-capture.json',JSON.stringify({date:new Date().toISOString(),source:'https://home-services-coral.vercel.app/',viewport:{width:390,height:844},data:'Public template marketing content; no account or private records',requests:'GET/HEAD only; all writes blocked',checks:['Keyboard Enter opens existing menu','Close button dismisses menu'],originalArtifact:'docs/design/phase2/media/home-services-mobile-menu-original.png',artifact:'public/projects/phase2/home-services-mobile-menu.webp',modifications:'Lossless format conversion only; no crop, annotation or fabricated UI'},null,2)+'\n');
  console.log('Genuine public Home Services mobile navigation captured; open/close verified without writes.');
} finally {await browser.close();}
