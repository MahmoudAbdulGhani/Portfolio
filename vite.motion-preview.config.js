import { readFileSync } from 'node:fs';
import config from './vite.config.js';

// Explicit review mode: public CMS snapshot only; no requests reach production.
config.server.allowedHosts = ['terminal.local'];
config.server.proxy = {};
config.plugins.push({ name: 'readonly-motion-preview', configureServer(server) {
  server.middlewares.use((req, res, next) => {
    if (req.url?.startsWith('/__motion-review')) {
      const tablet = req.url.includes('tablet');
      res.setHeader('Content-Type', 'text/html');
      res.end(`<html><head><meta charset="utf-8"><style>body{margin:0;background:#ddd;font:14px system-ui}p{text-align:center;margin:10px}iframe{display:block;margin:auto;border:0;width:${tablet ? 1024 : 390}px;height:844px}</style></head><body><p>${tablet ? 'Tablet width' : 'Mobile width'} review — live frontend in a viewport</p><iframe title="Portfolio responsive review" src="/"></iframe></body></html>`); return;
    }
    if (!req.url?.startsWith('/api/')) return next();
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
