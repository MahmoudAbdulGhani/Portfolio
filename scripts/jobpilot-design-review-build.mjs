import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const jobPilotDesignBranch = 'prototype/jobpilot-design-journey';
export function isJobPilotDesignReviewBuild(mode, env = process.env) {
  if (env.VERCEL_ENV === 'production') return false;
  return mode === 'jobpilot-design-review' || (env.VERCEL_ENV === 'preview' && env.VERCEL_GIT_COMMIT_REF === jobPilotDesignBranch);
}
export function jobPilotDesignArtifacts(enabled) {
  let output;
  return {
    name: 'jobpilot-design-review-artifacts',
    configResolved(config) { output = path.resolve(config.root,config.build.outDir); },
    async closeBundle() {
      if (!enabled) return;
      const destination = path.join(output,'review/jobpilot-comparison');
      await mkdir(destination,{recursive:true});
      await cp('docs/design/jobpilot-design-journey',destination,{recursive:true});
      await writeFile(path.join(destination,'build.json'),JSON.stringify({review:true,commit:process.env.VERCEL_GIT_COMMIT_SHA??'local',baseline:'/review/jobpilot/baseline',candidate:'/review/jobpilot/candidate',comparison:'/review/jobpilot-comparison/index.html'},null,2));
    },
  };
}
