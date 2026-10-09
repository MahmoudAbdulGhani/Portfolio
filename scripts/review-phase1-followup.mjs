// Read-only Profile review using the public snapshot; every API write is blocked.
import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const out = 'docs/design/phase1-followup';
await mkdir(out, { recursive: true });
const content = JSON.parse(await readFile('.motion-preview/public-content.json', 'utf8'));
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [];
try {
  for (const width of [1363, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width > 1000 ? 936 : 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', route => route.request().method() === 'GET'
      ? route.fulfill({ json: content[new URL(route.request().url()).pathname] ?? [] }) : route.abort());
    await page.goto('http://127.0.0.1:5180/profile');
    await page.locator('.profile-record').waitFor();
    await page.evaluate(() => document.fonts.ready);
    if (!await page.evaluate(() => document.fonts.check('400 14px Manrope'))) throw new Error('Manrope did not load');
    await page.locator('.profile-portrait img').evaluate(img => img.decode());
    await page.getByRole('button', { name: 'Capabilities', exact: true }).click();
    await page.locator('[data-competency]').first().waitFor();
    if (width !== 320) await page.screenshot({ path: `${out}/capabilities-${width}.jpg`, type: 'jpeg', quality: 85 });
    await page.locator('.capability-record h2').filter({ hasText: /^databases$/i }).scrollIntoViewIfNeeded();
    if (width !== 320) await page.screenshot({ path: `${out}/capabilities-databases-${width}.jpg`, type: 'jpeg', quality: 85 });
    await page.locator('.capability-record h2').filter({ hasText: /^Operations$/ }).evaluate(el => el.scrollIntoView({ block: 'start' }));
    if (width !== 320) await page.screenshot({ path: `${out}/capabilities-operations-${width}.jpg`, type: 'jpeg', quality: 85 });
    await page.locator('.capability-record h2').last().evaluate(el => el.scrollIntoView({ block: 'start' }));
    if (width !== 320) await page.screenshot({ path: `${out}/capabilities-skills-${width}.jpg`, type: 'jpeg', quality: 85 });
    findings.push({ width, ...await page.evaluate(() => {
      const keys = [...document.querySelectorAll('[data-competency]')].map(el => el.dataset.competency);
      const main = document.querySelector('.page-surface');
      return {
        keys, duplicateKeys: keys.filter((key, i) => keys.indexOf(key) !== i),
        overflow: document.documentElement.scrollWidth > innerWidth || main.scrollWidth > main.clientWidth,
        evidence: [...document.querySelectorAll('[data-competency]')].filter(el => el.querySelector('a')).map(el => ({ key: el.dataset.competency, href: el.querySelector('a').getAttribute('href') })),
      };
    }), pageErrors: errors });
    await page.getByRole('button', { name: 'Education & training', exact: true }).click();
    await page.locator('.training-record').scrollIntoViewIfNeeded();
    if (width !== 320) await page.screenshot({ path: `${out}/training-${width}.jpg`, type: 'jpeg', quality: 85 });
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(`${out}/browser-findings.json`, JSON.stringify(findings, null, 2) + '\n');
if (findings.some(row => row.overflow || row.duplicateKeys.length || row.pageErrors.length)) throw new Error('Profile review failed; see browser-findings.json');
console.log(JSON.stringify(findings.map(({ width, keys, duplicateKeys, overflow, pageErrors }) => ({ width, competencies: keys.length, duplicateKeys, overflow, pageErrors }))));
