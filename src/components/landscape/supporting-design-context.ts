import { createContext, useContext, useSyncExternalStore } from 'react';

// Only the explicit review entry supplies this context. Normal routes opt out.
export type SupportingReview = {
  candidate: boolean;
  compact?: boolean;
  variant?: string;
  indexPath: string;
  readerPath: (slug: string) => string;
  presentation: Partial<Record<string, { lead?: string; contributionFirst?: boolean; workflowLimit?: number; mobileSummary?: string }>>;
  cards?: Partial<Record<string, { category: string; summary: string }>>;
};
export const SupportingDesignContext = createContext<SupportingReview | null>(null);
export const useSupportingDesign = () => useContext(SupportingDesignContext);
const phoneQuery = '(max-width: 719px)';
const phone = () => window.matchMedia(phoneQuery).matches;
const noPhone = () => false;
const idle = () => () => {};
const subscribePhone = (notify: () => void) => {
  const media = window.matchMedia(phoneQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
// Match CSS on first render. Normal/historical routes do not subscribe.
export function useSupportingCompact() {
  const review = useSupportingDesign();
  return useSyncExternalStore(review?.compact ? subscribePhone : idle, review?.compact ? phone : noPhone, noPhone);
}
export const supportingSlugs = ['gamezone-arena', 'unihub', 'full-stack-user-management-system', 'medicare-hub', 'home-services'] as const;
export function supportingReviewAddress(path: string) {
  if (import.meta.env.DEV || import.meta.env.SUPPORTING_DESIGN_REVIEW) {
    return /^\/review\/supporting\/(baseline|before|candidate)(?:\/projects\/([^/]+))?\/?$/.exec(path);
  }
  return null;
}
