import type { Project } from '../../types';
import type { CapabilityGroup } from '../../../shared/content-integrity-runtime.js';
import { caseStudyFor } from '../../../shared/case-study-runtime.js';
import { projectDisplayName } from '../../../shared/content-integrity-runtime.js';

// Profile presentation only. Do not change competency normalization, CV or AI data.
const boundaries = {
  'ai api integration': { slug: 'jobpilot-ai', number: '01', label: 'Reviewed AI changes', supports: (text: string) => /review/i.test(text) && /AI|profile/i.test(text) },
  django: { slug: 'construction-project-management-accounting-system', number: '03', label: 'Financial calculation and interpretation', supports: (text: string) => /financial|accounting/i.test(text) && /AI|Groq/i.test(text) },
  supabase: { slug: 'lobby', number: '02', label: 'Guest membership and call access', supports: (text: string) => /guest|invitation/i.test(text) && /Supabase/i.test(text) },
} as const;
const numbers: Record<string,string> = { 'jobpilot-ai': '01', lobby: '02', 'construction-project-management-accounting-system': '03' };
// Copy reused from the accepted demonstrations, with their source limits in the readers.
const explanations: Record<string,string> = {
  'jobpilot-ai': 'Suggestions become saved information only after review.',
  'construction-project-management-accounting-system': 'The explanation reads the calculated figures. It cannot change them.',
  lobby: 'An invitation offers a connection. Joining the room and entering its call are separate checks.',
};
export function profileCapabilityEvidence(group: Pick<CapabilityGroup,'key'|'evidence'>, projects: Project[]) {
  const boundary = boundaries[group.key as keyof typeof boundaries];
  const supported = boundary && projects.find(project => project.slug === boundary.slug && project.published && project.showOnPortfolio !== false
    && caseStudyFor(project) && boundary.supports((project.contributions ?? []).join(' ')));
  const references = supported ? [{ slug: supported.slug, name: projectDisplayName(supported) }] : group.evidence;
  return references.map(reference => {
    const project = projects.find(project => project.slug === reference.slug);
    const engineering = Boolean(project && caseStudyFor(project));
    const team = Boolean(project && ((project.team?.length ?? 0) > 1 || (project.teamSize ?? 0) > 1 || /team|collaborat/i.test(`${project.myRole ?? ''} ${project.ownership ?? ''}`)));
    return { ...reference, href: `/projects/${reference.slug}${engineering ? '#engineering' : ''}`,
      scope: team ? 'Team-project evidence' : 'Project evidence',
      number: engineering ? numbers[reference.slug] : undefined,
      boundary: supported && reference.slug === supported.slug ? boundary.label : undefined,
    };
  });
}

type ProfileEvidenceRow = ReturnType<typeof profileCapabilityEvidence>[number] & { competencies: string[]; explanation?: string };
export function groupedProfileEvidence(groups: CapabilityGroup[], projects: Project[]) {
  const references = new Map<string, ProfileEvidenceRow>();
  for (const group of groups) for (const reference of profileCapabilityEvidence(group, projects)) {
    const row = references.get(reference.slug) ?? { ...reference, competencies: [] };
    if (!row.competencies.includes(group.name)) row.competencies.push(group.name);
    if (reference.boundary) { row.boundary = reference.boundary; row.explanation = explanations[reference.slug]; }
    references.set(reference.slug, row);
  }
  const primary = ['jobpilot-ai', 'construction-project-management-accounting-system', 'lobby']
    .map(slug => references.get(slug)).filter((row): row is ProfileEvidenceRow => Boolean(row?.boundary));
  return {
    primary,
    additional: [...references.values()].filter(row => !primary.includes(row)),
  };
}
