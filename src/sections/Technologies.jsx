import { useState } from 'react';

const Technologies = () => {
  const [activeTab, setActiveTab] = useState('all');

  const techStack = [
    { name: "JavaScript (ES6+)", category: "languages", layer: "CORE_LOGIC", status: "OPTIMIZED", color: "text-amber-400 border-amber-500/25 bg-amber-500/5" },
    { name: "TypeScript", category: "languages", layer: "TYPE_SAFETY", status: "STABLE", color: "text-blue-400 border-blue-500/25 bg-blue-500/5" },
    { name: "PHP", category: "languages", layer: "BACKEND_ENGINE", status: "STABLE", color: "text-indigo-400 border-indigo-500/25 bg-indigo-500/5" },
    { name: "C# (.NET)", category: "languages", layer: "COMPILED_LOGIC", status: "READY", color: "text-purple-400 border-purple-500/25 bg-purple-500/5" },
    { name: "HTML5 / CSS3", category: "languages", layer: "MARKUP_STYLE", status: "OPTIMIZED", color: "text-orange-400 border-orange-500/25 bg-orange-500/5" },
    { name: "SQL", category: "languages", layer: "DATA_QUERY", status: "STABLE", color: "text-sky-400 border-sky-500/25 bg-sky-500/5" },

    { name: "React.js", category: "frameworks", layer: "UI_COMPONENT", status: "ACTIVE", color: "text-accent-blue border-accent-blue/25 bg-accent-blue/5" },
    { name: "Next.js", category: "frameworks", layer: "FULLSTACK_FRAMEWORK", status: "ACTIVE", color: "text-slate-100 border-slate-500/25 bg-slate-500/5" },
    { name: "Angular", category: "frameworks", layer: "UI_FRAMEWORK", status: "ACTIVE", color: "text-rose-400 border-rose-500/25 bg-rose-500/5" },
    { name: "Node.js", category: "frameworks", layer: "RUNTIME_ENV", status: "ACTIVE", color: "text-emerald-400 border-emerald-400/25 bg-emerald-400/5" },
    { name: "Express.js", category: "frameworks", layer: "API_ROUTING", status: "ACTIVE", color: "text-neutral-300 border-neutral-500/25 bg-neutral-500/5" },
    { name: "NestJS", category: "frameworks", layer: "BACKEND_FRAMEWORK", status: "ACTIVE", color: "text-red-400 border-red-500/25 bg-red-500/5" },
    { name: "Tailwind CSS", category: "frameworks", layer: "UTILITY_STYLE", status: "STABLE", color: "text-cyan-400 border-cyan-400/25 bg-cyan-400/5" },
    { name: "Bootstrap", category: "frameworks", layer: "LAYOUT_STYLE", status: "STABLE", color: "text-purple-400 border-purple-400/25 bg-purple-400/5" },
    { name: "Sequelize ORM", category: "frameworks", layer: "DATA_MAPPING", status: "LOADED", color: "text-blue-400 border-blue-400/25 bg-blue-400/5" },

    { name: "MongoDB", category: "databases", layer: "DOCUMENT_DB", status: "ACTIVE", color: "text-green-400 border-green-500/25 bg-green-500/5" },
    { name: "PostgreSQL", category: "databases", layer: "RELATIONAL_DB", status: "STABLE", color: "text-sky-400 border-sky-400/25 bg-sky-400/5" },
    { name: "MySQL / MariaDB", category: "databases", layer: "RELATIONAL_DB", status: "STABLE", color: "text-teal-400 border-teal-400/25 bg-teal-400/5" },
    { name: "SQL Server", category: "databases", layer: "RELATIONAL_DB", status: "STABLE", color: "text-red-400 border-red-400/25 bg-red-400/5" },
    { name: "Supabase", category: "databases", layer: "BACKEND_AS_SERVICE", status: "ACTIVE", color: "text-emerald-400 border-emerald-400/25 bg-emerald-400/5" },

    { name: "Git & GitHub", category: "ops", layer: "VERSION_CTRL", status: "STABLE", color: "text-slate-300 border-slate-500/25 bg-slate-500/5" },
    { name: "JWT Auth", category: "ops", layer: "AUTH_TOKENS", status: "ACTIVE", color: "text-pink-400 border-pink-500/25 bg-pink-500/5" },
    { name: "Stripe", category: "ops", layer: "PAYMENTS", status: "ACTIVE", color: "text-indigo-300 border-indigo-400/25 bg-indigo-400/5" },
    { name: "Nodemailer / SMTP", category: "ops", layer: "EMAIL_DELIVERY", status: "ACTIVE", color: "text-amber-300 border-amber-400/25 bg-amber-400/5" },
    { name: "LiveKit Cloud", category: "ops", layer: "REALTIME_MEDIA", status: "ACTIVE", color: "text-violet-400 border-violet-400/25 bg-violet-400/5" },
    { name: "Zod", category: "ops", layer: "VALIDATION", status: "ACTIVE", color: "text-sky-300 border-sky-300/25 bg-sky-300/5" },
    { name: "pnpm Workspaces", category: "ops", layer: "MONOREPO_TOOL", status: "ACTIVE", color: "text-yellow-300 border-yellow-400/25 bg-yellow-400/5" },
    { name: "Vite Build Tool", category: "ops", layer: "COMPILATION", status: "OPTIMIZED", color: "text-yellow-400 border-yellow-400/25 bg-yellow-400/5" },
    { name: "Postman API Client", category: "ops", layer: "API_TESTING", status: "STABLE", color: "text-orange-400 border-orange-400/25 bg-orange-400/5" },
    { name: "OpenAPI / Swagger", category: "ops", layer: "DOCS_SCHEMA", status: "READY", color: "text-emerald-500 border-emerald-500/25 bg-emerald-500/5" },
    { name: "Jira / Asana", category: "ops", layer: "AGILE_FLOW", status: "MONITORED", color: "text-blue-500 border-blue-500/25 bg-blue-500/5" }
  ];

  const categories = [
    { id: 'all', name: 'ALL_SYSTEMS' },
    { id: 'languages', name: 'CORE_LANGUAGES' },
    { id: 'frameworks', name: 'ENV_FRAMEWORKS' },
    { id: 'databases', name: 'DATA_LAYERS' },
    { id: 'ops', name: 'TOOLS_&_PLATFORMS' }
  ];

  const filteredTech = activeTab === 'all'
    ? techStack
    : techStack.filter(t => t.category === activeTab);

  return (
    <section id="technologies" className="py-24 relative section-panel">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header Block */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="section-label">Stack Mahmoud uses</div>
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Technologies & Tools</h2>
            <p className="text-text-secondary text-sm max-w-xl">
              Languages, frameworks, databases, and delivery tools used across Mahmoud's portfolio projects.
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px] bg-card-dark/60 p-1.5 rounded-lg border border-white/10 backdrop-blur-sm self-start xl:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 py-2 rounded-lg transition-all duration-300 uppercase tracking-wider cursor-pointer ${
                  activeTab === cat.id
                    ? "bg-accent-gold text-bg-dark font-bold shadow-md"
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
          {filteredTech.map((tech) => (
            <div
              key={tech.name}
              className="p-5 rounded-lg bg-card-dark/70 border border-white/10 hover:border-accent-gold/30 transition-all duration-300 flex flex-col justify-between font-mono relative overflow-hidden group min-h-[110px]"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-accent-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between gap-4">
                <span className="text-text-primary font-bold text-sm tracking-wide font-sans group-hover:text-accent-blue transition-colors">{tech.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tech.color}`}>
                  {tech.status}
                </span>
              </div>

              {/* Clean System Logs Instead of Progress Bars */}
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/[0.03]">
                <span className="text-[10px] text-text-secondary/40 tracking-wider uppercase">
                  // {tech.layer}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-accent-blue/50 group-hover:bg-accent-blue transition-colors" />
                  <span className="text-[10px] text-text-secondary/60">SYS_READY</span>
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
