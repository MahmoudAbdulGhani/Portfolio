import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
export const supportingDesignBranch = 'prototype/supporting-design-phase2';
export const supportingDensityBranch = 'refine/supporting-mobile-density';
export function isSupportingDesignReviewBuild(mode, env = process.env) {
  if (env.VERCEL_ENV === 'production') return false;
  return mode === 'supporting-design-review' || (env.VERCEL_ENV === 'preview' && [supportingDesignBranch, supportingDensityBranch].includes(env.VERCEL_GIT_COMMIT_REF));
}
export function supportingDesignArtifacts(enabled) {
  let output;
  return {
    name: 'supporting-design-review-artifacts',
    configResolved(config) { output = path.resolve(config.root, config.build.outDir); },
    async closeBundle() {
      if (!enabled) return;
      const destination = path.join(output, 'review/supporting-comparison');
      await mkdir(destination, { recursive: true });
      await cp('docs/design/supporting-phase2', destination, { recursive: true });
      const density = path.join(output, 'review/supporting-density');
      await mkdir(density, { recursive: true });
      await cp('docs/design/supporting-density', density, { recursive: true });
      await writeFile(path.join(destination, 'build.json'), JSON.stringify({ review: true, commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local' }, null, 2));
    },
  };
}
