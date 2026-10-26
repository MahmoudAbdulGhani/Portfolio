import test from 'node:test';
import assert from 'node:assert/strict';
import { caseStudyFor, caseStudies, selectedContributions } from '../shared/case-study-runtime.js';
import { normalizeSiteSection, normalizeTraining, normalizeEducation, normalizeExperience } from '../shared/content-integrity-runtime.js';
import { caseStudyProjects } from './fixtures/case-study-projects.ts';
import { PUBLIC_COPY_INSTRUCTION, PROJECT_EVIDENCE_INSTRUCTION, LEARNING_EVIDENCE_INSTRUCTION, EMPLOYMENT_EVIDENCE_INSTRUCTION } from '../server/src/lib/evidence-instructions.js';
import { candidateCvForJob } from '../server/src/lib/candidate-cv.js';
import { publicMatchCopy, qualificationAnswer, designCreditAnswer } from '../server/src/lib/public-professional-copy.js';
import { formalJobRequirements, scopeMatchStatements, REQUIREMENT_SCOPE_INSTRUCTION } from '../server/src/lib/job-requirements.js';

const internalCopy = /owner-confirmed|undocumented|unverified|not independently verified|available records|source inspected|source reviewed|inspected (?:source|implementation|posting)|supporting team evidence|production.*audit/i;
test('all eight public case studies project professional copy while retaining internal review constraints', () => {
  for (const project of caseStudyProjects) {
    const before = JSON.stringify(project), study = caseStudyFor(project);
    assert.ok(study);
    const visible = [study.summary, study.problem, study.leadCaption, study.mediaQualification, ...(study.mediaNotes || []),
      ...study.workflow.map(step => step.notice), ...study.decisions.flatMap(row => [row.constraint, row.choice, row.consequence]), ...study.delivered, ...study.limits, study.flow?.description].join(' ');
    assert.doesNotMatch(visible, internalCopy, project.slug);
    assert.match(study.evidenceStatus.projectRuntime, /not rerun/);
    assert.ok(study.evidenceStatus.projectRuntime.includes(caseStudies[project.slug].limits[0]));
    assert.deepEqual(study.authorship.documentedPersonalWork, project.contributions);
    assert.deepEqual(selectedContributions(project, study), selectedContributions(project, caseStudies[project.slug]));
    assert.equal(JSON.stringify(project), before);
  }
  const home = caseStudyFor(caseStudyProjects.find(p => p.slug === 'home-services'));
  assert.match(home.limits.join(' '), /frontend demonstration.*no operational booking or payment backend/i);
  assert.match(home.limits.join(' '), /supplied.*Figma UI kit/);
  assert.equal(home.designCredit.creator, null);
  const project = caseStudyProjects.find(p => p.slug === 'home-services');
  const answer = designCreditAnswer('What does Home Services do and who supplied its design?', { currentProject: { ...project, portfolioUrl: '/projects/home-services', caseStudy: home } });
  assert.match(answer, /supplied \[Figma UI kit\]/);
  assert.match(answer, /original creator is not listed/);
  assert.doesNotMatch(answer, /available records|designed by Mahmoud|undocumented/);
  assert.equal(designCreditAnswer('Who designed it?', {}), null);
  const lobby = caseStudyFor(caseStudyProjects.find(p => p.slug === 'lobby'));
  assert.match(lobby.summary, /team-built.*contributed/i);
  assert.doesNotMatch(lobby.summary, /personally (?:built|authored)/i);
});

test('legacy CMS section copy stays corrected on reload without overwriting future editorial text', () => {
  const raw = { key: 'jobMatch', description: 'Compare a job description with the saved portfolio skills, projects, experience, education, and certifications.', content: { seoDescription: "Compare a job description with the portfolio owner's verified skills, projects, experience, education, and certifications.", seoTitle: 'Job Match', custom: ['keep'] } };
  const result = normalizeSiteSection(raw);
  assert.match(result.description, /skills, projects and experience/);
  assert.doesNotMatch(JSON.stringify(result), /verified skills|saved portfolio/);
  assert.deepEqual(normalizeSiteSection(result), result);
  assert.equal(raw.content.seoDescription.includes('verified'), true);
  assert.deepEqual(result.content.custom, ['keep']);
  const future = { ...raw, description: 'New editorial copy.' };
  assert.equal(normalizeSiteSection(future).description, future.description);
  assert.equal(normalizeSiteSection({ key: 'other', description: 'Verified request signature.' }).description, 'Verified request signature.');
});

