/* Canonical portfolio content.
   Shared by:
   - the React app (src/data/portfolio.ts re-exports from here as seed fallback)
   - the server seed script (server/prisma/seed.ts imports from here)

   Single source of truth for the data migrated into PostgreSQL. */

export const profileData = {
  id: "profile-main",
  name: "Mahmoud Hussein Abdul Ghani",
  shortName: "Mahmoud Abdul Ghani",
  title: "Junior Full-Stack Software Engineer",
  tagline: "Building full-stack products for real workflows.",
  bio: "Software engineer crafting responsive React and Angular interfaces backed by Node.js and NestJS APIs, MongoDB and Supabase data layers, and real-time communication — through collaborative engineering at The Digital Hub by UNRWA. I care about secure authentication, clean APIs, responsive interfaces, and software that stays understandable after launch.",
  location: "Tripoli, Lebanon",
  email: "Mahmoud.Abdulghani@outlook.com",
  phone: "+961 76 364 340",
  photo: "/myphoto.jpeg",
  resumeUrl: null,
  languages: "Arabic (Native), English (Fluent)",
  experience: [
    {
      milestone: "Full-Stack Developer",
      facility: "The Digital Hub by UNRWA",
      role: "Full-Stack Developer",
      company: "The Digital Hub by UNRWA",
      startDate: "2026-05",
      endDate: null,
      isCurrent: true,
      location: null,
      meta: "2026-05 – Present",
      details:
        "Collaborative full-stack development across three shipped products: GameZone Arena (Next.js, TypeScript, MongoDB, Stripe), Lobby (Angular, NestJS, Supabase, LiveKit) and UniHub (React, Node.js, Express, MongoDB).",
    },
    {
      milestone: "Backend Developer",
      facility: "Ishtari Group",
      role: "Backend Developer",
      company: "Ishtari Group",
      startDate: "2025-12",
      endDate: "2026-02",
      isCurrent: false,
      location: null,
      meta: "2025-12 – 2026-02",
      details:
        "Built and updated PHP MVC modules, worked with relational database schemas, and wrote SQL queries for production admin systems.",
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
  { name: "React.js", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Angular", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Responsive Design", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "Express.js", category: "Backend" },
  { name: "NestJS", category: "Backend" },
  { name: "PHP", category: "Backend" },
  { name: "REST APIs", category: "Backend" },
  { name: "JWT Authentication", category: "Backend" },
  { name: "Role-Based Access (RBAC)", category: "Backend" },
  { name: "Real-time Systems", category: "Backend" },
  { name: "MongoDB", category: "Data" },
  { name: "PostgreSQL", category: "Data" },
  { name: "MySQL / MariaDB", category: "Data" },
  { name: "Supabase", category: "Data" },
  { name: "Database Design", category: "Data" },
  { name: "Parameterized SQL", category: "Data" },
  { name: "Git / GitHub", category: "Tools" },
  { name: "Stripe", category: "Tools" },
  { name: "Nodemailer / SMTP", category: "Tools" },
  { name: "LiveKit", category: "Tools" },
  { name: "Zod", category: "Tools" },
  { name: "Postman", category: "Tools" },
  { name: "Agile / Scrum", category: "Tools" },
  { name: "OpenAPI / Swagger", category: "Tools" },
];

export const projectsData = [
  {
    slug: "gamezone-arena",
    name: "GameZone Arena",
    type: "Gaming arena reservation",
    tagline: "Live availability, online bookings and payments for a gaming arena.",
    description:
      "Full-stack reservation platform that replaces manual booking — calls, messages and front-desk coordination — with live room and device availability, online bookings and payments.",
    overview:
      "A reservation system for a gaming arena that lets customers see live room and device availability, book time slots, and pay online — while staff manage everything from a single admin command center.",
    problem:
      "Bookings happened over calls and messages, coordinated by front-desk staff. Double-bookings, missed payments and manual availability checks made scheduling slow and error-prone.",
    solution:
      "GameZone Arena digitizes the whole flow: a five-gate auth flow, time-slot conflict detection to prevent overlapping bookings, Stripe and cash-at-desk payments with admin approval, and an admin command center for full control.",
    features: [
      "Five-gate auth flow: registration → OTP → verification → JWT → protected routes",
      "Time-slot conflict detection prevents overlapping room and device bookings",
      "Stripe card and cash-at-desk payments with admin approval, loyalty rewards and no-show policy",
      "Admin command center for rooms, devices, bookings, payments, users and reports",
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "MongoDB", "JWT + OTP", "Stripe", "Nodemailer / SMTP"],
    team: ["Haya Shinini", "Omar Assaad", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub by UNRWA",
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
      "Full-stack real-time communication platform where authenticated users keep a persistent identity across communities, servers and channels, while guests join temporary rooms through invitation links.",
    overview:
      "Lobby is a real-time communication platform built as a TypeScript monorepo. Authenticated users move across communities, servers and channels with a persistent identity, while guests join temporary rooms through invitation links.",
    problem:
      "Existing platforms made it hard to mix persistent, structured communities with quick, ephemeral drop-in sessions for guests.",
    solution:
      "Lobby combines both: authenticated users with persistent identities across servers and channels, plus guest access to temporary rooms via invitation links — with real-time messaging, audio and screen sharing over LiveKit Cloud.",
    features: [
      "Authenticated users: persistent identity, communities, servers and channels",
      "Guest access to temporary rooms through invitation links",
      "Real-time messaging, audio and screen sharing via LiveKit Cloud",
      "TypeScript monorepo (pnpm workspaces) with shared contracts across frontend and backend",
    ],
    stack: ["Angular 22", "NestJS 11", "Supabase", "LiveKit Cloud", "TypeScript", "Tailwind CSS", "Zod", "pnpm Workspaces"],
    team: ["Ahmad Khalaf", "Bissan Al Miari", "Mohamad El Mawed", "Mohammad Hajeer", "Nireez Al Sweidan", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub by UNRWA",
    github: null,
    demo: "https://lobby-hub.vercel.app/",
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
      "Full-stack system centralizing university operations through dedicated portals for students, professors and administrators — from enrollment and submissions to grading and approvals.",
    overview:
      "UniHub centralizes university operations in one system, with role-specific portals: students enroll in courses, submit assignments and track attendance and grades; professors manage courses, exams, grading and announcements; administrators handle users, approvals and platform administration.",
    problem:
      "University workflows were scattered across channels — enrollment, submissions, grading and approvals lived in different places with no shared record.",
    solution:
      "UniHub brings them together behind a JWT-protected REST API with role-based access control, giving each role a dedicated portal over the same data.",
    features: [
      "Student portal: course enrollment, assignment submission, attendance and grades",
      "Professor portal: course management, assignments, exams, grading and announcements",
      "Admin portal: user management, approvals and platform administration",
      "JWT-protected REST API with role-based access control",
    ],
    stack: ["React", "Node.js", "Express.js", "MongoDB", "REST APIs", "JWT Auth", "Tailwind CSS"],
    team: ["Abdulaziz Al Sayyed", "Nada Alahmad", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub by UNRWA",
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
    degree: "Bachelor's Degree in Computer Science",
    field: null,
    period: "10/2022 – 06/2025",
    details: "Tripoli, Lebanon · Cumulative GPA 3.30 / 4.00",
    order: 1,
  },
];

export const certificationsData = [
  {
    id: "cert-1",
    title: "Software Engineering Internship",
    issuer: "The Digital Hub (UNRWA Training Program)",
    year: "2026 – Present",
    url: null,
    order: 1,
  },
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
    year: "80 Days",
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
