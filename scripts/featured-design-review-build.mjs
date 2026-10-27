import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
export const featuredDesignBranch = 'prototype/featured-design-phase2';
export const featuredDemoBranch = 'refine/featured-demo-introductions';
export function isFeaturedDesignReviewBuild(mode, env = process.env) {
  if (env.VERCEL_ENV === 'production') return false;
  return mode === 'featured-design-review' || (env.VERCEL_ENV === 'preview' && [featuredDesignBranch,featuredDemoBranch].includes(env.VERCEL_GIT_COMMIT_REF));
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
      const demoComparison=path.join(output,'review/featured-demo-introductions');
      await mkdir(demoComparison,{recursive:true});
      await cp('docs/design/featured-demo-introductions',demoComparison,{recursive:true});
      await writeFile(path.join(destination,'build.json'),JSON.stringify({review:true,commit:process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',demoComparison:'/review/featured-demo-introductions/index.html'},null,2));
    },
  };
}
