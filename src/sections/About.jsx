const About = () => {
  const journeyTimeline = [
    {
      milestone: "01 // Software Engineering Intern",
      facility: "The Digital Hub",
      meta: "Current Focus",
      details: "Building adaptive frontends, translating Figma mockups into interactive UI components, and optimizing production deployments."
    },
    {
      milestone: "02 // Backend Engineering Layer",
      facility: "Ishtari Group",
      meta: "Production Systems",
      details: "Engineered scalable MVC backend components, managed relational schemas, and structured secure RESTful API systems."
    },
    {
      milestone: "03 // Quality Assurance Engine",
      facility: "Oigetit",
      meta: "Verification & Telemetry",
      details: "Conducted continuous boundary testing, trace level log debugging, and evaluated system flows to catch and fix core script anomalies."
    },
    {
      milestone: "04 // Web Development Trainer",
      facility: "Tech Education Sector",
      meta: "Knowledge Distribution",
      details: "Mentored developers on procedural engineering logic, component workflows, and industry-standard deployment structures."
    }
  ];

  return (
    <section id="about" className="py-24 relative border-b border-white/5 bg-bg-dark">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Side Bio Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-accent-blue bg-accent-blue/5 px-2.5 py-1 rounded border border-accent-blue/10">
            SYSTEM // INITIALIZATION
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Architecting Reliable <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
              Digital Infrastructure
            </span>
          </h2>
          
          <div className="space-y-4 text-text-secondary text-sm leading-relaxed font-sans">
            <p>
              I am a versatile Software Engineer driven by technical precision and stable system architectures. My experience spans full-stack roles covering normalized transactional database engines, modular backend layers, and automated QA test runs.
            </p>
            <p>
              By focusing cleanly on core software engineering cycles, I build performant web layouts that integrate easily with high-throughput logic structures. I prioritize clean component isolation, documentation metrics, and robust code.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 font-mono">
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <span className="block text-2xl font-bold text-white tracking-tight">4+</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block mt-1">Environments</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <span className="block text-2xl font-bold text-accent-blue tracking-tight">100%</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block mt-1">Production Driven</span>
            </div>
          </div>
        </div>

        {/* Right Side Timeline Grid */}
        <div className="lg:col-span-7 space-y-6 w-full">
          <div className="font-mono text-xs text-text-secondary/50 mb-2 flex items-center gap-3">
            <span>[ SYSTEM_TIMELINE_LOG ]</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="space-y-4">
            {journeyTimeline.map((item, index) => (
              <div 
                key={index} 
                className="group relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className="absolute top-0 left-6 w-16 h-px bg-gradient-to-r from-accent-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3">
                  <div>
                    <h3 className="font-mono font-bold text-sm text-white tracking-wide group-hover:text-accent-blue transition-colors">
                      {item.milestone}
                    </h3>
                    <p className="text-text-secondary text-xs font-sans mt-0.5">{item.facility}</p>
                  </div>
                  <div className="self-start sm:self-center">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-text-secondary tracking-wider block">
                      {item.meta}
                    </span>
                  </div>
                </div>
                
                <p className="text-text-secondary text-xs sm:text-sm font-sans leading-relaxed">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;