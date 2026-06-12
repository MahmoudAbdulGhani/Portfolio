import ProjectCard from "../components/ProjectCard";

const Projects = () => {
  const engineeringProjects = [
    {
      name: "Medicare Hub",
      stack: ["HTML5", "CSS3", "Bootstrap", "JavaScript", "Email Integration", "AWS SNS Alerts"],
      description: "An advanced, feature-rich medical clinic dashboard system designed to optimize doctor schedules and handle user health requests. Built with an intricate frontend engine featuring client-side routing logic, automated booking matrices, and scalable cloud notification channels.",
      features: [
        "Integrated transactional mail mechanisms for continuous automated user appointment updates.",
        "Engineered AWS SNS broadcast hooks to process immediate emergency SMS routes safely.",
        "Complex calendar checking matching multi-specialty clinical fields cleanly without scheduling overlapping errors."
      ],
      github: "https://github.com/MahmoudAbdulGhani/Clinic-management-system",
      demo: "https://clinic-management-system.kesug.com/" // Pointed to repository fallback cleanly
    },
    {
      name: "Home Services Web Application",
      stack: ["React.js", "Vite", "Tailwind CSS", "Component Architecture", "Agile Deployment"],
      description: "A production-grade modern marketplace application developed during my Software Engineering Internship at The Digital Hub. Built following strict SDLC workflows to turn complex Figma designs into responsive layout components.",
      features: [
        "Architected reusable responsive UI components within React, minimizing system redundancy levels.",
        "Implemented clean flexible layout configurations using Tailwind CSS to adjust cleanly across phone, desktop, and tablet screens.",
        "Managed active data layers using React hooks to maintain predictable state changes through service steps."
      ],
      github: "https://github.com/MahmoudAbdulGhani/home-services",
      demo: "https://home-services-coral.vercel.app/"
    },
    {
      name: "Phone Store E-Commerce System",
      stack: ["PHP (MVC)", "JavaScript", "MySQL", "CSS3", "Session Authentication"],
      description: "A complete full-stack web storefront platform integrated with custom relational database schemas to safely process mobile product inventories, cart states, and administrative catalogs.",
      features: [
        "Designed normalized SQL indexing rules to support high-speed processing of product tables.",
        "Built a modular PHP Model-View-Controller framework containing object parsing blocks and secure authentication layers.",
        "Shielded input parameters with parameterized SQL statements to safeguard database communication hooks entirely."
      ],
      github: "https://github.com/MahmoudAbdulGhani/Phone-Store-Website",
      demo: null
    },
    {
      name: "Doctor's Appointments Desktop App",
      stack: ["C#", ".NET Windows Forms", "SQL Server", "Relational Architecture"],
      description: "A structured administrative desktop client system created to handle patient chart entries, complex scheduling tracking, and historical audit reporting metrics.",
      features: [
        "Wrote highly optimized stored procedures inside SQL Server to process rapid concurrent table additions.",
        "Crafted role management dashboard logic to divide operator privileges cleanly between system agents and medical managers.",
        "Employed strict multi-table relational structures protecting database data consistency metrics completely."
      ],
      github: "https://github.com/MahmoudAbdulGhani/Doctor-Appointment-App",
      demo: null
    }
  ];

  return (
    <section id="projects" className="py-24 relative bg-bg-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/5 border border-accent-purple/10 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
            <span className="text-[10px] tracking-widest text-accent-purple uppercase">PRODUCTION_DEPLOYMENTS</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Engineering Projects</h2>
          <p className="text-text-secondary text-sm max-w-xl">
            A verified directory of operational systems built with clean interface logic, reliable data engines, and managed cloud channels.
          </p>
        </div>

        {/* Refactored to leverage modular ProjectCard components cleanly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {engineeringProjects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Projects;