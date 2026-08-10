const focusAreas = [
  "React · Next.js",
  "Angular",
  "Node.js · NestJS",
  "REST APIs",
  "Real-time systems",
];

const portfolioMarks = [
  { label: "Based in", value: "Tripoli, Lebanon" },
  { label: "Current focus", value: "Junior full-stack engineer" },
  { label: "Project proof", value: "Reservations, real-time platform, university system" },
];

const Hero = () => {
  return (
    <section id="hero" className="min-h-screen pt-24 flex items-center relative overflow-hidden cyber-grid">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg-dark to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-dark to-transparent" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-12 relative z-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="section-label">Junior Full-Stack Software Engineer</div>

          <div className="space-y-5">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.02]">
              I build full-stack products for real workflows.
            </h1>

            <p className="text-text-secondary text-base sm:text-lg max-w-2xl leading-relaxed">
              Software engineer crafting responsive React and Angular interfaces backed by
              Node.js and NestJS APIs, MongoDB and Supabase data layers, and real-time
              communication — through collaborative engineering at The Digital Hub by UNRWA.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {focusAreas.map((item) => (
              <span
                key={item}
                className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-text-primary"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#projects"
              className="rounded-lg bg-accent-gold px-6 py-3 text-sm font-extrabold text-bg-dark shadow-[0_14px_36px_rgba(244,184,74,0.18)] hover:-translate-y-0.5 hover:bg-white transition-all duration-300"
            >
              View Projects
            </a>

            <a
              href="#contact"
              className="rounded-lg border border-accent-blue/35 bg-accent-blue/10 px-6 py-3 text-sm font-bold text-accent-blue hover:border-accent-blue hover:bg-accent-blue hover:text-bg-dark transition-all duration-300"
            >
              Contact Mahmoud
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-card-dark shadow-2xl">
              <div className="aspect-[4/5] bg-white/[0.025]">
                <img
                  src="/myphoto.jpeg"
                  alt="Mahmoud Hussein Abdul Ghani"
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="border-t border-white/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-xl font-bold text-white">MHA Portfolio</p>
                    <p className="mt-1 text-sm text-text-secondary">Selected engineering work, built with real teams.</p>
                  </div>
                  <span className="rounded-lg border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-xs font-bold text-accent-green">
                    Available
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {portfolioMarks.map((mark) => (
                    <div key={mark.label} className="grid grid-cols-[7.5rem_1fr] gap-3 border-t border-white/5 pt-3 text-sm">
                      <span className="text-text-secondary">{mark.label}</span>
                      <span className="font-semibold text-text-primary">{mark.value}</span>
                    </div>
                  ))}
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
