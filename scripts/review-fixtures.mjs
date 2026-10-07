// Development-only UI fixtures. These never proxy requests or persist messages.
import { readFileSync } from 'node:fs';
export function reviewFixtures(req, res) {
  let fixture;
  try { fixture = new URL(req.headers.referer || '').searchParams.get('review_fixture'); } catch { return false; }
  const path = req.url?.split('?')[0];
  if (!['success', 'failure'].includes(fixture) || req.method !== 'POST' || !['/api/messages', '/api/job-match', '/api/job-match/tailored-cv'].includes(path)) return false;
  req.resume();
  if (fixture === 'failure') { res.statusCode = 503; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ message: 'Review fixture: service unavailable. Please try again.' })); return true; }
  if (path === '/api/job-match/tailored-cv') { res.setHeader('Content-Type', 'application/pdf'); res.end(readFileSync('.motion-preview/public-cv.pdf')); return true; }
  if (path === '/api/messages') { res.statusCode = 201; res.setHeader('Content-Type', 'application/json'); setTimeout(() => res.end(JSON.stringify({ id: 'review-fixture', createdAt: new Date().toISOString() })), 1200); return true; }
  const result = { matchLevel: 'Moderate Match', overallMatch: 'Review fixture — this is a deterministic UI test, not an AI assessment.', strongMatches: ['Fixture: React and TypeScript evidence appears in JobPilot AI.'], relevantExperience: ['Fixture: connected frontend and API workflows.'], relevantProjects: [{ slug: 'jobpilot-ai', name: 'JobPilot AI', portfolioUrl: '/projects/jobpilot-ai', evidence: 'Fixture link to the real case study.' }], partialMatches: ['Fixture: experience requirements need recruiter review.'], gaps: ['Fixture: unsupported requirements remain visible.'], recruiterSummary: 'Review fixture summary for clipboard and export verification.' };
  res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache');
  res.write(`event: status\ndata: ${JSON.stringify({ message: 'Review fixture: comparing portfolio evidence…' })}\n\n`);
  setTimeout(() => res.end(`event: result\ndata: ${JSON.stringify({ result, cvToken: 'review-fixture' })}\n\n`), 1800);
  return true;
}
