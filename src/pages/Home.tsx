import { Collection } from "../components/landscape/Collection";
import { PageMeta } from "../components/PageMeta";
import { useProfile } from "../lib/hooks";
import { useJobPilotDesign } from '../components/landscape/jobpilot-design-context';

export function Home() {
  const { data: profile } = useProfile();
  const design = useJobPilotDesign();
  return (
    <>
      <PageMeta
        title={profile?.seoTitle ?? profile?.title ?? "Portfolio"}
        description={profile?.seoDescription ?? undefined}
        noIndex={Boolean(design)}
        canonicalPath={design ? '/' : undefined}
      />
      <Collection />
    </>
  );
}
