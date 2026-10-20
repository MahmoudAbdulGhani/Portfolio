import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { isPortraitReviewBuild, portraitReviewBranch } from '../scripts/profile-portrait-review-build.mjs';

test('portrait review requires local opt-in or the named Preview branch, and fails closed in Production', () => {
  assert.equal(isPortraitReviewBuild('production', {}), false);
  assert.equal(isPortraitReviewBuild('portrait-review', {}), true);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: portraitReviewBranch }), true);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'prototype/profile-portrait-hosted-review' }), true);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'prototype/profile-portrait-original-refinement' }), true);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'prototype/profile-portrait-mobile-composition' }), true);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'prototype/profile-standing-portrait' }), false);
  assert.equal(isPortraitReviewBuild('production', { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feat/profile-portrait-adoption' }), false, 'adoption Preview must exercise a normal production build');
  assert.equal(isPortraitReviewBuild('portrait-review', { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: portraitReviewBranch }), false);
});

test('approved matte clears both arm openings while preserving face, sleeve, watch and hands', async () => {
  const { crop } = JSON.parse(await readFile('docs/design/profile-portrait-original-refinement/processing.json', 'utf8'));
  const decoded = [];
  for (const format of ['png', 'webp']) {
    const { data, info } = await sharp(`public/review-assets/profile-original-hands.${format}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const alpha = (x, y) => data[((y - crop[1]) * info.width + x - crop[0]) * 4 + 3];
    for (const [x, y] of [[430, 1370], [948, 1312]]) assert.equal(alpha(x, y), 0, `${format}: background opening ${x},${y}`);
    for (const [x, y] of [[730, 500], [300, 1400], [900, 1800], [530, 1900], [840, 1900]]) assert.equal(alpha(x, y), 255, `${format}: original foreground ${x},${y}`);
    decoded.push(data);
  }
  assert.deepEqual(decoded[0], decoded[1], 'PNG and optimized lossless WebP retain the same RGBA pixels');
});

test('production portrait files retain the exact approved PR 37 bytes',async()=>{
  const {assets}=JSON.parse(await readFile('docs/design/profile-portrait-mobile-hierarchy/after.json','utf8'));
  for(const ext of ['png','webp']) {
    const actual=createHash('sha256').update(await readFile(`public/review-assets/profile-original-hands.${ext}`)).digest('hex');
    assert.equal(actual,assets[ext],`${ext}: approved original-photo extraction must not change during adoption`);
  }
});
