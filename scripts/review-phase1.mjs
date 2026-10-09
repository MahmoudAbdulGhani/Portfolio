// Read-only QA against a local frontend, using the captured public CMS records.
import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const phase = process.argv[2] || 'after';
const baseURL = process.argv[3] || 'http://127.0.0.1:5180';
const out = `docs/design/phase1/${phase}`;
await mkdir(out, { recursive: true });
const content = JSON.parse(await readFile('.motion-preview/public-content.json', 'utf8'));
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [];
for (const width of [1363, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: width > 1000 ? 936 : 844 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET') return route.abort();
    const body = content[path] ?? content['/api/projects'].find(p => path === `/api/projects/${p.slug}`);
    return route.fulfill({ status: body ? 200 : 404, json: body ?? { message: 'Unavailable in read-only review' } });
  });
  for (const project of content['/api/projects']) {
    await page.goto(`${baseURL}/projects/${project.slug}`);
    await page.locator('.case-heading').waitFor();
    await page.evaluate(() => document.fonts.ready);
    if (!await page.evaluate(() => document.fonts.check('400 14px Manrope'))) throw new Error('Manrope did not load for matched screenshots');
    await page.locator('.case-image img').evaluate(img => img.decode().catch(() => {}));
    if (width !== 320) await page.screenshot({ path: `${out}/${project.slug}-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 75 });
    await page.locator('#overview').scrollIntoViewIfNeeded();
    if (width !== 320) await page.screenshot({ path: `${out}/${project.slug}-notes-${width}.jpg`, type: 'jpeg', quality: 75 });
    findings.push({ width, slug: project.slug, ...await page.evaluate(() => ({
      title: document.querySelector('h1')?.textContent,
      contribution: Boolean(document.querySelector('#contribution')),
      emptyBlocks: [...document.querySelectorAll('.case-page p,.case-page ul')].filter(el => !el.textContent.trim()).length,
      overflow: document.documentElement.scrollWidth > innerWidth || document.querySelector('main').scrollWidth > document.querySelector('main').clientWidth,
      imageLoaded: [...document.querySelectorAll('.case-image img')].every(img => img.complete && img.naturalWidth > 0),
      labels: [...document.querySelectorAll('.chapter-switch button')].map(el => el.textContent),
    })) });
  }
  await page.goto(`${baseURL}/profile`);
  await page.locator('.profile-record').waitFor();
  await page.locator('.profile-portrait img').evaluate(img => img.decode().catch(() => {}));
  for (const tab of ['Experience', 'Education & training', 'Capabilities']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    if (width !== 320) await page.screenshot({ path: `${out}/profile-${tab.split(' ')[0].toLowerCase()}-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 75 });
    const target = tab === 'Education & training' ? '.training-record' : tab === 'Capabilities' ? '.capability-record ul' : '.experience-record';
    await page.locator(target).scrollIntoViewIfNeeded();
    if (width !== 320) await page.screenshot({ path: `${out}/profile-${tab.split(' ')[0].toLowerCase()}-records-${width}.jpg`, type: 'jpeg', quality: 75 });
    findings.push({ width, tab, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
  }
  findings.push({ width, pageErrors: errors });
  await page.close();
}
await browser.close();
await writeFile(`${out}/browser-findings.json`, JSON.stringify(findings, null, 2) + '\n');
console.log(`${phase}: ${findings.length} read-only route/tab checks captured.`);
