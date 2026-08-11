import { PageMeta } from "../components/PageMeta";
import { Hero } from "../sections/Hero";
import { About } from "../sections/About";
import { Technologies } from "../sections/Technologies";
import { Skills } from "../sections/Skills";
import { Education } from "../sections/Education";
import { Certifications } from "../sections/Certifications";
import { FeaturedProjects } from "../sections/FeaturedProjects";
import { HireCta } from "../sections/HireCta";
import { ContactSection } from "../sections/ContactSection";

export function Home() {
  return (
    <>
      <PageMeta
        title="Junior Full-Stack Software Engineer"
        description="Full-stack portfolio of Mahmoud Abdul Ghani — React, Next.js and Angular frontends; Node.js, Express and NestJS backends; MongoDB, PostgreSQL and Supabase. Projects from The Digital Hub by UNRWA."
      />
      <main>
        <Hero />
        <About />
        <Technologies />
        <Skills />
        <Education />
        <Certifications />
        <FeaturedProjects />
        <HireCta />
        <ContactSection />
      </main>
    </>
  );
}
