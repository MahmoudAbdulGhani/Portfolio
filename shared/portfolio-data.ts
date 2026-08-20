/* Canonical portfolio content.
   Shared by:
   - the React app (src/data/portfolio.ts re-exports from here as seed fallback)
   - the server seed script (server/prisma/seed.ts imports from here)

   Single source of truth for the data migrated into PostgreSQL. */

export const profileData = {
  id: "profile-main",
  name: "Mahmoud Hussein Abdul Ghani",
  shortName: "Mahmoud Abdul Ghani",
  title: "Full-Stack Software Engineer",
  tagline: "Building secure, scalable, and user-focused web applications.",
  bio: "Computer science graduate and full-stack software engineer with professional PHP backend experience at Ishtari Group and collaborative product experience through The Digital Hub by UNRWA. I build responsive interfaces, secure APIs, and database-backed applications with React, Next.js, TypeScript, Node.js, Express.js, Python frameworks, MongoDB, and SQL technologies. My current projects also include testing, CI/CD, and practical AI API integrations.",
  location: "Tripoli, Lebanon",
  email: "Mahmoud.Abdulghani@outlook.com",
  phone: "+961 76 364 340",
  photo: "/myphoto.jpeg",
  resumeUrl: null,
  portfolioUrl: null,
  seoTitle: "Mahmoud Hussein Abdul Ghani | Full-Stack Software Engineer",
  seoDescription: "Portfolio of Mahmoud Hussein Abdul Ghani, a full-stack software developer building secure React, Next.js, TypeScript, Node.js, Express.js, MongoDB, and SQL applications.",
  languages: "Arabic (Native), English (Fluent)",
  experience: [
    {
      milestone: "Full-Stack Developer Intern",
      facility: "The Digital Hub by UNRWA",
      role: "Full-Stack Developer Intern",
      company: "The Digital Hub by UNRWA",
      startDate: "2026-05",
      endDate: null,
      isCurrent: true,
      location: "Remote",
      meta: "2026-05 – Present",
      details:
        "Completing an intensive full-stack software engineering and AI program focused on modern architecture and production-ready applications. Developing type-safe React and Next.js applications and REST APIs; implementing secure SQL and NoSQL data layers, testing, AI integrations, and documented deployments in Agile teams.",
    },
    {
      milestone: "Backend Developer",
      facility: "Ishtari Group",
      role: "Backend Developer",
      company: "Ishtari Group",
      startDate: "2025-12",
      endDate: "2026-01",
      isCurrent: false,
      location: "Tripoli, Lebanon",
      meta: "2025-12 – 2026-01",
      details:
        "Developed PHP MVC modules for production administration systems, including search, filtering, pagination, reporting, and AJAX-driven interfaces. Wrote MySQL and MariaDB queries for product, category, order, cost, price, and profit reporting.",
    },
    {
      milestone: "QA Intern",
      facility: "Oigetit",
      role: "QA Intern",
      company: "Oigetit",
      startDate: "2026-05",
      endDate: "2026-08",
      isCurrent: false,
      location: null,
      meta: "2026-05 – 2026-08",
      details:
        "Tested application flows, documented bugs, and used logs to help identify and reproduce failures.",
    },
    {
      milestone: "Web Development Trainer",
      facility: "KfW & EU Graduate Support Program · FALA Association",
      role: "Web Development Trainer",
      company: "KfW & EU Graduate Support Program · FALA Association",
      startDate: "2025-04",
      endDate: "2025-06",
      isCurrent: false,
      location: null,
      meta: "2025-04 – 2025-06",
      details:
        "Mentored developers on procedural engineering logic, component workflows, and industry-standard deployment structures.",
    },
  ],
  socials: [
    {
      id: "social-1",
      label: "GitHub",
      url: "https://github.com/MahmoudAbdulGhani",
    },
    {
      id: "social-2",
      label: "LinkedIn",
      url: "https://linkedin.com/in/MahmoudAbdulGhani",
    },
    {
      id: "social-3",
      label: "Instagram",
      url: "https://www.instagram.com/mahmoud_abdulghani2",
    },
    {
      id: "social-4",
      label: "WhatsApp",
      url: "https://wa.me/96176364340?text=Hello%20Mahmoud%2C%20I%20saw%20your%20portfolio.",
    },
  ],
};