test('confirmed learning stays factual and other courses do not gain completion or credentials', () => {
  assert.match(normalizeEducation({ school: 'Lebanese International University', degree: 'BSc in Computer Science', details: 'Owner-confirmed.' }).details, /^Graduated/);
  assert.match(normalizeExperience({ company: 'The Digital Hub, UNRWA', description: 'Completed a full-stack software engineering and AI program.' }).description, /^Completed/);
  const aws = normalizeTraining({ title: 'AWS re/Start Bootcamp', description: 'Cloud training. Completion/certification remains unverified.', year: 'July 2025 - Oct 2025' });
  assert.equal(aws.description, 'Cloud training.');
  assert.equal(aws.learningEvidence.certification.status, 'unverified');
  const unknown = normalizeTraining({ title: 'Other course', description: 'Completed the course. REST API topics.' });
  assert.equal(unknown.description, 'REST API topics.');
  const angular = normalizeTraining({ title: 'Angular Independent Study' });
  assert.equal(angular.issuer, 'Self-directed learning');
  assert.doesNotMatch(angular.description, /certified|completed/i);
});

test('both AI tools keep factual constraints while separating ordinary copy from direct qualification questions', () => {
  assert.match(PUBLIC_COPY_INSTRUCTION, /not routine public copy/);
  assert.match(PUBLIC_COPY_INSTRUCTION, /Requirements to discuss only/);
  assert.match(PUBLIC_COPY_INSTRUCTION, /Do not repeat it in summaries/);
  assert.match(PUBLIC_COPY_INSTRUCTION, /directly asks about a qualification/);
  assert.match(PUBLIC_COPY_INSTRUCTION, /never earned/i);
  assert.match(PROJECT_EVIDENCE_INSTRUCTION, /always retain supplied-design credit/);
  assert.match(PROJECT_EVIDENCE_INSTRUCTION, /explain the missing attribution briefly only if specifically asked/);
  assert.match(LEARNING_EVIDENCE_INSTRUCTION, /explicitly say it is not verified/);
  assert.match(EMPLOYMENT_EVIDENCE_INSTRUCTION, /Month-only dates.*do not establish exact elapsed days/);
  const cv = candidateCvForJob({ technologies: [{ name: 'React' }], skills: [] }, 'React role; AWS certification required.');
  assert.equal(cv.text, 'Full-stack software engineer building web applications. My portfolio includes work with React.');
  assert.doesNotMatch(cv.text, /certif|unverified|evidence/i);
});

test('direct qualification answers never turn training into completion, certification or a negative credential claim', () => {
  const context = { profile: { experience: [normalizeExperience({ role: 'Full-Stack Developer Intern', company: 'The Digital Hub, UNRWA', description: 'Completed a full-stack software engineering and AI program.' })] },
    education: [normalizeEducation({ degree: 'BSc in Computer Science', school: 'Lebanese International University' })],
    certifications: [normalizeTraining({ title: 'AWS re/Start Bootcamp', issuer: 'Amazon Web Services', year: 'Jul 2025 – Oct 2025' }), normalizeTraining({ title: 'Angular Independent Study' }), normalizeTraining({ title: 'Full-Stack Web Development', issuer: 'youbee.ai' })] };
  assert.equal(qualificationAnswer('Summarize his background.', context), null);
  const aws = qualificationAnswer('Does Mahmoud have AWS certification?', context);
  assert.match(aws, /AWS re\/Start training \(Jul 2025 – Oct 2025\)/);
  assert.match(aws, /An earned AWS vendor certification is not listed/);
  assert.doesNotMatch(aws, /(?:completed|never earned|does not have|unverified)/i);
  assert.match(qualificationAnswer('Is his AWS certification independently verified?', context), /Independent verification.*not provided here/);
  assert.match(qualificationAnswer('Did he complete AWS training?', context), /confirmed completion status is not provided/);
  assert.match(qualificationAnswer('Did he complete youbee training?', context), /confirmed completion status is not provided/);
  assert.match(qualificationAnswer('Is Angular study a certification?', context), /self-directed learning, not a certification program/);
  assert.match(qualificationAnswer('Did he graduate from Lebanese International University?', context), /^Graduated with a BSc/);
  assert.match(qualificationAnswer('Did he complete The Digital Hub program?', context), /^Completed the full-stack development program/);
});

