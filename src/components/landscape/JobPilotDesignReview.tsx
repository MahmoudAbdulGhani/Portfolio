import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LandscapeLayout } from './Layout';
import { JobPilotDesignContext } from './jobpilot-design-context';
import { JobPilotRegister } from './JobPilotRegister';
import { NotFound } from '../../pages/NotFound';

export function JobPilotDesignReview() {
  const { variant } = useParams();
  const design = useMemo(() => {
    const registration = variant === 'registration';
    const motionStudy = variant === 'motion' || registration;
    return {
      variant: variant === 'before' ? 'before' as const : (variant === 'candidate' || registration) ? 'candidate' as const : 'baseline' as const,
      motionStudy, candidate: variant !== 'baseline', refined: variant === 'candidate' || motionStudy,
      Register: registration ? JobPilotRegister : undefined,
      collectionPath: `/review/jobpilot/${variant}`, readerPath: `/review/jobpilot/${variant}/reader`,
    };
  }, [variant]);
  if (!['baseline', 'before', 'candidate', 'motion', 'registration'].includes(variant ?? '')) return <NotFound />;
  return <JobPilotDesignContext.Provider value={design}><LandscapeLayout /></JobPilotDesignContext.Provider>;
}
