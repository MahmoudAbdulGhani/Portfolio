import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SupportingDesignContext, supportingSlugs, type SupportingReview } from './supporting-design-context';
import { LandscapeLayout } from './Layout';
import { NotFound } from '../../pages/NotFound';
import './supporting-design.css';

export function SupportingDesignReview() {
  const { variant, slug } = useParams();
  const design = useMemo<SupportingReview>(() => ({
    candidate: variant === 'candidate',
    indexPath: `/review/supporting/${variant}`,
    readerPath: (project: string) => supportingSlugs.some(slug => slug === project) ? `/review/supporting/${variant}/projects/${project}` : `/projects/${project}`,
    presentation: variant === 'candidate' ? {
      'gamezone-arena': { workflowLimit: 2 },
      unihub: { contributionFirst: true },
      'full-stack-user-management-system': { lead: '/projects/phase3/user-management-registration.webp' },
      'medicare-hub': {},
      'home-services': {},
    } : {},
  }), [variant]);
  if (!['baseline', 'candidate'].includes(variant ?? '') || (slug && !supportingSlugs.some(project => project === slug))) return <NotFound />;
  return <SupportingDesignContext.Provider value={design}><LandscapeLayout /></SupportingDesignContext.Provider>;
}