test('public match summaries use source role labels and put the AWS comparison only under requirements', () => {
  const context = { technologies: [{ name: 'React' }], skills: [], certifications: [{ title: 'AWS re/Start Bootcamp' }] };
  const candidate = candidateCvForJob(context, 'React role; AWS certification required.');
  const result = { relevantExperience: ['Backend Developer · Ishtari · Dec 2025 – Jan 2026'], partialMatches: ['API integration', 'AWS certification not verified'], gaps: ['Kubernetes', 'AWS certification absent'] };
  const copy = publicMatchCopy(context, 'React role; AWS certification required.', candidate, result);
  assert.doesNotMatch(copy.overallMatch + copy.recruiterSummary, /certif|intern|2 months|contract|all requirements|accessible|production-proven/i);
  assert.match(copy.recruiterSummary, /Backend Developer · Ishtari · Dec 2025 – Jan 2026/);
  assert.deepEqual(copy.partialMatches, ['API integration']);
  assert.deepEqual(copy.gaps, ['Kubernetes', 'The role requests AWS certification; the portfolio lists AWS re/Start training.']);
  assert.deepEqual(result.gaps, ['Kubernetes', 'AWS certification absent']);
});

test('AWS comparison does not invent a requirement from a waived or different vendor qualification', () => {
  const context = { certifications: [{ title: 'AWS re/Start Bootcamp' }] };
  const candidate = { skillKeys: [], text: '' }, result = { relevantExperience: [], partialMatches: [], gaps: ['Kubernetes'] };
  for (const job of ['AWS certification is not required.', 'No AWS certification is required.', 'AWS deployment skills. Azure certification is required.', 'Experience with AWS; certification is optional.']) {
    assert.deepEqual(publicMatchCopy(context, job, candidate, result).gaps, ['Kubernetes'], job);
  }
  assert.equal(publicMatchCopy(context, 'An independently verified AWS certification is preferred, not mandatory.', candidate, result).gaps.length, 2);
});

test('practical accessibility and security do not authorize extra credentials, audits or standards', () => {
  const job = 'Build accessible React interfaces, authentication and secure Python APIs. Explain security testing experience.';
  assert.deepEqual(formalJobRequirements(job), []);
  assert.deepEqual(formalJobRequirements('Qualifications: React, accessible interfaces and AWS deployment skills.'), []);
  assert.equal(formalJobRequirements('Computer Science degree and AWS experience.').some(row => row.kind === 'credential'), false);
  const statements = ['Dedicated web accessibility certifications or formal audits are not listed.',
    'An IAAP accessibility credential would establish fit.', 'Independent security audits and security certification are absent.',
    'WCAG 2.2 AA compliance is not established.', 'React and Express.js work.', 'Discuss API authorization.'];
  assert.deepEqual(scopeMatchStatements(job, statements), ['React and Express.js work.', 'Discuss API authorization.']);
  assert.deepEqual(scopeMatchStatements(job, statements, { discussPractical: true }), [
    'Discuss the approach to implementing and testing accessible interfaces.', 'Discuss the approach to application security and testing.',
    'React and Express.js work.', 'Discuss API authorization.',
  ]);
  assert.deepEqual(scopeMatchStatements('Implement audit logging for authentication.', ['Audit logs record authentication changes.']), ['Audit logs record authentication changes.']);
  assert.match(REQUIREMENT_SCOPE_INSTRUCTION, /Practical implementation skills, earned credentials, formal audits and compliance standards are distinct/);
});

