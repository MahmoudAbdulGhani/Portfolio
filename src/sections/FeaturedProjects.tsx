import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useProjects } from "../lib/hooks";
import { ProjectCard } from "../components/ProjectCard";
import { SectionHeading } from "../components/SectionHeading";
import { Reveal } from "../components/Reveal";

export function FeaturedProjects() {
  const { data: projects } = useProjects();
  const featured = (projects ?? []).filter((p) => p.featured).slice(0, 3);

  return (
    <section id="projects" className="section relative">
      <div className="container-x">
        <SectionHeading
          eyebrow="Selected engineering work"
          title="Recent full-stack projects"
          description="Three collaborative products from The Digital Hub by UNRWA — reservations with payments, real-time communication, and a university system — alongside earlier full-stack work."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.08} variant="scale">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Link to="/projects" className="btn-outline btn-lg group">
            View all projects
            <FiArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
