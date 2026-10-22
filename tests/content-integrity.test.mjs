import test from 'node:test';
import assert from 'node:assert/strict';
import { datePeriod, dateRange, monthDate, normalizeExperience, sortExperience, uniqueCapabilities, normalizeTraining, recordKind, normalizeProjectCv, projectDisplayName, learningEvidence, normalizeEducation, capabilityGroups } from '../shared/content-integrity.ts';

test('dates use one format without interpreting durations or invalid dates as timestamps', () => {
  for (const value of ['June 2026 – Sept 2026', '2026-06 - 2026-09']) assert.equal(datePeriod(value), 'Jun 2026 – Sep 2026');
  assert.equal(dateRange('2026-06', null, true), 'Jun 2026 – Present');
  assert.equal(monthDate('09/2025'), 'Sep 2025');
  assert.equal(monthDate('2026-13'), '2026-13');
  assert.equal(datePeriod('4-month program'), '4-month program');
});

test('owner-confirmed Digital Hub completion survives stale CMS prose and CV bullets; current roles sort first', () => {
  const hub = { company: 'The Digital Hub, UNRWA', startDate: '2026-06', endDate: '2026-09', meta: 'Stale date', description: 'Completing an intensive full-stack software engineering and AI program.', details: 'Completed a full-stack software engineering and AI program.', cvBullets: ['Completed a full-stack software engineering and AI program.', 'Developed apps; Built APIs.'] };
  const normalized = normalizeExperience(hub);
  assert.equal(normalized.meta, 'Jun 2026 – Sep 2026');
  for (const text of [normalized.description, normalized.details, normalized.cvBullets[0]]) assert.match(text, /^Completed a full-stack/);
  for (const text of normalized.cvBullets) assert.doesNotMatch(text, /Completing|; Built/);
  assert.equal(normalized.learningEvidence.completion.status, 'owner-confirmed');
  assert.equal(normalized.learningEvidence.certification.status, 'unverified');
  assert.match(normalizeExperience({ ...hub, description: 'Participated in a full-stack software engineering and AI program.' }).description, /^Completed/);
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
    assert.equal(context.profile.experience[0].learningEvidence.completion.status, 'owner-confirmed');
    assert.equal(context.education[0].learningEvidence.completion.status, 'unverified');
    assert.equal(context.certifications[0].learningEvidence.completion.status, 'unverified');
    assert.equal(context.certifications[0].learningEvidence.certification.status, 'unverified');
    assert.equal(context.certifications[0].learningEvidence.dates, 'Jul 2025 – Oct 2025');
  } finally {
    for (const [model, key, fn] of originals) model[key] = fn;
    await prisma.$disconnect();
  }
});

test('only the confirmed LIU Computer Science degree gains graduation copy; other study remains factual', () => {
  const degree = { degree: 'Bachelor of Science in Computer Science', school: 'Lebanese International University (LIU)', startDate: '2022-10', endDate: '2025-06', details: null };
  const normalized = normalizeEducation(degree);
  assert.equal(normalized.details, 'Graduated with a BSc in Computer Science.');
  assert.equal(normalized.period, 'Oct 2022 – Jun 2025');
  assert.equal(normalized.learningEvidence.completion.status, 'owner-confirmed');
  assert.equal(normalized.learningEvidence.certification.status, 'unverified');
  assert.deepEqual(normalizeEducation(normalized), normalized);
  for (const other of [{ ...degree, school: 'Another university' }, { ...degree, degree: 'Master of Science in Computer Science' }, { ...degree, degree: 'Bachelor of Business' }]) {
    const result = normalizeEducation(other);
    assert.equal(result.learningEvidence.completion.status, 'unverified');
    assert.equal(result.details, null);
  }
  assert.equal(degree.details, null, 'Presentation never mutates the CMS record');
});