test('explicit accessibility qualifications, audits and standards retain their separate scopes', () => {
  const credential = 'An accessibility certification is required.';
  assert.deepEqual(formalJobRequirements(credential), [{ kind: 'credential', subject: 'accessibility' }]);
  assert.deepEqual(scopeMatchStatements(credential, ['Discuss the requested accessibility certification.']), ['Discuss the requested accessibility certification.']);
  assert.deepEqual(scopeMatchStatements(credential, ['Accessibility certification or formal audits are not listed.'], { discussPractical: true }), ['Discuss the accessibility qualification requested by the role.']);
  const audit = 'Conduct a formal accessibility audit against WCAG 2.2 AA.';
  const note = 'Discuss the accessibility audit approach and WCAG 2.2 AA testing.';
  assert.deepEqual(formalJobRequirements(audit), [{ kind: 'audit', subject: 'accessibility' }, { kind: 'standard', subject: 'accessibility', standard: 'wcag2.2aa' }]);
  assert.deepEqual(scopeMatchStatements(audit, [note]), [note]);
  assert.deepEqual(scopeMatchStatements(audit, ['Accessibility certification is not listed.']), []);
  assert.deepEqual(scopeMatchStatements('Implement WCAG 2.1 AA.', ['WCAG 2.2 AA experience is needed.']), []);
  assert.deepEqual(scopeMatchStatements('Implement WCAG 2.2 Level AA and Section 508.', ['Discuss WCAG 2.2 AA and Section 508 implementation.']), ['Discuss WCAG 2.2 AA and Section 508 implementation.']);
});

test('production reproduction keeps the AWS preference and practical React discussion without invented qualifications', () => {
  const job = 'Junior Full-Stack Developer. Build accessible React and TypeScript interfaces and Python REST APIs using FastAPI or Django. Work with PostgreSQL, authentication, automated tests and Git. Explain your individual contribution to team projects. Commercial production experience and an independently verified AWS certification are preferred, not mandatory.';
  const context = { certifications: [{ title: 'AWS re/Start Bootcamp' }] }, candidate = { skillKeys: ['react'], text: 'Full-stack software engineer building web applications. My portfolio includes work with React.' };
  const result = { relevantExperience: [], partialMatches: ['React project work.', 'Dedicated web accessibility certifications or formal audits are not listed.'], gaps: ['Commercial production experience should be discussed.', 'AWS certification is not listed.'] };
  const before = structuredClone(result), copy = publicMatchCopy(context, job, candidate, result);
  assert.deepEqual(formalJobRequirements(job), [{ kind: 'credential', subject: 'aws' }]);
  assert.deepEqual(copy.partialMatches, ['React project work.', 'Discuss the approach to implementing and testing accessible interfaces.']);
  assert.deepEqual(copy.gaps, ['Commercial production experience should be discussed.', 'The role requests AWS certification; the portfolio lists AWS re/Start training.']);
  assert.doesNotMatch(copy.overallMatch + copy.recruiterSummary, /certification|audited|accessible|employment contract|months/);
  assert.deepEqual(result, before);
  const waived = publicMatchCopy(context, 'React developer. AWS certification is explicitly not required.', candidate,
    { relevantExperience: [], partialMatches: ['AWS certification is not listed.'], gaps: ['AWS credential is not listed.'] });
  assert.deepEqual(waived.partialMatches, []);
  assert.deepEqual(waived.gaps, []);
  const mixed = publicMatchCopy(context, job, candidate, { relevantExperience: [], partialMatches: ['AWS certification and accessibility audits are not listed.'], gaps: [] });
  assert.deepEqual(mixed.partialMatches, ['Discuss the approach to implementing and testing accessible interfaces.']);
  assert.equal(mixed.gaps.length, 1);
});
