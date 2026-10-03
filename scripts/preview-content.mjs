import { mkdir, writeFile } from 'node:fs/promises';

const routes = ['profile', 'site-content', 'projects', 'skills', 'education', 'certifications', 'technologies'];
const entries = await Promise.all(routes.map(async (route) => {
  const response = await fetch(`https://mahmoud-portfolio-omega.vercel.app/api/${route}`);
  if (!response.ok) throw new Error(`Public ${route} fetch failed: ${response.status}`);
  return [`/api/${route}`, await response.json()];
}));
await mkdir('.motion-preview', { recursive: true });
await writeFile('.motion-preview/public-content.json', JSON.stringify(Object.fromEntries(entries)));
console.log('Read-only preview content refreshed from the published public CMS.');
