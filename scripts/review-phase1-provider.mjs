// Explicit live-provider QA through the real local assistant route. The only
// external writes are provider generation requests; all Prisma reads/writes use
// a fail-closed in-memory replacement populated from read-only public GET data.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import { snapshotPrisma, serve } from '../server/test/helpers/snapshot-api.mjs';

if (!process.argv.includes('--live')) throw new Error('Pass --live to authorize real provider generation QA.');
dotenv.config({ path: 'server/.env', quiet: true });
if (!process.env.GEMINI_API_KEY) throw new Error('Provider access unavailable; no key configured.');
process.env.NODE_ENV = 'test';
const content = JSON.parse(await readFile('.motion-preview/public-content.json', 'utf8'));
globalThis.__portfolioPrisma = snapshotPrisma(content).prisma;
const { default: app } = await import('../server/src/app.js');
const api = await serve(app);
const findings = [];
try {
  for (const question of [
    'The AWS re/Start dates are in the past. What can I safely say about attendance, finishing the bootcamp, and an earned AWS certification?',
    'Has Mahmoud graduated from the Digital Hub program, or does the available information establish something more limited? Give the dates and evidence limits.',
    'Did Mahmoud independently own all of Lobby and UniHub? Separate what the teams delivered from his recorded personal contributions and identify collaborators where documented.',
  ]) {
    const response = await api.post('/api/assistant', { question });
    findings.push({ question, status: response.status, ...JSON.parse(response.body) });
  }
} finally { await api.close(); delete globalThis.__portfolioPrisma; }
const out = 'docs/design/phase1-followup';
await mkdir(out, { recursive: true });
await writeFile(`${out}/provider-answers.json`, JSON.stringify({
  date: new Date().toISOString(), source: 'Real configured Gemini provider through corrected local assistant route, using captured public GET records and in-memory Prisma. Not deployed production responses.',
  model: process.env.GEMINI_MODEL || 'gemini-3.5-flash', findings,
}, null, 2) + '\n');
console.log(JSON.stringify(findings, null, 2));
if (findings.some(row => row.status !== 200)) process.exitCode = 1;
