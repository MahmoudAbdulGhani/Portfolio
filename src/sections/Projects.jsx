import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

const Projects = () => {
  return (
    <section id="projects" className="py-24 relative section-panel">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="space-y-2 mb-12">
          <div className="section-label">Selected engineering work</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Recent full-stack projects</h2>
          <p className="text-text-secondary text-sm max-w-xl">
            Three collaborative products from The Digital Hub by UNRWA — reservations with payments, real-time communication, and a university system — alongside earlier full-stack work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Projects;
