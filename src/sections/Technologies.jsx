import { useState } from 'react';

const Technologies = () => {
  const [activeTab, setActiveTab] = useState('all');

  const techStack = [
    { name: "JavaScript (ES6+)", category: "languages", level: "95%", status: "OPTIMIZED", color: "text-amber-400 border-amber-500/25 bg-amber-500/5" },
    { name: "TypeScript", category: "languages", level: "85%", status: "STABLE", color: "text-blue-400 border-blue-500/25 bg-blue-500/5" },
    { name: "PHP", category: "languages", level: "90%", status: "STABLE", color: "text-indigo-400 border-indigo-500/25 bg-indigo-500/5" },
    { name: "C# (.NET)", category: "languages", level: "80%", status: "READY", color: "text-purple-400 border-purple-500/25 bg-purple-500/5" },
    { name: "HTML5 / CSS3", category: "languages", level: "95%", status: "OPTIMIZED", color: "text-orange-400 border-orange-500/25 bg-orange-500/5" },
    { name: "SQL", category: "languages", level: "90%", status: "STABLE", color: "text-sky-400 border-sky-500/25 bg-sky-500/5" },
    
    { name: "React.js", category: "frameworks", level: "95%", status: "ACTIVE", color: "text-accent-blue border-accent-blue/25 bg-accent-blue/5" },
    { name: "Angular", category: "frameworks", level: "85%", status: "LOADED", color: "text-rose-400 border-rose-500/25 bg-rose-500/5" },
    { name: "Node.js", category: "frameworks", level: "90%", status: "ACTIVE", color: "text-emerald-400 border-emerald-400/25 bg-emerald-400/5" },
    { name: "Express.js", category: "frameworks", level: "90%", status: "ACTIVE", color: "text-neutral-300 border-neutral-500/25 bg-neutral-500/5" },
    { name: "Tailwind CSS", category: "frameworks", level: "95%", status: "STABLE", color: "text-cyan-400 border-cyan-400/25 bg-cyan-400/5" },
    { name: "Bootstrap", category: "frameworks", level: "95%", status: "STABLE", color: "text-purple-400 border-purple-400/25 bg-purple-400/5" },
    { name: "Sequelize ORM", category: "frameworks", level: "85%", status: "LOADED", color: "text-blue-400 border-blue-400/25 bg-blue-400/5" },

    { name: "AWS Cloud Infrastructure", category: "ops", level: "85%", status: "VERIFIED", color: "text-amber-500 border-amber-500/25 bg-amber-500/5" },
    { name: "Git & GitHub", category: "ops", level: "95%", status: "STABLE", color: "text-slate-300 border-slate-500/25 bg-slate-500/5" },
    { name: "Postman API Client", category: "ops", level: "90%", status: "STABLE", color: "text-orange-400 border-orange-400/25 bg-orange-400/5" },
    { name: "Jira / Asana", category: "ops", level: "85%", status: "MONITORED", color: "text-blue-500 border-blue-500/25 bg-blue-500/5" },
    { name: "OpenAPI / Swagger", category: "ops", level: "80%", status: "READY", color: "text-emerald-500 border-emerald-500/25 bg-emerald-500/5" },
    { name: "Vite Build Tool", category: "ops", level: "90%", status: "OPTIMIZED", color: "text-yellow-400 border-yellow-400/25 bg-yellow-400/5" }
  ];

  const categories = [
    { id: 'all', name: 'ALL_SYSTEMS' },
    { id: 'languages', name: 'CORE_LANGUAGES' },
    { id: 'frameworks', name: 'ENV_FRAMEWORKS' },
    { id: 'ops', name: 'CLOUD_QA_OPS' }
  ];

  const filteredTech = activeTab === 'all' 
    ? techStack 
    : techStack.filter(t => t.category === activeTab);

  return (
    <section id="technologies" className="py-24 relative bg-bg-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] tracking-widest text-emerald-400 uppercase">STACK_TELEMETRY_LOGS</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Technologies & Tools</h2>
            <p className="text-text-secondary text-sm max-w-xl">
              Live efficiency map of languages, compilation tools, and frameworks verified across full-stack applications.
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px] bg-card-dark/60 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm self-start xl:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 py-2 rounded-lg transition-all duration-300 uppercase tracking-wider cursor-pointer ${
                  activeTab === cat.id
                    ? "bg-gradient-to-r from-accent-blue to-accent-purple text-bg-dark font-bold shadow-md"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTech.map((tech, index) => (
            <div 
              key={index}
              className="p-5 rounded-xl bg-card-dark/40 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between font-mono relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-accent-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between gap-4">
                <span className="text-text-primary font-bold text-sm tracking-wide font-sans">{tech.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tech.color}`}>
                  {tech.status}
                </span>
              </div>

              {/* Status Performance Bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-text-secondary/50">
                  <span>COMPILING_EFFICIENCY</span>
                  <span className="text-text-primary font-bold">{tech.level}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-500 ease-out" 
                    style={{ width: tech.level }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Technologies;