export const technologiesData = [
  { name: "JavaScript (ES6+)", category: "languages" },
  { name: "TypeScript", category: "languages" },
  { name: "PHP", category: "languages" },
  { name: "C# (.NET)", category: "languages" },
  { name: "HTML5 / CSS3", category: "languages" },
  { name: "SQL", category: "languages" },
  { name: "React.js", category: "frameworks" },
  { name: "Next.js", category: "frameworks" },
  { name: "Angular", category: "frameworks" },
  { name: "Node.js", category: "frameworks" },
  { name: "Express.js", category: "frameworks" },
  { name: "NestJS", category: "frameworks" },
  { name: "Tailwind CSS", category: "frameworks" },
  { name: "Bootstrap", category: "frameworks" },
  { name: "Sequelize ORM", category: "frameworks" },
  { name: "MongoDB", category: "databases" },
  { name: "PostgreSQL", category: "databases" },
  { name: "MySQL / MariaDB", category: "databases" },
  { name: "SQL Server", category: "databases" },
  { name: "Supabase", category: "databases" },
  { name: "Git & GitHub", category: "ops" },
  { name: "JWT Auth", category: "ops" },
  { name: "Stripe", category: "ops" },
  { name: "Nodemailer / SMTP", category: "ops" },
  { name: "LiveKit Cloud", category: "ops" },
  { name: "Zod", category: "ops" },
  { name: "pnpm Workspaces", category: "ops" },
  { name: "Vite Build Tool", category: "ops" },
  { name: "Postman API Client", category: "ops" },
  { name: "OpenAPI / Swagger", category: "ops" },
  { name: "Jira / Asana", category: "ops" },
];

export const skillsData = [
  ...["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", "React.js", "Next.js", "Zustand", "TanStack Query", "Angular", "Tailwind CSS", "Responsive Design"].map((name) => ({ name, category: "Frontend", status: "verified" })),
  ...["Node.js", "Express.js", "Python", "FastAPI", "Django", "Django REST Framework", "NestJS", "PHP", "RESTful APIs"].map((name) => ({ name, category: "Backend", status: "verified" })),
  ...["MySQL", "MongoDB", "Mongoose", "SQL", "NoSQL", "MariaDB", "PostgreSQL", "Supabase"].map((name) => ({ name, category: "Databases", status: "verified" })),
  ...["JWT", "Authentication & Authorization", "RBAC", "Secure Cookies", "OTP Verification", "Zod"].map((name) => ({ name, category: "Authentication & Security", status: "verified" })),
  ...["Jest", "Vitest", "Unit & Integration Testing", "Postman"].map((name) => ({ name, category: "Testing", status: "verified" })),
  ...["Git", "GitHub", "Branching", "Pull Requests", "Code Reviews", "GitHub Actions", "CI/CD", "Cloud Deployment", "Vercel", "Render"].map((name) => ({ name, category: "DevOps & Version Control", status: "verified" })),
  ...["Reusable Components", "REST API Architecture", "Real-time Systems", "Clean Architecture", "SOLID Principles", "Design Patterns", "Scalable System Design"].map((name) => ({ name, category: "Architecture", status: "verified" })),
  ...["LLMs", "Prompt Engineering", "AI API Integration", "Cognitive APIs"].map((name) => ({ name, category: "AI", status: "verified" })),
  ...["SSR", "CSR", "SSG", "ISR", "Core Web Vitals", "SEO"].map((name) => ({ name, category: "Web Performance & SEO", status: "verified" })),
];

