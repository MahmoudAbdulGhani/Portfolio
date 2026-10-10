import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotPrisma, serve } from './helpers/snapshot-api.mjs';

test('actual assistant and Job Match JSON/SSE paths preserve uncertainty, ownership and fresh context', async () => {
  const content = {
    '/api/profile': { name: 'Test Owner', experience: [{ company: 'The Digital Hub', startDate: '2026-06', endDate: '2026-09', description: 'Completed a full-stack software engineering and AI program.' }], socials: [] },
    '/api/projects': [{ slug: 'lobby', name: 'Lobby', github: 'https://github.com/Ahmad-khalaf517/lobby', team: ['Named colleague'], teamSize: 2, ownership: 'Team project', myRole: 'Developer', contributions: ['Invitation flows'], features: ['Team voice feature'], stack: ['Angular'] }],
    '/api/education': [{ degree: 'BSc', period: '2022 – 2025', details: 'Graduated in 2025.' }],
    '/api/certifications': [{ title: 'AWS re/Start Bootcamp', year: 'July 2025 - Oct 2025' }, { title: 'Another course', year: '2024' }],
  };
  const mock = snapshotPrisma(content);
  globalThis.__portfolioPrisma = mock.prisma;
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'mock-provider-key';
  const requests = [];
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /^https:\/\/generativelanguage\.googleapis\.com\//);
    const payload = JSON.parse(options.body);
    requests.push(payload);
    const text = payload.generationConfig.responseMimeType ? JSON.stringify({
      matchLevel: 'Partial Match', overallMatch: 'Mocked report', recruiterSummary: 'Training completion is unverified.',
      strongMatches: [], relevantExperience: [], relevantProjects: [{ slug: 'lobby', evidence: 'Invitation flows in a team project' }], partialMatches: [], gaps: ['Completion not verified'],
    }) : 'Mocked transport response; no model evaluation.';
    const result = { candidates: [{ content: { parts: [{ text }] } }] };
    return new Response(String(url).includes('streamGenerateContent') ? `data: ${JSON.stringify(result)}\n\n` : JSON.stringify(result), { status: 200 });
  };
  const { default: app } = await import('../src/app.js');
  const api = await serve(app);
  try {
    for (const stream of [false, true]) {
      const beforeReads = mock.readCount();
      const response = await api.post('/api/assistant', { question: `Describe learning status and teamwork (${stream}).`, projectSlug: 'lobby', stream });
      assert.equal(response.status, 200);
      assert.match(response.headers['cache-control'], /no-store/);
      assert.match(response.body, stream ? /"done":true/ : /Mocked transport/);
      assert.equal(mock.readCount() - beforeReads, 6, 'Every answer reads a fresh snapshot');
      const jobResponse = await api.post('/api/job-match', { jobDescription: `A recruiter needs a developer with documented full-stack training, verified qualifications and collaborative Angular experience. Variant ${stream}.`, stream });
      assert.equal(jobResponse.status, 200);
      assert.match(jobResponse.headers['cache-control'], /no-store/);
      assert.match(jobResponse.body, stream ? /event: result/ : /Mocked report/);
      content['/api/certifications'][0].year = '2025-07 - 2025-10';
    }
    assert.equal(requests.length, 4);
    for (const request of requests) {
      const instruction = request.systemInstruction.parts[0].text;
      assert.match(instruction, /Past dates.*never imply completion, graduation/);
      assert.match(instruction, /explicitly say it is not verified/);
      assert.match(instruction, /Unverified also does not establish that a qualification was not earned/);
      assert.match(instruction, /whether it was earned or completed remains unknown/);
      assert.match(instruction, /personal work only to documented myRole, ownership and contributions/);
      assert.match(instruction, /Source inspection is not a passed test, deployed feature/);
      assert.match(instruction, /use exclusively caseStudy.authorship.documentedPersonalWork/);
      const prompt = request.contents[0].parts[0].text;
      const context = JSON.parse(prompt.split('\n')[1]);
      for (const record of [...context.certifications, ...context.education, context.profile.experience[0]]) {
        assert.equal(record.learningEvidence.completion.status, 'unverified');
        assert.equal(record.learningEvidence.certification.status, 'unverified');
      }
      assert.equal(context.certifications[0].learningEvidence.dates, 'Jul 2025 – Oct 2025');
      assert.deepEqual(context.projects[0].team, ['Named colleague']);
      assert.deepEqual(context.projects[0].contributions, ['Invitation flows']);
      assert.match(context.projects[0].caseStudy.evidenceStatus.projectRuntime, /not rerun/);
      assert.deepEqual(context.projects[0].caseStudy.authorship.documentedPersonalWork, ['Invitation flows']);
      assert.ok(context.projects[0].caseStudy.decisions.every(decision => decision.personalAuthorship === 'not established by code inspection'));
      assert.deepEqual(context.education[0].learningEvidence.completion.recordedClaims, ['Graduated in 2025.']);
    }
    assert.equal(JSON.parse(requests[3].contents[0].parts[0].text.split('\n')[1]).certifications[0].year, 'Jul 2025 – Oct 2025');
    // A changed fact must appear on the next request, not an old answer cache.
    content['/api/certifications'][0].year = '2027';
    await api.post('/api/assistant', { question: 'Read the updated training dates.' });
    assert.equal(JSON.parse(requests[4].contents[0].parts[0].text.split('\n')[1]).certifications[0].year, '2027');
  } finally {
    await api.close();
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey;
    delete globalThis.__portfolioPrisma;
  }
});
