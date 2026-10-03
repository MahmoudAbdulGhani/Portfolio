import { LandingMotion } from "../components/LandingMotion";
import { PageMeta } from "../components/PageMeta";
import { CinematicLanding } from "../sections/CinematicLanding";
import { useProfile, useSiteContent, useSiteSection } from "../lib/hooks";
import { PublicDataState } from "../components/PublicDataState";

export function Home() {
  const { data: profile } = useProfile();
  const { data: seo } = useSiteSection("seo");
  const siteContent = useSiteContent();
  const defaultTitle = typeof seo?.content.defaultTitle === "string" ? seo.content.defaultTitle : profile?.title ?? "";
  const defaultDescription = typeof seo?.content.defaultDescription === "string" ? seo.content.defaultDescription : profile?.seoDescription ?? "";
  if (siteContent.isLoading || siteContent.isError) return <main className="min-h-screen pt-16"><PublicDataState loading={siteContent.isLoading} error={siteContent.isError} onRetry={() => void siteContent.refetch()} label="site content" /></main>;
  return (
    <>
      <PageMeta
        title={profile?.seoTitle || defaultTitle}
        description={profile?.seoDescription || defaultDescription}
      />
      <LandingMotion><main className="portfolio-home">
        <CinematicLanding />
      </main></LandingMotion>
    </>
  );
}
