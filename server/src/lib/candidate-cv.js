import { capabilityParts } from '../../../shared/content-integrity-runtime.js';

// Approved factual profile copy. A provider evaluation is never a CV summary.
export const APPROVED_CV_SUMMARY = 'Full-stack software engineer building type-safe web applications, REST APIs, authentication systems, and relational/NoSQL data solutions using React, Next.js, TypeScript, Node.js, Express.js, and Python frameworks. Focused on maintainable architecture, secure integrations, testing, CI/CD, and practical AI application features.';
const lead = 'Full-stack software engineer building web applications.';
const parts = name => capabilityParts(name || '');
function sourceSkills(source) {
  const skills = new Map();
  for (const row of [...(source.technologies || []), ...(source.skills || [])]) {
    if (!row || typeof row.name !== 'string' || !row.name.trim()) continue;
    if (row.status && row.status !== 'verified') continue;
    for (const part of parts(row.name)) skills.set(part.key, part.name);
  }
  return skills;
}
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function mentioned(name, description) {
  return new RegExp(`(^|[^a-z0-9])${escapePattern(name)}(?=$|[^a-z0-9])`, 'i').test(description);
}

// The model cannot supply prose here: it selects no claims and no employment
// labels. Role relevance is a bounded plan of known skill keys, rebuilt below.
export function candidateCvForJob(source, jobDescription) {
  const skills = sourceSkills(source);
  const skillKeys = [...skills].filter(([key, name]) => mentioned(name, jobDescription) || mentioned(key, jobDescription))
    .sort((a, b) => jobDescription.toLowerCase().indexOf(a[1].toLowerCase()) - jobDescription.toLowerCase().indexOf(b[1].toLowerCase()))
    .slice(0, 8).map(([key]) => key);
  const plan = { version: 1, skillKeys, teamWork: /\bteam\b|collaborat/i.test(jobDescription) };
  return { ...resolveCandidateCv(plan, source), plan };
}

export function resolveCandidateCv(plan, source) {
  const skills = sourceSkills(source);
  const valid = plan?.version === 1 && Array.isArray(plan.skillKeys) && plan.skillKeys.length > 0 && plan.skillKeys.length <= 8
    && typeof plan.teamWork === 'boolean' && new Set(plan.skillKeys).size === plan.skillKeys.length
    && plan.skillKeys.every(key => typeof key === 'string' && skills.has(key));
  if (!valid) return { text: APPROVED_CV_SUMMARY, source: 'approved-profile', skillKeys: [], teamWork: false };
  const names = plan.skillKeys.map(key => skills.get(key));
  const text = `${lead} My portfolio includes work with ${names.join(', ')}.`;
  if (text.length > 600) return { text: APPROVED_CV_SUMMARY, source: 'approved-profile', skillKeys: [], teamWork: false };
  return { text, source: 'record-grounded', skillKeys: [...plan.skillKeys], teamWork: plan.teamWork };
}

export function selectCandidateProjects(projects, candidate, proposedSlugs = []) {
  const allowed = projects.filter(project => project.published !== false && project.showOnCv !== false);
  const proposals = new Set(proposedSlugs);
  const rows = allowed.map((project, index) => {
    const stack = new Set((project.stack || []).flatMap(parts).map(part => part.key));
    const matches = candidate.skillKeys.filter(key => stack.has(key)).length;
    const documentedTeam = (project.teamSize > 1 || project.team?.length > 1 || /team|co-developed/i.test(project.ownership || ''))
      && Boolean(project.myRole?.trim() || project.contributions?.some(value => value.trim()));
    return { project, index, matches, score: matches * 10 + (matches && candidate.teamWork && documentedTeam ? 2 : 0) + (proposals.has(project.slug) ? 1 : 0) };
  }).filter(row => candidate.skillKeys.length ? row.matches > 0 : proposals.has(row.project.slug));
  return rows.sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 3).map(row => row.project);
}
