import ProjectCard from "../components/ProjectCard";

const Projects = () => {
  const engineeringProjects = [
    {
      name: "Medicare Hub",
      type: "Healthcare dashboard",
      stack: ["HTML5", "CSS3", "Bootstrap", "JavaScript", "Email Integration", "AWS SNS Alerts"],
      description: "A medical clinic dashboard for doctor schedules, user health requests, booking logic, and automated communication channels.",
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
      type: "Marketplace frontend",
      stack: ["React.js", "Vite", "Tailwind CSS", "Component Architecture", "Agile Deployment"],
      description: "A modern marketplace interface developed during Mahmoud's Software Engineering Internship at The Digital Hub.",
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
      type: "Full-stack commerce",
      stack: ["PHP (MVC)", "JavaScript", "MySQL", "CSS3", "Session Authentication"],
      description: "A complete storefront platform with custom database schemas for inventory, cart state, sessions, and admin catalog control.",
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
      type: "Desktop scheduling",
      stack: ["C#", ".NET Windows Forms", "SQL Server", "Relational Architecture"],
      description: "An administrative desktop app for patient entries, scheduling, role access, and SQL Server reporting workflows.",
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
    <section id="projects" className="py-24 relative section-panel">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="space-y-2 mb-12">
          <div className="section-label">Selected project proof</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Built around Mahmoud's actual work</h2>
          <p className="text-text-secondary text-sm max-w-xl">
            Four concrete systems showing frontend delivery, backend structure, database thinking, and QA-aware implementation.
          </p>
        </div>

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
