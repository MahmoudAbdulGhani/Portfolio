const ProjectCard = ({ project }) => {
  return (
    <div className="bg-card-dark/40 border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 backdrop-blur-md relative overflow-hidden">
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-[10px] text-text-secondary/40 border-b border-white/5 pb-2">
          <span>SRC_BUILD_0{project.name.length % 9} // CORE</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            READY
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white group-hover:text-accent-blue transition-colors tracking-tight">
          {project.name}
        </h3>
        
        <p className="text-text-secondary text-sm leading-relaxed">
          {project.description}
        </p>

        {project.features && project.features.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-mono text-accent-purple uppercase tracking-wider font-semibold">
              // Architectural Highlights:
            </div>
            <ul className="space-y-1.5">
              {project.features.map((feature, idx) => (
                <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed">
                  <span className="text-accent-blue font-mono mt-0.5">▹</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 pt-3">
          {project.stack.map((t, idx) => (
            <span key={idx} className="text-[10px] font-mono px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/5 text-text-secondary group-hover:border-white/10 transition-colors">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-6 mt-6 border-t border-white/5 font-mono text-xs">
        <a 
          href={project.github} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-accent-blue transition-colors flex items-center gap-1.5 group/btn"
        >
          <svg className="w-4 h-4 text-text-secondary group-hover/btn:text-accent-blue transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          <span>SOURCE</span>
        </a>
        
        {project.demo && (
          <a 
            href={project.demo} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent-blue hover:text-white transition-colors flex items-center gap-1.5 group/live"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping" />
            <span>LIVE_DEMO</span>
            <svg className="w-3.5 h-3.5 transition-transform group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;