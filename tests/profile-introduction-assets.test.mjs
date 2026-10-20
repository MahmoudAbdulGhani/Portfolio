import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('only the four delivered optimized speaking assets are shipped, unchanged', async () => {
  const files = {
    'mahmoud-introduction-480.webm': [1523283, '343efe0a20731c7acd8056b5ec35ab80510c9dd0d03629b3720d83dd7d808f6d'],
    'mahmoud-introduction-720.webm': [2654346, 'f15deb5ec861c231b555989975464ece43581a71241101f6a173dc08e6bc6b18'],
    'mahmoud-introduction.mp3': [289197, '41225f959543f2ffe7f0ab10c46846ef772110efe7ad1fa47e5826a22f864a6a'],
    'mahmoud-introduction.en.vtt': [222, '30416c551129cced422e17e780704fb971fba539382990e9a1300a9ac05531c8'],
  };
  assert.deepEqual((await readdir('public/media/profile')).sort(), Object.keys(files).sort());
  for (const [name, [size, hash]] of Object.entries(files)) {
    const bytes = await readFile(`public/media/profile/${name}`);
    assert.equal(bytes.length, size);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
  }
  // Vite imports from src, while the stable public VTT remains downloadable.
  assert.deepEqual(await readFile('src/lib/profile-introduction.en.vtt'), await readFile('public/media/profile/mahmoud-introduction.en.vtt'));
});
