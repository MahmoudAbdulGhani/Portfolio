import { createContext, useContext } from 'react';

export type JobPilotDesign = {
  variant: 'baseline' | 'candidate';
  candidate: boolean;
  collectionPath: string;
  readerPath: string;
};
export const JobPilotDesignContext = createContext<JobPilotDesign | null>(null);
export const useJobPilotDesign = () => useContext(JobPilotDesignContext);

// The route-restoration owner lives above layouts. Keep its review aliases
// behind the same compiled flag; ordinary Production has no review addresses.
export function jobPilotReviewAddress(pathname: string) {
  if (!(import.meta.env.DEV || import.meta.env.JOBPILOT_DESIGN_REVIEW)) return null;
  const match = /^\/review\/jobpilot\/(baseline|candidate)(\/reader)?$/.exec(pathname);
  return match ? { collection: !match[2], reader: Boolean(match[2]) } : null;
}
