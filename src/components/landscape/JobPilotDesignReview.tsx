import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LandscapeLayout } from './Layout';
import { JobPilotDesignContext } from './jobpilot-design-context';
import { NotFound } from '../../pages/NotFound';

export function JobPilotDesignReview() {
  const { variant } = useParams();
  const design = useMemo(() => ({ variant: variant === 'candidate' ? 'candidate' as const : variant === 'before' ? 'before' as const : 'baseline' as const,
    candidate: variant === 'candidate' || variant === 'before', refined: variant === 'candidate', collectionPath: `/review/jobpilot/${variant}`, readerPath: `/review/jobpilot/${variant}/reader`,
  }),[variant]);
  if (!['baseline','before','candidate'].includes(variant??'')) return <NotFound />;
  return <JobPilotDesignContext.Provider value={design}><LandscapeLayout /></JobPilotDesignContext.Provider>;
}
