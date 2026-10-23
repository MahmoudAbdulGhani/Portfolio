// Static PDF regression: inspect rendered text boxes, never query a database.
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
process.env.CV_STATIC_ONLY = '1';
const { generateCvPdfBuffer } = await import('../src/lib/cv.js');
const { resolveCvData } = await import('../src/lib/cv-config.js');
const { APPROVED_CV_SUMMARY } = await import('../src/lib/candidate-cv.js');
const { projectsData, skillsData } = await import('../../shared/portfolio-data.ts');
const directory = await mkdtemp(join(tmpdir(),'portfolio-cv-overflow-'));
const snapshots = projectsData.map(project => [project, project.cvBullets]);
const originalSkillCount = skillsData.length;
try {
  const data = await resolveCvData('application');
  const assessment = 'UNSUPPORTED_RECRUITER_ASSESSMENT_MUST_NOT_BE_CV_COPY';
  const cases = [];
  for (const count of [0, 1, 3]) {
    const selected = data.projects.slice(0, count);
    const file = `tailored-${count}.pdf`;
    await writeFile(join(directory,file),await generateCvPdfBuffer({mode:'application',tailor:{summary:assessment,projectSlugs:selected.map(project=>project.slug)}}));
    cases.push({file,projects:selected.map(project=>project.name),summary:APPROVED_CV_SUMMARY,forbidden:assessment,pages:1});
  }
  const first = projectsData.find(project => project.slug === data.projects[0].slug);
  first.cvBullets = ['Synthetic long project fixture phrase. '.repeat(65)];
  const skillPhrase = 'Synthetic long skill fixture covering validation, authentication, persistence, interface workflows, tests and integrations';
  skillsData.push({ name: skillPhrase, category: 'Authentication & Security', status: 'verified' });
  await writeFile(join(directory,'tailored-long.pdf'),await generateCvPdfBuffer({mode:'application',tailor:{summary:assessment,projectSlugs:data.projects.map(project=>project.slug)}}));
  cases.push({file:'tailored-long.pdf',projects:data.projects.map(project=>project.name),summary:APPROVED_CV_SUMMARY,forbidden:assessment,minPages:2,repeatedPhrase:'Synthetic long project fixture phrase.',repeatCount:65,skillPhrase});
  await writeFile(join(directory,'expectations.json'),JSON.stringify(cases));
  const result = spawnSync('python',['scripts/verify-cv-overflow.py',directory],{encoding:'utf8'});
  if(result.status!==0) throw new Error(result.stdout+result.stderr);
  console.log(result.stdout.trim());
} finally {
  for (const [project, bullets] of snapshots) project.cvBullets = bullets;
  skillsData.length = originalSkillCount;
  if(resolve(directory).startsWith(resolve(tmpdir())+'\\portfolio-cv-overflow-') || resolve(directory).startsWith(resolve(tmpdir())+'/portfolio-cv-overflow-')) await rm(directory,{recursive:true,force:true});
}
