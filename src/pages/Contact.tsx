import { PageMeta } from "../components/PageMeta";
import { ContactSection } from "../sections/ContactSection";
import { useSiteSection } from "../lib/hooks";

export function Contact() {
  const { data: seo } = useSiteSection("seo");
  const pages = seo?.content.pages && typeof seo.content.pages === "object" ? seo.content.pages as Record<string, { title?: string; description?: string }> : {};
  return (
    <>
      <PageMeta
        title={pages.contact?.title ?? "Contact"}
        description={pages.contact?.description}
      />
      <main className="pt-16">
        <ContactSection />
      </main>
    </>
  );
}
