import { readFileSync } from 'node:fs';
import config from './vite.config.js';
import { reviewFixtures } from './scripts/review-fixtures.mjs';

// Explicit review mode: public CMS snapshot only; no requests reach production.
config.server.allowedHosts = ['terminal.local'];
config.server.proxy = {};
config.plugins.push({ name: 'readonly-motion-preview',
  // Explicit frontend fixture; never changes browser/OS preferences or production.
  transformIndexHtml: {
    order: 'pre',
    handler(html, context) {
      if (new URL(context.originalUrl || '/', 'http://localhost').searchParams.get('review_motion') !== 'reduced') return html;
      return { html, tags: [{ tag: 'script', injectTo: 'head-prepend', children: `
        const nativeMatchMedia = window.matchMedia.bind(window);
        window.matchMedia = query => query === '(prefers-reduced-motion: reduce)'
          ? { matches: true, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return true; } }
          : nativeMatchMedia(query);
      ` }] };
    },
  },
  configureServer(server) {
  server.middlewares.use((req, res, next) => {
    if (req.url?.startsWith('/__motion-review')) {
      const tablet = req.url.includes('tablet');
      const narrow = req.url.includes('narrow');
      const params = new URL(req.url, 'http://localhost').searchParams;
      const requested = params.get('route');
      const wide = params.get('viewport') === 'wide';
      const compact = params.get('viewport') === 'compact';
      const allowed = ['/', '/projects', '/contact', '/job-match', ...JSON.parse(readFileSync('.motion-preview/public-content.json', 'utf8'))['/api/projects'].map(project => `/projects/${project.slug}`)];
      const route = allowed.includes(requested) ? requested : req.url.includes('projects') ? '/projects' : '/';
      const fixture = ['success', 'failure'].includes(params.get('fixture')) ? params.get('fixture') : '';
      const reduced = params.get('motion') === 'reduced';
      const query = new URLSearchParams();
      if (fixture) query.set('review_fixture', fixture);
      if (reduced) query.set('review_motion', 'reduced');
      const source = `${route}${query.size ? `?${query}` : ''}`;
      const width = wide ? 1920 : compact ? 1366 : tablet ? 1024 : narrow ? 320 : 390;
      const height = wide || compact ? 640 : 844;
      const scale = wide ? 0.66 : compact ? 0.92 : 1;
      res.setHeader('Content-Type', 'text/html');
      res.end(`<html><head><meta charset="utf-8"><style>body{margin:0;background:#ddd;font:14px system-ui}p{text-align:center;margin:10px}.review-frame{width:${width * scale}px;height:${height * scale}px;margin:auto}iframe{display:block;border:0;width:${width}px;height:${height}px;transform:scale(${scale});transform-origin:top left}</style></head><body><p>${reduced ? "LOCAL REDUCED-MOTION FIXTURE · " : ""}${fixture ? `LOCAL TEST FIXTURE: ${fixture} — no production requests · ` : ""}${wide ? '1920×640' : compact ? '1366×640' : tablet ? 'Tablet width' : 'Mobile width'} review — live frontend in a viewport</p><div class="review-frame"><iframe title="Portfolio responsive review" src="${source}"></iframe></div></body></html>`); return;
    }
    if (!req.url?.startsWith('/api/')) return next();
    if (reviewFixtures(req, res)) return;
    if (req.url.split('?')[0] === '/api/cv.pdf' && (req.method === 'GET' || req.method === 'HEAD')) {
      try {
        res.setHeader('Content-Type', 'application/pdf');
        res.end(req.method === 'HEAD' ? undefined : readFileSync('.motion-preview/public-cv.pdf'));
      } catch {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'The CV is unavailable in this preview.' }));
      }
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: 'This preview is read-only. Open the live portfolio to send messages or use AI.' })); return;
    }
    try {
      const content = JSON.parse(readFileSync('.motion-preview/public-content.json', 'utf8'));
      const path = req.url.split('?')[0];
      const project = path.startsWith('/api/projects/') ? content['/api/projects'].find((item) => item.slug === path.slice('/api/projects/'.length)) : undefined;
      const body = content[path] ?? project;
      res.statusCode = body ? 200 : 404;
      res.end(JSON.stringify(body ?? { message: 'This endpoint is unavailable in the read-only preview.' }));
    } catch {
      res.statusCode = 503;
      res.end(JSON.stringify({ message: 'Run npm run preview:content to prepare the public CMS snapshot.' }));
    }
  });
}});
export default config;
