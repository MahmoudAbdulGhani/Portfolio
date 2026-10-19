import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPortraitReviewBuild, portraitReviewBranch } from '../scripts/profile-portrait-review-build.mjs';

test('portrait review requires local opt-in or the named Preview branch, and fails closed in Production', () => {
  assert.equal(isPortraitReviewBuild('production', {}), false);
  assert.equal(isPortraitReviewBuild('portrait-review', {}), true);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: portraitReviewBranch }), true);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'prototype/profile-portrait-hosted-review' }), true);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'prototype/profile-standing-portrait' }), false);
  assert.equal(isPortraitReviewBuild('portrait-review', { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: portraitReviewBranch }), false);
});