export const projectsData = [
  {
    slug: "gamezone-arena",
    name: "GameZone Arena",
    type: "Gaming arena reservation",
    tagline: "Live availability, online bookings and payments for a gaming arena.",
    description:
      "Built a gaming-arena reservation platform with live availability and conflict detection to prevent overlapping room and device bookings, supported by OTP verification and JWT-protected routes.",
    overview:
      "A reservation system for a gaming arena that lets customers see live room and device availability, book time slots, and pay online — while staff manage everything from a single admin command center.",
    problem:
      "Bookings happened over calls and messages, coordinated by front-desk staff. Double-bookings, missed payments and manual availability checks made scheduling slow and error-prone.",
    solution:
      "GameZone Arena digitizes the whole flow: a five-gate auth flow, time-slot conflict detection to prevent overlapping bookings, Stripe and cash-at-desk payments with admin approval, and an admin command center for full control.",
    features: [
      "Registration with OTP verification followed by JWT-protected routes",
      "Time-slot conflict detection prevents overlapping room and device bookings",
      "Stripe card and cash-at-desk payments with admin approval, loyalty rewards and no-show policy",
      "Admin command center for rooms, devices, bookings, payments, users and reports",
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "MongoDB", "Tailwind CSS", "JWT", "OTP", "Stripe"],
    team: ["Haya Shinini", "Omar Assaad", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub",
    myRole: "Full-Stack Developer (team project)",
    contributions: [
      "Collaborated on authenticated booking flows, reservation conflict prevention, and administrative workflows.",
      "Contributed to frontend and backend integration across bookings, payments, rooms, devices, and users.",
    ],
    ownership: "Collaborative three-person project; contributions are described without claiming sole ownership.",
    github: "https://github.com/MahmoudAbdulGhani/Gaming-Arena-Reservation-System",
    demo: "https://gaming-arena-reservation-system.vercel.app/",
    featured: true,
    published: true,
    visual: "#5966A0",
    order: 1,
  },
  {
    slug: "lobby",
    name: "Lobby",
    type: "Real-time communication platform",
    tagline: "Persistent communities, temporary guest rooms and live voice.",
    description:
      "Built a real-time communication platform supporting persistent communities, servers, channels, temporary guest rooms, invitation access, and live voice communication.",
    overview:
      "Lobby is a real-time communication platform built as a TypeScript monorepo. Authenticated users move across communities, servers and channels with a persistent identity, while guests join temporary rooms through invitation links.",
    problem:
      "Existing platforms made it hard to mix persistent, structured communities with quick, ephemeral drop-in sessions for guests.",
    solution:
      "Lobby combines both: authenticated users with persistent identities across servers and channels, plus guest access to temporary rooms via invitation links — with real-time messaging, audio and screen sharing over LiveKit Cloud.",
    features: [
      "Built a real-time communication platform with persistent communities, servers, channels, and temporary guest rooms",
      "Guest access to temporary rooms through invitation links",
      "Real-time messaging, audio and screen sharing via LiveKit Cloud",
      "TypeScript monorepo (pnpm workspaces) with shared contracts across frontend and backend",
    ],
    stack: ["Angular 22", "NestJS 11", "TypeScript", "Supabase", "LiveKit", "Tailwind CSS"],
    team: ["Ahmad Khalaf", "Bissan Al Miari", "Mohamad El Mawed", "Mohammad Hajeer", "Nireez Al Sweidan", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub",
    github: "https://github.com/Ahmad-khalaf517/lobby",
    demo: "https://lobby-hub.vercel.app/",
    myRole: "Full-Stack Developer (team project)",
    contributions: [
      "Collaborated on persistent community and temporary guest-room workflows in a TypeScript monorepo.",
      "Contributed to authenticated and guest access, invitation links, validation, and Supabase-backed services.",
    ],
    ownership: "Collaborative team project; feature descriptions represent team delivery, not sole ownership.",
    featured: true,
    published: true,
    visual: "#765D99",
    order: 2,
  },
  {
    slug: "unihub",
    name: "UniHub",
    type: "University management system",
    tagline: "Dedicated portals for students, professors and administrators.",
    description:
      "Developed role-based academic portals with JWT-protected workflows for course enrollment, assignments, attendance, grades, and announcements.",
    overview:
      "UniHub centralizes university operations in one system, with role-specific portals: students enroll in courses, submit assignments and track attendance and grades; professors manage courses, exams, grading and announcements; administrators handle users, approvals and platform administration.",
    problem:
      "University workflows were scattered across channels — enrollment, submissions, grading and approvals lived in different places with no shared record.",
    solution:
      "UniHub brings them together behind a JWT-protected REST API with role-based access control, giving each role a dedicated portal over the same data.",
    features: [
      "Developed role-based portals with JWT authentication and protected routes",
      "Professor portal: course management, assignments, exams, grading and announcements",
      "Admin portal: user management, approvals and platform administration",
      "JWT-protected REST API with role-based access control",
    ],
    stack: ["React", "Node.js", "Express.js", "MongoDB", "REST APIs", "JWT", "Tailwind CSS"],
    team: ["Abdulaziz Al Sayyed", "Nada Alahmad", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub",
    myRole: "Student Portal Contributor (team project)",
    contributions: [
      "Contributed to the student portal for course enrollment, assignment submission, attendance, and grade visibility.",
      "Integrated protected frontend workflows with the JWT-authenticated REST API.",
    ],
    ownership: "Collaborative three-person project; primary documented contribution was the student portal.",
    github: "https://github.com/MahmoudAbdulGhani/university-management-system",
    demo: "https://university-management-system-three-fawn.vercel.app/login",
    featured: true,
    published: true,
    visual: "#26879B",
    order: 3,
  },
  {
    slug: "medicare-hub",
    name: "Medicare Hub",
    type: "Clinic management system",
    tagline: "Patient records, schedules and role-based clinic workflows.",
    description:
      "Web platform for clinic operations — patient records, doctor schedules, specialty appointments and role-based staff workflows for admins, doctors, receptionists and pharmacists.",
    overview:
      "Medicare Hub supports day-to-day clinic operations: patient records, doctor schedules, specialty appointments, and role-based dashboards for admins, doctors, receptionists and pharmacists.",
    problem:
      "Clinics juggled appointments, schedules and records across paper and spreadsheets, with no clear separation of duties between roles.",
    solution:
      "Medicare Hub centralizes operations behind role-based dashboards and adds appointment booking and confirmation across medical specialties, plus password recovery with emailed OTP codes.",
    features: [
      "Appointment booking and confirmation across medical specialties",
      "Role-based dashboards covering patients, doctors, receptionists and pharmacy",
      "Password recovery with emailed OTP codes and PHPMailer notifications",
    ],
    stack: ["PHP", "MySQL", "Bootstrap", "JavaScript", "PHPMailer"],
    team: [],
    program: null,
    github: "https://github.com/MahmoudAbdulGhani/Clinic-management-system",
    demo: "https://clinic-management-system.kesug.com/",
    featured: false,
    published: true,
    visual: "#A8693F",
    order: 4,
  },
  {
    slug: "home-services",
    name: "Home Services",
    type: "Responsive web application",
    tagline: "A pixel-faithful landing page built from a Figma design.",
    description:
      "Responsive home-services landing page built from a Figma design during the Digital Hub internship — pixel-faithful layouts composed from reusable React components.",
    overview:
      "A responsive home-services landing page implemented pixel-by-pixel from a professional Figma UI kit, composed from reusable React components and styled with Tailwind CSS.",
    problem:
      "Translating a detailed Figma design into a responsive, maintainable implementation without losing fidelity across breakpoints.",
    solution:
      "Built the page from reusable React components, with responsive behavior across desktop, tablet and mobile and a mobile sidebar navigation.",
    features: [
      "Pixel-perfect implementation of a professional Figma UI kit",
      "Responsive across desktop, tablet and mobile with mobile sidebar navigation",
      "Component-based React architecture styled with Tailwind CSS",
    ],
    stack: ["React", "Vite", "Tailwind CSS", "JavaScript", "Responsive Design"],
    team: [],
    program: null,
    github: "https://github.com/MahmoudAbdulGhani/home-services",
    demo: "https://home-services-coral.vercel.app/",
    featured: false,
    published: true,
    visual: "#825C91",
    order: 5,
  },
  {
    slug: "phone-store",
    name: "Phone Store",
    type: "Full-stack e-commerce",
    tagline: "Storefront and admin catalog on a custom PHP MVC stack.",
    description:
      "Storefront with product browsing, cart, session handling and admin catalog management built on a custom PHP MVC structure with a MySQL database.",
    overview:
      "A full-stack e-commerce storefront with product browsing, search and a session-based cart, backed by a custom PHP MVC structure and a MySQL database, plus admin catalog control.",
    problem:
      "Needed a lightweight e-commerce storefront with an admin-managed catalog and safe database communication on a classic LAMP-style stack.",
    solution:
      "Built a custom PHP MVC application with parameterized SQL queries to protect database communication, session-based cart handling, and an admin catalog panel with inventory management.",
    features: [
      "Product catalog, search and cart managed through PHP sessions",
      "Admin catalog control with inventory management",
      "Parameterized SQL queries to protect database communication",
    ],
    stack: ["PHP", "MySQL", "JavaScript", "CSS3", "Session Auth"],
    team: [],
    program: null,
    github: "https://github.com/MahmoudAbdulGhani/Phone-Store-Website",
    demo: null,
    featured: false,
    published: false,
    visual: "#347F7B",
    order: 6,
  },
];

export const educationData = [
  {
    id: "education-1",
    school: "Lebanese International University (LIU)",
    degree: "Bachelor of Science in Computer Science",
    field: null,
    period: "10/2022 – 06/2025",
    details: null,
    order: 1,
  },
];

export const certificationsData = [
  {
    id: "cert-2",
    title: "Angular Self-Learning Course",
    issuer: "Self-Learning Program",
    year: "09/2025",
    url: null,
    order: 2,
  },
  {
    id: "cert-3",
    title: "AWS re/Start Bootcamp — Cloud Computing & DevOps Fundamentals",
    issuer: "Amazon Web Services",
    year: "Expected 2026",
    url: null,
    order: 3,
  },
  {
    id: "cert-4",
    title: "Full-Stack Web Development",
    issuer: "youbee.ai",
    year: "4 Months",
    url: null,
    order: 4,
  },
];
