// Public JSON only: never request PDF initialization or submit a form.
import { writeFile, mkdir } from 'node:fs/promises';

const paths = ['profile', 'site-content', 'projects', 'skills', 'education', 'certifications', 'technologies'];
const entries = await Promise.all(paths.map(async path => {
  const response = await fetch(`https://mahmoud-portfolio-omega.vercel.app/api/${path}`, {
    method: 'GET', signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return [`/api/${path}`, await response.json()];
}));
await mkdir('.motion-preview', { recursive: true });
await writeFile('.motion-preview/public-content.json', JSON.stringify(Object.fromEntries(entries)));
console.log('Read-only public JSON snapshot saved for local Phase 2 review.');