test('self-directed Angular and unknown training never gain certification or completion claims', () => {
  for (const title of ['Angular Independent Study', 'Angular Self-Learning Course']) {
    const result = normalizeTraining({ title, issuer: 'Self-Learning Program', year: '09/2025' });
    assert.equal(result.title, 'Angular Independent Study');
    assert.equal(result.issuer, 'Self-directed learning');
    assert.equal(result.description, 'Self-directed study of Angular.');
    assert.equal(result.year, 'Sep 2025');
    assert.equal(recordKind(result), 'Training');
    assert.equal(result.learningEvidence.certification.status, 'unverified');
    assert.deepEqual(normalizeTraining(result), result);
  }
  const raw = { title: 'Another training course', issuer: 'Recorded provider', year: '2024', description: 'Completed the course. API design topics. Completion and certification are not verified by the available records.', cvDescription: 'Certified developer. API design topics.' };
  const result = normalizeTraining(raw);
  assert.equal(result.description, 'API design topics.');
  assert.equal(result.cvDescription, 'API design topics.');
  assert.equal(result.learningEvidence.completion.status, 'unverified');
  assert.deepEqual(result.learningEvidence.completion.recordedClaims, ['Completed the course. API design topics. Completion and certification are not verified by the available records.']);
  assert.deepEqual(normalizeTraining(result), result);
  assert.match(raw.description, /^Completed/, 'Original evidence remains unchanged');
});

test('both CV modes normalize stale catalog copy without losing explicit date overrides or writing data', async () => {
  const { prisma } = await import('../server/src/lib/prisma.js');
  const { initialModes, resolveCvData } = await import('../server/src/lib/cv-config.js');
  const catalog = {
    profile: { experience: [{ id: 'hub', company: 'The Digital Hub, UNRWA', description: 'Completing an intensive full-stack software engineering and AI program.', cvBullets: ['Participated in a full-stack software engineering and AI program.'], startDate: '2026-06', endDate: '2026-09' }], socials: [], languages: '' },
    projects: [], skills: [], languages: [],
    education: [{ id: 'degree', school: 'Lebanese International University', degree: 'Bachelor of Science in Computer Science', startDate: '2022-10', endDate: '2025-06' }],
    certifications: [{ id: 'aws', title: 'AWS re/Start Bootcamp', issuer: 'AWS', year: 'July 2025 - Oct 2025', cvDescription: 'Cloud training; completion expected in 2026.' }],
  };
  const configuration = { ...initialModes(catalog) };
  configuration.master.educationOverrides.degree = { displayDate: 'Oct 2022 – June 2025' };
  const originals = [];
  const replace = (model, key, fn) => { originals.push([model, key, model[key]]); model[key] = fn; };
  replace(prisma.profile, 'findFirst', async () => structuredClone(catalog.profile));
  for (const [model, key] of [['project', 'projects'], ['skill', 'skills'], ['education', 'education'], ['certification', 'certifications']]) replace(prisma[model], 'findMany', async () => structuredClone(catalog[key]));
  replace(prisma.cvConfiguration, 'findUnique', async () => configuration);
  replace(prisma.cvConfiguration, 'create', async () => assert.fail('No CV configuration write is authorized'));
  try {
    for (const mode of ['application', 'master']) {
      const data = await resolveCvData(mode);
      assert.match(data.profile.experience[0].details, /^Completed a full-stack/);
      assert.match(data.profile.experience[0].cvBullets[0], /^Completed a full-stack/);
      assert.equal(data.profile.experience[0].meta, 'Jun 2026 – Sep 2026');
      assert.equal(data.education[0].details, 'Graduated with a BSc in Computer Science.');
      assert.equal(data.education[0].period, mode === 'master' ? 'Oct 2022 – June 2025' : 'Oct 2022 – Jun 2025');
      assert.equal(data.certifications[0].cvDescription, 'Cloud training.');
      assert.equal(data.certifications[0].learningEvidence.completion.status, 'unverified');
    }
    assert.match(catalog.profile.experience[0].description, /^Completing/, 'Database catalog remains untouched');
  } finally {
    for (const [model, key, fn] of originals) model[key] = fn;
    await prisma.$disconnect();
  }
});

