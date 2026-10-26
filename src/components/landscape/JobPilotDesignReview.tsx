import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LandscapeLayout } from './Layout';
import { JobPilotDesignContext } from './jobpilot-design-context';
import { NotFound } from '../../pages/NotFound';
import './jobpilot-design-review.css';

export function JobPilotDesignReview() {
  const { variant } = useParams();
  const design = useMemo(() => ({ variant: variant === 'candidate' ? 'candidate' as const : 'baseline' as const,
    candidate: variant === 'candidate', collectionPath: `/review/jobpilot/${variant}`, readerPath: `/review/jobpilot/${variant}/reader`,
  }),[variant]);
  if (!['baseline','candidate'].includes(variant??'')) return <NotFound />;
  return <JobPilotDesignContext.Provider value={design}><LandscapeLayout /></JobPilotDesignContext.Provider>;
}
