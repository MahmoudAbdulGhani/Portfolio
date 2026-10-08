import { Collection } from "../components/landscape/Collection";
import { PageMeta } from "../components/PageMeta";
import { useProfile } from "../lib/hooks";

export function Home() {
  const { data: profile } = useProfile();
  return (
    <>
      <PageMeta
        title={profile?.seoTitle ?? profile?.title ?? "Portfolio"}
        description={profile?.seoDescription ?? undefined}
      />
      <Collection />
    </>
  );
}
