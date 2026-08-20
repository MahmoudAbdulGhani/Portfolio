import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const here = dirname(fileURLToPath(import.meta.url));
const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const outputDirectory = resolve(here, "..", "backups");
const outputPath = resolve(outputDirectory, `portfolio-content-${timestamp}.json`);

try {
  const [profiles, technologies, skills, projects, education, certifications, cvConfigurations] =
    await Promise.all([
      prisma.profile.findMany({ include: { experience: true, socials: true } }),
      prisma.technology.findMany(),
      prisma.skill.findMany(),
      prisma.project.findMany(),
      prisma.education.findMany(),
      prisma.certification.findMany(),
      prisma.cvConfiguration.findMany(),
    ]);

  const backup = {
    metadata: { createdAt: new Date().toISOString(), scope: "portfolio-content-and-cv" },
    profiles,
    technologies,
    skills,
    projects,
    education,
    certifications,
    cvConfigurations,
  };
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(backup, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ outputPath, counts: {
    profiles: profiles.length,
    experience: profiles.reduce((sum, profile) => sum + profile.experience.length, 0),
    socials: profiles.reduce((sum, profile) => sum + profile.socials.length, 0),
    technologies: technologies.length,
    skills: skills.length,
    projects: projects.length,
    education: education.length,
    certifications: certifications.length,
    cvConfigurations: cvConfigurations.length,
  } }));
} finally {
  await prisma.$disconnect();
}
