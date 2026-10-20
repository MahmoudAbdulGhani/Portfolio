import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const before = process.argv.includes('--before'), phase = before ? 'before' : 'after';
const folder = 'docs/design/profile-portrait-adoption';
const approvedFolder = 'docs/design/profile-portrait-mobile-hierarchy';
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5194';
const widths = [[320, 844], [390, 844], [430, 932], [768, 1024], [1440, 900]];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const pixels = async bytes => hash(await sharp(bytes).raw().toBuffer());
await mkdir(folder, { recursive: true });
const approved = JSON.parse(await readFile(`${approvedFolder}/after.json`, 'utf8'));
const prior = before ? null : JSON.parse(await readFile(`${folder}/before.json`, 'utf8'));
const assets = Object.fromEntries(await Promise.all(['png','webp'].map(async ext => [ext, hash(await readFile(`public/review-assets/profile-original-hands.${ext}`))])));
expect(assets).toEqual(approved.assets);
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [], preservation = [];
try {
  for (const [width, height] of widths) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [], writes = [], portraits = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (!['GET','HEAD'].includes(request.method())) writes.push(request.url());
      if (/profile-original-hands|portrait-striped-finished/.test(request.url())) portraits.push(request.url());
    });
    expect((await page.goto(`${base}/profile`)).status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await page.locator(before ? '.portrait-panel img' : '.standing-portrait-image').evaluate(img => img.decode());
    const content = await page.evaluate(() => ({
      title: document.querySelector('h1').textContent,
      introduction: document.querySelector('.profile-intro').textContent,
      records: [...document.querySelectorAll('[role=tablist], [role=tabpanel], .profile-contact')].map(el => el.textContent),
      links: [...document.querySelectorAll('.profile-record a')].map(el => el.getAttribute('href')),
    }));
    const geometry = () => page.evaluate(() => {
      const rect = selector => { const {x,y,width,height} = document.querySelector(selector).getBoundingClientRect(); return {x,y,width,height}; };
      return { heading:rect('h1'), image:rect('.standing-portrait-stage'), intro:rect('.profile-intro'), records:rect('.profile-record'), cv:rect('.profile-portrait .inline-flex') };
    });
    const shot = await page.screenshot({ path:`${folder}/${phase}-${width}.jpg`, quality:90 });
    const initialHash = await pixels(shot);
    // /profile correctly activates its navigation link; the old review URL did
    // not. Compare the entire visible main area below its blank top padding,
    // away from JPEG blocks affected by that intentional header-only change.
    const main = await page.locator('main').boundingBox();
    const crop = {left:Math.floor(main.x),top:Math.ceil(main.y+16),width:Math.floor(main.width),height:Math.floor(main.height-16)};
    const compositionPixels = async bytes=>hash(await sharp(bytes).extract(crop).raw().toBuffer());
    if (!before) {
      expect(content).toEqual(prior.findings.find(row=>row.width===width).content);
      expect(await compositionPixels(shot), `approved PR #37 composition at ${width}`).toBe(await compositionPixels(await readFile(`${approvedFolder}/after-${width}.jpg`)));
      expect(portraits).toHaveLength(1);
      expect(portraits[0]).toContain('/review-assets/profile-original-hands.webp');
    }
    for (const [label, selector] of width < 720 ? [['introduction','.profile-intro'], ['records','.record-tabs']] : []) {
      await page.locator(selector).evaluate(el => { const main = document.querySelector('main'); main.scrollTop += el.getBoundingClientRect().top - main.getBoundingClientRect().top - 20; });
      const shot = await page.screenshot({ path:`${folder}/${phase}-${label}-${width}.jpg`, quality:90 });
      if (!before) expect(await compositionPixels(shot), `approved scrolled ${label} at ${width}`).toBe(await compositionPixels(await readFile(`${approvedFolder}/after-${label}-${width}.jpg`)));
    }
    await page.locator('main').evaluate(el=>{ el.scrollTop=0; });
    const metrics = { width, height, content, initialHash, compositionHash:await compositionPixels(shot), approvedCompositionHash:await compositionPixels(await readFile(`${approvedFolder}/after-${width}.jpg`)), comparisonCrop:crop, errors, writes };
    if (!before) {
      metrics.geometry = await geometry();
      const cv = page.getByRole('button',{name:'Download CV',exact:true});
      await cv.focus();
      const pending = page.waitForEvent('download'); await page.keyboard.press('Enter');
      const download = await pending, pdf = await readFile(await download.path());
      expect(await download.failure()).toBeNull();
      expect(hash(pdf)).toBe(hash(await readFile('.motion-preview/public-cv.pdf')));
      metrics.download = {bytes:pdf.length,sha256:hash(pdf),filename:download.suggestedFilename(),keyboard:true};
      const disclosure = page.locator('.experience-record summary').first();
      await disclosure.focus(); await page.keyboard.press('Space'); await expect(disclosure).toHaveAttribute('aria-expanded','false');
      await page.keyboard.press('Enter'); await expect(disclosure).toHaveAttribute('aria-expanded','true');
      await page.getByRole('tab',{name:'Experience',exact:true}).focus(); await page.keyboard.press('End');
      await expect(page.getByRole('tab',{name:'Capabilities',exact:true})).toBeFocused();
      await page.keyboard.press('Home');
      let release; const held = new Promise(resolve=>{release=resolve;});
      await page.route('**/review-assets/profile-original-hands.webp',async route=>{await held;await route.continue();});
      await page.reload({waitUntil:'domcontentloaded'});
      const stage = page.locator('.standing-portrait-stage'); await expect(stage).toHaveAttribute('data-state','loading');
      await page.evaluate(()=>document.fonts.ready); const pendingGeometry = await geometry();
      if(width<720) await page.screenshot({path:`${folder}/loading-${width}.jpg`,quality:90});
      release(); await expect(stage).toHaveAttribute('data-state','ready'); expect(await geometry()).toEqual(pendingGeometry);
      await page.route('**/review-assets/profile-original-hands.webp',route=>route.abort());
      await page.reload(); await expect(stage).toHaveAttribute('data-state','error'); await page.evaluate(()=>document.fonts.ready);
      expect(await geometry()).toEqual(pendingGeometry);
      if(width<720) await page.screenshot({path:`${folder}/fallback-${width}.jpg`,quality:90});
      metrics.loading = {stable:true,pending:pendingGeometry,fallback:await geometry()};
    }
    expect(errors).toEqual([]); expect(writes).toEqual([]);
    expect(await page.locator('main').evaluate(el=>el.scrollWidth>el.clientWidth||document.documentElement.scrollWidth>innerWidth)).toBe(false);
    findings.push(metrics); await page.close();
  }
  for (const width of [390,1440]) for (const route of ['/projects','/contact','/job-match']) {
    const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    await page.goto(base+route); await page.evaluate(()=>document.fonts.ready);
    const entry = {width,route,content:await page.locator('main').evaluate(main=>({
      text:main.textContent,
      headings:[...main.querySelectorAll('h1,h2')].map(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {text:el.textContent,x:r.x,y:r.y,width:r.width,height:r.height,font:s.font,color:s.color};}),
      links:[...main.querySelectorAll('a')].map(el=>el.getAttribute('href')),
      overflow:main.scrollWidth>main.clientWidth||document.documentElement.scrollWidth>innerWidth,
    }))};
    if(prior) {
      // Lazy media can still be decoding; retain its raw status in the report,
      // but compare authored text independently of transient loading notices.
      const normalize=row=>({...row,content:{...row.content,text:row.content.text.replaceAll('Loading preview…','')}});
      expect(normalize(entry)).toEqual(normalize(prior.preservation.find(row=>row.width===width&&row.route===route)));
    }
    preservation.push(entry); await page.close();
  }
  if(!before) for(const [width,height] of widths) for(const suffix of ['',...(width<720?['-introduction','-records']:[])]) {
    const label = Buffer.from(`<svg width="${width*2+24}" height="62"><rect width="100%" height="100%" fill="#ecebe3"/><g font-family="Arial" font-size="18" fill="#252b26"><text x="12" y="38">Previous /profile · ${width}px</text><text x="${width+36}" y="38">Adopted /profile · ${width}px</text></g></svg>`);
    await sharp({create:{width:width*2+24,height:height+62,channels:3,background:'#ecebe3'}}).composite([{input:label,left:0,top:0},{input:`${folder}/before${suffix}-${width}.jpg`,left:0,top:62},{input:`${folder}/after${suffix}-${width}.jpg`,left:width+24,top:62}]).jpeg({quality:92}).toFile(`${folder}/comparison${suffix}-${width}.jpg`);
  }
} finally {await browser.close();}
await writeFile(`${folder}/${phase}.json`,JSON.stringify({approvedCommit:'5db900a204c5f475f6906bd28d05913227f8a8f5',environment:'Normal compiled production build, frozen read-only public GET/CV fixtures; Windows Chrome emulation, not physical-device testing.',assets,findings,preservation},null,2)+'\n');
console.log(`${phase}: five /profile widths captured; ${before?'baseline saved':'all approved PR #37 pixels, records, evidence, CV document, loading/failure geometry and six other-page content/layout checks preserved'}.`);
