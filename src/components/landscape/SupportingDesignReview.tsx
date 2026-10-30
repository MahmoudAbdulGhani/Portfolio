import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SupportingDesignContext, supportingSlugs, type SupportingReview } from './supporting-design-context';
import { LandscapeLayout } from './Layout';
import { NotFound } from '../../pages/NotFound';
import './supporting-design.css';

export function SupportingDesignReview() {
  const { variant, slug } = useParams();
  const design = useMemo<SupportingReview>(() => ({
    candidate: variant !== 'baseline', compact: variant === 'candidate', variant,
    indexPath: `/review/supporting/${variant}`,
    readerPath: (project: string) => supportingSlugs.some(slug => slug === project) ? `/review/supporting/${variant}/projects/${project}` : `/projects/${project}`,
    presentation: variant !== 'baseline' ? {
      'gamezone-arena': { workflowLimit: 2, mobileSummary: 'A team-built reservation system for gaming rooms and devices.' },
      unihub: { contributionFirst: true, mobileSummary: 'A student workspace inside a team-built university system.' },
      'full-stack-user-management-system': { lead: '/projects/phase3/user-management-registration.webp', mobileSummary: 'An independent React/FastAPI app for account self-service and administrative user management.' },
      'medicare-hub': { mobileSummary: 'A PHP clinic-management project with appointment and role-specific pages.' },
      'home-services': { mobileSummary: 'A responsive home-services landing page implemented in React.' },
    } : {},
    cards: {
      'jobpilot-ai': { category: 'AI job search', summary: 'A workspace for saved jobs, application drafts and interview practice.' },
      lobby: { category: 'Real-time communication', summary: 'A team-built platform for room invitations, membership and call access.' },
      'construction-project-management-accounting-system': { category: 'Construction accounting', summary: 'A team-built workspace for construction budgets, invoices, payments and reports.' },
      'gamezone-arena': { category: 'Gaming reservations', summary: 'A team-built system for reserving gaming rooms and devices.' },
      unihub: { category: 'Student portal', summary: 'A student portal within a team-built university system.' },
      'full-stack-user-management-system': { category: 'Account management', summary: 'React/FastAPI account self-service with separate administrative roles.' },
      'medicare-hub': { category: 'Clinic management', summary: 'A PHP clinic-management project with appointment and role-specific pages.' },
      'home-services': { category: 'Frontend implementation', summary: 'A responsive React landing page implemented from a supplied design.' },
    },
  }), [variant]);
  if (!['baseline', 'before', 'candidate'].includes(variant ?? '') || (slug && !supportingSlugs.some(project => project === slug))) return <NotFound />;
  return <SupportingDesignContext.Provider value={design}><LandscapeLayout /></SupportingDesignContext.Provider>;
}
