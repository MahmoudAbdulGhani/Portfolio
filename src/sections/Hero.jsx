const Hero = () => {
  return (
    <section id="hero" className="min-h-screen pt-28 flex items-center relative overflow-hidden cyber-grid">
      {/* Visual Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-accent-blue/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-accent-purple/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 relative z-10">
        
        {/* Left Column: Core Profiles */}
        <div className="lg:col-span-6 text-left space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Engineering Avatar Canvas Frame */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-blue via-accent-purple to-emerald-500 opacity-60 blur-[4px] group-hover:opacity-100 transition duration-500" />
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-card-dark border border-white/10 flex items-center justify-center">
                <img 
                  src="/my-photo.jpeg" 
                  alt="Mahmoud Hussein" 
                  className="w-full h-full object-cover object-center contrast-[1.05] brightness-[1.05] group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    document.getElementById('avatar-fallback').classList.remove('hidden');
                  }}
                />
                <div id="avatar-fallback" className="hidden w-full h-full flex items-center justify-center bg-card-dark text-accent-blue font-mono text-2xl font-bold">
                  {"</>"}
                </div>
              </div>
            </div>

            {/* Title Block */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">SYS_ACTIVE // PRODUCTION_READY</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary font-sans">
                Mahmoud Hussein Abdul Ghani
              </h1>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-white bg-clip-text text-transparent">
              Software Engineer
            </span>
          </h2>

          <p className="text-text-secondary text-base max-w-xl font-normal leading-relaxed font-sans">
            Based in Tripoli, Lebanon. Specializing in responsive front-end applications, modular MVC backend systems, normalized relational databases, and automated software diagnostics pipelines.
          </p>

          {/* Action Callouts */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#projects"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-bg-dark font-sans font-bold text-sm shadow-[0_4px_20px_rgba(56,189,248,0.2)] hover:shadow-[0_4px_25px_rgba(129,140,248,0.4)] hover:scale-[1.02] transition-all duration-300"
            >
              Explore Projects
            </a>
            
            <a
              href="tel:+96176364340"
              className="px-5 py-3.5 rounded-xl border border-accent-blue/30 bg-accent-blue/5 font-mono text-xs font-semibold text-accent-blue hover:bg-accent-blue/10 hover:border-accent-blue/60 transition-all duration-300 flex items-center gap-2 group"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-blue group-hover:animate-ping" />
              CALL // +961 76 364 340
            </a>

            <a
              href="#contact"
              className="px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 font-sans font-semibold text-sm hover:bg-white/10 transition-all duration-300"
            >
              Get In Touch
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Stack Overview Card */}
        <div className="lg:col-span-6 w-full">
          <div className="relative mx-auto max-w-[500px] lg:max-w-none group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent-blue to-accent-purple opacity-20 blur-lg group-hover:opacity-30 transition duration-500" />
            
            <div className="relative bg-card-dark/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[11px] font-mono text-text-secondary/60 pl-2">Console Session</span>
                </div>
                <div className="flex items-center gap-1.5 bg-accent-blue/5 border border-accent-blue/10 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-accent-blue tracking-wide">mha_core.sh</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-sm">
                <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-accent-blue/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-accent-blue font-bold text-xs tracking-wider">01 // Frontend Layer</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-accent-blue/20 text-accent-blue bg-accent-blue/5">[ALIVE]</span>
                  </div>
                  <p className="text-text-secondary text-xs mt-1.5 font-sans leading-relaxed">
                    React.js, Angular, TypeScript, JavaScript, Tailwind CSS, Bootstrap, Vite, Figma-to-Code.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-accent-purple/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-accent-purple font-bold text-xs tracking-wider">02 // Backend Systems</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-accent-purple/20 text-accent-purple bg-accent-purple/5">[LOADED]</span>
                  </div>
                  <p className="text-text-secondary text-xs mt-1.5 font-sans leading-relaxed">
                    Node.js, Express.js, PHP, RESTful APIs, JWT Authentication, MVC Architecture, C#.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-amber-500/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold text-xs tracking-wider">03 // Relational Storage</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/20 text-amber-400 bg-amber-500/5">[CONNECTED]</span>
                  </div>
                  <p className="text-text-secondary text-xs mt-1.5 font-sans leading-relaxed">
                    MySQL, MariaDB, PostgreSQL, SQL Server, Parameterized Raw SQL, Sequelize ORM.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-xs tracking-wider">04 // QA & Operations</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5">[ACTIVE]</span>
                  </div>
                  <p className="text-text-secondary text-xs mt-1.5 font-sans leading-relaxed">
                    AWS Cloud, Git/GitHub, Bug Tracking, Regression/Sanity Testing, Postman, Jira.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-text-secondary/70">
                <div className="flex items-center gap-1">
                  <span className="text-accent-purple">LOC:</span>
                  <span className="text-white/90 font-sans">Tripoli, LB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-semibold tracking-wider text-[10px]">ALL_SYSTEMS_OPTIMAL</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;