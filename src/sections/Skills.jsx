const Skills = () => {
  const skillCategories = [
    {
      id: "01",
      title: "Frontend Engineering",
      color: "border-accent-blue/30 text-accent-blue bg-accent-blue/5",
      skills: ["React.js", "Angular", "TypeScript", "JavaScript (ES6+)", "Tailwind CSS", "Bootstrap", "Vite", "Figma-to-Code", "Responsive Design"]
    },
    {
      id: "02",
      title: "Backend & Systems",
      color: "border-accent-purple/30 text-accent-purple bg-accent-purple/5",
      skills: ["Node.js", "Express.js", "PHP", "C# (.NET)", "RESTful APIs", "JWT Authentication", "Role-Based Access (RBAC)", "MVC Architecture"]
    },
    {
      id: "03",
      title: "Databases & Engines",
      color: "border-amber-500/30 text-amber-400 bg-amber-500/5",
      skills: ["MySQL", "MariaDB", "PostgreSQL", "SQL Server", "Database Optimization", "Parameterized SQL", "Sequelize ORM", "Data Sanity Audits"]
    },
    {
      id: "04",
      title: "Cloud & QA Operations",
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
      skills: ["AWS Cloud Infrastructure", "Git / GitHub", "Postman API Testing", "Software Testing (QA)", "Agile / Scrum Workflows", "SDLC", "Jira / Asana"]
    }
  ];

  return (
    <section id="skills" className="py-24 relative bg-bg-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/5 border border-accent-blue/10 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-[10px] tracking-widest text-accent-blue uppercase">CORE_ENGINE_CAPABILITIES</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Technical Infrastructure</h2>
          <p className="text-text-secondary text-sm max-w-xl">
            A comprehensive matrix of core programming environments, runtime layers, and automation capabilities validated across active deployments.
          </p>
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillCategories.map((category) => (
            <div 
              key={category.id} 
              className="p-6 rounded-2xl bg-card-dark border border-white/5 hover:border-white/10 transition-all duration-300 relative group overflow-hidden"
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
                    className="px-3 py-2 rounded-xl bg-white/[0.01] border border-white/5 font-mono text-xs text-text-secondary hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200"
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