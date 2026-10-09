// Hermetic review exports. The tailored scenario is a declared QA fixture,
// never a substitute for the application's real AI Job Match workflow.
import { writeFile, mkdir } from 'node:fs/promises';
process.env.CV_STATIC_ONLY = '1';
const { generateCvPdfBuffer } = await import('../server/src/lib/cv.js');
await mkdir('docs/design/phase1/cv', { recursive: true });
for (const [name, options] of Object.entries({
  application: {},
  master: { mode: 'master' },
  tailored: { tailor: {
    summary: 'Full-stack engineer developing connected React interfaces, Python APIs and relational data workflows.',
    projectSlugs: ['lobby', 'jobpilot-ai', 'gamezone-arena'],
    strongMatches: ['React', 'Python', 'PostgreSQL'],
  } },
})) await writeFile(`docs/design/phase1/cv/${name}.pdf`, await generateCvPdfBuffer(options));
console.log('Static application, master and declared tailored QA exports generated without database access.');
