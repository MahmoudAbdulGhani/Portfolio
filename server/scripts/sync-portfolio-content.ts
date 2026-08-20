import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { certificationsData, educationData, profileData, projectsData, skillsData } from "../../shared/portfolio-data";

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DIRECT_URL or DATABASE_URL is required.");
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

async function main() {
  const profile = await prisma.profile.update({
    where: { id: profileData.id },
    data: {
      name: profileData.name, shortName: profileData.shortName, title: profileData.title,
      tagline: profileData.tagline, bio: profileData.bio, location: profileData.location,
      email: profileData.email, phone: profileData.phone, languages: profileData.languages,
      portfolioUrl: process.env.PUBLIC_SITE_URL || profileData.portfolioUrl || undefined,
      seoTitle: profileData.seoTitle, seoDescription: profileData.seoDescription,
    },
  });

  for (const [order, item] of profileData.experience.slice(0, 2).entries()) {
    const existing = await prisma.experience.findFirst({ where: { profileId: profile.id, company: item.company } });
    if (!existing) throw new Error(`Experience not found: ${item.company}`);
    await prisma.experience.update({ where: { id: existing.id }, data: {
      milestone: item.milestone, facility: item.facility, meta: item.meta, details: item.details,
      role: item.role, company: item.company, description: item.details, startDate: item.startDate,
      endDate: item.endDate, isCurrent: item.isCurrent, location: item.location, order,
    } });
  }

  await prisma.skill.deleteMany({ where: { name: { notIn: skillsData.map((item) => item.name) } } });
  for (const [order, item] of skillsData.entries()) {
    await prisma.skill.upsert({ where: { name: item.name }, update: { category: item.category, status: item.status, order }, create: { ...item, order } });
  }

  for (const project of projectsData) {
    await prisma.project.update({ where: { slug: project.slug }, data: {
      name: project.name, type: project.type, tagline: project.tagline, description: project.description,
      overview: project.overview, problem: project.problem, solution: project.solution, features: project.features,
      stack: project.stack, team: project.team, program: project.program, github: project.github, demo: project.demo,
      featured: project.featured, published: project.published, visual: project.visual, order: project.order,
      myRole: "myRole" in project ? project.myRole : null,
      contributions: "contributions" in project ? project.contributions : [],
      ownership: "ownership" in project ? project.ownership : null,
    } });
  }

  for (const [order, item] of educationData.entries()) {
    await prisma.education.update({ where: { id: item.id }, data: { ...item, order } });
  }
  await prisma.certification.deleteMany({ where: { id: { notIn: certificationsData.map((item) => item.id) } } });
  for (const [order, item] of certificationsData.entries()) {
    await prisma.certification.upsert({ where: { id: item.id }, update: { ...item, order }, create: { ...item, order } });
  }

  const selectedSkillNames = [
    "HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", "React.js", "Next.js", "Angular", "Zustand", "TanStack Query", "Tailwind CSS",
    "Node.js", "Express.js", "NestJS", "PHP", "Python", "FastAPI", "Django", "Django REST Framework", "RESTful APIs",
    "MySQL", "MariaDB", "PostgreSQL", "MongoDB", "Mongoose", "Supabase", "SQL", "NoSQL",
    "JWT", "OTP Verification", "Authentication & Authorization", "RBAC", "Secure Cookies",
    "LLMs", "Prompt Engineering", "AI API Integration",
    "Jest", "Vitest", "Unit & Integration Testing",
    "Git", "GitHub", "Branching", "Pull Requests", "Code Reviews", "GitHub Actions", "CI/CD", "Vercel", "Render",
    "REST API Architecture", "Clean Architecture", "SOLID Principles", "Design Patterns", "Scalable System Design",
    "SSR", "CSR", "SSG", "Core Web Vitals", "SEO",
  ];
  const selectedSkills = await prisma.skill.findMany({ where: { name: { in: selectedSkillNames }, status: "verified" } });
  const selectedProjects = await prisma.project.findMany({ where: { slug: { in: ["lobby", "gamezone-arena", "unihub"] } } });
  const digitalHub = await prisma.experience.findFirst({ where: { profileId: profile.id, company: "The Digital Hub by UNRWA" } });
  const ishtari = await prisma.experience.findFirst({ where: { profileId: profile.id, company: "Ishtari Group" } });
  const configuration = await prisma.cvConfiguration.findUnique({ where: { id: "default" } });
  if (configuration) {
    const application = configuration.application as Record<string, unknown>;
    const projectBySlug = new Map(selectedProjects.map((project) => [project.slug, project]));
    const projectIds = ["lobby", "gamezone-arena", "unihub"].map((slug) => projectBySlug.get(slug)?.id).filter(Boolean);
    const projectOverrides = Object.fromEntries(projectsData
      .filter((project) => ["lobby", "gamezone-arena", "unihub"].includes(project.slug))
      .map((project) => [projectBySlug.get(project.slug)?.id, {
        description: project.description, bullets: [project.description], techStack: project.stack.join(", "),
        github: project.github, demo: project.demo,
      }]).filter(([id]) => id));
    const experienceOverrides = {
      ...((application.experienceOverrides as Record<string, unknown> | undefined) ?? {}),
      ...(digitalHub ? { [digitalHub.id]: {
        role: "Full-Stack Developer Intern", company: "The Digital Hub by UNRWA", startDate: "2026-05", isCurrent: true, location: "Remote",
        bullets: [
          "Completing an intensive full-stack software engineering and AI program focused on modern architecture and production-ready applications.",
          "Developing type-safe React and Next.js applications with Zustand and TanStack Query, while building REST APIs using Node.js, Express.js, FastAPI, and Django REST Framework.",
          "Implemented MongoDB/Mongoose and SQL data layers, JWT authentication, RBAC, validation, and unit testing with Vitest.",
          "Applying SOLID principles and clean architecture in Agile teams; integrating LLM and Cognitive APIs and deploying documented applications with Vercel and Render.",
        ],
      } } : {}),
      ...(ishtari ? { [ishtari.id]: {
        role: "Backend Developer", company: "Ishtari Group", startDate: "2025-12", endDate: "2026-01", location: "Tripoli, Lebanon",
        bullets: [
          "Developed PHP MVC modules with search, filtering, pagination, reporting, and AJAX-driven administration interfaces.",
          "Wrote MySQL and MariaDB queries for product, category, order, cost, price, and profit reporting.",
        ],
      } } : {}),
    };
    await prisma.cvConfiguration.update({ where: { id: "default" }, data: {
      professionalSummary: "Full-stack software engineer building type-safe web applications, REST APIs, authentication systems, and relational and NoSQL data solutions using React, Next.js, TypeScript, Node.js, Express.js, and Python frameworks. Focused on maintainable architecture, secure integrations, testing, CI/CD, and practical AI-powered application features.",
      application: { ...application, projects: projectIds, experienceOverrides, projectOverrides, skillCategoryOverrides: { AI: "AI & Testing", Testing: "AI & Testing", "DevOps & Version Control": "DevOps & Tools", Architecture: "Architecture & Web", "Web Performance & SEO": "Architecture & Web" }, skills: selectedSkillNames.map((name) => selectedSkills.find((skill) => skill.name === name)?.id).filter(Boolean), sections: ["summary", "experience", "projects", "skills", "education", "certifications", "languages"], sectionTitles: { summary: "Professional Summary", experience: "Professional Experience", projects: "Project Experience", skills: "Technical Skills", education: "Education", certifications: "Certifications", languages: "Languages" } },
    } });
  }
}

main().then(() => console.log("Portfolio content synchronized.")).finally(() => prisma.$disconnect());
