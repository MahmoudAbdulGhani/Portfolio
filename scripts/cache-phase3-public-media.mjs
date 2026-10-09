// Immutable, authentic public image bytes for repeatable visual review only.
// No fixtures, edits or production content writes.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const exec = promisify(execFile);
const content = JSON.parse(await readFile('.motion-preview/phase3-public-content.json', 'utf8'));
const sources = [...new Set(content['/api/projects'].flatMap(project => [...project.screenshots, project.coverImage]).filter(src => src?.startsWith('https://')))];
await mkdir('.motion-preview/phase3-public-media', { recursive: true });
const records = [];
for (const src of sources) {
  const url = new URL(src);
  if (url.hostname !== 'yetqhjdgbemjxanxqlqf.supabase.co' || !url.pathname.startsWith('/storage/v1/object/public/portfolio-images/projects/')) throw new Error('Unexpected public media origin');
  const identity = url.pathname.split('/').at(-1);
  const file = `.motion-preview/phase3-public-media/${identity}`;
  await exec('rtk', ['proxy', 'curl.exe', '--silent', '--show-error', '--fail', '--max-time', '60', '--output', file, src]);
  const bytes = await readFile(file), metadata = await sharp(bytes).metadata();
  records.push({ src, identity, file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), width: metadata.width, height: metadata.height });
  console.log(`${identity}: ${metadata.width}×${metadata.height}`);
}
await writeFile('docs/design/phase3/published-image-dimensions.json', JSON.stringify({ date: new Date().toISOString(), method: 'Read-only original public image GET via curl; SHA-256 and decoded image metadata. Unmodified bytes cached locally for repeatable visual review only.', records }, null, 2) + '\n');
