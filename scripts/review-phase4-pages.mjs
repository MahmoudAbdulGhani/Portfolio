// Actual media, frozen public records, production build. Every write is blocked.
import { chromium, expect } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const output = 'docs/design/phase4/supporting-pages';
const content = JSON.parse(await readFile('.motion-preview/phase3-public-content.json', 'utf8'));
const originals = JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json', 'utf8')).records;
await mkdir(output, { recursive:true });
const findings = [];
const browser = await chromium.launch({ channel:'chrome' });
try {
  for (const [width,height] of [[1363,936],[1024,1366],[390,844],[320,844]]) {
    const context = await browser.newContext({ viewport:{width,height}, hasTouch:width<=1024, reducedMotion:'no-preference', recordVideo:{dir:'.motion-preview/phase4-pages-video',size:{width,height}} });
    const page = await context.newPage(), errors = [], writes = [], checks = [];
    page.on('pageerror', error=>errors.push(error.message));
    await page.route('**/*', route=> {
      if (!['GET','HEAD'].includes(route.request().method())) { writes.push(route.request().method()); return route.abort(); }
      return route.continue();
    });
    await page.route('**/api/**', route=> {
      const path = new URL(route.request().url()).pathname;
      const body = content[path] ?? content['/api/projects'].find(project=>path===`/api/projects/${project.slug}`);
      return route.request().method()==='GET'&&body!==undefined ? route.fulfill({json:body}) : route.abort();
    });
    for (const original of originals) await page.route(original.src, async route=> {
      const bytes = await readFile(original.file);
      if (createHash('sha256').update(bytes).digest('hex')!==original.sha256) throw new Error('Original media hash changed');
      return route.fulfill({contentType:'image/png',body:bytes});
    });
    const go = async path=> { await page.goto(`http://127.0.0.1:5184${path}`); await page.evaluate(()=>document.fonts.ready); };
    const shot = async name=> {
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.screenshot({path:`${output}/${name}-${width}.jpg`,quality:85});
    };
    await go('/profile');
    await expect(page.locator('.profile-portrait img')).toBeVisible();
    await page.waitForTimeout(320);
    await shot('profile');
    const experience = page.locator('.experience-record details').first();
    if (await experience.count()) {
      await experience.locator('summary').click(); await page.waitForTimeout(240);
      await expect(experience).not.toHaveAttribute('open');
      await experience.locator('summary').click(); await page.waitForTimeout(240);
      await expect(experience).toHaveAttribute('open','');
    }
    await page.getByRole('button',{name:'Capabilities',exact:true}).click();
    await shot('capabilities');
    checks.push('Original portrait and major group entry; experience reverse; unchanged Capabilities');
    await go('/projects'); await expect(page.locator('.work-preview').first()).toBeVisible();
    await shot('projects');
    for (const slug of ['jobpilot-ai','gamezone-arena']) {
      await go(`/projects/${slug}`);
      const primary = page.locator('.case-figure .screenshot-frame');
      await expect(primary).toHaveAttribute('data-image-state','ready');
      const last = page.locator('.workflow-frames .screenshot-frame').last();
      const waitingOffscreen = await last.locator('img').count() === 0;
      await page.waitForTimeout(16_000);
      if (waitingOffscreen) {
        await expect(last).toHaveAttribute('data-image-state','loading');
        await expect(last.locator('img')).toHaveCount(0);
      }
      await expect(page.getByText('This image is unavailable.')).toHaveCount(0);
      await shot(`${slug}-intro-16s`);
      for (const frame of await page.locator('.workflow-frames .screenshot-frame').all()) {
        const before = await frame.boundingBox();
        await frame.scrollIntoViewIfNeeded(); await expect(frame).toHaveAttribute('data-image-state','ready');
        expect((await frame.boundingBox()).height).toBeCloseTo(before.height,0);
      }
      await shot(`${slug}-workflow`);
      const trigger = last.getByRole('button',{name:/Enlarge/});
      await trigger.click(); await expect(page.getByRole('dialog')).toBeVisible();
      await page.waitForTimeout(240); await shot(`${slug}-inspector`);
      await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(240);
      await page.getByRole('button',{name:'Actual size',exact:true}).click();
      await expect(page.locator('.case-inspector-image')).toHaveClass(/is-actual/);
      await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
      expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
      const chooser = page.locator('.case-media-chooser');
      await chooser.locator('summary').click(); await chooser.locator('button').nth(1).click();
      await expect(primary).toHaveAttribute('data-image-state','ready');
      await primary.scrollIntoViewIfNeeded(); await page.waitForTimeout(240);
      await shot(`${slug}-selection`);
      const disclosure = page.locator('.engineering-decisions details').first();
      if (await disclosure.count()) {
        await disclosure.locator('summary').click(); await page.waitForTimeout(240);
        await expect(disclosure.locator('summary')).toHaveAttribute('aria-expanded','true');
        await shot(`${slug}-disclosure`);
        await disclosure.locator('summary').click(); await page.waitForTimeout(240);
        await expect(disclosure).not.toHaveAttribute('open');
      }
      checks.push({slug,introductionWaitMs:16000,waitingOffscreen,workflow:'All actual frames ready with stable heights',selection:true,inspector:'Keyboard, actual size, Escape and focus',disclosure:true});
    }
    await go('/contact');
    await expect(page.locator('#contact-name')).toBeEditable();
    await page.locator('#contact-name').focus();
    await shot('contact');
    await go('/job-match');
    await expect(page.locator('#job-description')).toBeEditable(); await page.locator('#job-description').focus();
    await shot('job-match');
    checks.push('Contact and Job Match immediately editable; no submissions or provider operations');
    await page.emulateMedia({reducedMotion:'reduce'}); await go('/profile');
    expect(await page.locator('.profile-record').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
    await shot('profile-reduced');
    expect(errors).toEqual([]); expect(writes).toEqual([]);
    const video = page.video(); await context.close(); await video.saveAs(`${output}/pages-${width}.webm`);
    findings.push({width,height,checks,errors,writes,horizontalOverflow:false});
    console.log(`Supporting pages ${width}px: ${checks.length} flows passed`);
  }
} finally { await browser.close(); }
await writeFile(`${output}/findings.json`,JSON.stringify({date:new Date().toISOString(),build:'Local production build',media:'Actual local assets and SHA-256 verified public PNG cache',records:'Frozen public GET snapshot; writes and counters blocked',provider:'No live provider responses; API behavior verified separately by regression fixtures',findings},null,2)+'\n');
