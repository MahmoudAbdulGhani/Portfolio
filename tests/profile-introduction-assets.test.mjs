import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('only the four reviewed speaking assets are shipped; audio and captions are preserved', async () => {
  const files = {
    'mahmoud-introduction-480.webm': [2703633, '41ef037004110db063d855915a0a78da7cc4f8a0ae51a743c43727a2b658cf49'],
    'mahmoud-introduction-720.webm': [5051086, 'f29880da2d56148ffd8cc74d2707481359dc93a90f8870bc1d10c23dcd9de5af'],
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
