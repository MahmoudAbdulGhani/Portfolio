import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const folder = 'docs/design/profile-speaking-introduction';
const before = process.argv.includes('--before');
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5194';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
await mkdir(folder, { recursive: true });
const baseline = before ? null : JSON.parse(await readFile(`${folder}/before.json`, 'utf8'));
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [];
try {
  for (const width of [320,390,430,768,1440]) {
    const page = await browser.newPage({ viewport: { width, height: width === 768 ? 1024 : 900 }, reducedMotion: before ? 'reduce' : 'no-preference' });
    const requests = [], errors = [], writes = [];
    page.on('request', request => {
      if (request.url().includes('/media/profile/')) requests.push(request.url().split('/media/profile/')[1]);
      if (!['GET','HEAD'].includes(request.method())) writes.push(request.method());
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/profile`);
    await page.locator('.standing-portrait-image').evaluate(img => img.decode());
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.standing-portrait-figure')).toHaveAttribute('data-entrance', 'false');
    const row = { width, stage: await page.locator('.standing-portrait-stage').boundingBox(), content: await page.locator('.profile-record').innerText() };
    await page.screenshot({ path: `${folder}/${before ? 'before' : 'after'}-${width}.jpg`, quality: 88 });
    if (!before) {
      expect(row.stage).toEqual(baseline.metrics.find(r => r.width === width).stage);
      expect(row.content).toEqual(baseline.metrics.find(r => r.width === width).content);
      expect(requests).toEqual([]);
      const ui = page.locator('.portrait-introduction'), action = ui.locator('button').first();
      const layout = () => page.evaluate(() => ['.standing-portrait-stage','.profile-intro','.portrait-introduction','.record-tabs'].map(selector => {
        const el = document.querySelector(selector); return { width: el.offsetWidth, height: el.offsetHeight, top: el.offsetTop };
      }));
      const geometry = await layout();
      await action.press('Enter');
      await expect(ui).toHaveAttribute('data-playback', 'playing');
      await page.waitForFunction(() => document.querySelector('video')?.currentTime >= 1);
      row.firstCaption = await ui.locator('.portrait-playback-captions').innerText();
      if ([390,1440].includes(width)) {
        await page.screenshot({ path: `${folder}/playing-${width}.jpg`, quality: 88 });
        const raw = await page.locator('video').evaluate(video => {
          const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video,0,0); return canvas.toDataURL('image/png').split(',')[1];
        });
        const frame = Buffer.from(raw,'base64');
        const rgba = await sharp(frame).ensureAlpha().raw().toBuffer({resolveWithObject:true});
        row.decodedAlpha = [rgba.data[3], rgba.data[(rgba.info.width-1)*4+3]];
        expect(row.decodedAlpha.every(alpha => alpha < 16)).toBe(true);
        const backgrounds = ['#ecebe3','#ffffff','#202629'];
        const tileWidth=240,tileHeight=424;
        await sharp({create:{width:tileWidth*3,height:tileHeight,channels:3,background:'white'}})
          .composite(await Promise.all(backgrounds.map(async (background,i) => ({
            input:await sharp(frame).resize(tileWidth,tileHeight).flatten({background}).png().toBuffer(),left:i*tileWidth,top:0,
          })))).jpeg({quality:94}).toFile(`${folder}/browser-alpha-${width}.jpg`);
      }
      await page.waitForFunction(() => document.querySelector('video')?.currentTime >= 5);
      row.middleCaption = await ui.locator('.portrait-playback-captions').innerText();
      await page.waitForFunction(() => document.querySelector('video')?.currentTime >= 9);
      row.finalCaption = await ui.locator('.portrait-playback-captions').innerText();
      await expect(ui).toHaveAttribute('data-playback','ended',{timeout:7000});
      expect(await layout()).toEqual(geometry);
      expect(requests.every(name=>name===`mahmoud-introduction-${width<720?480:720}.webm`)).toBe(true);
      row.network = { beforeActivation:0, requested:[...new Set(requests)] };
      row.network.resources = await page.evaluate(() => performance.getEntriesByType('resource').filter(entry => entry.name.includes('/media/profile/')).map(entry => ({ file:entry.name.split('/').at(-1), bytes:entry.encodedBodySize, transferred:entry.transferSize })));
      row.completePlayback = true;
      row.overflow = await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth || document.querySelector('main').scrollWidth>document.querySelector('main').clientWidth);
      expect(row.overflow).toBe(false);
      const cv = page.getByRole('button',{name:'Download CV',exact:true});
      const pending=page.waitForEvent('download'); await cv.press('Enter');
      const pdf=await readFile(await (await pending).path());
      expect(hash(pdf)).toBe(hash(await readFile('.motion-preview/public-cv.pdf')));
      row.cv={bytes:pdf.length,sha256:hash(pdf),keyboard:true};
      for(const button of await ui.getByRole('button').all()) {
        await button.focus();
        const focused = await button.evaluate(el => {const rect=el.getBoundingClientRect();return {width:rect.width,height:rect.height,outline:getComputedStyle(el).outlineStyle,bottom:rect.bottom,footer:document.querySelector('footer').getBoundingClientRect().top};});
        expect(focused.width).toBeGreaterThanOrEqual(44);expect(focused.height).toBeGreaterThanOrEqual(44);
        expect(focused.outline).toBe('solid');expect(focused.bottom).toBeLessThanOrEqual(focused.footer);
      }
      await page.locator('.profile-intro').evaluate(el=>el.scrollIntoView());
      if (width === 390) await page.screenshot({path:`${folder}/introduction-390.jpg`,quality:88});
      const left=await readFile(`${folder}/before-${width}.jpg`),right=await readFile(`${folder}/after-${width}.jpg`);
      const meta=await sharp(left).metadata();
      const label=Buffer.from(`<svg width="${width*2}" height="36"><rect width="100%" height="100%" fill="#ecebe3"/><g font-family="Arial" font-size="14" fill="#202629"><text x="12" y="24">PR #38 — static</text><text x="${width+12}" y="24">Speaking integration — idle</text></g></svg>`);
      await sharp({create:{width:width*2,height:meta.height+36,channels:3,background:'#ecebe3'}}).composite([{input:label,left:0,top:0},{input:left,left:0,top:36},{input:right,left:width,top:36}]).jpeg({quality:90}).toFile(`${folder}/comparison-${width}.jpg`);
    }
    expect(errors).toEqual([]); expect(writes).toEqual([]);
    findings.push({...row,errors,writes}); await page.close();
  }
  await writeFile(`${folder}/${before?'before':'validation'}.json`,JSON.stringify(before?{metrics:findings}:{build:'normal production build',browser:'Windows Chrome emulation; frozen read-only GET/CV fixtures',findings},null,2)+'\n');
} finally { await browser.close(); }
