import test from 'node:test';
import assert from 'node:assert/strict';
import { isJobPilotDesignReviewBuild, jobPilotDesignBranch } from '../scripts/jobpilot-design-review-build.mjs';

test('JobPilot design review requires explicit build opt-in and fails closed in Production',()=>{
  assert.equal(isJobPilotDesignReviewBuild('production',{}),false);
  assert.equal(isJobPilotDesignReviewBuild('jobpilot-design-review',{}),true);
  assert.equal(isJobPilotDesignReviewBuild('production',{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:jobPilotDesignBranch}),true);
  assert.equal(isJobPilotDesignReviewBuild('production',{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'fix/job-match-requirement-scope'}),false);
  assert.equal(isJobPilotDesignReviewBuild('jobpilot-design-review',{VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:jobPilotDesignBranch}),false);
});
