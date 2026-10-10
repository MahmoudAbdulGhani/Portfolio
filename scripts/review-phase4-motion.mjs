// Actual-asset motion review; all API data is a frozen public GET snapshot.
// No project view counters, Contact submissions or authenticated operations.
import { chromium, expect } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const phase = process.argv[2] || 'before';
if (!['before', 'after'].includes(phase)) throw new Error('Unknown phase');
const port = phase === 'before' ? 5186 : Number(process.argv[3] || 5185);
const timingsOnly = process.argv.includes('--timings-only');
const output = `docs/design/phase4/${phase}`;
await mkdir(output, { recursive: true });
const content = JSON.parse(await readFile('.motion-preview/phase3-public-content.json', 'utf8'));
const originals = JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json', 'utf8')).records;
const objects = [['jobpilot', 'JobPilot AI'], ['lobby', 'Lobby'], ['cedar', 'Cedar Construction']];
const findings = [];
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const [width, height] of [[1363, 936], [1024, 1366], [390, 844], [320, 844]]) for (const [kind, title] of objects) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width <= 1024, reducedMotion: 'no-preference', recordVideo: timingsOnly ? undefined : { dir: '.motion-preview/phase4-videos', size: { width, height } } });
    const page = await context.newPage();
    const screenshot = options => timingsOnly ? Promise.resolve() : page.screenshot(options);
    const errors = [], writes = [];
    await page.addInitScript(() => {
      window.__motionSamples = [];
      window.__draws = 0; window.__frameGaps = []; window.__longTasks = [];
      for (const name of ['drawElements', 'drawArrays']) {
        const original = WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name] = function (...args) { window.__draws++; return original.apply(this, args); };
      }
      let previous = performance.now();
      const frame = now => { window.__frameGaps.push(now - previous); previous = now; requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
      new PerformanceObserver(list => window.__longTasks.push(...list.getEntries().map(task => ({ start:task.startTime, duration:task.duration })))).observe({ type:'longtask', buffered:true });
      const observer = new MutationObserver(changes => {
        for (const change of changes) if (['data-selection-state','data-motion-phase','data-renderer','data-content-state'].includes(change.attributeName)) window.__motionSamples.push({ time: performance.now(), attribute: change.attributeName, value: change.target.getAttribute(change.attributeName) });
      });
      observer.observe(document, { subtree: true, attributes: true });
      addEventListener('pointerdown', () => window.__motionSamples.push({ time: performance.now(), attribute: 'input' }));
      addEventListener('focusin', event => {
        if (event.target.matches('.project-hit')) window.__motionSamples.push({time:performance.now(),attribute:'collection-focus'});
      });
      addEventListener('click', () => {
        let frames = 0;
        const acknowledged = () => {
          const stage = document.querySelector('.stage');
          if (stage?.dataset.motionPhase !== 'idle' && stage?.querySelector('.selection-detail')) {
            window.__motionSamples.push({ time:performance.now(), attribute:'ack-paint', phase:stage.dataset.motionPhase, content:stage.dataset.contentState });
          } else if (++frames < 120) requestAnimationFrame(acknowledged);
        };
        requestAnimationFrame(acknowledged);
      });
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      if (!['GET','HEAD'].includes(route.request().method())) { writes.push(route.request().method()); return route.abort(); }
      return route.continue();
    });
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname;
      const body = content[path] ?? content['/api/projects'].find(project => path === `/api/projects/${project.slug}`);
      return route.request().method() === 'GET' && body !== undefined ? route.fulfill({ json: body }) : route.abort();
    });
    for (const original of originals) await page.route(original.src, async route => {
      const bytes = await readFile(original.file);
      if (createHash('sha256').update(bytes).digest('hex') !== original.sha256) throw new Error('Media hash mismatch');
      return route.fulfill({ contentType: 'image/png', body: bytes });
    });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const target = page.getByRole('button', { name: `Explore ${title}`, exact: true });
    await expect(target).toBeVisible();
    await page.waitForTimeout(1_200);
    await screenshot({ path: `${output}/${kind}-${width}-01-idle.jpg`, quality: 85 });
    await (width <= 1024 ? target.tap() : target.click());
    const rig = page.locator('.motion-rig');
    await expect(rig).toHaveAttribute('data-renderer', /webgl|fallback/);
    const renderer = await rig.getAttribute('data-renderer');
    await page.waitForTimeout(150);
    await screenshot({ path: `${output}/${kind}-${width}-02-articulation.jpg`, quality: 85 });
    await expect(page.locator('.is-expanded')).toHaveAttribute('data-selection-state', 'settled');
    await screenshot({ path: `${output}/${kind}-${width}-03-active.jpg`, quality: 85 });
    let device = null;
    if (renderer === 'webgl') device = await rig.locator('canvas').evaluate(canvas => {
      const gl = canvas.getContext('webgl2'); const debug = gl.getExtension('WEBGL_debug_renderer_info');
      return debug && { vendor: gl.getParameter(debug.UNMASKED_VENDOR_WEBGL), renderer: gl.getParameter(debug.UNMASKED_RENDERER_WEBGL), pixelWidth:canvas.width, pixelHeight:canvas.height, density:canvas.width/canvas.getBoundingClientRect().width };
    });
    await page.waitForTimeout(100);
    const idleDraws = await page.evaluate(() => window.__draws);
    await page.waitForTimeout(500);
    const idleDrawDelta = await page.evaluate(before => window.__draws - before, idleDraws);
    expect(idleDrawDelta).toBe(0);
    const geometry = await page.locator('.selection-frame').evaluate(el => ({ width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,captionGap:el.querySelector('.selection-caption').getBoundingClientRect().top-el.querySelector('.selection-image-frame').getBoundingClientRect().bottom, overflow:document.documentElement.scrollWidth>innerWidth }));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(180);
    await screenshot({ path: `${output}/${kind}-${width}-04-return.jpg`, quality: 85 });
    await expect(target).toBeFocused();
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.evaluate(() => window.__motionSamples.push({time:performance.now(),attribute:'focus-restored'}));
    await screenshot({ path: `${output}/${kind}-${width}-05-idle-restored.jpg`, quality: 85 });
    expect(errors).toEqual([]); expect(writes).toEqual([]); expect(geometry.overflow).toBe(false);
    const samples = await page.evaluate(() => window.__motionSamples);
    const performance = await page.evaluate(() => ({ frameGaps:window.__frameGaps,longTasks:window.__longTasks,draws:window.__draws,resources:performance.getEntriesByType('resource').filter(entry=>/sculpture|archive-|motion-rig|710055|ac322|png/.test(entry.name)).map(entry=>({name:entry.name,start:entry.startTime,duration:entry.duration,responseEnd:entry.responseEnd})) }));
    if (phase === 'after' && !timingsOnly) {
      await (width <= 1024 ? target.tap() : target.click());
      await expect(page.locator('.stage')).toHaveAttribute('data-motion-phase', 'opening');
      await page.waitForTimeout(180);
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
      await expect(target).toBeFocused();
      await expect(page.locator('canvas')).toHaveCount(0);
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
      await screenshot({ path: `${output}/${kind}-${width}-06-interrupted-restored.jpg`, quality:85 });
    }
    const video = page.video();
    await context.close();
    await video?.saveAs(`${output}/${kind}-${width}.webm`);
    findings.push({ kind, width, height, renderer, device, geometry, idleDrawDelta, performance, focusReturned:true, canvasDisposed:true, interruptedReturn:phase==='after'&&!timingsOnly, errors, writes, samples });
    console.log(`${phase}: ${kind} ${width}px ${renderer} opening/return passed`);
  }
} finally { await browser.close(); }
await writeFile(`${output}/${timingsOnly?'timings':'findings'}.json`, JSON.stringify({ date:new Date().toISOString(), phase, timingsOnly, source: phase==='before'?'Approved 66bba23 isolated worktree':'Current Phase 4 code', data:'Frozen Phase 3 public GET snapshot; API writes/counters blocked', media:'Actual local sculpture/project images and hash-verified unmodified public PNGs; no pixel fixtures', browser:'Installed Chrome default renderer; no forced fallback/software flags; native no-preference', findings },null,2)+'\n');