test('past dates, degree names and listed credential metadata do not establish graduation or certification', () => {
  const education = normalizeEducation({ degree: 'BSc Computer Science', startDate: '2022-10', endDate: '2025-06', details: 'Graduated in 2025.' });
  assert.equal(education.learningEvidence.completion.status, 'unverified');
  assert.deepEqual(education.learningEvidence.completion.recordedClaims, ['Graduated in 2025.']);
  assert.match(education.learningEvidence.completion.basis, /Past dates do not establish completion or graduation/);
  const training = normalizeTraining({ title: 'Another training course', year: '2024', credentialId: 'self-reported-id', url: 'https://example.com/course', description: 'Completed the course.' });
  assert.equal(training.learningEvidence.completion.status, 'unverified');
  assert.deepEqual(training.learningEvidence.completion.recordedClaims, ['Completed the course.']);
  assert.equal(training.learningEvidence.certification.status, 'unverified');
  assert.equal(training.learningEvidence.certification.recordedCredential.id, 'self-reported-id');
  assert.equal(learningEvidence({ year: '2030' }).completion.status, 'unverified');
  assert.equal(learningEvidence({ company: 'The Digital Hub', role: 'Another training course' }).completion.status, 'unverified');
  assert.equal(normalizeExperience({ company: 'Employer', role: 'Backend Developer', endDate: '2024-12' }).learningEvidence, undefined);
  assert.equal(normalizeExperience({ company: 'Another academy', description: 'Participated in a training program.', endDate: '2024-12' }).learningEvidence.completion.status, 'unverified');
});

test('Capabilities assigns aliases and composite atoms one location, retaining specific details and personal evidence', () => {
  const technologies = [
    { name: 'HTML & CSS', category: 'languages' }, { name: 'MySQL / MariaDB', category: 'databases' },
    { name: 'Git & GitHub', category: 'ops' }, { name: 'Argon2', category: 'ops' },
  ];
  const skills = ['HTML5', 'CSS3', 'MySQL', 'MariaDB', 'Git', 'GitHub', 'Argon2 Password Hashing', 'Argon2', 'AI API Integration', 'AI API Integration — OpenAI', 'Django', 'Django REST Framework', 'SQL', 'SQLAlchemy'].map(name => ({ name }));
  const projects = [
    { slug: 'unattributed', name: 'Unattributed', published: true, stack: ['Git', 'OpenAI API'] },
    { slug: 'hidden', name: 'Hidden', published: true, showOnPortfolio: false, myRole: 'Developer', stack: ['Git'] },
    { slug: 'documented', name: 'Team delivery', published: true, myRole: 'Documented personal role', stack: ['Git', 'GitHub', 'MySQL', 'MariaDB', 'HTML5', 'CSS3', 'Argon2', 'OpenAI API'] },
  ];
  const groups = capabilityGroups(technologies, skills, projects);
  assert.equal(new Set(groups.map(row => row.key)).size, groups.length);
  for (const [key, category] of [['html', 'languages'], ['css', 'languages'], ['mysql', 'databases'], ['mariadb', 'databases'], ['git', 'ops'], ['github', 'ops'], ['argon2', 'ops']]) {
    const matches = groups.filter(row => row.key === key);
    assert.equal(matches.length, 1, key);
    assert.equal(matches[0].category, category);
    assert.deepEqual(matches[0].evidence, [{ slug: 'documented', name: 'Team delivery' }]);
  }
  assert.deepEqual(groups.find(row => row.key === 'html').details, ['HTML5']);
  assert.deepEqual(groups.find(row => row.key === 'css').details, ['CSS3']);
  assert.deepEqual(groups.find(row => row.key === 'argon2').details, ['Password hashing']);
  assert.deepEqual(groups.find(row => row.key === 'ai api integration').details, ['OpenAI']);
  assert.deepEqual(groups.find(row => row.key === 'ai api integration').evidence, [{ slug: 'documented', name: 'Team delivery' }]);
  for (const name of ['Django', 'Django REST Framework', 'SQL', 'SQLAlchemy']) assert.equal(groups.filter(row => row.name === name).length, 1);
  assert.deepEqual(technologies[0], { name: 'HTML & CSS', category: 'languages' }, 'Grouping does not mutate CMS data');
});
