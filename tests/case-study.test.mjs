import test from 'node:test';
import assert from 'node:assert/strict';
import { caseStudyFor, caseStudies, selectedContributions, screenMatches, caseStudyImageCaption } from '../shared/case-study-runtime.js';
import { caseStudyProjects } from './fixtures/case-study-projects.ts';

test('source links encode dynamic-route path segments without changing their revision', () => {
  const source = caseStudies['gamezone-arena'].sources.find(source => source.url.includes('approve-cash'));
  assert.ok(source);
  assert.match(source.url, /bookings\/%5Bid%5D\/approve-cash\/route\.ts$/);
  assert.match(decodeURIComponent(source.url), /bookings\/\[id\]\/approve-cash\/route\.ts$/);
});

test('reviewed stories require the linked repository, not merely a familiar slug', () => {
  assert.equal(Object.keys(caseStudies).length, 8);
  for (const project of caseStudyProjects) {
    const study = caseStudyFor(project);
    assert.ok(study, project.slug);
    assert.equal(caseStudyFor({ ...project, github: null }), undefined);
    assert.equal(caseStudyFor({ ...project, github: 'https://github.com/unrelated/project' }), undefined);
    assert.equal(caseStudyFor({ ...project, github: `${project.github}.evil.test` }), undefined);
    assert.match(study.revision, /^[a-f0-9]{40}$/);
    assert.ok(study.summary.split(/\s+/).length <= 50);
    for (const source of study.sources) assert.ok(source.url.startsWith(`${study.repository}/blob/${study.revision}/`));
    for (const decision of study.decisions) for (const id of decision.sources) assert.ok(study.sources.some(source => source.id === id));
  }
  assert.equal(caseStudyFor({ slug: 'future-project', github: 'https://github.com/owner/future' }), undefined);
});

test('personal attribution stays in current CMS records; missing attribution is not reconstructed from repository evidence', () => {
  for (const project of caseStudyProjects) {
    const study = caseStudyFor(project);
    const selected = selectedContributions(project, study);
    for (const statement of selected) assert.ok(project.contributions.includes(statement));
    assert.deepEqual(selectedContributions({ contributions: [] }, study), []);
    if (['medicare-hub', 'home-services'].includes(project.slug)) {
      assert.deepEqual(selected, []);
      assert.equal(study.authorship.status, 'personal attribution undocumented');
      assert.deepEqual(study.authorship.documentedPersonalWork, []);
    }
    assert.ok(study.decisions.every(decision => decision.personalAuthorship === 'not established by code inspection'));
  }
  assert.ok(caseStudies['home-services'].designCredit.url.startsWith('https://www.figma.com/'));
  assert.equal(caseStudies['home-services'].designCredit.creator, null);
  assert.match(caseStudies['home-services'].designCredit.creatorStatus, /not identified/);
  assert.match(caseStudies['medicare-hub'].leadCaption, /not a screenshot/);
  assert.equal(caseStudies['medicare-hub'].flowPlacement, 'workflow');
});

test('known media identity matches without assigning unfamiliar captures a reviewed workflow', () => {
  assert.equal(screenMatches('https://media.example.test/project/known.png?cache=1', ['known.png']), true);
  assert.equal(screenMatches('https://media.example.test/project/unknown.png', ['known.png']), false);
  assert.equal(screenMatches('/unrelated/audio-room.webp', ['/projects/lobby/audio-room.webp']), false);
});

test('reviewed limitations distinguish code, pictured UI and runtime evidence', () => {
  const cedar = caseStudies['construction-project-management-accounting-system'];
  assert.match(cedar.decisions.find(row => row.title === 'Calculate first, narrate second').choice, /Django computes.*Optional Groq narration/);
  assert.match(cedar.limits.join(' '), /Inventory valuation.*Coming soon/);
  assert.match(caseStudies['gamezone-arena'].limits.join(' '), /does not establish payment settlement or race-free/);
  assert.match(caseStudies.unihub.workflow[0].notice, /not a verified academic credential/);
  assert.equal(caseStudies['jobpilot-ai'].sourceAccess, 'private');
  assert.ok(caseStudies['jobpilot-ai'].sources.every(source => source.access === 'private'));
  assert.match(caseStudies['jobpilot-ai'].decisions.find(row => row.title === 'Approve the version that is exported').consequence, /does not inherit/);
});

