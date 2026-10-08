import { PageMeta } from "../components/PageMeta";
import { ContactSection } from "../sections/ContactSection";
import { useSiteSection } from "../lib/hooks";
import { useContactViewport } from "../lib/use-contact-viewport";
import "./contact.css";

export function Contact() {
  const page = useContactViewport();
  const { data: seo } = useSiteSection("seo");
  const pages =
    seo?.content.pages && typeof seo.content.pages === "object"
      ? (seo.content.pages as Record<
          string,
          { title?: string; description?: string }
        >)
      : {};
  return (
    <>
      <PageMeta
        title={pages.contact?.title ?? "Contact"}
        description={pages.contact?.description}
      />
      <main
        ref={page}
        id="main-content"
        tabIndex={-1}
        className="public-page landscape-contact"
      >
        <ContactSection />
      </main>
    </>
  );
}
