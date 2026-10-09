import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';

const root = 'docs/design/engineered-landscape-portrait/finish';
const treatment = JSON.parse(await readFile(`${root}/processing.json`, 'utf8'));
const delivery = JSON.parse(await readFile(`${root}/delivery.json`, 'utf8'));
const master = await readFile(`${root}/portrait-finished-master.png`);

test('portrait finishing preserves the existing alpha, registered geometry, clothing interior and hands', async () => {
  const previous = await readFile('docs/design/engineered-landscape-portrait/portrait-refined-master.png');
  assert.equal(createHash('sha256').update(previous).digest('hex'), treatment.existingMasterSHA256);
  const original = await sharp(previous).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const finished = await sharp(master).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([finished.info.width, finished.info.height], [1200, 1600]);
  assert.deepEqual(finished.info, original.info);
  let changedFace = 0;
  for (let i = 0; i < original.data.length; i += 4) {
    const y = Math.floor(i / 4 / original.info.width);
    assert.equal(finished.data[i + 3], original.data[i + 3], `alpha at pixel ${i / 4}`);
    const rgbChanged = [0, 1, 2].some(channel => finished.data[i + channel] !== original.data[i + channel]);
    if ((y >= 755 && original.data[i + 3] >= 250) || y >= 1400) {
      assert.equal(rgbChanged, false, `clothing, hands or watch at pixel ${i / 4}`);
    }
    if (y < 690 && original.data[i + 3] >= 250 && rgbChanged) changedFace++;
  }
  assert.ok(changedFace > 1000, 'the head photometric correction must be present');
  assert.deepEqual(treatment.crop, { left: 376, top: 341, width: 768, height: 1259 });
});

test('responsive portrait files preserve visible RGB and alpha without exceeding native source resolution', async () => {
  for (const variant of delivery.variants) {
    assert.ok(variant.width <= treatment.crop.width, 'do not upscale the native cutout');
    const expected = await sharp(master).extract(treatment.crop).resize({ width: variant.width, withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const actual = await sharp(await readFile(`public${variant.src}`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual([actual.info.width, actual.info.height], [variant.width, variant.height]);
    assert.equal(actual.data.length, expected.data.length);
    for (let i = 0; i < actual.data.length; i += 4) {
      assert.equal(actual.data[i + 3], expected.data[i + 3], `${variant.width}px alpha at ${i / 4}`);
      if (expected.data[i + 3] > 0) for (let c = 0; c < 3; c++) assert.equal(actual.data[i + c], expected.data[i + c], `${variant.width}px visible RGB at ${i / 4}`);
    }
  }
  const fallback = await sharp(await readFile('public/landscape/portrait-striped-finished.webp')).metadata();
  assert.deepEqual([fallback.width, fallback.height], [768, 1259]);
  assert.equal(fallback.hasAlpha, true);
});
