const HireMe = () => {
  const valuePropositions = [
    {
      title: "Adaptable & Multi-Stack Native",
      metric: "[ LEARNING_MINDSET ]",
      desc: "Proven capabilities crossing backend architectures (Node.js/PHP), UI platforms (React/Angular), and systems testing suites to solve deployment pipeline roadblocks cleanly."
    },
    {
      title: "Rigorous Component Optimization",
      metric: "[ CODE_QUALITY ]",
      desc: "Committed to producing cleanly isolated UI structures, writing parameterized secure raw SQL data queries, and avoiding layout bloat to assure quick user performance metrics."
    },
    {
      title: "Technical Clarity & Communication",
      metric: "[ AGILITY ]",
      desc: "Experienced technical instructor who translated complicated engineering principles into simple workflows. Fluent English communicator optimized for cross-functional scrum groups."
    }
  ];

  return (
    <section id="hireme" className="py-24 relative border-b border-white/5 bg-bg-dark">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-accent-purple bg-accent-purple/5 px-2.5 py-1 rounded border border-accent-purple/10">
            VALUE_PROP // SYSTEMS_EVALUATION
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Operational Value & <br />
            <span className="bg-gradient-to-r from-accent-purple via-emerald-400 to-white bg-clip-text text-transparent">
              Professional Alignment
            </span>
          </h2>
        </div>

        {/* Grid Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {valuePropositions.map((item, idx) => (
            <div key={idx} className="p-6 sm:p-8 rounded-2xl bg-white/[0.01] border border-white/5 relative group hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300">
              <div className="font-mono text-[10px] text-accent-blue tracking-wider mb-2 block">
                {item.metric}
              </div>
              <h3 className="text-base font-bold text-white mb-3 font-sans">
                {item.title}
              </h3>
              <p className="text-text-secondary text-xs sm:text-sm font-sans leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HireMe;