test('public editorial copy separates product scope from capture mechanics without losing qualifications', () => {
  for (const study of Object.values(caseStudies)) {
    const publicCopy = [study.summary, study.problem, study.leadCaption, ...study.workflow.map(step => step.notice), ...study.delivered, ...study.limits].join(' ');
    assert.doesNotMatch(publicCopy, /Keyboard Enter|network writes|public GET check|during this review|was retested|were not retested|host challenge shell/);
  }
  assert.match(caseStudies['jobpilot-ai'].limits.join(' '), /completed profile saves.*remain.*unverified/);
  assert.match(caseStudies.lobby.limits.join(' '), /team delivery.*individual ownership/);
  assert.match(caseStudies['gamezone-arena'].leadCaption, /synthetic demonstration/);
  assert.match(caseStudies['gamezone-arena'].mediaNotes.join(' '), /intercepted synthetic.*No booking or payment.*not verified/);
  assert.match(caseStudies['medicare-hub'].limits.join(' '), /authenticated workflow media.*remain unavailable/);
  assert.match(caseStudies['home-services'].limits.join(' '), /placeholder anchors.*backend.*not demonstrated/);
  assert.equal(caseStudies['home-services'].workflow[0].notice, 'Mobile navigation sidebar on the public demonstration page.');
});

test('captions follow the selected image without promoting old media or demonstration figures to evidence', () => {
  const medicare = caseStudies['medicare-hub'];
  assert.equal(caseStudyImageCaption(medicare, '/projects/cinematic/medicare-logo.webp', 'Medicare project identity'), 'Medicare project identity. Authenticated clinical workflows remain unverified.');
  assert.match(caseStudyImageCaption(medicare, '/projects/phase3/medicare-homepage.webp', 'Public homepage'), /public Medicare Hub homepage.*not a screenshot of appointment/);
  assert.doesNotMatch(caseStudyImageCaption(caseStudies['gamezone-arena'], '/projects/gamezone-arena/choose_Room.webp', 'Earlier room selection'), /deployed interface|synthetic/);
  assert.match(caseStudyImageCaption(caseStudies['construction-project-management-accounting-system'], '/projects/responsive/cedar-phone.webp', 'Mobile public landing page'), /demonstration data, not business results/);
  assert.match(caseStudyImageCaption(caseStudies.unihub, '/projects/unihub/transcipt.webp', 'Student academic transcript'), /not a verified credential/);
});

test('AI context shares the reviewed visible summary and limits while preserving team and learning evidence', async () => {
  const { prisma } = await import('../server/src/lib/prisma.js');
  const { getPortfolioContext } = await import('../server/src/lib/portfolio-context.js');
  const originals = [];
  const replace = (model, key, fn) => { originals.push([model, key, model[key]]); model[key] = fn; };
  replace(prisma.profile, 'findFirst', async () => ({ name: 'Test owner', resumeUrl: null, socials: [], experience: [{ company: 'The Digital Hub', startDate: '2026-06', endDate: '2026-09', description: 'Completing an intensive full-stack software engineering and AI program.' }] }));
  replace(prisma.project, 'findMany', async () => structuredClone(caseStudyProjects));
  for (const model of ['technology', 'skill', 'education']) replace(prisma[model], 'findMany', async () => []);
  replace(prisma.certification, 'findMany', async () => [{ title: 'AWS re/Start Bootcamp', year: 'July 2025 - Oct 2025' }]);
  try {
    const context = await getPortfolioContext('lobby');
    for (const original of caseStudyProjects) {
      const actual = context.projects.find(p => p.slug === original.slug);
      const reviewed = caseStudyFor(original);
      assert.equal(actual.description, reviewed.summary);
      assert.deepEqual(actual.features, reviewed.delivered);
      assert.deepEqual(actual.team, original.team);
      assert.deepEqual(actual.contributions, original.contributions);
      assert.equal(actual.ownership, original.ownership);
      assert.deepEqual(actual.caseStudy.authorship.documentedPersonalWork, original.contributions);
      assert.deepEqual(actual.caseStudy.limits, reviewed.limits);
      assert.match(actual.caseStudy.evidenceStatus.projectRuntime, /not rerun/);
    }
    assert.deepEqual(context.currentProject.caseStudy, caseStudyFor(caseStudyProjects.find(p => p.slug === 'lobby')));
    assert.equal(context.certifications[0].learningEvidence.completion.status, 'unverified');
    assert.equal(context.profile.experience[0].learningEvidence.completion.status, 'unverified');
    assert.equal(context.projects.find(p => p.slug === 'medicare-hub').myRole, '');
  } finally {
    for (const [model, key, fn] of originals) model[key] = fn;
    await prisma.$disconnect();
  }
});
