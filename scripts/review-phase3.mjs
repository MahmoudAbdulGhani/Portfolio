// Current interface captures. API reads use an immutable public snapshot so
// production's detail-view counter and PDF initialization cannot write data.
import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const phase = process.argv[2] || 'after';
if (!['before', 'jobpilot', 'after'].includes(phase)) throw new Error('Unknown review phase');
const deployed = process.argv.includes('--deployed');
const complete = process.argv.includes('--complete');
const cachedMedia = process.argv.includes('--cached-media');
const originals = cachedMedia ? JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json', 'utf8')).records : [];
const base = deployed ? 'https://mahmoud-portfolio-omega.vercel.app' : 'http://127.0.0.1:5184';
const content = JSON.parse(await readFile('.motion-preview/phase3-public-content.json', 'utf8'));
const projects = content['/api/projects'].filter(project => phase !== 'jobpilot' || ['jobpilot-ai', 'construction-project-management-accounting-system'].includes(project.slug));
const routes = projects.map(project => ({ name: project.slug, path: `/projects/${project.slug}`, reader: true }));
if (phase !== 'jobpilot') routes.push(...[['collection', '/'], ['projects', '/projects'], ['profile', '/profile'], ['contact', '/contact'], ['job-match', '/job-match']].map(([name, path]) => ({ name, path })));
const output = `docs/design/phase3/${phase}`;
await mkdir(output, { recursive: true });
const findings = [];
let completeCaptures = 0;
async function decode(image) {
  return image.evaluate(async img => {
    try { await Promise.race([img.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error('Media did not decode within 20 seconds')), 20_000))]); return null; }
    catch (error) { return { src: img.src, message: error.message }; }
  });
}
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const [width, height] of complete ? [[1363, 1400], [390, 1600]] : [[1363, 936], [1024, 1366], [390, 844], [320, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
    await page.route('**/api/**', route => {
      if (route.request().method() !== 'GET') return route.abort();
      const path = new URL(route.request().url()).pathname;
      const body = content[path] ?? projects.find(project => path === `/api/projects/${project.slug}`);
      return body === undefined ? route.abort() : route.fulfill({ json: body });
    });
    if (cachedMedia) for (const original of originals) await page.route(original.src, async route => route.fulfill({ contentType: 'image/png', body: await readFile(original.file) }));
    for (const route of routes) {
      const errorStart = errors.length;
      const mediaErrors = [];
      await page.goto(`${base}${route.path}`, { waitUntil: 'domcontentloaded' });
      await page.locator(route.reader ? '.case-heading' : 'main h1').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (!await page.evaluate(() => document.fonts.check('400 14px Manrope'))) throw new Error('Manrope not loaded');
      const lead = page.locator('.case-image img');
      if (await lead.count()) { const error = await decode(lead); if (error) mediaErrors.push(error); }
      await page.screenshot({ path: `${output}/${route.name}${complete ? '-complete' : ''}-${width}.jpg`, type: 'jpeg', quality: 85 });
      if (complete) { completeCaptures++; console.log(`${phase} complete: ${route.name} ${width}px`); continue; }
      if (route.reader) {
        await page.locator('.case-image').evaluate(el => el.scrollIntoView({ block: 'center' }));
        await page.screenshot({ path: `${output}/${route.name}-media-${width}.jpg`, type: 'jpeg', quality: 85 });
        const workflow = page.locator('#workflow');
        await workflow.evaluate(el => el.scrollIntoView({ block: 'start' }));
        const image = workflow.locator('img').first();
        if (await image.count()) { const error = await decode(image); if (error) mediaErrors.push(error); }
        await page.screenshot({ path: `${output}/${route.name}-workflow-${width}.jpg`, type: 'jpeg', quality: 85 });
        if (width === 390 && phase === 'after') {
          const frames = await page.locator('.workflow-frames figure').all();
          for (let index = 0; index < frames.length; index++) {
            await frames[index].evaluate(el => el.scrollIntoView({ block: 'start' }));
            const photo = frames[index].locator('img');
            const error = await decode(photo); if (error) mediaErrors.push(error);
            await page.screenshot({ path: `${output}/${route.name}-workflow-${index + 1}-${width}.jpg`, type: 'jpeg', quality: 85 });
          }
        }
        const decision = page.locator('.engineering-decisions details').first();
        await decision.evaluate(el => el.scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: `${output}/${route.name}-collapsed-${width}.jpg`, type: 'jpeg', quality: 85 });
        await decision.locator('summary').click();
        await page.screenshot({ path: `${output}/${route.name}-expanded-${width}.jpg`, type: 'jpeg', quality: 85 });
      } else if (route.name === 'contact') {
        await page.locator('.contact-form').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/contact-form-${width}.jpg`, type: 'jpeg', quality: 85 });
      } else if (route.name === 'profile') {
        const capabilities = page.getByRole('button', { name: 'Capabilities', exact: true });
        await capabilities.click();
        await page.locator('.capability-record').evaluate(el => el.scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: `${output}/profile-capabilities-${width}.jpg`, type: 'jpeg', quality: 85 });
      }
      findings.push({ name: route.name, width, height, mediaErrors, ...await page.evaluate(() => {
        const surface = document.querySelector('.landscape-route main');
        if (!surface) throw new Error('Public reading surface not found');
        const overflowX = getComputedStyle(surface).overflowX;
        const clipping = [];
        for (let parent = surface.parentElement; parent; parent = parent.parentElement) {
          if (['hidden', 'clip'].includes(getComputedStyle(parent).overflowX)) clipping.push(parent.className || parent.tagName);
        }
        return {
          overflow: document.documentElement.scrollWidth > innerWidth || (surface.scrollWidth > surface.clientWidth && (['auto', 'scroll'].includes(overflowX) || (!clipping.length && !['hidden', 'clip'].includes(overflowX)))),
          intrinsicSurfaceOverflow: surface.scrollWidth > surface.clientWidth,
          surfaceOverflowX: overflowX,
          clippingAncestors: clipping,
          headings: [...document.querySelectorAll('main h1,main h2,main h3')].map(el => el.textContent.trim()),
          images: [...document.querySelectorAll('main img')].map(img => ({ src: img.getAttribute('src'), currentSrc: img.currentSrc, alt: img.alt, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, displayWidth: img.getBoundingClientRect().width, displayHeight: img.getBoundingClientRect().height })),
          muted: getComputedStyle(document.querySelector('.landscape')).getPropertyValue('--muted'),
        };
      }), pageErrors: errors.slice(errorStart) });
      console.log(`${phase}: ${route.name} ${width}px${mediaErrors.length ? ` (${mediaErrors.length} media errors)` : ''}`);
    }
    await page.close();
  }
} finally { await browser.close(); }
if (!complete) await writeFile(`${output}/findings.json`, JSON.stringify({ date: new Date().toISOString(), interface: deployed ? 'Deployed production assets' : 'Local Phase 3 production build', data: 'Current public GET snapshot; detail counter/PDF routes intercepted, all network writes blocked', media: cachedMedia ? 'Unmodified public PNG bytes from the recorded GET/hash cache; local authentic media served normally' : 'Original public image URLs and local assets', reducedMotion: true, findings }, null, 2) + '\n');
console.log(JSON.stringify({ phase, source: deployed ? 'deployed' : 'local', reviewed: findings.length + completeCaptures, overflow: findings.filter(row => row.overflow).map(row => [row.name, row.width]), pageErrors: findings.flatMap(row => row.pageErrors) }));
if (findings.some(row => row.overflow || row.pageErrors.length)) process.exitCode = 1;
