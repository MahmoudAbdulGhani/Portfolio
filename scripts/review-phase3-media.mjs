// All reader images, using real public records and unmodified original bytes.
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const content = JSON.parse(await readFile('.motion-preview/phase3-public-content.json', 'utf8'));
const originals = JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json', 'utf8')).records;
const output = 'docs/design/phase3/media-review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [];
try {
  for (const width of [1363, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 936 }, reducedMotion: 'reduce' });
    await page.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname;
      const body = content[path] ?? content['/api/projects'].find(project => path === `/api/projects/${project.slug}`);
      return route.request().method() === 'GET' && body !== undefined ? route.fulfill({ json: body }) : route.abort();
    });
    for (const original of originals) await page.route(original.src, async route => route.fulfill({ contentType: 'image/png', body: await readFile(original.file) }));
    for (const project of content['/api/projects']) {
      await page.goto(`http://127.0.0.1:5184/projects/${project.slug}`);
      const summary = page.locator('.case-media-chooser summary');
      await summary.waitFor();
      const count = await page.locator('.chapter-switch button').count();
      for (let index = 0; index < count; index++) {
        await summary.click(); await page.locator('.chapter-switch button').nth(index).click();
        await page.locator('.case-figure').evaluate(el => el.scrollIntoView({ block: 'center' }));
        await page.locator('.case-figure img').evaluate(img => img.decode());
        const title = await page.locator('.case-media-title strong').innerText();
        const record = await page.locator('.case-figure').evaluate(el => {
          const img = el.querySelector('img'), frame = el.querySelector('.screenshot-frame');
          return { src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, frameWidth: frame.getBoundingClientRect().width, frameHeight: frame.getBoundingClientRect().height, caption: el.querySelector('figcaption').textContent.trim(), status: frame.dataset.imageState };
        });
        const screenshot = `${project.slug}-${String(index + 1).padStart(2, '0')}-${width}.jpg`;
        await page.screenshot({ path: `${output}/${screenshot}`, type: 'jpeg', quality: 85 });
        findings.push({ slug: project.slug, width, title, position: index + 1, total: count, screenshot, ...record });
      }
      console.log(`${project.slug}: ${count} images at ${width}px`);
    }
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(`${output}/findings.json`, JSON.stringify({ date: new Date().toISOString(), data: 'Actual public GET snapshot, original PNG cache with recorded hashes, authentic existing/new local images; writes blocked. This is layout/media review, not backend/provider execution.', findings }, null, 2) + '\n');
console.log(JSON.stringify({ inspected: findings.length, failed: findings.filter(row => !row.naturalWidth || row.status !== 'ready') }));
