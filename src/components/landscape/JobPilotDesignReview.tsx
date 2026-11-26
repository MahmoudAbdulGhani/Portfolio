import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LandscapeLayout } from './Layout';
import { JobPilotDesignContext } from './jobpilot-design-context';
import { NotFound } from '../../pages/NotFound';

export function JobPilotDesignReview() {
  const { variant } = useParams();
  const design = useMemo(() => ({ variant: variant === 'candidate' ? 'candidate' as const : variant === 'before' ? 'before' as const : 'baseline' as const,
    motionStudy: variant === 'motion', candidate: variant !== 'baseline', refined: variant === 'candidate' || variant === 'motion', collectionPath: `/review/jobpilot/${variant}`, readerPath: `/review/jobpilot/${variant}/reader`,
  }),[variant]);
  if (!['baseline','before','candidate','motion'].includes(variant??'')) return <NotFound />;
  return <JobPilotDesignContext.Provider value={design}><LandscapeLayout /></JobPilotDesignContext.Provider>;
}
