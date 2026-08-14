import {
  certificationsData,
  educationData,
  profileData,
  projectsData,
  skillsData,
  technologiesData,
} from "../../shared/portfolio-data";
import type {
  AnalyticsSummary,
  AuthUser,
  Certification,
  Education,
  Message,
  Profile,
  Project,
  Skill,
  Technology,
} from "../types";

/* The canonical portfolio content lives in shared/portfolio-data.ts and is
   migrated into PostgreSQL by the server seed script. The React app re-exports
   it here so the public site can render instantly and fall back gracefully if
   the API is unreachable. */

// Public experience is intentionally never sourced from the static profile copy.
export const seedProfile = { ...profileData, experience: [] } as Profile;
export const seedTechnologies = technologiesData as Technology[];
export const seedSkills = skillsData as Skill[];
export const seedProjects = projectsData as Project[];
export const seedEducation = educationData as Education[];
export const seedCertifications = certificationsData as Certification[];

/* ------------------------------------------------------------------ */
/*  Demo data (frontend fallbacks only — not seeded to the database)   */
/* ------------------------------------------------------------------ */

export const seedMessages: Message[] = [
  {
    id: "msg-1",
    name: "Rana Haddad",
    email: "rana.haddad@gmail.com",
    subject: "Frontend internship",
    message:
      "Hi Mahmoud! I saw the GameZone Arena project and loved the booking flow. We have an opening for a junior frontend developer at our studio — would you be open to talking this week?",
    read: false,
    createdAt: "2025-07-28T15:22:00.000Z",
  },
  {
    id: "msg-2",
    name: "Omar Farah",
    email: "omar@startup.co",
    subject: "Freelance full-stack work",
    message:
      "Your work on the real-time Lobby platform is impressive. We need a full-stack developer for a 6-week contract building a similar product. Are you available next month?",
    read: false,
    createdAt: "2025-07-24T09:10:00.000Z",
  },
  {
    id: "msg-3",
    name: "Layal Nassar",
    email: "layal.n@hiring.firm",
    subject: "Junior role at a fintech startup",
    message:
      "We reviewed your GitHub and like the UniHub architecture — clean REST APIs and RBAC. We have a junior full-stack role open. Would you be open to an intro call?",
    read: true,
    createdAt: "2025-07-15T18:45:00.000Z",
  },
];

export const seedAuthUser: AuthUser = {
  id: "user-1",
  email: "Mahmoud.Abdulghani@outlook.com",
  name: "Mahmoud Abdul Ghani",
};

export const seedAnalytics: AnalyticsSummary = {
  totalProjects: seedProjects.length,
  publishedProjects: seedProjects.filter((p) => p.published).length,
  totalSkills: seedSkills.length,
  unreadMessages: seedMessages.filter((m) => !m.read).length,
  totalViews: 12842,
  viewsByProject: [
    { name: "GameZone Arena", slug: "gamezone-arena", views: 4150 },
    { name: "Lobby", slug: "lobby", views: 3180 },
    { name: "UniHub", slug: "unihub", views: 2870 },
    { name: "Medicare Hub", slug: "medicare-hub", views: 1340 },
    { name: "Home Services", slug: "home-services", views: 780 },
    { name: "Phone Store", slug: "phone-store", views: 522 },
  ],
  recentMessages: seedMessages,
};

export const seedData = {
  profile: seedProfile,
  technologies: seedTechnologies,
  skills: seedSkills,
  projects: seedProjects,
  messages: seedMessages,
  analytics: seedAnalytics,
};
