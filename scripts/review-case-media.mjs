// Actual project assets and frozen public GET records; no backend writes.
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
const phase = process.argv[2] ?? 'before';
const projectFilter = process.argv.find(arg => arg.startsWith('--project='))?.slice('--project='.length);
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after');
const output = `docs/design/mobile-case-media/${phase}`;
await mkdir(output, { recursive: true });
const content = JSON.parse(await readFile('.motion-preview/phase3-public-content.json', 'utf8'));
const originals = JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json', 'utf8')).records;
const browser = await chromium.launch({ channel: 'chrome' });
const findings = [], inventory = [];
async function captureFigure(page, figure, target) {
  // The reader main scrolls inside landscape-route, not the document. Stitch native
  // viewport clips so tall figures are complete and navigation never overlays
  // the evidence. No viewport resizing or product CSS modification.
  const scroller = page.locator('.project-reader');
  const initial = await figure.boundingBox();
  const width = Math.floor(initial.width), height = Math.floor(initial.height);
  const pieces = [];
  let offset = 0;
  while (offset < height) {
    const box = await figure.boundingBox(), area = await scroller.boundingBox();
    await scroller.evaluate((el, delta) => el.scrollTo({ top: el.scrollTop + delta, behavior: 'instant' }), box.y + offset - area.y);
    const current = await figure.boundingBox();
    const y = Math.ceil(current.y + offset);
    const rows = Math.min(height - offset, Math.floor(area.y + area.height - y), page.viewportSize().height - y);
    if (rows <= 0 || y < 0) throw new Error(JSON.stringify({ target, offset, current, area, y, rows, state: await scroller.evaluate(el => ({ scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight })) }));
    pieces.push({ input: await page.screenshot({ clip: { x: Math.floor(current.x), y, width, height: rows } }), left: 0, top: offset });
    offset += rows;
  }
  await sharp({ create: { width, height, channels: 3, background: '#eeede6' } }).composite(pieces).jpeg({ quality: 85 }).toFile(target);
}
try {
  for (const width of [320, 390, 768, 1363]) {
    const page = await browser.newPage({ viewport: { width, height: 936 }, reducedMotion: 'reduce' });
    await page.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname;
      const body = content[path] ?? content['/api/projects'].find(project => path === `/api/projects/${project.slug}`);
      return body !== undefined ? route.fulfill({ json: body }) : route.abort();
    });
    for (const original of originals) await page.route(original.src, async route => route.fulfill({ contentType: 'image/png', body: await readFile(original.file) }));
    for (const project of content['/api/projects']) {
      if (projectFilter && project.slug !== projectFilter) continue;
      await page.goto(`http://127.0.0.1:${phase === 'before' ? 5185 : 5184}/projects/${project.slug}`);
      await page.locator('.case-media-chooser summary').waitFor();
      await page.locator('.case-figure .screenshot-button img').evaluate(img => img.decode());
      await page.locator('.case-heading').screenshot({ path: `${output}/${project.slug}-intro-${width}.jpg`, type: 'jpeg', quality: 80 });
      const figures = page.locator('.workflow-frames figure');
      for (let index = 0; index < await figures.count(); index++) {
        const figure = figures.nth(index);
        await figure.scrollIntoViewIfNeeded();
        const frames = figure.locator('.screenshot-frame');
        for (let f = 0; f < await frames.count(); f++) { await frames.nth(f).scrollIntoViewIfNeeded(); await frames.nth(f).locator('.screenshot-button img').evaluate(img => img.decode()); }
        const screenshot = `${project.slug}-workflow-${index + 1}-${width}.jpg`;
        await captureFigure(page, figure, `${output}/${screenshot}`);
        findings.push({ type: 'workflow', slug: project.slug, width, index, screenshot, text: await figure.innerText(), images: await figure.locator('.screenshot-button img').evaluateAll(nodes => nodes.map(img => ({ src: img.src, width: img.naturalWidth, height: img.naturalHeight, fit: getComputedStyle(img).objectFit, transform: getComputedStyle(img).transform }))) });
        await figure.getByRole('button', { name: phase === 'before' ? 'Inspect image' : 'View full screen', exact: true }).click();
        await page.locator('.case-inspector-image .project-image-current img').evaluate(img => img.decode());
        const viewerScreenshot = `${project.slug}-workflow-viewer-${index + 1}-${width}.jpg`;
        await page.locator('.case-inspector').screenshot({ path: `${output}/${viewerScreenshot}`, type: 'jpeg', quality: 85 });
        findings.push({ type: 'workflow-viewer', slug: project.slug, width, index, screenshot: viewerScreenshot, title: await page.locator('.case-inspector h2').innerText() });
        await page.keyboard.press('Escape');
        await page.locator('.case-inspector').waitFor({ state: 'detached' });
      }
      await page.locator('.media-enlarge').click();
      const count = await page.locator('.case-inspector-thumbs button').count();
      for (let index = 0; index < count; index++) {
        const choice = page.locator('.case-inspector-thumbs button').nth(index);
        await choice.click();
        const region = page.locator('.case-inspector-image');
        await region.locator('.project-image-current img').evaluate(img => img.decode());
        await page.waitForTimeout(40);
        const record = await region.evaluate(el => {
          const img = el.querySelector('.project-image-current img'), box = img.getBoundingClientRect();
          return { src: img.getAttribute('src'), currentSrc: img.currentSrc, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, displayedWidth: box.width, displayedHeight: box.height, availableWidth: el.clientWidth, availableHeight: el.clientHeight, scrollWidth: el.scrollWidth, scrollHeight: el.scrollHeight };
        });
        const title = await page.locator('.case-inspector h2').innerText();
        const screenshot = `${project.slug}-viewer-${index + 1}-${width}.jpg`;
        await page.locator('.case-inspector').screenshot({ path: `${output}/${screenshot}`, type: 'jpeg', quality: 85 });
        findings.push({ type: 'viewer', slug: project.slug, width, index, title, screenshot, ...record });
        if (width === 1363) inventory.push({ slug: project.slug, index, title, ...record });
        if (phase === 'after') {
          const modes = [];
          for (const name of ['Fit width', 'Actual size', 'Fit']) {
            await page.locator('.case-inspector').getByRole('button', { name, exact: true }).click();
            await region.locator('.project-image-current img').evaluate(img => img.decode());
            modes.push({ name, ...await region.evaluate(el => ({ scrollWidth: el.scrollWidth, scrollHeight: el.scrollHeight, availableWidth: el.clientWidth, availableHeight: el.clientHeight })) });
          }
          findings.at(-1).modes = modes;
        }
      }
      await page.keyboard.press('Escape');
      await page.locator('.case-inspector').waitFor({ state: 'detached' });
      console.log(`${phase} ${width}px ${project.slug}: ${count} gallery / ${await figures.count()} workflow figures`);
    }
    await page.close();
  }
} finally { await browser.close(); }
if (projectFilter) {
  const existing = JSON.parse(await readFile(`${output}/findings.json`, 'utf8'));
  inventory.push(...existing.inventory.filter(item => item.slug !== projectFilter));
  findings.push(...existing.findings.filter(item => item.slug !== projectFilter));
}
await writeFile(`${output}/findings.json`, JSON.stringify({ phase, date: new Date().toISOString(), provenance: 'Frozen public GET records; original remote PNG bytes from recorded hash cache; genuine local assets. Chrome emulation, not a physical phone.', inventory, findings }, null, 2));
