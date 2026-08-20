import { PageMeta } from "../components/PageMeta";
import { Hero } from "../sections/Hero";
import { About } from "../sections/About";
import { Skills } from "../sections/Skills";
import { Education } from "../sections/Education";
import { Certifications } from "../sections/Certifications";
import { FeaturedProjects } from "../sections/FeaturedProjects";
import { ContactSection } from "../sections/ContactSection";
import { useProfile, useSiteContent, useSiteSection } from "../lib/hooks";
import { PublicDataState } from "../components/PublicDataState";

export function Home() {
  const { data: profile } = useProfile();
  const { data: seo } = useSiteSection("seo");
  const siteContent = useSiteContent();
  const defaultTitle = typeof seo?.content.defaultTitle === "string" ? seo.content.defaultTitle : profile?.title ?? "";
  const defaultDescription = typeof seo?.content.defaultDescription === "string" ? seo.content.defaultDescription : profile?.seoDescription ?? "";
  if (siteContent.isLoading || siteContent.isError) return <main className="pt-16"><PublicDataState loading={siteContent.isLoading} error={siteContent.isError} onRetry={() => void siteContent.refetch()} label="site content" /></main>;
  return (
    <>
      <PageMeta
        title={profile?.seoTitle || defaultTitle}
        description={profile?.seoDescription || defaultDescription}
      />
      <main>
        <Hero />
        <FeaturedProjects />
        <About />
        <Skills />
        <Education />
        <Certifications />
        <ContactSection />
      </main>
    </>
  );
}
