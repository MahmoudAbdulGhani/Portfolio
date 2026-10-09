// Read-only comparison of real public project records in the local reader.
import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const phase = process.argv[2] || 'after';
if (!['before', 'jobpilot', 'after', 'details'].includes(phase)) throw new Error('Unknown review phase');
const content = JSON.parse(await readFile('.motion-preview/public-content.json', 'utf8'));
const records = content['/api/projects'].filter(p => phase !== 'jobpilot' || p.slug === 'jobpilot-ai');
const out = `docs/design/phase2/${phase}`;
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [];
try {
  for (const [width, height] of (phase === 'details' ? [[1363, 936], [390, 844]] : [[1363, 936], [1024, 1366], [390, 844], [320, 844]])) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', route => {
      if (route.request().method() !== 'GET') return route.abort();
      const path = new URL(route.request().url()).pathname;
      const body = content[path] ?? content['/api/projects'].find(p => path === `/api/projects/${p.slug}`);
      return route.fulfill({ json: body ?? [] });
    });
    for (const p of records) {
      await page.goto(`http://127.0.0.1:5180/projects/${p.slug}`);
      await page.locator('.case-heading').waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (!await page.evaluate(() => document.fonts.check('400 14px Manrope'))) throw new Error('Manrope failed to load');
      await page.locator('.case-image img').evaluate(img => img.decode());
      if (phase === 'details') {
        const decision = page.locator('.engineering-decisions details').first();
        await decision.locator('summary').click();
        await decision.evaluate(el => el.scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: `${out}/${p.slug}-decision-${width}.jpg`, type: 'jpeg', quality: 80 });
        continue;
      }
      await page.screenshot({ path: `${out}/${p.slug}-${width}.jpg`, type: 'jpeg', quality: 80 });
      const target = page.locator('#workflow');
      if (await target.count()) await target.evaluate(el => el.scrollIntoView({ block: 'start' }));
      else await page.locator('#overview').scrollIntoViewIfNeeded();
      const workflowImage = page.locator('#workflow img').first();
      if (await workflowImage.count()) await workflowImage.evaluate(img => img.decode());
      await page.screenshot({ path: `${out}/${p.slug}-workflow-${width}.jpg`, type: 'jpeg', quality: 80 });
      const engineering = page.locator('#engineering');
      if (await engineering.count()) {
        await engineering.evaluate(el => el.scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: `${out}/${p.slug}-engineering-${width}.jpg`, type: 'jpeg', quality: 80 });
      }
      findings.push({ width, height, slug: p.slug, ...await page.evaluate(() => {
        const main = document.querySelector('.page-surface');
        return {
          overflow: document.documentElement.scrollWidth > innerWidth || main.scrollWidth > main.clientWidth,
          contribution: Boolean(document.querySelector('#contribution')),
          headings: [...document.querySelectorAll('.case-page h1,.case-page h2,.case-page h3')].map(el => el.textContent),
          images: [...document.querySelectorAll('.case-page img')].map(img => ({ src: img.getAttribute('src'), alt: img.alt, loaded: img.complete && img.naturalWidth > 0 })),
          emptyBlocks: [...document.querySelectorAll('.case-page p,.case-page ul')].filter(el => !el.textContent.trim()).length,
        };
      }), pageErrors: [...errors] });
    }
    await page.close();
  }
} finally { await browser.close(); }
if (phase !== 'details') await writeFile(`${out}/browser-findings.json`, JSON.stringify(findings, null, 2) + '\n');
console.log(JSON.stringify({ phase, ...(phase === 'details' ? { expandedDecisionCaptures: records.length * 2 } : { routes: findings.length }), overflow: findings.filter(r => r.overflow).map(r => [r.slug, r.width]), pageErrors: findings.flatMap(r => r.pageErrors) }));
if (findings.some(row => row.overflow || row.pageErrors.length || row.emptyBlocks)) process.exitCode = 1;
