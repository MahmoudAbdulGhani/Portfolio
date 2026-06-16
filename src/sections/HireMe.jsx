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
    <section id="hireme" className="py-24 relative section-panel">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-xl">
          <div className="section-label">Why hire Mahmoud</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Useful across frontend, backend, data, and QA conversations.
          </h2>
        </div>

        {/* Grid Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {valuePropositions.map((item, idx) => (
            <div key={idx} className="p-6 sm:p-8 rounded-lg bg-card-dark/70 border border-white/10 relative group hover:border-accent-gold/30 hover:bg-white/[0.025] transition-all duration-300">
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
