import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('only the four reviewed speaking assets are shipped; audio and captions are preserved', async () => {
  const files = {
    'mahmoud-introduction-480.webm': [510176, 'be05f8501d8f902e5f79c2d543437dbe5f76c618889550bf9b0357c5ee6f6be9'],
    'mahmoud-introduction-720.webm': [818600, 'bcc8c7da11828be2800d472c9cc04ce66d2d19ab08dd3e6bdf5144a320685f23'],
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
