import { mkdir, rm, writeFile } from 'node:fs/promises';

const routes = ['profile', 'site-content', 'projects', 'skills', 'education', 'certifications', 'technologies'];
const entries = await Promise.all(routes.map(async (route) => {
  const response = await fetch(`https://mahmoud-portfolio-omega.vercel.app/api/${route}`);
  if (!response.ok) throw new Error(`Public ${route} fetch failed: ${response.status}`);
  return [`/api/${route}`, await response.json()];
}));
await mkdir('.motion-preview', { recursive: true });
await writeFile('.motion-preview/public-content.json', JSON.stringify(Object.fromEntries(entries)));
console.log('Read-only preview content refreshed from the published public CMS.');
try {
  const cv = await fetch('https://mahmoud-portfolio-omega.vercel.app/api/cv.pdf');
  if (!cv.ok || !cv.headers.get('content-type')?.includes('application/pdf')) {
    throw new Error('Public CV is unavailable.');
  }
  await writeFile('.motion-preview/public-cv.pdf', Buffer.from(await cv.arrayBuffer()));
  console.log('Public CV prepared for the read-only preview.');
} catch {
  await rm('.motion-preview/public-cv.pdf', { force: true });
  console.warn('Public CV is unavailable; the preview will report that honestly.');
}
