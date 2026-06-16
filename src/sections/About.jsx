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
    <section id="about" className="py-24 relative section-panel">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Side Bio Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="section-label">About Mahmoud</div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Full-stack foundations, practical delivery, and a clear testing mindset.
          </h2>
          
          <div className="space-y-4 text-text-secondary text-sm leading-relaxed font-sans">
            <p>
              I am a software engineer from Tripoli, Lebanon, building across frontend interfaces, backend logic, relational databases, and QA workflows.
            </p>
            <p>
              My work is shaped by real project constraints: turning Figma designs into responsive React screens, structuring MVC backends, writing safer SQL flows, and checking behavior before it reaches users.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 font-mono">
            <div className="p-4 rounded-lg bg-white/[0.025] border border-white/10">
              <span className="block text-2xl font-bold text-white tracking-tight">4+</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block mt-1">Work areas</span>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.025] border border-white/10">
              <span className="block text-2xl font-bold text-accent-gold tracking-tight">MHA</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block mt-1">Personal brand</span>
            </div>
          </div>
        </div>

        {/* Right Side Timeline Grid */}
        <div className="lg:col-span-7 space-y-6 w-full">
          <div className="font-mono text-xs text-text-secondary/50 mb-2 flex items-center gap-3">
            <span>Experience timeline</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="space-y-4">
            {journeyTimeline.map((item, index) => (
              <div 
                key={index} 
                className="group relative p-6 rounded-lg bg-card-dark/70 border border-white/10 hover:border-accent-gold/30 hover:bg-white/[0.025] transition-all duration-300"
              >
                <div className="absolute top-0 left-6 w-16 h-px bg-gradient-to-r from-accent-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-white tracking-wide group-hover:text-accent-gold transition-colors">
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
