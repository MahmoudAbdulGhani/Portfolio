const ProjectCard = ({ project }) => {
  return (
    <article className="group flex min-h-full flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-card-dark/80 transition-all duration-300 hover:-translate-y-1 hover:border-accent-gold/35">
      <div className="p-6 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <span className="rounded-md border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-bold text-text-secondary">
            {project.type}
          </span>
          <span className="text-xs font-bold text-accent-green">Ready</span>
        </div>

        <h3 className="text-xl font-extrabold tracking-tight text-white group-hover:text-accent-gold transition-colors">
          {project.name}
        </h3>

        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          {project.description}
        </p>

        {project.features && project.features.length > 0 && (
          <ul className="mt-5 space-y-2">
            {project.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span key={tech} className="rounded-md border border-white/10 bg-white/[0.025] px-2.5 py-1 text-xs font-semibold text-text-secondary">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 p-5 text-sm font-bold">
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 px-4 py-2 text-white hover:border-white/25 hover:bg-white/5 transition-colors"
        >
          Source
        </a>

        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent-blue px-4 py-2 text-bg-dark hover:bg-white transition-colors"
          >
            Live Demo
          </a>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
