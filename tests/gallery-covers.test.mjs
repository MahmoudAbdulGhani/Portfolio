import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';

const covers = JSON.parse(await readFile('docs/design/engineered-landscape-covers/cover-treatments.json', 'utf8'));

test('all eight covers have the same painted screenshot bounds, not only equal outer frames', async () => {
  assert.equal(covers.length, 8);
  for (const cover of covers) {
    const { data, info } = await sharp(cover.master).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 1600, cover.slug);
    assert.equal(info.height, 1000, cover.slug);
    let left = info.width, top = info.height, right = -1, bottom = -1;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const offset = (y * info.width + x) * info.channels;
        if (data[offset] === 222 && data[offset + 1] === 222 && data[offset + 2] === 211) continue;
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
    assert.deepEqual({ left, top, width: right - left + 1, height: bottom - top + 1 },
      { left: 80, top: 50, width: 1440, height: 900 }, cover.slug);
    // Source captures already match the slot; fitting them must not introduce
    // letterboxing, stretch a wide dashboard, or clip a tall original.
    assert.equal(cover.originalResolution[0] / cover.originalResolution[1], 1.6, cover.slug);
    assert.equal(cover.noCaptureCropping, true, cover.slug);
  }
});

test('every responsive gallery format and primary fallback decodes at the intended aspect ratio', async () => {
  for (const cover of covers) {
    for (const width of [480, 960, 1600]) {
      for (const format of ['webp', 'avif']) {
        const file = `public/projects/gallery-covers/${cover.slug}-${width}w.${format}`;
        const image = sharp(await readFile(file));
        const metadata = await image.metadata();
        assert.deepEqual([metadata.width, metadata.height], [width, width / 1.6], file);
        await image.resize({ width: 32 }).raw().toBuffer();
      }
    }
    const fallback = await sharp(await readFile(`public/projects/gallery-covers/${cover.slug}.webp`)).metadata();
    assert.deepEqual([fallback.width, fallback.height], [1600, 1000], cover.slug);
  }
});
