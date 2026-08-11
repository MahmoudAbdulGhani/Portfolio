import { PageMeta } from "../components/PageMeta";
import { ContactSection } from "../sections/ContactSection";

export function Contact() {
  return (
    <>
      <PageMeta
        title="Contact"
        description="Reach out to Mahmoud Abdul Ghani for junior software engineering roles, full-stack projects, internships, or collaboration."
      />
      <main className="pt-16">
        <ContactSection />
      </main>
    </>
  );
}
