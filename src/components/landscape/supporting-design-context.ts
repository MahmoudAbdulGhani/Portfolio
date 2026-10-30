import { createContext, useContext } from 'react';

// Only the explicit review entry supplies this context. Normal routes opt out.
export type SupportingReview = {
  candidate: boolean;
  indexPath: string;
  readerPath: (slug: string) => string;
  presentation: Partial<Record<string, { lead?: string; contributionFirst?: boolean; workflowLimit?: number }>>;
};
export const SupportingDesignContext = createContext<SupportingReview | null>(null);
export const useSupportingDesign = () => useContext(SupportingDesignContext);
export const supportingSlugs = ['gamezone-arena', 'unihub', 'full-stack-user-management-system', 'medicare-hub', 'home-services'] as const;
export function supportingReviewAddress(path: string) {
  if (import.meta.env.DEV || import.meta.env.SUPPORTING_DESIGN_REVIEW) {
    return /^\/review\/supporting\/(baseline|candidate)(?:\/projects\/([^/]+))?\/?$/.exec(path);
  }
  return null;
}
