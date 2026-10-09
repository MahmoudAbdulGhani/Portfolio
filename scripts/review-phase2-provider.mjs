// Real provider evaluation, corrected local routes and read-only public data.
// Every Prisma operation uses the fail-closed in-memory review replacement.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import dotenv from 'dotenv';
import { snapshotPrisma, serve } from '../server/test/helpers/snapshot-api.mjs';
if (!process.argv.includes('--live')) throw new Error('Use --live for real provider evaluation.');
dotenv.config({ path: 'server/.env', quiet: true });
if (!process.env.GEMINI_API_KEY) throw new Error('Provider access is unavailable.');
process.env.NODE_ENV = 'test';
globalThis.__portfolioPrisma = snapshotPrisma(JSON.parse(await readFile('.motion-preview/public-content.json', 'utf8'))).prisma;
const { default: app } = await import('../server/src/app.js');
const api = await serve(app);
const questions = [
  { projectSlug: 'jobpilot-ai', question: 'How does JobPilot handle stale reviewed profile changes and approved document versions? Separate inspected implementation from anything actually tested in this case-study review.' },
  { projectSlug: 'construction-project-management-accounting-system', question: 'Does Groq calculate Cedar’s financial forecast and decide risk levels? Explain the source-backed boundary and what this review can verify about the deployed application.' },
  { projectSlug: 'lobby', question: 'Did Mahmoud alone build Lobby’s full audio and screen-sharing infrastructure? Distinguish the platform’s team delivery from his documented personal work.' },
  { question: 'What evidence supports the Medicare Hub and Home Services case studies? Is individual ownership documented, and who supplied the Home Services visual design?' },
];
const findings = [];
try {
  for (const payload of questions) {
    const response = await api.post('/api/assistant', payload);
    findings.push({ ...payload, status: response.status, ...JSON.parse(response.body) });
  }
} finally { await api.close(); delete globalThis.__portfolioPrisma; }
await mkdir('docs/design/phase2', { recursive: true });
await writeFile('docs/design/phase2/provider-answers.json', JSON.stringify({ date: new Date().toISOString(),
  source: 'Real configured Gemini provider, corrected local assistant route, public GET snapshot and in-memory Prisma. Not deployed production responses or project backend/provider tests.',
  model: process.env.GEMINI_MODEL || 'gemini-3.5-flash', findings,
}, null, 2) + '\n');
console.log(JSON.stringify(findings, null, 2));
if (findings.some(row => row.status !== 200)) process.exitCode = 1;
