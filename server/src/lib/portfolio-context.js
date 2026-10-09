import { prisma } from "./prisma.js";
import { resumeLink } from './portfolio-links.js';
import { caseStudyFor } from '../../../shared/case-study-runtime.js';
import { projectDisplayName, normalizeExperience, sortExperience, uniqueCapabilities, normalizeTraining, normalizeEducation, recordKind } from '../../../shared/content-integrity-runtime.js';

const projectSelect = {
  slug: true, name: true, type: true, tagline: true, description: true,
  overview: true, problem: true, solution: true, features: true, stack: true,
  team: true, program: true, github: true, demo: true, featured: true,
  myRole: true, contributions: true, ownership: true, teamSize: true,
};

export async function getPortfolioContext(projectSlug) {
  const [profile, projects, technologies, skills, education, certifications] = await Promise.all([
    prisma.profile.findFirst({
      select: {
        name: true, shortName: true, title: true, tagline: true, bio: true,
        location: true, languages: true, resumeUrl: true,
        experience: { where: { published: true },
          orderBy: { order: "asc" },
          select: { role: true, company: true, startDate: true, endDate: true, isCurrent: true, location: true, description: true, details: true, bullets: true, cvBullets: true, meta: true },
        },
        socials: { where: { published: true }, select: { label: true, url: true } },
      },
    }),
    prisma.project.findMany({
      where: { published: true, showOnPortfolio: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: projectSelect,
    }),
    prisma.technology.findMany({ orderBy: { order: "asc" }, select: { name: true, category: true } }),
    prisma.skill.findMany({ orderBy: { order: "asc" }, select: { name: true, category: true } }),
    prisma.education.findMany({ where: { published: true }, orderBy: { order: "asc" }, select: { school: true, degree: true, field: true, period: true, details: true, startDate: true, endDate: true } }),
    prisma.certification.findMany({ where: { published: true }, orderBy: { order: "asc" }, select: { title: true, issuer: true, year: true, url: true, description: true, expectedDate: true, credentialId: true, issueDate: true } }),
  ]);

  if (!profile) throw new Error("Portfolio profile not found");
  const currentProject = projectSlug ? projects.find((project) => project.slug === projectSlug) : undefined;
  if (projectSlug && !currentProject) return null;
  const linkedProjects = projects.map(project => {
    const caseStudy = caseStudyFor(project);
    return {
      ...project,
      ...(caseStudy && { description: caseStudy.summary, overview: caseStudy.problem,
        problem: caseStudy.problem, solution: caseStudy.delivered.join(' '),
        features: caseStudy.delivered, caseStudy }),
      functionalName: project.name, name: projectDisplayName(project), portfolioUrl: `/projects/${project.slug}`,
    };
  });

  return {
    ...(currentProject && { currentProject: linkedProjects.find((project) => project.slug === projectSlug) }),
    profile: { ...profile, experience: sortExperience(profile.experience.map(normalizeExperience)), resumeUrl: resumeLink(profile.resumeUrl) },
    projects: linkedProjects,
    technologies: uniqueCapabilities(technologies),
    skills: uniqueCapabilities(skills),
    education: education.map(normalizeEducation),
    certifications: certifications.map(item => ({ ...normalizeTraining(item), recordKind: recordKind(item) })),
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
