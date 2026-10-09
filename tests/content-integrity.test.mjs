import test from 'node:test';
import assert from 'node:assert/strict';
import { datePeriod, dateRange, monthDate, normalizeExperience, sortExperience, uniqueCapabilities, normalizeTraining, recordKind, normalizeProjectCv, projectDisplayName } from '../shared/content-integrity.ts';

test('dates use one format without interpreting durations or invalid dates as timestamps', () => {
  for (const value of ['June 2026 – Sept 2026', '2026-06 - 2026-09']) assert.equal(datePeriod(value), 'Jun 2026 – Sep 2026');
  assert.equal(dateRange('2026-06', null, true), 'Jun 2026 – Present');
  assert.equal(monthDate('09/2025'), 'Sep 2025');
  assert.equal(monthDate('2026-13'), '2026-13');
  assert.equal(datePeriod('4-month program'), '4-month program');
});

test('Digital Hub status is neutral across descriptions and CV bullets; current roles sort first', () => {
  const hub = { company: 'The Digital Hub, UNRWA', startDate: '2026-06', endDate: '2026-09', meta: 'Stale date', description: 'Completing an intensive full-stack software engineering and AI program.', details: 'Completed a full-stack software engineering and AI program.', cvBullets: ['Completed a full-stack software engineering and AI program.', 'Developed apps; Built APIs.'] };
  const normalized = normalizeExperience(hub);
  assert.equal(normalized.meta, 'Jun 2026 – Sep 2026');
  for (const text of [normalized.description, normalized.details, ...normalized.cvBullets]) assert.doesNotMatch(text, /Completed|Completing|; Built/);
  assert.deepEqual(normalizeExperience(normalized), normalized);
  const rows = [{ company: 'Ishtari', endDate: '2026-01' }, hub, { company: 'Oigetit', endDate: '2026-08' }, { company: 'Current', isCurrent: true }, { company: 'Undated' }];
  assert.deepEqual(sortExperience(rows).map(r => r.company), ['Current', hub.company, 'Oigetit', 'Ishtari', 'Undated']);
  assert.equal(rows[0].company, 'Ishtari', 'Sorting must not mutate CMS arrays');
});

test('only actual aliases collapse; distinct frameworks, ORM, hashing and provider skills survive', () => {
  const names = ['pytest', 'Pytest', 'SOLID', 'SOLID Principles', 'JavaScript', 'JavaScript (ES6+)', 'Django', 'Django REST Framework', 'SQL', 'SQLAlchemy', 'Argon2', 'Argon2 Password Hashing', 'AI API Integration', 'AI API Integration — OpenAI'];
  assert.deepEqual(uniqueCapabilities(names.map(name => ({ name }))).map(s => s.name), names.filter(name => !['Pytest', 'SOLID Principles', 'JavaScript (ES6+)'].includes(name)));
});

test('AWS dates retain the authoritative range without claiming completion or a credential', () => {
  const aws = normalizeTraining({ title: 'AWS re/Start Bootcamp', year: 'July 2025 - Oct 2025', expectedDate: '2026', description: 'Cloud computing and DevOps fundamentals training; completion expected in 2026.' });
  assert.equal(aws.year, 'Jul 2025 – Oct 2025');
  assert.equal(aws.expectedDate, null);
  assert.equal(aws.description, 'Cloud computing and DevOps fundamentals training.');
  assert.equal(recordKind(aws), 'Training');
  assert.deepEqual(normalizeTraining(aws), aws);
  assert.equal(recordKind({ title: 'Vendor exam', credentialId: 'documented-credential' }), 'Certification');
});

test('display titles preserve identifiers and team CV claims use documented contributions', () => {
  assert.equal(projectDisplayName({ slug: 'construction-project-management-accounting-system', name: 'Full system name' }), 'Cedar Construction');
  assert.equal(projectDisplayName({ slug: 'full-stack-user-management-system', name: 'Full system name' }), 'User Management');
  assert.equal(projectDisplayName({ slug: 'future-cms-project', name: 'Future name' }), 'Future name');
  const lobby = normalizeProjectCv({ slug: 'lobby', cvBullets: ['Built a real-time communication platform supporting persistent communities, servers, channels, guest rooms, and live voice communication. (Tech: Angular)'] });
  assert.match(lobby.cvBullets[0], /^Co-developed/);
  assert.match(lobby.cvBullets[0], /Contributed to authenticated and guest access/);
  assert.equal(normalizeProjectCv({ slug: 'lobby', cvBullets: ['Reviewed future description.'] }).cvBullets[0], 'Reviewed future description.');
  assert.equal(normalizeProjectCv({ slug: 'lobby', cvBullets: ['Built a newly documented feature.'] }).cvBullets[0], 'Built a newly documented feature.');
});

test('AI context consumes the same corrected record, evidence names and training classification', async () => {
  // Replace every data read used here; no database or provider request occurs.
  const { prisma } = await import('../server/src/lib/prisma.js');
  const { getPortfolioContext } = await import('../server/src/lib/portfolio-context.js');
  const originals = [];
  const replace = (model, key, fn) => { originals.push([model, key, model[key]]); model[key] = fn; };
  replace(prisma.profile, 'findFirst', async () => ({ name: 'Test owner', resumeUrl: null, experience: [{ company: 'The Digital Hub', description: 'Completing an intensive full-stack software engineering and AI program.', startDate: '2026-06', endDate: '2026-09' }, { company: 'Ishtari', endDate: '2026-01' }, { company: 'Oigetit', endDate: '2026-08' }] }));
  replace(prisma.project, 'findMany', async () => [{ slug: 'construction-project-management-accounting-system', name: 'Construction Project Management & Accounting System', contributions: ['Documented work'] }]);
  replace(prisma.technology, 'findMany', async () => []);
  replace(prisma.skill, 'findMany', async () => [{ name: 'pytest' }, { name: 'Pytest' }]);
  replace(prisma.education, 'findMany', async () => [{ period: 'Oct 2022 – June 2025' }]);
  replace(prisma.certification, 'findMany', async () => [{ title: 'AWS re/Start Bootcamp', year: 'July 2025 - Oct 2025', description: 'Training; completion expected in 2026.' }]);
  try {
    const context = await getPortfolioContext('construction-project-management-accounting-system');
    assert.equal(context.currentProject.name, 'Cedar Construction');
    assert.equal(context.currentProject.portfolioUrl, '/projects/construction-project-management-accounting-system');
    assert.equal(context.currentProject.functionalName, 'Construction Project Management & Accounting System');
    assert.equal(context.profile.experience[1].company, 'Oigetit');
    assert.doesNotMatch(context.profile.experience[0].description, /Completing/);
    assert.equal(context.skills.length, 1);
    assert.equal(context.certifications[0].recordKind, 'Training');
    assert.doesNotMatch(context.certifications[0].description, /expected/);
    assert.equal(context.profile.resumeUrl, '/api/cv.pdf');
  } finally {
    for (const [model, key, fn] of originals) model[key] = fn;
    await prisma.$disconnect();
  }
});
