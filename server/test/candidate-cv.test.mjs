import test from 'node:test';
import assert from 'node:assert/strict';
import { candidateCvForJob, resolveCandidateCv, selectCandidateProjects, APPROVED_CV_SUMMARY } from '../src/lib/candidate-cv.js';
import { normalizeExperience, employmentEvidence, experienceLocation } from '../../shared/content-integrity-runtime.js';

test('a candidate summary uses source skill keys, never a provider assessment or employment inference', () => {
  const source = { skills: ['React', 'TypeScript', 'FastAPI', 'Django', 'PostgreSQL', 'Git'].map(name => ({ name })) };
  const result = candidateCvForJob(source, 'Junior React and TypeScript developer using FastAPI or Django, PostgreSQL and Git. Team work matters.');
  assert.equal(result.source, 'record-grounded');
  assert.equal(result.text, 'Full-stack software engineer building web applications. My portfolio includes work with React, TypeScript, FastAPI, Django, PostgreSQL, Git.');
  assert.deepEqual(result.plan.skillKeys, ['react', 'typescript', 'fastapi', 'django', 'postgresql', 'git']);
  assert.equal(result.teamWork, true);
  assert.deepEqual(resolveCandidateCv(result.plan, source).text, result.text);
  assert.deepEqual(candidateCvForJob(source, 'Reactive systems only.').plan.skillKeys, []);
});

test('invalid, stale, duplicate and legacy freeform summary proposals use the approved factual fallback', () => {
  const source = { skills: [{ name: 'React' }] };
  for (const plan of [undefined, { text: 'Invented executive recommendation and credential assessment.' },
    { version: 2, skillKeys: ['react'], teamWork: false }, { version: 1, skillKeys: ['invented'], teamWork: false },
    { version: 1, skillKeys: ['react', 'react'], teamWork: false }, { version: 1, skillKeys: [], teamWork: false }]) {
    assert.equal(resolveCandidateCv(plan, source).text, APPROVED_CV_SUMMARY);
    assert.equal(resolveCandidateCv(plan, source).source, 'approved-profile');
  }
  const plan = candidateCvForJob(source, 'React web developer').plan;
  assert.equal(resolveCandidateCv(plan, { skills: [] }).text, APPROVED_CV_SUMMARY, 'Removed skills are revalidated at download time');
  const longName='Long source skill '.repeat(45).trim();
  assert.equal(resolveCandidateCv({version:1,skillKeys:[longName.toLowerCase()],teamWork:false},{skills:[{name:longName}]}).text,APPROVED_CV_SUMMARY,'Candidate copy remains concise even with oversized source labels');
});

test('project selection uses role overlap and documented team scope, not empty-slot padding', () => {
  const projects = [
    { slug: 'python', stack: ['FastAPI'], published: true },
    { slug: 'team', stack: ['React'], team: ['Owner', 'Colleague'], myRole: 'Contributed to the team UI', published: true },
    { slug: 'unrelated', stack: ['PHP'], published: true },
    { slug: 'hidden', stack: ['FastAPI'], showOnCv: false },
  ];
  const candidate = { skillKeys: ['fastapi', 'react'], teamWork: true };
  assert.deepEqual(selectCandidateProjects(projects, candidate).map(project => project.slug), ['team', 'python']);
  assert.deepEqual(selectCandidateProjects(projects, { skillKeys: ['fastapi'], teamWork: false }).map(project => project.slug), ['python']);
  assert.deepEqual(selectCandidateProjects(projects, { skillKeys: [], teamWork: false }, ['hidden', 'invented']), []);
});

test('month ranges and role labels preserve granularity without inventing a developer contract', () => {
  const backend = normalizeExperience({ company: 'Ishtari', role: 'Backend Developer', startDate: '2025-12', endDate: '2026-01', workArrangement: 'Onsite' });
  assert.equal(backend.meta, 'Dec 2025 – Jan 2026');
  assert.equal(backend.employmentEvidence.dateGranularity, 'month');
  assert.equal(backend.employmentEvidence.exactDuration, null);
  assert.equal(backend.employmentEvidence.employmentType, null);
  assert.equal(backend.employmentEvidence.workArrangement, 'Onsite');
  assert.equal(employmentEvidence({ role: 'QA Intern', startDate: '2026-05', endDate: '2026-08' }).employmentType, 'Internship');
  assert.equal(employmentEvidence({ role: 'Web Development Trainer' }).employmentType, null);
  assert.equal(employmentEvidence({ role: 'Backend Developer', meta: 'Dec 2025 – Jan 2026' }).dateGranularity, 'month');
  assert.deepEqual(normalizeExperience(backend), backend);
});

test('stale Digital Hub and FALA prose is factual after every read, with location metadata retained once', () => {
  const hub = { company: 'The Digital Hub, UNRWA, Beirut, Hybrid', role: 'Full-Stack Developer Intern', startDate: '2026-06', endDate: '2026-09', location: 'Beirut, Hybrid', description: 'Completing an intensive full-stack software engineering and AI program. Developing type-safe React apps; implementing secure SQL and NoSQL data layers. Beirut, Hybrid.' };
  const result = normalizeExperience(hub);
  assert.equal(result.description, 'Completed a full-stack software engineering and AI program. Developed type-safe React apps; implemented secure SQL and NoSQL data layers.');
  assert.equal(result.location, hub.location);
  assert.equal(experienceLocation(result), '');
  assert.equal(experienceLocation({ ...result, company: 'The Digital Hub, UNRWA' }), 'Beirut, Hybrid');
  assert.deepEqual(normalizeExperience(result), result);
  const fala = normalizeExperience({ company: 'FALA Association', description: 'Mentored developers on procedural engineering logic, component workflows, and industry-standard deployment structures.' });
  assert.equal(fala.description, 'Mentored developers in programming logic and component-based workflows, and guided learners through project structure and deployment practices.');
});
