import test from 'node:test';
import assert from 'node:assert/strict';
import { isSupportingDesignReviewBuild, supportingDesignBranch, supportingDensityBranch } from '../scripts/supporting-design-review-build.mjs';
test('supporting candidates require explicit local mode or their exact Preview branch',()=>{
  assert.equal(isSupportingDesignReviewBuild('production',{}),false);
  assert.equal(isSupportingDesignReviewBuild('supporting-design-review',{}),true);
  assert.equal(isSupportingDesignReviewBuild('production',{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:supportingDesignBranch}),true);
  assert.equal(isSupportingDesignReviewBuild('production',{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'main'}),false);
  assert.equal(isSupportingDesignReviewBuild('supporting-design-review',{VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:supportingDesignBranch}),false);
  assert.equal(isSupportingDesignReviewBuild('production',{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:supportingDensityBranch}),true);
  assert.equal(isSupportingDesignReviewBuild('supporting-design-review',{VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:supportingDensityBranch}),false);
});
