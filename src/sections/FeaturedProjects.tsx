import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useProjects } from "../lib/hooks";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectCardSkeleton } from "../components/ProjectCardSkeleton";
import { SectionHeading } from "../components/SectionHeading";
import { Reveal } from "../components/Reveal";

export function FeaturedProjects() {
  const { data: projects, isLoading } = useProjects();
  const featured = (projects ?? []).filter((p) => p.featured).slice(0, 3);

  return (
    <section id="projects" className="section relative">
      <div className="container-x">
        <SectionHeading
          eyebrow="Selected work"
          title="Systems built for real workflows"
          description="Three full-stack products engineered at the Digital Hub and independently."
        />

        <div className="space-y-2">
          {isLoading && Array.from({ length: 3 }, (_, index) => <ProjectCardSkeleton key={index} />)}
          {featured.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.06}>
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
