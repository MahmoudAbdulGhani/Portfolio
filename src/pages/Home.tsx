import { PageMeta } from "../components/PageMeta";
import { Hero } from "../sections/Hero";
import { About } from "../sections/About";
import { Skills } from "../sections/Skills";
import { Education } from "../sections/Education";
import { Certifications } from "../sections/Certifications";
import { FeaturedProjects } from "../sections/FeaturedProjects";
import { ContactSection } from "../sections/ContactSection";
import { useProfile } from "../lib/hooks";

export function Home() {
  const { data: profile } = useProfile();
  return (
    <>
      <PageMeta
        title={profile?.seoTitle?.replace(/\s*[|—-]\s*Mahmoud Hussein Abdul Ghani.*$/i, "") || "Full-Stack Software Engineer"}
        description={profile?.seoDescription || "Portfolio of Mahmoud Hussein Abdul Ghani, a full-stack software developer building React, Next.js, TypeScript, Node.js, Express.js, MongoDB, and SQL applications."}
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
