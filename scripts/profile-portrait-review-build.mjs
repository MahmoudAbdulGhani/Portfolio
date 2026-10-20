import { readFileSync } from 'node:fs';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const portraitReviewBranch = 'prototype/profile-portrait-mobile-hierarchy';
const portraitReviewBranches = [portraitReviewBranch, 'prototype/profile-portrait-mobile-composition', 'prototype/profile-portrait-original-refinement', 'prototype/profile-portrait-hosted-review'];
const comparisonDirectory = 'docs/design/profile-portrait-adoption';

// Deliberately fail closed on Vercel Production. Local builds opt in by mode;
// Git integration enables only the explicit review branches in Preview.
export function isPortraitReviewBuild(mode, env = process.env) {
  if (env.VERCEL_ENV === 'production') return false;
  return mode === 'portrait-review' ||
    (env.VERCEL_ENV === 'preview' && portraitReviewBranches.includes(env.VERCEL_GIT_COMMIT_REF));
}

export function portraitReviewArtifacts(enabled) {
  let output;
  return {
    name: 'profile-portrait-review-artifacts',
    configResolved(config) { output = path.resolve(config.root, config.build.outDir); },
    async closeBundle() {
      if (!enabled) return;
      const destination = path.join(output, 'review/portrait-comparison');
      await mkdir(destination, { recursive: true });
      await cp(comparisonDirectory, destination, { recursive: true });
      await cp('design-qa.md', path.join(destination, 'design-qa.md'));
      const html = await readFile(path.join(destination, 'comparison.html'), 'utf8');
      await writeFile(path.join(destination, 'index.html'), html);
      await writeFile(path.join(destination, 'build.json'), JSON.stringify({
        review: true, branch: process.env.VERCEL_GIT_COMMIT_REF ?? 'local',
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
        route: '/review/profile-portrait', comparison: '/review/portrait-comparison/index.html',
      }, null, 2) + '\n');
      console.log('Portrait review build: /review/profile-portrait and /review/portrait-comparison/index.html');
    },
    configureServer(server) {
      // Preserve the same comparison URL when reviewing the source locally.
      server.middlewares.use('/review/portrait-comparison', (req, res, next) => {
        const requested = (req.url ?? '/').split('?')[0];
        const file = requested === '/' || requested === '/index.html' ? 'comparison.html' : requested.slice(1);
        const folder = path.resolve(comparisonDirectory);
        const target = path.resolve(folder, file);
        if (!target.startsWith(folder + path.sep)) return next();
        try {
          const body = readFileSync(file === 'design-qa.md' ? 'design-qa.md' : target);
          const type = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.zip': 'application/zip' }[path.extname(file)];
          res.setHeader('Content-Type', type ?? 'application/octet-stream');
          res.setHeader('X-Robots-Tag', 'noindex, nofollow');
          res.end(body);
        } catch { next(); }
      });
    },
  };
}
