import type { JobPilotDesign } from './jobpilot-design-context';
import { jobPilotPresentation } from './jobpilot-design-context';

export const featuredProjects = {
  'jobpilot-ai': { kind: 'jobpilot', number: '01', asset: 'jobpilot-sculpture.webp', caption: 'Review before saving' },
  lobby: { kind: 'lobby', number: '02', asset: 'lobby-sculpture.webp', caption: 'Invitation, membership, then call access' },
  'construction-project-management-accounting-system': { kind: 'cedar', number: '03', asset: 'archive-sculpture.webp', caption: 'Calculated facts, then interpretation' },
} as const;
export type FeaturedSlug = keyof typeof featuredProjects;
export function featuredProject(slug?: string) {
  return slug && slug in featuredProjects ? featuredProjects[slug as FeaturedSlug] : undefined;
}

// Approved featured presentations are the normal defaults. Explicit historical
// review contexts retain their own versions without duplicating components.
export function featuredPresentation(review: JobPilotDesign | null, slug?: string) {
  if (slug === 'jobpilot-ai') return jobPilotPresentation(review, true);
  const matches = Boolean(featuredProject(slug) && (!review || review.projectSlug === slug));
  return { candidate: matches && (review?.candidate ?? true), refined: matches && (review?.refined ?? true) };
}
