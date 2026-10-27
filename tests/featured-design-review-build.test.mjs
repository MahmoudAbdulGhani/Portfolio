import test from 'node:test';
import assert from 'node:assert/strict';
import { isFeaturedDesignReviewBuild, featuredDesignBranch } from '../scripts/featured-design-review-build.mjs';
test('Phase 2 candidates require explicit opt-in and fail closed in Vercel Production', () => {
  assert.equal(isFeaturedDesignReviewBuild('production',{}),false);
  assert.equal(isFeaturedDesignReviewBuild('featured-design-review',{}),true);
  assert.equal(isFeaturedDesignReviewBuild('production',{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:featuredDesignBranch}),true);
  assert.equal(isFeaturedDesignReviewBuild('production',{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'adopt/jobpilot-phase1'}),false);
  assert.equal(isFeaturedDesignReviewBuild('featured-design-review',{VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:featuredDesignBranch}),false);
});
