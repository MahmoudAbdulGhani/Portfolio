const HireMe = () => {
  const valuePropositions = [
    {
      title: "Collaborative Full-Stack Delivery",
      metric: "[ FULL_STACK ]",
      desc: "Shipped three team projects end-to-end at The Digital Hub — from bookings with payments to real-time audio — across React, Next.js and Angular with Node.js and NestJS backends."
    },
    {
      title: "Security & Architecture Aware",
      metric: "[ CODE_QUALITY ]",
      desc: "Auth flows built on JWT, OTP and RBAC, time-slot conflict detection, typed contracts, and parameterized queries — code engineered to stay reliable and understandable after launch."
    },
    {
      title: "Clear Communication & Growth",
      metric: "[ AGILITY ]",
      desc: "Technical instructor experienced at translating complex engineering concepts into simple workflows, with fluent English communication for cross-functional teams."
    }
  ];

  return (
    <section id="hireme" className="py-24 relative section-panel">
      <div className="max-w-7xl mx-auto px-6 space-y-12">

        {/* Section Header */}
        <div className="space-y-3 max-w-xl">
          <div className="section-label">Why hire Mahmoud</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Contributing across frontend, backend, data, and real-time systems.
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
