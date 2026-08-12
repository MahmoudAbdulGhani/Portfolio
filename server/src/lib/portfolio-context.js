import { prisma } from "./prisma.js";

function clean(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

const projectSelect = {
  slug: true, name: true, type: true, tagline: true, description: true,
  overview: true, problem: true, solution: true, features: true, stack: true,
  team: true, program: true, github: true, demo: true, featured: true,
};

export async function getPortfolioContext(projectSlug) {
  const [profile, projects, technologies, skills, education, certifications] = await Promise.all([
    prisma.profile.findFirst({
      select: {
        name: true, shortName: true, title: true, tagline: true, bio: true,
        location: true, languages: true, resumeUrl: true,
        experience: {
          orderBy: { order: "asc" },
          select: { milestone: true, facility: true, meta: true, details: true },
        },
        socials: { select: { label: true, url: true } },
      },
    }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: projectSelect,
    }),
    prisma.technology.findMany({ orderBy: { order: "asc" }, select: { name: true, category: true } }),
    prisma.skill.findMany({ orderBy: { order: "asc" }, select: { name: true, category: true } }),
    prisma.education.findMany({ orderBy: { order: "asc" }, select: { school: true, degree: true, field: true, period: true, details: true } }),
    prisma.certification.findMany({ orderBy: { order: "asc" }, select: { title: true, issuer: true, year: true, url: true } }),
  ]);

  if (!profile) throw new Error("Portfolio profile not found");
  const currentProject = projectSlug ? projects.find((project) => project.slug === projectSlug) : undefined;
  if (projectSlug && !currentProject) return null;
  const linkedProjects = projects.map((project) => ({ ...project, portfolioUrl: `/projects/${project.slug}` }));

  return {
    ...(currentProject && { currentProject: linkedProjects.find((project) => project.slug === projectSlug) }),
    profile: { ...profile, resumeUrl: clean(profile.resumeUrl) ?? "/api/cv.pdf" },
    projects: linkedProjects,
    technologies,
    skills,
    education,
    certifications,
  };
}

export async function getPortfolioContextWithRetry(projectSlug) {
  try {
    return await getPortfolioContext(projectSlug);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return getPortfolioContext(projectSlug);
  }
}
