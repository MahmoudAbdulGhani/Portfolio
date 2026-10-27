import { createContext, useContext } from 'react';

export type JobPilotDesign = {
  projectSlug?: string;
  variant: 'baseline' | 'before' | 'candidate';
  candidate: boolean;
  refined: boolean;
  collectionPath: string;
  readerPath: string;
};
export const JobPilotDesignContext = createContext<JobPilotDesign | null>(null);
export const useJobPilotDesign = () => useContext(JobPilotDesignContext);

// Normal JobPilot routes use the approved PR #52 presentation. Explicit
// historical review contexts retain their own composition; other projects do not.
export function jobPilotPresentation(review: JobPilotDesign | null, jobpilot: boolean) {
  return {
    candidate: jobpilot && (review?.candidate ?? true),
    refined: jobpilot && (review?.refined ?? true),
  };
}

// The route-restoration owner lives above layouts. Keep its review aliases
// behind the same compiled flag; ordinary Production has no review addresses.
export function jobPilotReviewAddress(pathname: string) {
  if (import.meta.env.DEV || import.meta.env.FEATURED_DESIGN_REVIEW) {
    const featured = /^\/review\/featured\/(cedar|lobby)\/(baseline|candidate)(\/reader)?$/.exec(pathname);
    if (featured) return { collection: !featured[3], reader: Boolean(featured[3]), project: featured[1] === 'cedar' ? 'construction-project-management-accounting-system' : 'lobby' };
  }
  if (!(import.meta.env.DEV || import.meta.env.JOBPILOT_DESIGN_REVIEW)) return null;
  const match = /^\/review\/jobpilot\/(baseline|before|candidate)(\/reader)?$/.exec(pathname);
  return match ? { collection: !match[2], reader: Boolean(match[2]) } : null;
}
