import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { caseMedia } from '../src/generated/case-media.ts';

test('all 50 original identities retain measured dimensions and explicit roles', async () => {
  assert.equal(caseMedia.length, 50);
  assert.deepEqual(Object.fromEntries([...new Set(caseMedia.map(item => item.slug))].map(slug => [slug, caseMedia.filter(item => item.slug === slug).length])), {
    'jobpilot-ai': 7, lobby: 8, 'gamezone-arena': 15, 'construction-project-management-accounting-system': 7,
    unihub: 6, 'full-stack-user-management-system': 3, 'medicare-hub': 2, 'home-services': 2,
  });
  assert.equal(new Set(caseMedia.map(item => `${item.slug}:${item.identity}`)).size, 50);
  for (const item of caseMedia) {
    assert.ok(item.width > 0 && item.height > 0);
    assert.match(item.role, /^(overview|task|document|phone|tablet|artwork)$/);
    if (item.identity.startsWith('/')) {
      const metadata = await sharp(`public${item.identity}`).metadata();
      assert.equal(metadata.width, item.width, item.identity);
      assert.equal(metadata.height, item.height, item.identity);
    }
    for (const detail of [...item.details, ...(item.mobile ? [item.mobile] : [])]) {
      const metadata = await sharp(`public${detail.src}`).metadata();
      assert.equal(metadata.width, detail.width, detail.src);
      assert.equal(metadata.height, detail.height, detail.src);
      assert.ok(detail.label.trim());
    }
    if (item.mobile) {
      const complete = await sharp(`public${item.mobile.fullSrc}`).metadata();
      assert.equal(complete.width, item.mobile.width);
      assert.ok(complete.height > item.mobile.height, 'Phone task retains its complete document source');
    }
  }
});

test('authored detail rectangles stay inside complete originals and preserve source provenance', async () => {
  const { compositions } = JSON.parse(await readFile('docs/design/mobile-case-media/compositions.json', 'utf8'));
  for (const view of compositions) {
    const identity = view.original.startsWith('/') ? view.original : view.original.split('/').at(-1);
    const original = caseMedia.find(item => item.identity === identity);
    assert.ok(original, identity);
    assert.match(view.originalSha256, /^[a-f0-9]{64}$/);
    const { left, top, width, height } = view.rectangle;
    assert.ok(left >= 0 && top >= 0 && width > 0 && height > 0);
    assert.ok(left + width <= original.width && top + height <= original.height, view.detail);
  }
  assert.equal(caseMedia.find(item => item.slug === 'unihub' && item.details.length)?.role, 'document');
  assert.equal(caseMedia.filter(item => item.mobile).length, 3);
  assert.equal(caseMedia.filter(item => item.slug === 'medicare-hub').every(item => !item.details.length && !item.mobile), true);
});

test('complete reader variants preserve every original boundary and never upscale a source', async () => {
  const assets = JSON.parse((await readFile('src/generated/complete-case-media.ts', 'utf8')).split('export const completeCaseMedia: Record<string, ProjectImageAsset & { src: string }> = ')[1].trim().replace(/;$/, ''));
  const { sources } = JSON.parse(await readFile('docs/design/complete-case-media/sources.json', 'utf8'));
  assert.equal(Object.keys(assets).length, 50);
  const variantOwners = new Map();
  for (const source of sources) {
    const asset = assets[source.identity];
    assert.equal(asset.width, source.width); assert.equal(asset.height, source.height);
    assert.equal(asset.src, source.src);
    assert.ok(!asset.src.includes('/projects/case-media/'));
    for (const format of ['avif', 'webp']) for (const variant of asset[format].split(', ')) {
      const [src, descriptor] = variant.split(' ');
      assert.ok(!variantOwners.has(src), `Different originals must not overwrite the same variant: ${src}`);
      variantOwners.set(src, source.identity);
      const width = Number(descriptor.slice(0, -1));
      const metadata = await sharp(`public${src}`).metadata();
      assert.equal(metadata.width, width, src);
      assert.ok(width <= source.width, `No invented resolution: ${src}`);
      assert.ok(Math.abs(metadata.height - source.height * width / source.width) <= 0.5, `Whole original proportions: ${src}`);
    }
    if (source.src.startsWith('/projects/complete/')) {
      const expected = await sharp(source.master).raw().toBuffer();
      const original = await sharp(`public${source.src}`).raw().toBuffer();
      assert.deepEqual(original, expected, 'Full-resolution lossless original retains every pixel');
    }
  }
  assert.ok(assets['/projects/phase3/gamezone-session.webp'].width > 2360, 'Restore full desktop master instead of enlarging the 1920px derivative');
  assert.equal(assets['/projects/unihub/transcipt.webp'].width, 1914, 'Transcript source quality is honestly bounded');
  assert.equal(assets['/projects/responsive/user-management-phone.webp'].width, 343, 'Phone excerpt is not given invented detail');
});
