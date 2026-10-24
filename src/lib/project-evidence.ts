import type { Project } from '../types';
import { projectDisplayName } from '../../shared/content-integrity-runtime.js';

// Collection's accepted assignments; projects outside that selection are unnumbered.
const collectionNumbers: Record<string,string> = { 'jobpilot-ai': '01', lobby: '02', 'construction-project-management-accounting-system': '03' };
export const projectNumber = (slug: string) => collectionNumbers[slug];
export type MatchProjectReference = { slug: string; name: string; portfolioUrl: string; evidence: string };

export function resolveMatchProjects(references: MatchProjectReference[], projects: Project[]) {
  const seen = new Set<string>();
  return references.flatMap(reference => {
    const project = projects.find(p => p.slug === reference.slug && p.published && p.showOnPortfolio !== false);
    if (!project || seen.has(project.slug)) return [];
    seen.add(project.slug);
    const team = (project.team?.length ?? 0) > 1 || (project.teamSize ?? 0) > 1 || /team|collaborat/i.test(`${project.myRole ?? ''} ${project.ownership ?? ''}`);
    return [{ project, slug: project.slug, name: projectDisplayName(project), number: projectNumber(project.slug),
      href: `/projects/${project.slug}`, evidence: reference.evidence,
      scope: team ? 'View team project' : 'View project' }];
  });
}
