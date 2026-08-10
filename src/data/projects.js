export const projects = [
  {
    name: "GameZone Arena",
    type: "Gaming arena reservation",
    featured: true,
    team: ["Haya Shinini", "Omar Assaad", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub by UNRWA",
    description:
      "Full-stack reservation platform that replaces manual booking — calls, messages and front-desk coordination — with live room and device availability, online bookings and payments.",
    features: [
      "Five-gate auth flow: registration → OTP → verification → JWT → protected routes",
      "Time-slot conflict detection prevents overlapping room and device bookings",
      "Stripe card and cash-at-desk payments with admin approval, loyalty rewards and no-show policy",
      "Admin command center for rooms, devices, bookings, payments, users and reports",
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "MongoDB", "JWT + OTP", "Stripe", "Nodemailer / SMTP"],
    github: "https://github.com/MahmoudAbdulGhani/Gaming-Arena-Reservation-System",
    demo: "https://gaming-arena-reservation-system.vercel.app/",
  },
  {
    name: "Lobby",
    type: "Real-time communication platform",
    featured: true,
    team: ["Ahmad Khalaf", "Bissan Al Miari", "Mohamad El Mawed", "Mohammad Hajeer", "Nireez Al Sweidan", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub by UNRWA",
    description:
      "Full-stack real-time communication platform where authenticated users keep a persistent identity across communities, servers and channels, while guests join temporary rooms through invitation links.",
    features: [
      "Authenticated users: persistent identity, communities, servers and channels",
      "Guest access to temporary rooms through invitation links",
      "Real-time messaging, audio and screen sharing via LiveKit Cloud",
      "TypeScript monorepo (pnpm workspaces) with shared contracts across frontend and backend",
    ],
    stack: ["Angular 22", "NestJS 11", "Supabase", "LiveKit Cloud", "TypeScript", "Tailwind CSS", "Zod", "pnpm Workspaces"],
    github: null,
    demo: "https://lobby-hub.vercel.app/",
  },
  {
    name: "UniHub",
    type: "University management system",
    featured: true,
    team: ["Abdulaziz Al Sayyed", "Nada Alahmad", "Mahmoud Abdul Ghani"],
    program: "The Digital Hub by UNRWA",
    description:
      "Full-stack system centralizing university operations through dedicated portals for students, professors and administrators — from enrollment and submissions to grading and approvals.",
    features: [
      "Student portal: course enrollment, assignment submission, attendance and grades",
      "Professor portal: course management, assignments, exams, grading and announcements",
      "Admin portal: user management, approvals and platform administration",
      "JWT-protected REST API with role-based access control",
    ],
    stack: ["React", "Node.js", "Express.js", "MongoDB", "REST APIs", "JWT Auth", "Tailwind CSS"],
    github: "https://github.com/MahmoudAbdulGhani/university-management-system",
    demo: "https://university-management-system-three-fawn.vercel.app/login",
  },
  {
    name: "Medicare Hub",
    type: "Clinic management system",
    description:
      "Web platform for clinic operations — patient records, doctor schedules, specialty appointments and role-based staff workflows for admins, doctors, receptionists and pharmacists.",
    features: [
      "Appointment booking and confirmation across medical specialties",
      "Role-based dashboards covering patients, doctors, receptionists and pharmacy",
      "Password recovery with emailed OTP codes and PHPMailer notifications",
    ],
    stack: ["PHP", "MySQL", "Bootstrap", "JavaScript", "PHPMailer"],
    github: "https://github.com/MahmoudAbdulGhani/Clinic-management-system",
    demo: "https://clinic-management-system.kesug.com/",
  },
  {
    name: "Home Services",
    type: "Responsive web application",
    description:
      "Responsive home-services landing page built from a Figma design during the Digital Hub internship — pixel-faithful layouts composed from reusable React components.",
    features: [
      "Pixel-perfect implementation of a professional Figma UI kit",
      "Responsive across desktop, tablet and mobile with mobile sidebar navigation",
      "Component-based React architecture styled with Tailwind CSS",
    ],
    stack: ["React", "Vite", "Tailwind CSS", "JavaScript", "Responsive Design"],
    github: "https://github.com/MahmoudAbdulGhani/home-services",
    demo: "https://home-services-coral.vercel.app/",
  },
  {
    name: "Phone Store",
    type: "Full-stack e-commerce",
    description:
      "Storefront with product browsing, cart, session handling and admin catalog management built on a custom PHP MVC structure with a MySQL database.",
    features: [
      "Product catalog, search and cart managed through PHP sessions",
      "Admin catalog control with inventory management",
      "Parameterized SQL queries to protect database communication",
    ],
    stack: ["PHP", "MySQL", "JavaScript", "CSS3", "Session Auth"],
    github: "https://github.com/MahmoudAbdulGhani/Phone-Store-Website",
    demo: null,
  },
];
