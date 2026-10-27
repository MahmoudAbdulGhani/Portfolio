import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
export const featuredDesignBranch = 'prototype/featured-design-phase2';
export function isFeaturedDesignReviewBuild(mode, env = process.env) {
  if (env.VERCEL_ENV === 'production') return false;
  return mode === 'featured-design-review' || (env.VERCEL_ENV === 'preview' && env.VERCEL_GIT_COMMIT_REF === featuredDesignBranch);
}
export function featuredDesignArtifacts(enabled) {
  let output;
  return {
    name: 'featured-design-review-artifacts',
    configResolved(config) { output = path.resolve(config.root,config.build.outDir); },
    async closeBundle() {
      if (!enabled) return;
      const destination = path.join(output,'review/featured-comparison');
      await mkdir(destination,{recursive:true});
      await cp('docs/design/featured-phase2',destination,{recursive:true});
      await writeFile(path.join(destination,'build.json'),JSON.stringify({review:true,commit:process.env.VERCEL_GIT_COMMIT_SHA ?? 'local'},null,2));
    },
  };
}
