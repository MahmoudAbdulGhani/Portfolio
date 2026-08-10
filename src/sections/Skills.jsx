const Skills = () => {
  const skillCategories = [
    {
      id: "01",
      title: "Frontend Engineering",
      color: "border-accent-blue/30 text-accent-blue bg-accent-blue/5",
      skills: ["React.js", "Next.js", "Angular", "TypeScript", "JavaScript (ES6+)", "Tailwind CSS", "Bootstrap", "Vite", "Responsive Design"]
    },
    {
      id: "02",
      title: "Backend & Systems",
      color: "border-accent-purple/30 text-accent-purple bg-accent-purple/5",
      skills: ["Node.js", "Express.js", "NestJS", "PHP", "REST APIs", "JWT Authentication", "Role-Based Access (RBAC)", "Real-time Systems"]
    },
    {
      id: "03",
      title: "Databases & Data",
      color: "border-amber-500/30 text-amber-400 bg-amber-500/5",
      skills: ["MongoDB", "PostgreSQL", "MySQL / MariaDB", "SQL Server", "Supabase", "Database Design", "Parameterized SQL", "Sequelize ORM"]
    },
    {
      id: "04",
      title: "Tools & Platforms",
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
      skills: ["Git / GitHub", "Stripe", "Nodemailer / SMTP", "LiveKit", "Zod", "pnpm", "Postman API Testing", "Agile / Scrum", "OpenAPI / Swagger"]
    }
  ];

  return (
    <section id="skills" className="py-24 relative section-panel">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="space-y-2 mb-12">
          <div className="section-label">Capability map</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Technical strengths</h2>
          <p className="text-text-secondary text-sm max-w-xl">
            A practical view of the skills behind Mahmoud's portfolio: frontend delivery, backend APIs, data layers, and modern full-stack tooling.
          </p>
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillCategories.map((category) => (
            <div
              key={category.id}
              className="p-6 rounded-lg bg-card-dark/75 border border-white/10 hover:border-accent-gold/30 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 font-mono text-3xl font-black text-white/5 select-none transition-transform duration-300 group-hover:scale-105">
                //{category.id}
              </div>

              <div className="flex items-center gap-3 mb-5 relative z-10">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${category.color}`}>
                  SYSTEM_LAYER
                </span>
                <h3 className="text-text-primary font-bold text-lg">{category.title}</h3>
              </div>

              <div className="flex flex-wrap gap-2 relative z-10">
                {category.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 rounded-lg bg-white/[0.025] border border-white/10 font-mono text-xs text-text-secondary hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Skills;
