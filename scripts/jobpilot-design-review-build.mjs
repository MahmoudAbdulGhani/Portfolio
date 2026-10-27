import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const jobPilotDesignBranch = 'prototype/jobpilot-design-journey';
export const jobPilotRefinementBranch = 'refine/jobpilot-design-phase1';
export function isJobPilotDesignReviewBuild(mode, env = process.env) {
  if (env.VERCEL_ENV === 'production') return false;
  return mode === 'jobpilot-design-review' || (env.VERCEL_ENV === 'preview' && [jobPilotDesignBranch,jobPilotRefinementBranch].includes(env.VERCEL_GIT_COMMIT_REF));
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
      // Keep the historical archive's working-candidate link attached to PR51.
      // Its committed captures/report are preserved without rewriting history.
      const archive=path.join(destination,'index.html');
      await writeFile(archive,(await readFile(archive,'utf8')).replace('href="/review/jobpilot/candidate"','href="/review/jobpilot/before"'));
      const refinement = path.join(output,'review/jobpilot-refinement');
      await mkdir(refinement,{recursive:true});
      await cp('docs/design/jobpilot-phase1-refinement',refinement,{recursive:true});
      await writeFile(path.join(destination,'build.json'),JSON.stringify({review:true,commit:process.env.VERCEL_GIT_COMMIT_SHA??'local',baseline:'/review/jobpilot/baseline',before:'/review/jobpilot/before',candidate:'/review/jobpilot/candidate',comparison:'/review/jobpilot-comparison/index.html',refinement:'/review/jobpilot-refinement/index.html'},null,2));
    },
  };
}
