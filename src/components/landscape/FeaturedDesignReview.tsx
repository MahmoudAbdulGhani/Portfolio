import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LandscapeLayout } from './Layout';
import { JobPilotDesignContext } from './jobpilot-design-context';
import { NotFound } from '../../pages/NotFound';

export function FeaturedDesignReview() {
  const { project, variant } = useParams();
  const slug = project === 'cedar' ? 'construction-project-management-accounting-system' : 'lobby';
  const design = useMemo(() => ({
    variant: variant === 'candidate' ? 'candidate' as const : 'baseline' as const,
    candidate: variant === 'candidate', refined: variant === 'candidate', projectSlug: slug,
    collectionPath: `/review/featured/${project}/${variant}`, readerPath: `/review/featured/${project}/${variant}/reader`,
  }), [project, variant, slug]);
  if (!['cedar','lobby'].includes(project ?? '') || !['baseline','candidate'].includes(variant ?? '')) return <NotFound />;
  return <JobPilotDesignContext.Provider value={design}><LandscapeLayout /></JobPilotDesignContext.Provider>;
}
